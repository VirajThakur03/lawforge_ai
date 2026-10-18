// lawforge-web/src/engine/WebGPUWorker.js
import { pipeline } from '@xenova/transformers';

let generator = null;

async function loadModel(progressCallback) {
  if (generator) return generator;
  try {
    generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
      progress_callback: (data) => {
        if (data.status === 'progress') {
          progressCallback(data.progress);
        }
      }
    });
    return generator;
  } catch (e) {
    console.error("Failed to load local model via Transformers.js:", e);
    throw e;
  }
}

self.onmessage = async (e) => {
  const { type, prompt, options } = e.data;
  
  if (type === 'load') {
    try {
      await loadModel((progress) => {
        self.postMessage({ type: 'load_progress', progress });
      });
      self.postMessage({ type: 'load_success' });
    } catch (err) {
      self.postMessage({ type: 'load_error', error: err.message });
    }
  } else if (type === 'generate') {
    try {
      let resultText = "";
      
      // Attempt local model execution
      if (generator) {
        const output = await generator(prompt, {
          max_new_tokens: 250,
          temperature: 0.7,
          ...options
        });
        resultText = output[0].generated_text;
      } else {
        // Fallback to rules-based synthesis if model is not loaded
        resultText = generateLocalFallbackRebuttal(prompt);
      }
      
      self.postMessage({ type: 'generate_success', text: resultText });
    } catch (err) {
      console.error("WebGPU generation fallback triggered:", err);
      // Fallback response on error
      const fallbackText = generateLocalFallbackRebuttal(prompt);
      self.postMessage({ type: 'generate_success', text: fallbackText });
    }
  }
};

function generateLocalFallbackRebuttal(prompt) {
  const cleanPrompt = prompt.toLowerCase();
  let directAnswer = "The local dataset indicates compliance risks based on matched statutory frameworks.";
  let statutoryFramework = "- Motor Vehicles Act, Section 112\n- Code of Criminal Procedure, Section 91";
  let analysis = "Based on the input pattern, your defense depends on procedural compliance records. If authorities failed to provide standard legal notices, the liability may be mitigated.";
  let compliance = "- Fine: ₹1,000 to ₹5,000\n- Action: Respond within 15 days to the issuing authority.";
  
  if (cleanPrompt.includes('speed') || cleanPrompt.includes('km/h')) {
    directAnswer = "Exceeding the speed limit constitutes an absolute liability offense under the Motor Vehicles Act.";
    statutoryFramework = "- Motor Vehicles Act, 1988, Section 112 (Speed Limits)\n- Motor Vehicles Act, Section 183 (Over-speeding)";
    analysis = "The radar calibration logs and the police officer's certificate are the primary pieces of evidence. A defense can be raised if the radar unit was not calibrated within the statutory 12-month window.";
    compliance = "- Fine of ₹1,000 for Light Motor Vehicles; ₹2,000 for Medium Vehicles.\n- Driving license suspension for repeat offenses.";
  } else if (cleanPrompt.includes('search') || cleanPrompt.includes('warrant')) {
    directAnswer = "Police officers generally require a search warrant under CrPC Section 93, subject to exigent circumstances.";
    statutoryFramework = "- Code of Criminal Procedure (CrPC), Section 93 (When search warrant may be issued)\n- CrPC Section 165 (Search by police officer)";
    analysis = "An officer can conduct a warrantless search under Section 165 only if there are reasonable grounds to believe that evidence will be lost if delayed, and grounds must be recorded in writing before search.";
    compliance = "- Right to demand to see written grounds under Section 165.\n- Right to have local independent witnesses present during search.";
  } else if (cleanPrompt.includes('evict') || cleanPrompt.includes('landlord') || cleanPrompt.includes('rent')) {
    directAnswer = "Landlords cannot evict tenants without following due process and obtaining a court order.";
    statutoryFramework = "- Rent Control Act (State-Specific)\n- Transfer of Property Act, 1882, Section 106";
    analysis = "Withholding rent because of lack of repairs is legally risky unless rent is deposited into a court-approved escrow account. Eviction requires a formal 15-day notice under Section 106.";
    compliance = "- Statutory 15-day notice period is mandatory.\n- Tenant must reply to notice within specified time to contest eviction.";
  }
  
  // Format as structured Markdown report matching Lex-AI structure
  return `### Status Warning
⚠️ OFFLINE LOCAL RUNNER: Synthesized via local legal rules engine.

### Direct Answer
${directAnswer}

### Statutory Framework
${statutoryFramework}

### Analysis
${analysis}

### Compliance & Risks
${compliance}

{"country": "India", "severity": "moderate", "risk_level": "MEDIUM", "confidence": "🟢 LOCAL", "laws": []}`;
}
