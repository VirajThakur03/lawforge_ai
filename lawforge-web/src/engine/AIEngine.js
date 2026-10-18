// src/engine/AIEngine.js
import { LegalMatcher } from "./LegalMatcher";
import { DeadlineEngine } from "./DeadlineEngine";
import { ScenarioEngine } from "./ScenarioEngine";
import { useStore } from "../store";
import { VectorSearchIndex } from "./VectorSearchIndex";
import { LAWS_BUNDLE } from "../data/laws_bundle";
import { LawSyncManager } from "./LawSyncManager";
import { KeyVault } from "./KeyVault";
import { RateLimiter } from "./RateLimiter";
import { AuditLogger } from "./AuditLogger";

// Local Worker Management
let localWorker = null;
let workerLoaded = false;
let workerLoading = false;

export const isWebGPUWorkerReady = () => workerLoaded;
export const isWebGPUWorkerLoading = () => workerLoading;

function getWorker() {
  if (typeof window === 'undefined') return null;
  if (!localWorker) {
    try {
      localWorker = new Worker(new URL('./WebGPUWorker.js', import.meta.url), { type: 'module' });
      localWorker.onmessage = (e) => {
        const { type, progress, error } = e.data;
        if (type === 'load_progress') {
          console.log(`WebGPU Worker loading model: ${Math.round(progress * 100)}%`);
        } else if (type === 'load_success') {
          workerLoaded = true;
          workerLoading = false;
          console.log("WebGPU Worker loaded Qwen model successfully.");
        } else if (type === 'load_error') {
          workerLoading = false;
          console.error("WebGPU Worker model load error:", error);
        }
      };
      workerLoading = true;
      localWorker.postMessage({ type: 'load' });
    } catch (e) {
      console.warn("Failed to initialize WebGPU Worker:", e);
    }
  }
  return localWorker;
}

async function runOfflineModel(prompt) {
  return new Promise((resolve) => {
    const worker = getWorker();
    if (!worker) {
      resolve(null);
      return;
    }
    
    // Set a timeout of 8 seconds to prevent blocking UI if download is slow
    const timeout = setTimeout(() => {
      console.warn("Offline model generation timed out. Using fast rule engine fallback.");
      resolve(null);
    }, 8000);
    
    const handleMessage = (e) => {
      if (e.data.type === 'generate_success') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handleMessage);
        resolve(e.data.text);
      }
    };
    
    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'generate', prompt });
  });
}

const LEX_AI_SYSTEM_PROMPT = `Identity & Core Directive:
You are Lex-AI, an elite, multi-jurisdictional Legal AI Assistant. Your primary function is to analyze legal issues, cross-reference regulations, and provide highly accurate, objective analysis.

Current System State:
- Operating Mode: {{CURRENT_MODE}}
- Active Jurisdiction: {{USER_SELECTED_COUNTRY}}
- Local Database Version Date: {{LOCAL_DB_DATE}}

Constraint Laws (CRITICAL):
1. State Awareness: If operating in "OFFLINE_LOCAL" mode, you MUST explicitly state in your opening section (Status Warning) that you are operating completely offline and that your knowledge is limited to the local snapshot dated {{LOCAL_DB_DATE}}.
2. Absolute Grounding: Every legal claim, penalty, or compliance requirement MUST be backed by a specific statutory citation provided in your retrieved context.
3. The Anti-Hallucination Protocol: If a user asks about a law not present in the retrieved context, you must reply: "The requested legal text is not available in the current active dataset. I cannot verify this provision." Never invent legal codes.
4. Jurisdiction Lock: Never mix legal frameworks. Do not apply case law concepts from an unselected country to the active jurisdiction.

Output Structure:
Always format your response using the following structure. You MUST wrap each section in standard headers:

### Status Warning
[Warning text here, ONLY if operating in OFFLINE_LOCAL mode, otherwise leave blank or write "N/A"]

### Direct Answer
[A concise 2-3 sentence summary of the legal position]

### Statutory Framework
[Bulleted list of the exact Acts, Sections, or Articles governing the issue]

### Analysis
[Detailed breakdown of how the law applies]

### Compliance & Risks
[Highlight penalties or strict deadlines]

You MUST also append a valid JSON payload at the very bottom of the response containing other metadata:
{
  "country": "{{USER_SELECTED_COUNTRY}}",
  "situation": "brief summary",
  "severity": "moderate",
  "risk_level": "HIGH",
  "confidence": "🟢 HIGH",
  "last_verified_date": "{{LOCAL_DB_DATE}}",
  "laws": [
    {"name": "...", "section": "...", "explanation": "..."}
  ],
  "penalties": [],
  "defenses": []
}`;

export const AIEngine = {
  async runOnlineGeneration(prompt, targetLanguage = 'en') {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    if (!apiKey || !navigator.onLine) {
        return "Offline Mode: AI generation unavailable.";
    }

    try {
        const fullPrompt = targetLanguage && targetLanguage !== 'en' 
            ? `${prompt}\n\nPlease respond in ${targetLanguage}.` 
            : prompt;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }]
            })
        });

        if (!response.ok) throw new Error("API request failed");
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        console.error("Online Generation Error:", e);
        return "Service temporarily unavailable.";
    }
  },

  async query(countryCode, countryName, situationText, offlineDb, targetLanguage = 'en', isAgentMode = false) {
    const { pipelineMode, localDbVersionDate } = useStore.getState();
    let apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    if (!apiKey) {
      try {
        apiKey = await KeyVault.getSecure('lf_gemini_api_key');
      } catch (err) {
        console.warn('Could not read key from vault:', err);
      }
    }

    // Audit: log analysis start (Task 10.7)
    AuditLogger.log('ANALYSIS_REQUESTED', {
      countryCode,
      countryName,
      query: situationText,  // will be hashed by AuditLogger
      pipeline: pipelineMode,
      isAgentMode
    }).catch(() => {});

    // Rate Limiting Check (Task 10.3)
    const rateLimitStatus = RateLimiter.check('ai_query');
    const isRateLimited = !rateLimitStatus.allowed;

    if (isRateLimited && pipelineMode === 'ONLINE_LIVE') {
      console.warn("Client rate limit reached. Re-routing to sovereign offline snapshot engine:", rateLimitStatus.message);
      useStore.getState().showToast(rateLimitStatus.message, 'warning');
    }

    // Check if offline is forced or network/key is missing or rate limited
    const isOffline = pipelineMode === 'OFFLINE_LOCAL' || !apiKey || !navigator.onLine || isRateLimited;

    if (isOffline) {
        console.log("Lex-AI Routing Engine: Routing to Offline Local SQLite DB pipeline.");
        
        // Retrieve local statutes using VectorSearchIndex
        const activeDb = offlineDb || (typeof LawSyncManager !== 'undefined' ? LawSyncManager.getActiveDatabase() : null) || LAWS_BUNDLE;
        const countryLaws = activeDb[countryCode] || {};
        const allStatutes = [];
        
        Object.keys(countryLaws).forEach(cat => {
          const catData = countryLaws[cat];
          if (catData && catData.laws) {
            catData.laws.forEach(law => {
              allStatutes.push({
                category: cat,
                name: law.name,
                section: law.section || '',
                explanation: law.note || '',
                text: law.note || ''
              });
            });
          }
        });

        const matchedStatutes = VectorSearchIndex.query(situationText, allStatutes);
        const retrievedContext = matchedStatutes.map(s => `- [${s.category}] ${s.name} (Section ${s.section}): ${s.explanation}`).join('\n');
        
        // Compile prompt with context and state variables
        let compiledOfflinePrompt = LEX_AI_SYSTEM_PROMPT
          .replace(/{{CURRENT_MODE}}/g, "OFFLINE_LOCAL")
          .replace(/{{USER_SELECTED_COUNTRY}}/g, countryName || 'Unknown')
          .replace(/{{LOCAL_DB_DATE}}/g, localDbVersionDate || new Date().toLocaleDateString());
          
        compiledOfflinePrompt += `\n\n<retrieved_context>\n${retrievedContext || "No relevant statutes found in database snapshot."}\n</retrieved_context>`;
        compiledOfflinePrompt += `\n\nUser Query: ${situationText}`;
        
        if (targetLanguage === 'hi') compiledOfflinePrompt += "\n\n🌍 TRANSLATION OVERRIDE: Translate the content to Hindi (हिंदी) but keep JSON keys in English.";
        if (targetLanguage === 'mr') compiledOfflinePrompt += "\n\n🌍 TRANSLATION OVERRIDE: Translate the content to Marathi (मराठी) but keep JSON keys in English.";

        // Attempt running WebGPU local Worker
        const modelOutputText = await runOfflineModel(compiledOfflinePrompt);
        
        let response;
        if (modelOutputText) {
          console.log("WebGPU Worker succeeded, parsing SLM markdown output...");
          response = AIEngine.parseResponse(modelOutputText, isAgentMode);
        } else {
          console.log("WebGPU Worker offline/failed/timedout, using rule-based fast matcher.");
          response = LegalMatcher.query(countryCode, countryName, situationText, activeDb, targetLanguage, isAgentMode);
        }
        
        // Enforce Absolute Grounding and Anti-Hallucination Programmatically
        const hasSpecificLawQuery = /section|article|act|provision|statute|law\s+\d+|clause/i.test(situationText);
        const databaseHasMatches = response.laws && !response.laws.includes("Please consult official government") && !response.laws.includes("Unknown");
        
        let statusWarning = `⚠️ OFFLINE MODE: Operating completely offline. Knowledge is limited to the local snapshot dated ${localDbVersionDate}.`;
        let directAnswer = response.summary || "No description compiled.";
        let statutoryFramework = response.laws || "No applicable statutes matched in database snapshot.";
        let complianceRisks = response.penalties || "Compliance requirements not specified.";
        let analysisText = (response.advice || '') + '\n\n' + (response.rights || '');
        
        if (hasSpecificLawQuery && !databaseHasMatches) {
          directAnswer = "The requested legal text is not available in the current active dataset. I cannot verify this provision.";
          statutoryFramework = "The requested legal text is not available in the current active dataset. I cannot verify this provision.";
          complianceRisks = "Verification unavailable.";
          analysisText = "The requested legal text is not available in the active offline dataset snapshot. Please connect to the online Live Web Search gateway to verify this provision.";
        }
        
        // Map elements to existing schema variables
        response.warning = statusWarning;
        response.summary = directAnswer;
        response.laws = statutoryFramework;
        response.advice = analysisText;
        response.penalties = complianceRisks;
        
        return response;
    }

    try {
        console.log("Lex-AI Routing Engine: Routing to Online Live LLM Gateway + Web Search pipeline.");

        // Compile prompt dynamically based on state
        let finalPrompt = LEX_AI_SYSTEM_PROMPT
            .replace(/{{CURRENT_MODE}}/g, "ONLINE_LIVE")
            .replace(/{{USER_SELECTED_COUNTRY}}/g, countryName || 'Unknown')
            .replace(/{{LOCAL_DB_DATE}}/g, new Date().toLocaleDateString());

        // --- EVOLUTION PREDICTIVE INJECTION ---
        finalPrompt += `\n\n🔮 PREDICTIVE FORECASTING DIRECTIVE: You MUST append a "forecast" JSON object to your final JSON payload containing {"success_chance": integer (0-100), "penalty_reduction": integer (0-100), "trend": "A short trend insight about this type of case"}`;

        // --- EVOLUTION AGENT INJECTION ---
        if (isAgentMode) {
           finalPrompt += `\n\n🤖 AGENTIC DIRECTIVE ACTIVE: You MUST append an "agent_data" JSON object to your final JSON payload. Break this task into autonomous steps. Include: {"checklist": ["task1", "task2"], "action_plan": ["step1", "step2"], "draft_title": "Draft Name", "draft_content": "A lightweight legal text draft"}`;
        }

        // --- EVOLUTION SCENARIO INJECTION ---
        finalPrompt += `\n\n🔀 SCENARIO DIRECTIVE: Append a "scenarios" array with 3 what-if paths: [{"type":"best|neutral|worst","action":"...","outcome":"...","risk_delta":number,"time_estimate":"...","cost_estimate":"..."}]`;

        // --- EVOLUTION CATEGORY INJECTION (for deadline engine) ---
        finalPrompt += `\n\n📁 CATEGORY DIRECTIVE: Include "legal_category" field in JSON with one of: Traffic, Workplace, Property, Police, Financial, Consumer, Domestic, Cyber, Criminal, Contract, Tax, Immigration, Medical, Family.`;

        // --- EVOLUTION PRECEDENT INJECTION ---
        finalPrompt += `\n\n📖 PRECEDENT DIRECTIVE: Include a "precedents" array with 1-3 relevant historical cases: [{"title":"Case Name (Year)","category":"...","summary":"..."}]`;

        // --- REAL-TIME STATUTORY GROUNDING DIRECTIVE ---
        finalPrompt += `\n\n⚖️ REAL-TIME STATUTORY DIRECTIVE: Ground all legal analysis in the most recent active statutory provisions, 2026/current legislative amendments, official gazette notifications, and updated fines/penalties for ${countryName}. If an older act has been amended or replaced (e.g. Bharatiya Nyaya Sanhita BNS in India, recent state/federal statutes in USA/UK), explicitly cite the new active statute and section numbers.`;

        if (targetLanguage === 'hi') finalPrompt += "\n\n🌍 TRANSLATION OVERRIDE: You MUST translate ALL text output (including the new agent_data and forecast) into HINDI (हिंदी). Ensure JSON keys remain in English.";
        if (targetLanguage === 'mr') finalPrompt += "\n\n🌍 TRANSLATION OVERRIDE: You MUST translate ALL text output (including the new agent_data and forecast) into MARATHI (मराठी). Ensure JSON keys remain in English.";

        console.log("Final compiled Lex-AI prompt length:", finalPrompt.length);

        const basePayload = {
            system_instruction: { parts: [{ text: finalPrompt }] },
            contents: [{ parts: [{ text: `Active Jurisdiction: ${countryName}. Current Year: ${new Date().getFullYear()}. Research and cite the latest statutes, amendments, and legal updates for: ${situationText}` }] }]
        };

        let response;
        try {
            // Attempt with live Google Search Grounding for real-time legal updates
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...basePayload, tools: [{ google_search: {} }] })
            });

            if (!response.ok) {
                // Graceful fallback to standard request if search tool is restricted by key quota
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(basePayload)
                });
            }
        } catch {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(basePayload)
            });
        }

        if (!response.ok) throw new Error("API request failed");
        
        const data = await response.json();
        RateLimiter.consume('ai_query');
        const rawText = data.candidates[0].content.parts[0].text;

        // Parse Output: Extract the JSON bounded at the end
        const parsed = AIEngine.parseResponse(rawText, isAgentMode);
        if (data.candidates[0]?.groundingMetadata) {
            parsed.groundingMetadata = data.candidates[0].groundingMetadata;
        }
        parsed.lastVerifiedDate = `${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} (Live Grounded)`;
        return parsed;

    } catch (e) {
        console.warn("API Engine failed, falling back to offline matcher.", e);
        return LegalMatcher.query(countryCode, countryName, situationText, offlineDb, targetLanguage, isAgentMode);
    }
  },

  parseResponse(rawMarkdown, isAgentMode = false) {
      // Find the JSON block at the end of the text
      const jsonStart = rawMarkdown.lastIndexOf('{');
      const jsonEnd = rawMarkdown.lastIndexOf('}');
      
      let metaData = {};
      let cleanHtml = rawMarkdown;

      if (jsonStart !== -1 && jsonEnd !== -1) {
          try {
              const jsonStr = rawMarkdown.substring(jsonStart, jsonEnd + 1);
              metaData = JSON.parse(jsonStr);
              cleanHtml = rawMarkdown.substring(0, jsonStart).replace(/```json/g, '').trim();
          } catch (e) {
              console.error("Failed to parse JSON blob from AI.", e);
          }
      }

      // We format this into the structure the FRONTFORGE ResponseSection expects
      const category = metaData.legal_category || 'Criminal';
      const sev = (metaData.risk_level || 'MEDIUM').toUpperCase();
      const countryCode = metaData.country_code || metaData.country?.substring(0,2).toUpperCase() || 'IN';
      
      return {
          country: metaData.country || 'Unknown',
          severity: sev,
          situation: metaData.situation || 'Situation analysis in progress...',
          
          // Lex-AI Output Structure Parsers
          warning: AIEngine.extractSection(cleanHtml, "### Status Warning", "### Direct Answer"),
          summary: AIEngine.extractSection(cleanHtml, "### Direct Answer", "### Statutory Framework"),
          laws: AIEngine.extractSection(cleanHtml, "### Statutory Framework", "### Analysis"),
          advice: AIEngine.extractSection(cleanHtml, "### Analysis", "### Compliance & Risks"),
          penalties: AIEngine.extractSection(cleanHtml, "### Compliance & Risks", "###"),
          
          rawText: cleanHtml,
          
          // EVOLUTION DATA
          agent_data: metaData.agent_data || null,
          forecast: metaData.forecast || null,
          scenarios: metaData.scenarios?.length ? metaData.scenarios : ScenarioEngine.generate(category, sev),
          deadlines: DeadlineEngine.calculate(countryCode, category, sev),
          precedents: metaData.precedents || [],
          isAgentSession: isAgentMode,
      };
  },

  extractSection(text, startTitle, endTitle) {
      const cleanTitle = (t) => t.replace(/###/g, '').trim();
      const titleStart = cleanTitle(startTitle);
      const titleEnd = cleanTitle(endTitle);
      
      const getStartPos = (title) => {
        const regex = new RegExp(`(###\\s*)?${title}\\b`, 'i');
        const match = text.match(regex);
        return match ? match.index + match[0].length : -1;
      };

      const getEndPos = (title) => {
        const regex = new RegExp(`(###\\s*)?${title}\\b`, 'i');
        const match = text.match(regex);
        return match ? match.index : -1;
      };

      const startPos = getStartPos(titleStart);
      if (startPos === -1) return null;
      
      let endPos = getEndPos(titleEnd);
      if (endPos === -1 || endPos < startPos) endPos = text.length;
      
      let content = text.substring(startPos, endPos).trim();
      content = content.replace(/^[:\s\-*]+/g, '').trim(); // Remove leading colons, bullets, and spaces
      return content;
  }
};
