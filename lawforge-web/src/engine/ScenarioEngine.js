/**
 * LAWFORGE AI — ScenarioEngine.js
 * Generates "What If" outcome paths from category + severity + country
 * 100% offline, zero dependencies
 */

const SCENARIO_DATA = {
  Traffic: {
    paths: [
      { action: 'Pay fine immediately & attend defensive driving course', type: 'best' },
      { action: 'Contest fine in court with valid defense', type: 'neutral' },
      { action: 'Ignore fine entirely', type: 'worst' },
    ],
  },
  Workplace: {
    paths: [
      { action: 'Negotiate settlement with employer directly', type: 'best' },
      { action: 'File a formal labour tribunal complaint', type: 'neutral' },
      { action: 'Resign and take no action', type: 'worst' },
    ],
  },
  Property: {
    paths: [
      { action: 'Negotiate with landlord and document everything', type: 'best' },
      { action: 'File a formal tenancy board / civil complaint', type: 'neutral' },
      { action: 'Leave premises and forgo deposit/rights', type: 'worst' },
    ],
  },
  Police: {
    paths: [
      { action: 'Exercise right to silence and get a lawyer immediately', type: 'best' },
      { action: 'Cooperate partially and apply for bail', type: 'neutral' },
      { action: 'Resist or make statements without counsel', type: 'worst' },
    ],
  },
  Financial: {
    paths: [
      { action: 'Report fraud to authorities & bank immediately', type: 'best' },
      { action: 'Pursue civil claim through consumer court', type: 'neutral' },
      { action: 'Take no action and absorb the loss', type: 'worst' },
    ],
  },
  Consumer: {
    paths: [
      { action: 'File consumer complaint within statutory period', type: 'best' },
      { action: 'Send legal notice and negotiate refund', type: 'neutral' },
      { action: 'Accept the loss without any formal action', type: 'worst' },
    ],
  },
  Domestic: {
    paths: [
      { action: 'Seek immediate protection order and safe accommodation', type: 'best' },
      { action: 'File police complaint and begin legal process', type: 'neutral' },
      { action: 'Return to situation without legal protection', type: 'worst' },
    ],
  },
  Cyber: {
    paths: [
      { action: 'Report to cybercrime portal and preserve all evidence', type: 'best' },
      { action: 'File police FIR and contact platform for content removal', type: 'neutral' },
      { action: 'Delete everything and take no legal action', type: 'worst' },
    ],
  },
  Criminal: {
    paths: [
      { action: 'Secure legal representation before any statement', type: 'best' },
      { action: 'Apply for bail and cooperate with process', type: 'neutral' },
      { action: 'Resist arrest or make uncouncelled statements', type: 'worst' },
    ],
  },
  Contract: {
    paths: [
      { action: 'Send formal legal notice and negotiate settlement', type: 'best' },
      { action: 'File civil suit within limitation period', type: 'neutral' },
      { action: 'Take no action and allow breach to stand', type: 'worst' },
    ],
  },
  Medical: {
    paths: [
      { action: 'File complaint with medical board and preserve records', type: 'best' },
      { action: 'Pursue civil negligence claim with expert testimony', type: 'neutral' },
      { action: 'Accept the outcome with no formal action', type: 'worst' },
    ],
  },
  Family: {
    paths: [
      { action: 'Engage mediation to reach an amicable agreement', type: 'best' },
      { action: 'File petition in Family Court', type: 'neutral' },
      { action: 'Abandon legal rights without formal resolution', type: 'worst' },
    ],
  },
};

const RISK_MULTIPLIERS = {
  best:    { LOW: -25, MEDIUM: -20, HIGH: -15 },
  neutral: { LOW:  10, MEDIUM:  5,  HIGH:  0  },
  worst:   { LOW:  30, MEDIUM:  40, HIGH:  55 },
};

const OUTCOMES = {
  best: {
    LOW:    { outcome: 'Strong likelihood of full resolution without court intervention. Minimal stress and cost.', time: '2–4 weeks', cost: 'Low (consultation fee only)' },
    MEDIUM: { outcome: 'Good chance of favourable settlement. Early action maximises your position.', time: '1–3 months', cost: 'Moderate (lawyer + filing)' },
    HIGH:   { outcome: 'Significant improvement in odds. Legal representation is critical at this path.', time: '3–6 months', cost: 'High (full legal team)' },
  },
  neutral: {
    LOW:    { outcome: 'Formal process resolves matter but adds time and bureaucracy.', time: '1–3 months', cost: 'Low–Moderate' },
    MEDIUM: { outcome: 'Formal complaint likely to succeed but outcome uncertain without evidence.', time: '3–12 months', cost: 'Moderate–High' },
    HIGH:   { outcome: 'Contested process with risk of adverse ruling. Outcome depends heavily on evidence.', time: '6–18 months', cost: 'High' },
  },
  worst: {
    LOW:    { outcome: 'Rights are forfeited. Counterparty may escalate against you. Avoidable loss.', time: 'Permanent', cost: 'Full exposure' },
    MEDIUM: { outcome: 'Serious legal and financial consequences. Counterparty gains full advantage.', time: 'Permanent', cost: 'Very High' },
    HIGH:   { outcome: 'Severe consequences including criminal record, maximum penalties, and civil liability.', time: 'Permanent', cost: 'Catastrophic' },
  },
};

export const ScenarioEngine = {
  generate(category, severity = 'MEDIUM', country = '') {
    const sev = (severity || 'MEDIUM').toUpperCase();
    const paths = SCENARIO_DATA[category]?.paths || [
      { action: 'Seek immediate legal advice and document everything', type: 'best' },
      { action: 'File a formal complaint with relevant authority', type: 'neutral' },
      { action: 'Take no action and ignore the situation', type: 'worst' },
    ];

    return paths.map(p => {
      const riskDelta = RISK_MULTIPLIERS[p.type]?.[sev] ?? 0;
      const outData = OUTCOMES[p.type]?.[sev] ?? OUTCOMES[p.type]?.MEDIUM;
      return {
        type: p.type,
        action: p.action,
        outcome: outData?.outcome,
        risk_delta: riskDelta,
        time_estimate: outData?.time,
        cost_estimate: outData?.cost,
        recommendation: p.type === 'best',
        jurisdiction: country || 'General',
      };
    });
  },
};
