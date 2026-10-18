import { LAWS_BUNDLE, LIMITED_DATA_COUNTRIES, DISCLAIMER_TEXT } from "../data/laws_bundle";
import { DeadlineEngine } from './DeadlineEngine';
import { ScenarioEngine } from './ScenarioEngine';
import { PrecedentIndex } from '../phase4/mini-rag/PrecedentIndex';
// ─── Keyword Maps ─────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  Traffic:   { words: ['speed','speeding','signal','traffic','drive','driving','drunk driving','dui','dwi','accident','crash','vehicle','car','bike','motorcycle','licence','license','helmet','seatbelt','parking','challan','fine','road','overtake','reckless','road rage','hit and run','red light','pedestrian','registration','insurance','mot','roadworthy','rv','highway'], weight: 1 },
  Workplace: { words: ['fired','termination','terminated','dismiss','dismissal','laid off','layoff','redundancy','harassment','salary','wage','unpaid','overtime','leave','boss','employer','employee','hr','human resources','hostile work','promotion','demotion','union','retrenchment','resignation','forced resign','constructive dismiss','contract work','freelance pay','apprentice','intern','severance','notice period','probation'], weight: 1 },
  Property:  { words: ['landlord','tenant','rent','eviction','lease','property','house','flat','apartment','encroach','boundary','land','ownership','title','mortgage','builder','real estate','stuck deposit','security deposit','neighbour','dispute property','trespass','squatter','adverse possession'], weight: 1 },
  Police:    { words: ['arrest','arrested','detained','detention','custody','police','search','seized','warrant','interrogate','fir','complaint','station','handcuff','interrogation','lockup','bail','remand','right to remain silent','not charged','frisk','stop and search','use of force','excessive force','drug possession'], weight: 1 },
  Financial: { words: ['fraud','scam','cheque','check bounce','loan','default','investment','deceive','money','transfer','transferred','lied','fake','ponzi','pyramid','advance fee','phishing','credit card','bank fraud','banking','bank account','identity theft','debt','collection','recovery','payment not received','did not pay','savings','account'], weight: 1 },
  Domestic:  { words: ['domestic violence','violence','abuse','divorce','custody','marriage','wife','husband','partner','dowry','assault','threat','intimidate','restraining order','family violence','child abuse'], weight: 1 },
  Cyber:     { words: ['hack','hacked','online fraud','phishing','dark web','defamation','social media','email','account','cyberbully','cyberstalking','impersonation','fake account','revenge porn','morphed photo','deepfake','sextortion','ransomware','data breach','unauthorized access'], weight: 1 },
  Medical:   { words: ['doctor','hospital','malpractice','negligence','prescription','surgery','medicine','treatment','wrong diagnosis','medical error','injury from treatment','health','clinic','nurse','misdiagnosis','informed consent','insurance denied'], weight: 1 },
  Consumer:  { words: ['product','refund','warranty','defective','overcharge','billing','shop','service','seller','buyer','ecommerce','online purchase','amazon','flipkart','return','replacement','fake product','wrong item','not delivered','delivery','consumer court'], weight: 1 },
  Contract:  { words: ['contract','agreement','breach','nda','non-disclosure','payment not done','terms violated','signed','promise','deal','dispute','failed to deliver','contract broken','clause','terms and conditions'], weight: 1 },
  Tax:       { words: ['income tax','gst','vat','audit','tax evasion','tax notice','tds','tax return','irs','hmrc','assessment','tax demand','black money','undeclared income'], weight: 1 },
  Family:    { words: ['adoption','inheritance','will','heir','guardian','custody','divorce settlement','alimony','maintenance','succession','estate','deceased','probate'], weight: 1 },
  Criminal:  { words: ['murder','theft','robbery','burglary','assault','drug','narcotics','gang','criminal charge','accused','arrest warrant','bail','remand','plea','prosecution','charged with','felony','misdemeanor','offense','offence','drug possession'], weight: 1 },
  Immigration:{ words: ['visa','passport','deport','deportation','refugee','asylum','permit','citizenship','overstay','undocumented','illegal immigration','work permit','green card','pr','permanent resident','immigration officer'], weight: 1 },
};

// ─── Scoring Engine ───────────────────────────────────────────────────────────
function detectCategory(situationText) {
  const text = situationText.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  const scores = {};

  for (const [cat, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const word of config.words) {
      // Use regex to find whole word matches and exact phrase matches across the text to boost the score if mentioned multiple times
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = situationText.match(regex);
      if (matches) {
        // Multi-word phrases get higher weight (3 per occurrence), single words (1 per occurrence)
        score += matches.length * (word.includes(' ') ? 3 : 1);
      }
    }
    
    // Slight multiplier for extremely short sentences where every word counts
    if (wordCount < 20 && score > 0) {
        score += 1; 
    }
    
    scores[cat] = score;
  }

  // Sort by score descending
  let sorted = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return ['Other', 0];

  // Tie-breaker: Financial vs Cyber overlap (e.g. hacking a bank account)
  // If Cyber is #1 but Financial is present (with words like money, theft, transfer, bank) -> prioritize Financial
  if (sorted[0][0] === 'Cyber') {
    const finMatch = sorted.find(c => c[0] === 'Financial');
    if (finMatch && text.match(/(bank|money|transfer|stole|savings|card|cheque|loan)/i)) {
       // Promote Financial to the top
       sorted = [finMatch, ...sorted.filter(c => c[0] !== 'Financial')];
    }
  }

  return [sorted[0][0], sorted[0][1]];
}

// ─── Response Builder ─────────────────────────────────────────────────────────
function buildResponse(countryCode, category, countryName, situationText, dbSource = LAWS_BUNDLE) {
  console.log(`Building response for ${countryName} (${countryCode}) - Category: ${category}`);
  const db = (dbSource || LAWS_BUNDLE)[countryCode];

  // Limited/no data country
  if (!db || LIMITED_DATA_COUNTRIES.includes(countryCode)) {
    console.log(`LIMITED DATA for ${countryCode}`);
    return buildLimitedResponse(countryName, category, situationText);
  }

  const entry = db[category];
  console.log(`Category entry for ${category}:`, !!entry);

  // Category not found for this country → try fallback
  if (!entry) {
    // Try to find the closest available category
    const available = Object.keys(db);
    if (available.length === 0) return buildLimitedResponse(countryName, category, situationText);
    return buildLimitedResponse(countryName, category, situationText, available);
  }

  // --- EVOLUTION DATA SYNTHESIS (Offline Mode) ---
  const sev = (entry.severity || 'MEDIUM').toUpperCase();
  const success_chance = sev === 'LOW' ? 85 : sev === 'MEDIUM' ? 60 : 30;
  const penalty_reduction = sev === 'LOW' ? 90 : sev === 'MEDIUM' ? 40 : 10;
  const trend = `Historically, ${category.toLowerCase()} matters in ${countryName} with a ${sev} rating rely heavily on early dispute resolution versus formal litigation.`;

  const agent_data = {
    checklist: ["Gather related documents", "Take photos of involved properties/vehicles", "Do not sign anything blindly"],
    action_plan: ["Analyze legal rights locally", "Locate preliminary attorney contact", "Prepare chronological summary of facts"],
    draft_title: "Initial Fact Summary Notice",
    draft_content: `To whom it may concern,\n\nRegarding the matter on [DATE] involving ${category.toLowerCase()}:\n${situationText?.substring(0, 50)}...\n\nPlease be advised I am currently organizing my legal defenses under the jurisdiction of ${countryName}.`
  };

  return {
    country: countryName,
    situation: situationText,
    severity: sev,
    summary: buildSituationSummary(countryName, category, situationText, entry),
    laws: buildLawsSection(entry.laws || []),
    penalties: buildPenaltiesSection(entry.penalties || []),
    rights: buildListSection(entry.rights || []),
    next_steps: buildStepsSection(entry.steps || []),
    advice: buildListSection(entry.defenses || ['Consult a lawyer to identify defenses specific to your case.']),
    warning: entry.urgent ? `⚠️ CRITICAL: ${entry.urgent}` : "ALWAYS CONSULT A LICENSED LAWYER. This AI generated intelligence is for informational purposes only.",
    laws_raw: (entry.laws || []).map(l => `${l.name} — ${l.section || ''}: ${l.note}`).join('\n'),
    
    // EVOLUTION DATA
    forecast: { success_chance, penalty_reduction, trend },
    agent_data: agent_data,
    deadlines: DeadlineEngine.calculate(countryCode, category, sev),
    scenarios: ScenarioEngine.generate(category, sev, countryName),
    precedents: PrecedentIndex.search(situationText),
  };
}

function buildSituationSummary(country, category, text, entry) {
  return `Your situation falls under the ${category} legal category in ${country}.\n\n` +
    `Based on the details provided, this involves the following area of law: **${category}**. ` +
    `This is rated as a **${entry.severity || 'MEDIUM'} severity** matter. ` +
    (entry.urgent ? `\n\n⚠️ IMPORTANT: ${entry.urgent}` : '') +
    `\n\nThe information below is based on the laws of ${country} as generally applicable to this type of situation.`;
}

function buildLawsSection(laws) {
  if (!laws.length) return 'No specific law data available for this situation. Please consult a local lawyer.';
  return laws.map(l =>
    `**${l.name}** — *${l.section || 'General provision'}*\n${l.note}`
  ).join('\n\n');
}

function buildPenaltiesSection(penalties) {
  if (!penalties.length) return 'Penalty information not available. Consult a lawyer.';
  return penalties.map(p => `**${p.type}:** ${p.value}`).join('\n');
}

function buildListSection(items) {
  if (!items || !items.length) return 'Information not available. Please consult a lawyer.';
  return items.map(i => `• ${i}`).join('\n');
}

function buildStepsSection(steps) {
  if (!steps || !steps.length) return 'Please consult a lawyer for specific guidance on next steps.';
  return steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
}

export function buildResourcesSection(resources) {
  if (!resources || !resources.length) return 'Search for official government legal resources for your country.';
  return resources.map(r => `**${r.name}:** ${r.url}`).join('\n');
}

function buildLimitedResponse(countryName, category, situationText, available) {
  const cats = available ? `Available data for this country covers: ${available.join(', ')}.` : '';
  // Always provide EVOLUTION data even for limited-data countries
  const forecast = {
    success_chance: 55,
    penalty_reduction: 35,
    trend: `Legal outcomes in ${countryName} for ${category.toLowerCase()} matters depend heavily on local legal representation quality.`
  };
  const agent_data = {
    checklist: ['Document the incident with dates and times', 'Gather any written communications or evidence', 'Research local legal aid organisations'],
    action_plan: ['1. Contact a licensed lawyer in your jurisdiction immediately', '2. Request copies of all official documents', '3. Do not sign anything without legal advice'],
    draft_title: 'Initial Legal Notice — Limited Jurisdiction Data',
    draft_content: `To whom it may concern,\n\nThis notice concerns a matter of ${category.toLowerCase()} law in ${countryName}.\nI am currently seeking proper legal counsel and reserve all rights.\n\n[Your Name]\n[Date]`
  };
  return {
    country: countryName,
    situation: situationText,
    severity: 'MEDIUM',
    summary: `Your situation in **${countryName}** involves the **${category}** area of law. ${cats}\n\nOur database currently has limited specific data for this country/category combination.`,
    laws: `Please consult official government legal resources or a licensed lawyer in ${countryName} for applicable laws.`,
    penalties: 'Consult local legal counsel for accurate penalty information.',
    rights: `In most jurisdictions you have: the right to silence, the right to a lawyer, and the right to know the charges against you. Verify these rights with a local lawyer in ${countryName}.`,
    next_steps: `1. Stay calm and do not make statements without legal advice.\n2. Contact a licensed lawyer in ${countryName} immediately.\n3. Document everything with dates, names, and evidence.`,
    advice: `4. Contact your country's embassy if you are a foreigner.\n5. Search for free legal aid in ${countryName} if cost is a concern.\nConsult a lawyer to identify valid legal defenses for your specific situation.`,
    warning: 'Our database has limited information for this country. Please consult a licensed local lawyer for accurate guidance.',
    forecast,
    agent_data,
    deadlines: DeadlineEngine.calculate('DEFAULT', category, 'MEDIUM'),
    scenarios: ScenarioEngine.generate(category, 'MEDIUM', countryName),
  };

}

// ─── Main Query Function ──────────────────────────────────────────────────────
/**
 * LegalMatcher.query(countryCode, countryName, situationText)
 * Returns a structured legal response object.
 */
export const LegalMatcher = {
  query(countryCode, countryName, situationText, dynamicDb = null, targetLanguage = 'en', isAgentMode = false) {
    console.log(`LegalMatcher.query starting... Country: ${countryCode} | Agent: ${isAgentMode}`);
    const dbSource = dynamicDb || LAWS_BUNDLE;
    
    const [category, confidence] = detectCategory(situationText);
    console.log(`Detected category: ${category} (confidence: ${confidence})`);
    
    const response = buildResponse(countryCode, category, countryName, situationText, dbSource);
    response._meta = { category, confidence, engine: 'LAWFORGE-OFFLINE-v1', language: targetLanguage };
    // Stamp agent session flag so UI panels render correctly
    response.isAgentSession = isAgentMode;
    console.log(`LegalMatcher.query returning response for ${response.country} | isAgentSession: ${response.isAgentSession}`);
    return response;
  },

  getAvailableCategories(countryCode, dynamicDb = null) {
    const db = (dynamicDb || LAWS_BUNDLE)[countryCode];
    return db ? Object.keys(db) : [];
  },

  isCountrySupported(countryCode) {
    return !!(LAWS_BUNDLE[countryCode]);
  },
};
