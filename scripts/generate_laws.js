const fs = require('fs');
const path = require('path');

// Configuration
const SHARED_DATA_DIR = path.join(__dirname, '../shared/data');
const WEB_DATA_DIR = path.join(__dirname, '../lawforge-web/src/data');
const COUNTRIES_DB_FILE = path.join(__dirname, '../lawforge-web/src/data/countries.js');

const BUNDLE_BASENAME = 'laws_bundle.js';

// Files to read and merge
const SOURCE_FILES = [
  path.join(SHARED_DATA_DIR, 'laws_IN.js'),
  path.join(SHARED_DATA_DIR, 'laws_US.js'),
  path.join(SHARED_DATA_DIR, 'laws_other.js')
];

function generatePlaceholderLaws(countryCode, countryName) {
  return `
/* ${countryCode} — ${countryName} Auto-generated boilerplate */
const LAWS_${countryCode} = {
  Traffic: {
    severity: 'MEDIUM',
    urgent: null,
    laws: [
      { name: 'National Traffic Code (${countryCode})', section: 'General Rules', note: 'Governance of speed limits, DUI, and civil liabilities.' },
      { name: 'Motorway and Road Act', section: 'S. 102', note: 'Reckless and dangerous driving laws.' }
    ],
    penalties: [{ type: 'Reckless Driving', value: 'High Fine / Suspension' }, { type: 'DUI', value: 'Jail + License Revocation' }],
    rights: ['Right to request breathalyzer calibration logs.', 'Right to contest the ticket before a judge.'],
    steps: ['Check traffic ticket for exact deadline and court location.', 'Request the police report.', 'Hire a traffic attorney.'],
    defenses: ['Calibration error.', 'Medical emergency during operation.', 'Mistaken identity.'],
    reduce: ['Traffic awareness course.', 'First-time offender leniency.'],
    resources: [{ name: 'National Transport Authority', url: '#' }]
  },
  Workplace: {
    severity: 'MEDIUM',
    urgent: null,
    laws: [
      { name: 'National Labour Act', section: 'Employment Rights', note: 'Protects against wrongful termination and wage theft.' },
      { name: 'Equality & Anti-Discrimination Act', section: 'Protected Rights', note: 'Protections on basis of gender, race, religion, etc.' }
    ],
    penalties: [{ type: 'Wrongful Dismissal', value: 'Severance + Compensation' }, { type: 'Harassment', value: 'Civil Damages' }],
    rights: ['Right to fair notice period.', 'Right to safe working environment.', 'Right to unionize.'],
    steps: ['File written HR complaint.', 'Collect all internal emails.', 'Contact the Labour Board.'],
    defenses: ['Employer procedural error.', 'No proven cause for dismissal.', 'Breach of contract by employer.'],
    reduce: ['Mediation / Arbitration.', 'Negotiating a settlement agreement.'],
    resources: [{ name: 'Labour Conciliation Board', url: '#' }]
  },
  Police: {
    severity: 'HIGH',
    urgent: 'Contact a local lawyer immediately. Do not speak without representation.',
    laws: [
      { name: 'Criminal Procedure Code', section: 'Detention', note: 'Sets limits on holding a suspect without formal charge.' },
      { name: 'Human Rights Protocol', section: 'Fair Trial', note: 'Right against self-incrimination.' }
    ],
    penalties: [{ type: 'Unlawful Detention', value: 'Habeas Corpus / Civil Damages' }],
    rights: ['Right to silence.', 'Right to legal counsel.', 'Right to a phone call.', 'Right to be informed of charges.'],
    steps: ['Stay silent.', 'Request duty solicitor.', 'Do not sign confessions.', 'Obtain release records.'],
    defenses: ['Illegal search and seizure.', 'Lack of probable cause.', 'Miranda/Caution warning failure.'],
    reduce: ['Cooperation (via lawyer).', 'Voluntary surrender.'],
    resources: [{ name: 'National Public Defender', url: '#' }]
  },
  Cyber: {
    severity: 'HIGH',
    urgent: 'Change passwords and lock accounts. Evidence can disappear quickly.',
    laws: [
      { name: 'Data Protection & Cybercrimes Act', section: 'Digital Fraud', note: 'Unauthorized access, hacking, and phishing.' }
    ],
    penalties: [{ type: 'Identity Theft', value: 'Criminal Prosecution + Fines' }],
    rights: ['Right to report digital fraud to banks.', 'Right to trace IPs through police.', 'Right to request social media takedown.'],
    steps: ['Take screenshots immediately.', 'Report to platform.', 'File cybercrime complaint.', 'Notify bank.'],
    defenses: ['No intent.', 'Spoofed IP address.'],
    reduce: ['Full restitution of stolen assets.'],
    resources: [{ name: 'National Cyber Security Unit', url: '#' }]
  },
  Financial: {
    severity: 'MEDIUM',
    urgent: 'Stop transfers and report to central fraud agency.',
    laws: [
      { name: 'Financial Crimes & Anti-Money Laundering Act', section: 'Fraud', note: 'Regulates banking frauds, cheque bouncing, scams.' }
    ],
    penalties: [{ type: 'Cheque Bounce', value: 'Fines / Civil suit' }, { type: 'Bank Fraud', value: 'Restitution + Jail' }],
    rights: ['Right to chargeback on unauthorized credit card use.', 'Right to demand audit.'],
    steps: ['Report to bank within 24hrs.', 'Draft legal demand notice.', 'File police complaint.'],
    defenses: ['Identity theft (someone else used account).', 'Signature forged.'],
    reduce: ['Settling debt before court.', 'Bank mediation.'],
    resources: [{ name: 'National Financial Ombudsman', url: '#' }]
  },
  Criminal: {
    severity: 'CRITICAL',
    urgent: 'Retain a criminal defense attorney immediately. Make no statements.',
    laws: [
      { name: 'National Penal Code', section: 'Violent & Drug Crimes', note: 'Manslaughter, robbery, severe assault, narcotics.' }
    ],
    penalties: [{ type: 'Felony/Major Crime', value: 'Lengthy Imprisonment' }],
    rights: ['Right to bail hearing.', 'Right to cross-examine witnesses.', 'Presumption of innocence.'],
    steps: ['Plead not guilty initially.', 'Apply for bail.', 'Review police evidence (discovery) with lawyer.'],
    defenses: ['Self-defense.', 'Alibi.', 'Lack of intent (Mens Rea).', 'Unlawful evidence.'],
    reduce: ['Plea bargaining.', 'First offender status.'],
    resources: [{ name: 'Criminal Defense Registry', url: '#' }]
  },
  Domestic: {
    severity: 'HIGH',
    urgent: 'If you are in immediate danger, contact emergency services.',
    laws: [
      { name: 'Family & Domestic Violence Act', section: 'Protection Orders', note: 'Provides emergency injunctions against abusers.' }
    ],
    penalties: [{ type: 'Assault', value: 'Jail' }, { type: 'Restraining Order Breach', value: 'Immediate Arrest' }],
    rights: ['Right to emergency protection order.', 'Right to safe housing.', 'Right to sole custody under threat.'],
    steps: ['Call police if in danger.', 'Document injuries.', 'File for restraining order.', 'Contact domestic shelter.'],
    defenses: ['N/A for victims.', 'Self-defense.'],
    reduce: ['Mandatory counseling.'],
    resources: [{ name: 'National Domestic Violence Hotline', url: '#' }]
  },
  Medical: {
    severity: 'MEDIUM',
    urgent: 'Request all medical records immediately before they are altered.',
    laws: [
      { name: 'Medical Negligence & Health Act', section: 'Duty of Care', note: 'Governs malpractice and standard of care.' }
    ],
    penalties: [{ type: 'Malpractice', value: 'High civil damages / License revocation' }],
    rights: ['Right to informed consent.', 'Right to second opinion.', 'Right to full medical records.'],
    steps: ['Request full unabridged medical chart.', 'Consult medical malpractice lawyer.', 'Gather expert witness testimony.'],
    defenses: ['Known complication.', 'Patient non-compliance with treatment.'],
    reduce: ['Out of court settlement.'],
    resources: [{ name: 'National Medical Council', url: '#' }]
  },
  Consumer: {
    severity: 'LOW',
    urgent: 'Null',
    laws: [
      { name: 'Consumer Protection Act', section: 'Fair Trading', note: 'Protects against defective products and unfair terms.' }
    ],
    penalties: [{ type: 'Defective Goods', value: 'Full Refund / Replacement' }],
    rights: ['Right to repair, replace, or refund.', 'Right to cancel online orders.'],
    steps: ['Send written complaint.', 'File with small claims court.', 'Use ADR (Alternative Dispute Resolution).'],
    defenses: ['Product altered by consumer.', 'Out of warranty.'],
    reduce: ['Credit card chargeback.'],
    resources: [{ name: 'Consumer Rights Agency', url: '#' }]
  },
  Contract: {
    severity: 'MEDIUM',
    urgent: 'Null',
    laws: [
      { name: 'Civil Obligations Act', section: 'Contracts', note: 'Rules for breach, damages, and enforcement.' }
    ],
    penalties: [{ type: 'Breach of Contract', value: 'Specific Performance or Damages' }],
    rights: ['Right to sue for damages.', 'Right to terminate upon material breach.'],
    steps: ['Send formal breach notice.', 'Attempt mediation.', 'File civil suit.'],
    defenses: ['Force Majeure.', 'Mutual mistake.', 'Invalid formation.'],
    reduce: ['Settlement.', 'Liquidated damages clause.'],
    resources: [{ name: 'National Chamber of Commerce', url: '#' }]
  },
  Immigration: {
    severity: 'HIGH',
    urgent: 'Consult an immigration lawyer immediately. Deadlines are strict.',
    laws: [
      { name: 'National Immigration Act', section: 'Visas & Deportation', note: 'Governs legal residence, asylum, and deportation.' }
    ],
    penalties: [{ type: 'Overstay', value: 'Deportation + Entry Ban' }],
    rights: ['Right to appeal deportation.', 'Right to claim asylum.', 'Right to consular access.'],
    steps: ['Do not ignore letters.', 'File appeal within deadline.', 'Seek emergency injunction if removal is imminent.'],
    defenses: ['Asylum claim under international law.', 'Spousal sponsorship.', 'Medical unfitness for travel.'],
    reduce: ['Voluntary departure (avoids ban).'],
    resources: [{ name: 'Immigration Legal Aid', url: '#' }]
  },
  Property: {
    severity: 'MEDIUM',
    urgent: 'Null',
    laws: [
      { name: 'Tenancy & Real Estate Act', section: 'Evictions', note: 'Governs landlord-tenant disputes and land ownership.' }
    ],
    penalties: [{ type: 'Illegal Eviction', value: 'Damages paid to tenant' }],
    rights: ['Right to quiet enjoyment.', 'Right to minimum notice periods before eviction.'],
    steps: ['Check lease terms.', 'Send recorded letter.', 'File with tenancy tribunal.'],
    defenses: ['Unpaid rent.', 'Property damage.'],
    reduce: ['Payment plan for arrears.'],
    resources: [{ name: 'Tenancy Tribunal', url: '#' }]
  }
};
`;
}

async function compileLaws() {
  console.log('--- COMPILING LEGAL DATABASE ---');
  
  // 1. Read existing law codes from the source files
  let bundledData = "";
  const foundCodes = new Set();
  
  SOURCE_FILES.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Reading: ${path.basename(file)}`);
      const content = fs.readFileSync(file, 'utf-8');
      bundledData += content + "\n";
      
      // Extract codes like LAWS_IN, LAWS_GB etc.
      const matches = content.matchAll(/const LAWS_([A-Z]{2})\s*=/g);
      for (const match of matches) {
        foundCodes.add(match[1]);
      }
    }
  });

  // 2. Load all possible country codes from the countries database
  const countriesContent = fs.readFileSync(COUNTRIES_DB_FILE, 'utf-8');
  const codeMatches = [...countriesContent.matchAll(/code:\s*['"]([A-Z]{2})['"]/g)];
  const allCodes = codeMatches.map(m => m[1]);
  
  const missingCodes = allCodes.filter(c => !foundCodes.has(c));
  console.log(`Matched ${foundCodes.size} existing codes. Generating placeholders for ${missingCodes.length} codes.`);

  // 3. Generate placeholders for missing codes
  missingCodes.forEach(code => {
    bundledData += generatePlaceholderLaws(code, code);
  });

  // 4. Build the final LAWS_BUNDLE map
  let bundleMap = `\nexport const LAWS_BUNDLE = {\n`;
  allCodes.forEach(code => {
    bundleMap += `  ${code}: LAWS_${code},\n`;
  });
  bundleMap += `};\n`;

  // 5. Final Output Assembly
  const finalOutput = `
/**
 * LAWFORGE AI — Offline Legal Bundle (Full 50+ Countries)
 * Auto-generated by scripts/generate_laws.js on ${new Date().toISOString()}
 */

${bundledData}
${bundleMap}

export const LIMITED_DATA_COUNTRIES = ${JSON.stringify(missingCodes)};
export const DISCLAIMER_TEXT = "This information is for general educational purposes only. It does not constitute legal advice and should not be relied upon as such. Laws vary by jurisdiction and change frequently. Always consult a qualified, licensed lawyer in your specific jurisdiction for advice on your particular situation.";
`;

  // Write to Shared
  if (!fs.existsSync(SHARED_DATA_DIR)) fs.mkdirSync(SHARED_DATA_DIR, { recursive: true });
  const sharedPath = path.join(SHARED_DATA_DIR, BUNDLE_BASENAME);
  fs.writeFileSync(sharedPath, finalOutput);
  console.log(`✅ Bundle written to ${sharedPath}`);

  // Write to Web App
  if (fs.existsSync(WEB_DATA_DIR)) {
    const webPath = path.join(WEB_DATA_DIR, BUNDLE_BASENAME);
    fs.writeFileSync(webPath, finalOutput);
    console.log(`✅ Web App Bundle updated: ${webPath}`);
  }
}

compileLaws().catch(console.error);

