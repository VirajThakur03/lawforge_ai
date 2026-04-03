/**
 * LAWFORGE AI — Offline Legal Matching Engine
 * Maps free-text situation descriptions to the correct legal category
 * using keyword scoring, then formats the structured response.
 * 100% client-side. Zero API calls.
 */

/* global LAWS_BUNDLE, LIMITED_DATA_COUNTRIES, DISCLAIMER_TEXT */

// ─── Keyword Maps ─────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  Traffic:   { words: ['speed','speeding','signal','traffic','drive','driving','drunk driving','dui','dwi','accident','crash','vehicle','car','bike','motorcycle','licence','license','helmet','seatbelt','parking','challan','fine','road','overtake','reckless','road rage','hit and run','red light','pedestrian','registration','insurance','mot','roadworthy','rv','highway'], weight: 1 },
  Workplace: { words: ['fired','termination','terminated','dismiss','dismissal','laid off','layoff','redundancy','harassment','salary','wage','unpaid','overtime','leave','boss','employer','employee','hr','human resources','hostile work','promotion','demotion','union','retrenchment','resignation','forced resign','constructive dismiss','contract work','freelance pay','apprentice','intern'], weight: 1 },
  Property:  { words: ['landlord','tenant','rent','eviction','lease','property','house','flat','apartment','encroach','boundary','land','ownership','title','mortgage','builder','real estate','stuck deposit','security deposit','neighbour','dispute property','trespass','squatter','adverse possession'], weight: 1 },
  Police:    { words: ['arrest','arrested','detained','detention','custody','police','search','seized','warrant','interrogate','fir','complaint','station','handcuff','interrogation','lockup','bail','remand','right to remain silent','not charged','frisk','stop and search','use of force','excessive force'], weight: 1 },
  Financial: { words: ['fraud','scam','cheque','check bounce','loan','default','investment','deceive','money','transfer','lied','fake','ponzi','pyramid','advance fee','phishing','credit card','bank fraud','identity theft','debt','collection','recovery','payment not received','did not pay'], weight: 1 },
  Domestic:  { words: ['domestic violence','violence','abuse','divorce','custody','marriage','wife','husband','partner','dowry','assault','threat','intimidate','restraining order','family violence','child abuse'], weight: 1 },
  Cyber:     { words: ['hack','hacked','online fraud','phishing','dark web','defamation','social media','email','account','cyberbully','cyberstalking','impersonation','fake account','revenge porn','morphed photo','deepfake','sextortion','ransomware','data breach','unauthorized access'], weight: 1 },
  Medical:   { words: ['doctor','hospital','malpractice','negligence','prescription','surgery','medicine','treatment','wrong diagnosis','medical error','injury from treatment','health','clinic','nurse','misdiagnosis','informed consent','insurance denied'], weight: 1 },
  Consumer:  { words: ['product','refund','warranty','defective','overcharge','billing','shop','service','seller','buyer','ecommerce','online purchase','amazon','flipkart','return','replacement','fake product','wrong item','not delivered','delivery','consumer court'], weight: 1 },
  Contract:  { words: ['contract','agreement','breach','nda','non-disclosure','payment not done','terms violated','signed','promise','deal','dispute','failed to deliver','contract broken','clause','terms and conditions'], weight: 1 },
  Tax:       { words: ['income tax','gst','vat','audit','tax evasion','tax notice','tds','tax return','irs','hmrc','assessment','tax demand','black money','undeclared income'], weight: 1 },
  Family:    { words: ['adoption','inheritance','will','heir','guardian','custody','divorce settlement','alimony','maintenance','succession','estate','deceased','probate'], weight: 1 },
  Criminal:  { words: ['murder','theft','robbery','burglary','assault','drug','narcotics','gang','criminal charge','accused','arrest warrant','bail','remand','plea','prosecution','charged with','felony','misdemeanor','offense','offence'], weight: 1 },
  Immigration:{ words: ['visa','passport','deport','deportation','refugee','asylum','permit','citizenship','overstay','undocumented','illegal immigration','work permit','green card','pr','permanent resident','immigration officer'], weight: 1 },
};

// ─── Scoring Engine ───────────────────────────────────────────────────────────
function detectCategory(situationText) {
  const text = situationText.toLowerCase();
  const scores = {};

  for (const [cat, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const word of config.words) {
      if (text.includes(word)) {
        // Multi-word phrases get higher weight
        score += word.includes(' ') ? 3 : 1;
      }
    }
    scores[cat] = score;
  }

  // Sort by score descending
  const sorted = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return ['Other', 0];
  return [sorted[0][0], sorted[0][1]];
}

// ─── Response Builder ─────────────────────────────────────────────────────────
function buildResponse(countryCode, category, countryName, situationText) {
  const db = LAWS_BUNDLE[countryCode];

  // Limited/no data country
  if (!db || LIMITED_DATA_COUNTRIES.includes(countryCode)) {
    return buildLimitedResponse(countryName, category, situationText);
  }

  const entry = db[category];

  // Category not found for this country → try fallback
  if (!entry) {
    // Try to find the closest available category
    const available = Object.keys(db);
    if (available.length === 0) return buildLimitedResponse(countryName, category, situationText);
    return buildLimitedResponse(countryName, category, situationText, available);
  }

  return {
    country: countryName,
    situation: situationText.slice(0, 140) + (situationText.length > 140 ? '…' : ''),
    severity: entry.severity || 'MEDIUM',
    urgentWarning: entry.urgent || null,
    sections: {
      situationSummary: buildSituationSummary(countryName, category, situationText, entry),
      applicableLaws: buildLawsSection(entry.laws || []),
      penalties: buildPenaltiesSection(entry.penalties || []),
      yourRights: buildListSection(entry.rights || []),
      whatToDo: buildStepsSection(entry.steps || []),
      legalDefense: buildListSection(entry.defenses || ['Consult a lawyer to identify defenses specific to your case.']),
      reducePenalty: buildListSection(entry.reduce || ['Consult a lawyer for options.']),
      officialResources: buildResourcesSection(entry.resources || []),
    },
    disclaimer: DISCLAIMER_TEXT,
    laws: (entry.laws || []).map(l => `${l.name}${l.section ? ' — ' + l.section : ''}`),
    penalties: (entry.penalties || []).map(p => `${p.type}: ${p.value}`),
    defenses: (entry.defenses || []),
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

function buildResourcesSection(resources) {
  if (!resources || !resources.length) return 'Search for official government legal resources for your country.';
  return resources.map(r => `**${r.name}:** ${r.url}`).join('\n');
}

function buildLimitedResponse(countryName, category, situationText, available) {
  const cats = available ? `Available data for this country covers: ${available.join(', ')}.` : '';
  return {
    country: countryName,
    situation: situationText.slice(0, 140),
    severity: 'MEDIUM',
    urgentWarning: 'Our database has limited information for this country. Please consult a licensed local lawyer for accurate guidance.',
    sections: {
      situationSummary: `Your situation in **${countryName}** involves the **${category}** area of law. ${cats}\n\nOur database currently has limited specific data for this country/category combination.`,
      applicableLaws: `Please consult official government legal resources or a licensed lawyer in ${countryName} for applicable laws.`,
      penalties: 'Consult local legal counsel for accurate penalty information.',
      yourRights: `In most jurisdictions you have: the right to silence, the right to a lawyer, and the right to know the charges against you. Verify these rights with a local lawyer in ${countryName}.`,
      whatToDo: `1. Stay calm and do not make statements without legal advice.\n2. Contact a licensed lawyer in ${countryName} immediately.\n3. Document everything with dates, names, and evidence.\n4. Contact your country's embassy if you are a foreigner.\n5. Search for free legal aid in ${countryName} if cost is a concern.`,
      legalDefense: 'Consult a lawyer to identify valid legal defenses for your specific situation.',
      reducePenalty: 'Cooperate with authorities while exercising your rights. Hire a lawyer early — earlier engagement typically produces better outcomes.',
      officialResources: `Search for "${countryName} Ministry of Justice" or "${countryName} Legal Aid" online for official government resources.`,
    },
    disclaimer: DISCLAIMER_TEXT,
    laws: [],
    penalties: [],
    defenses: ['Contact a local lawyer for specific defenses'],
  };
}

// ─── Main Query Function ──────────────────────────────────────────────────────
/**
 * LegalMatcher.query(countryCode, countryName, situationText)
 * Returns a structured legal response object.
 */
const LegalMatcher = {
  query(countryCode, countryName, situationText) {
    const [category, confidence] = detectCategory(situationText);
    const response = buildResponse(countryCode, category, countryName, situationText);
    response._meta = { category, confidence, engine: 'LAWFORGE-OFFLINE-v1' };
    return response;
  },

  getAvailableCategories(countryCode) {
    const db = LAWS_BUNDLE[countryCode];
    return db ? Object.keys(db) : [];
  },

  isCountrySupported(countryCode) {
    return !!(LAWS_BUNDLE[countryCode]);
  },
};
