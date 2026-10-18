/**
 * LAWFORGE AI — DocumentEngine.js
 * Generates court-ready legal documents from structured response data
 * 100% offline, zero library dependencies
 */

const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
const caseId = (country) => `LF-${country?.substring(0,2).toUpperCase()}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

const TEMPLATES = {
  legal_notice: (data) => `
WITHOUT PREJUDICE

LEGAL NOTICE

Date: ${today()}
Case Reference: ${caseId(data.country)}

From:
[YOUR FULL NAME]
[Your Address]
[City, State, PIN/ZIP]
[Your Email] | [Your Phone]

To:
[RECIPIENT FULL NAME / COMPANY]
[Recipient Address]

Subject: Legal Notice — ${data.category || 'Legal Matter'} — ${data.country}

Dear Sir / Madam,

I, [YOUR NAME], hereby serve you this formal legal notice under the laws of ${data.country} regarding the following matter:

FACTS OF THE CASE:
${data.situation || '[Describe the incident clearly]'}

APPLICABLE LAW:
${data.laws_raw || 'The applicable laws of ' + data.country + ' govern this matter.'}

DEMANDS:
1. Immediately cease and desist from the aforesaid unlawful conduct.
2. Provide written acknowledgment of receipt of this notice within 7 (seven) days.
3. Remedy the grievance described above within 30 (thirty) days of receipt.
4. Failure to comply shall leave me with no option but to initiate appropriate legal proceedings, including but not limited to civil and/or criminal action, without further notice.

DISCLAIMER:
This notice is issued without prejudice to any and all rights, remedies, and claims I may have, all of which are expressly reserved.

Yours faithfully,

_________________________
[YOUR FULL NAME]
[Date: ${today()}]

Enclosures: [List attached supporting documents]
`.trim(),

  consumer_complaint: (data) => `
CONSUMER COMPLAINT

Date: ${today()}
Case Reference: ${caseId(data.country)}

COMPLAINANT DETAILS:
Name: [YOUR FULL NAME]
Address: [Your Address]
Phone: [Your Phone]
Email: [Your Email]

RESPONDENT DETAILS:
Name / Company: [COMPANY / INDIVIDUAL NAME]
Address: [Respondent Address]

SUBJECT: Consumer Complaint — ${data.category || 'Consumer Matter'}

FACTS:
${data.situation || '[Describe what happened, including dates and amounts]'}

RELIEF SOUGHT:
1. Full refund of ₹/$/£[AMOUNT] paid on [DATE].
2. Compensation for mental agony and inconvenience.
3. Cost of this complaint.

DECLARATION:
I declare that the facts stated above are true and correct to the best of my knowledge.

Signature: _________________________
Name: [YOUR FULL NAME]
Date: ${today()}
`.trim(),

  workplace_grievance: (data) => `
FORMAL WORKPLACE GRIEVANCE

Date: ${today()}
Reference: ${caseId(data.country)}

Employee: [YOUR FULL NAME]
Designation: [Your Job Title]
Department: [Your Department]
Date of Employment: [Start Date]

To: [HR MANAGER / EMPLOYER NAME]
Company: [Company Name]

Subject: Formal Grievance — ${data.category || 'Workplace Matter'}

Dear [HR Manager's Name],

I am writing to formally raise a grievance regarding the following matter that occurred on [DATE]:

DESCRIPTION OF GRIEVANCE:
${data.situation || '[Clearly describe the incident including dates, witnesses, and impact]'}

REQUESTED RESOLUTION:
1. [Specific action you want taken — e.g., reinstatement, unpaid wages, apology]
2. Written confirmation of receipt of this grievance within 5 working days.
3. A formal hearing within 14 working days of this notice.

I reserve all rights under the applicable employment laws of ${data.country}.

Yours sincerely,

_________________________
[YOUR FULL NAME]
[Date: ${today()}]
`.trim(),

  eviction_response: (data) => `
TENANT'S RESPONSE TO EVICTION NOTICE

Date: ${today()}
Reference: ${caseId(data.country)}

Tenant: [YOUR FULL NAME]
Property Address: [Rental Property Address]

To: [LANDLORD / AGENT NAME]
Address: [Landlord Address]

Subject: Formal Response to Eviction Notice dated [DATE OF NOTICE]

Dear [Landlord's Name],

I write in response to your notice dated [DATE] purporting to require my vacation of the above premises.

GROUNDS FOR DISPUTE:
${data.situation || '[State why the eviction is unlawful — lack of notice, no court order, retaliatory, etc.]'}

LEGAL POSITION:
Under the applicable laws of ${data.country}, a landlord may not evict a tenant without [X days] written notice / a valid court order. The notice served does not comply with these requirements.

DEMANDS:
1. Immediately withdraw the unlawful eviction notice.
2. Confirm in writing that you will follow the lawful eviction procedure.
3. Failure to do so will result in an emergency application to the relevant tribunal/court.

I reserve all rights under the tenancy law of ${data.country}.

Yours faithfully,

_________________________
[YOUR FULL NAME]
[Date: ${today()}]
`.trim(),

  police_complaint: (data) => `
COMPLAINT TO POLICE / LAW ENFORCEMENT

Date: ${today()}
Station/Reference: ______________________

Complainant: [YOUR FULL NAME]
Address: [Your Address]
Phone: [Your Phone]
Identification: [ID Type + Number]

Subject: Complaint Against [ACCUSED NAME / UNKNOWN]

To,
The Station House Officer / Officer in Charge,
[Police Station Name]

Sir/Madam,

I wish to lodge a formal complaint regarding the following incident:

DATE AND TIME OF INCIDENT: [Date] at [Time]
LOCATION: [Exact location]

DESCRIPTION OF INCIDENT:
${data.situation || '[Describe what happened in chronological order, clearly and factually]'}

NAMES OF WITNESSES (if any):
1. [Name + Contact]
2. [Name + Contact]

EVIDENCE AVAILABLE:
[ ] Photographs / Videos
[ ] Written communications (emails, messages)
[ ] Physical evidence
[ ] Other: ___________

I request that a First Information Report (FIR) / Police Report be registered and appropriate action taken against the accused.

Yours faithfully,

_________________________
[YOUR FULL NAME]
[Date: ${today()}]
`.trim(),

  fir_complaint: (data) => `
FIRST INFORMATION REPORT (FIR) — DRAFT

Date: ${today()}
PS No. / Station: ______________________
District: ______________________________

COMPLAINANT:
Name: [YOUR FULL NAME]
Father's Name: [Father's Name]
Age: [Age] | Gender: [M/F/Other]
Address: [Permanent Address]
Mobile: [Phone]

ACCUSED (if known):
Name: [Accused Name or Unknown]
Address: [If known]

OFFENCE DETAILS:
Date of Offence: [Date]
Time: [Approx. Time]
Place: [Full Address / Location]

BRIEF DESCRIPTION:
${data.situation || '[Write a factual, chronological account of what happened]'}

SECTIONS APPLICABLE:
${data.laws_raw || '[Cite applicable sections based on legal advice]'}

I solemnly affirm that the above facts are true to the best of my knowledge.

Signature: _________________________
Name: [YOUR FULL NAME]
Date: ${today()}
`.trim(),
};

export const DocumentEngine = {
  generate(type, data = {}) {
    const template = TEMPLATES[type];
    if (!template) return `Document type "${type}" not found.`;
    return template(data);
  },

  getTypes() {
    return [
      { id: 'legal_notice',       label: '📜 Legal Notice',         icon: '📜' },
      { id: 'consumer_complaint', label: '🛒 Consumer Complaint',    icon: '🛒' },
      { id: 'workplace_grievance',label: '💼 Workplace Grievance',   icon: '💼' },
      { id: 'eviction_response',  label: '🏠 Eviction Response',     icon: '🏠' },
      { id: 'police_complaint',   label: '🚔 Police Complaint',      icon: '🚔' },
      { id: 'fir_complaint',      label: '📋 FIR Draft',             icon: '📋' },
    ];
  },

  generateCaseId(country) {
    return caseId(country);
  }
};
