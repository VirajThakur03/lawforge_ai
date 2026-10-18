/* INDIA — Legal Database */
const LAWS_IN = {
  Traffic: {
    severity:"MEDIUM",
    urgent:null,
    laws:[
      {name:"Motor Vehicles Act 1988",section:"Section 183",note:"Speeding offence — penalty for driving above prescribed speed limits on public roads."},
      {name:"Motor Vehicles Act 1988",section:"Section 184",note:"Dangerous driving — reckless or negligent driving endangering public safety."},
      {name:"Motor Vehicles Act 1988",section:"Section 185",note:"Driving under influence of alcohol or drugs (DUI)."},
      {name:"Motor Vehicles Act 1988",section:"Section 177",note:"General violations including signal jumping, wrong-side driving."},
      {name:"Motor Vehicles (Amendment) Act 2019",section:"Amended penalties",note:"Significantly increased fines across all categories effective September 2019."}
    ],
    penalties:[
      {type:"Speeding (1st offence)",value:"₹1,000–₹2,000"},
      {type:"Speeding (2nd offence)",value:"₹2,000–₹4,000 + possible suspension"},
      {type:"Dangerous driving",value:"Up to ₹5,000 + 6 months jail"},
      {type:"DUI",value:"₹10,000 + 6 months jail (1st); ₹15,000 + 2 years jail (2nd)"},
      {type:"Signal jumping",value:"₹1,000–₹5,000"},
      {type:"No helmet (2-wheeler)",value:"₹1,000 + 3-month licence suspension"},
      {type:"No seatbelt",value:"₹1,000"}
    ],
    rights:[
      "You have the right to ask the officer to identify themselves and show their badge number.",
      "You have the right to demand an official challan (fine slip) — never pay cash directly to an officer.",
      "You have the right to contest the challan in a motor accident claims tribunal or magistrate court.",
      "If challan is issued, you have 60–90 days to pay or contest.",
      "You cannot be detained indefinitely for a traffic violation — only your vehicle may be impounded."
    ],
    steps:[
      "Stay calm and pull over safely. Do not argue or resist.",
      "Ask the officer for their service number and name.",
      "Demand a printed challan — refuse to pay cash directly.",
      "Note the challan number, officer name, date/time, and violation mentioned.",
      "You may pay online via the Parivahan portal (parivahan.gov.in) or at a designated court.",
      "To contest: appear before the designated traffic court on the date mentioned on the challan."
    ],
    defenses:[
      "Defective/incorrectly calibrated speed detection equipment (demand calibration certificate).",
      "Emergency situation — medical emergency or avoidance of accident.",
      "Improper signage — speed limit sign not visible or absent.",
      "Wrong vehicle identification — wrong number plate noted by officer.",
      "First-time offender leniency plea in court."
    ],
    reduce:[
      "Pay fine online within the stipulated time to avoid late fees.",
      "Attend traffic awareness course if offered by state transport authority.",
      "Plead guilty in court with an apology for first-time minor offences — magistrate may reduce fine.",
      "Keep your vehicle documents and fitness certificate up to date to avoid compound violations."
    ],
    resources:[
      {name:"Parivahan Portal (Pay Fines Online)",url:"https://parivahan.gov.in"},
      {name:"e-Challan Status Check",url:"https://echallan.parivahan.gov.in"},
      {name:"Ministry of Road Transport",url:"https://morth.nic.in"}
    ]
  },
  Workplace: {
    severity:"MEDIUM",
    urgent:null,
    laws:[
      {name:"Industrial Disputes Act 1947",section:"Section 25F/25G/25H",note:"Governs retrenchment — employer must give 1 month notice and pay retrenchment compensation."},
      {name:"Payment of Wages Act 1936",section:"Section 3/4",note:"Employer must pay wages on time; deductions are strictly regulated."},
      {name:"Sexual Harassment of Women at Workplace (POSH) Act 2013",section:"Section 4/11",note:"Mandates Internal Complaints Committee; prohibits sexual harassment."},
      {name:"Employees' Provident Fund Act 1952",section:"Section 6",note:"Employer must contribute 12% of basic salary to EPF."},
      {name:"Code on Wages 2019",section:"Various",note:"Consolidates minimum wage laws; employer must pay minimum wages."}
    ],
    penalties:[
      {type:"Illegal termination compensation",value:"15 days wages per year of service"},
      {type:"Unpaid wage violation",value:"Employer liable for 3x unpaid amount + imprisonment up to 1 year"},
      {type:"POSH violation (no ICC)",value:"Fine up to ₹50,000; repeat: licence cancellation"},
      {type:"EPF non-contribution",value:"12% penalty + prosecution"}
    ],
    rights:[
      "You cannot be terminated without notice or cause after 240 days of continuous service.",
      "You have the right to receive all due wages on time.",
      "You have the right to file a complaint with the Labour Commissioner for unpaid wages.",
      "Female employees have the right to file a sexual harassment complaint with the Internal Complaints Committee (ICC).",
      "You have the right to form or join a trade union.",
      "You are entitled to EPF, ESI, and gratuity after qualifying service periods."
    ],
    steps:[
      "Document everything: keep all emails, payslips, appointment letters, and termination letters.",
      "If wages are unpaid: send a written demand letter to HR/employer.",
      "File a complaint with the district Labour Commissioner or Labour Court.",
      "For sexual harassment: first file with the Internal Complaints Committee (ICC). If no ICC exists, file with the Local Complaints Committee (LCC).",
      "For wrongful termination: file an industrial dispute claim with the Labour Court within 3 years.",
      "Consult a labour lawyer — first consultation is often free at legal aid centres."
    ],
    defenses:[
      "Retrenchment without following proper procedure (Section 25F) — termination void.",
      "Discrimination based on gender/religion/caste — protected under Constitution + labour laws.",
      "Constructive dismissal — employer made conditions unbearable forcing resignation."
    ],
    reduce:[
      "Attempt internal resolution before external legal action — faster and less costly.",
      "Request conciliation through the Labour Commissioner — free government service.",
      "Keep records of all communications to strengthen your case."
    ],
    resources:[
      {name:"Ministry of Labour & Employment",url:"https://labour.gov.in"},
      {name:"Shram Suvidha Portal (File complaints)",url:"https://shramsuvidha.gov.in"},
      {name:"EPFO",url:"https://www.epfindia.gov.in"}
    ]
  },
  Police: {
    severity:"HIGH",
    urgent:"Contact a licensed lawyer immediately. Do not make any statements without legal counsel.",
    laws:[
      {name:"Code of Criminal Procedure 1973 (CrPC)",section:"Section 41",note:"Police can arrest without warrant only if offence is cognizable and conditions are met."},
      {name:"Code of Criminal Procedure 1973",section:"Section 50",note:"Police must inform you of the grounds of your arrest immediately."},
      {name:"Code of Criminal Procedure 1973",section:"Section 57",note:"You cannot be detained for more than 24 hours without being produced before a magistrate."},
      {name:"Constitution of India",section:"Article 20(3)",note:"Right against self-incrimination — you cannot be forced to be a witness against yourself."},
      {name:"Constitution of India",section:"Article 22",note:"Right to be informed of arrest grounds; right to consult a lawyer of choice."},
      {name:"Arnesh Kumar v State of Bihar (2014 SC)",section:"Supreme Court ruling",note:"Police must follow D.K. Basu guidelines; cannot arrest arbitrarily."}
    ],
    penalties:[
      {type:"Wrongful arrest by police",value:"You may file a writ of Habeas Corpus in High Court"},
      {type:"Custodial torture",value:"Punishable under IPC + NHRC guidelines; civil suit for compensation"}
    ],
    rights:[
      "You have the right to know WHY you are being arrested.",
      "You have the right to inform a family member or friend of your arrest — police MUST allow this.",
      "You have the right to consult a lawyer BEFORE making any statement.",
      "You CANNOT be held for more than 24 hours without a magistrate's order.",
      "You CANNOT be forced to confess — any confession under coercion is inadmissible.",
      "You have the right to bail for bailable offences.",
      "Women can only be arrested by female officers and CANNOT be arrested after sunset."
    ],
    steps:[
      "Stay calm. Do not resist — even if the arrest is wrongful, resist through legal channels.",
      "Ask clearly: 'What is the reason for my arrest?'",
      "Invoke your rights: 'I want to speak to my lawyer before making any statement.'",
      "Inform a family member immediately. You or the police must do this.",
      "Do NOT sign any document without reading it fully or without your lawyer present.",
      "If denied a lawyer, cite Article 22 of the Constitution.",
      "After release: file a complaint with the SP/SSP or the State Human Rights Commission for any violations."
    ],
    defenses:[
      "Illegal arrest (no warrant for non-cognizable offence) — file Habeas Corpus petition.",
      "Arrest without informing grounds — violates CrPC Section 50.",
      "Detention beyond 24 hours without magistrate order — illegal.",
      "Evidence obtained through coercion or illegal search — inadmissible."
    ],
    reduce:[
      "Cooperate calmly and professionally while asserting rights.",
      "Seek anticipatory bail (Section 438 CrPC) if you expect arrest.",
      "Apply for regular bail promptly through your lawyer."
    ],
    resources:[
      {name:"National Human Rights Commission",url:"https://nhrc.nic.in"},
      {name:"National Legal Services Authority (Free Legal Aid)",url:"https://nalsa.gov.in"},
      {name:"State Legal Services Authority",url:"https://nalsa.gov.in/lsams"}
    ]
  },
  Financial: {
    severity:"HIGH",
    urgent:"If you're a victim — file complaint immediately. If accused — contact a lawyer before making any statement.",
    laws:[
      {name:"Indian Penal Code 1860",section:"Section 420",note:"Cheating and dishonest inducement — up to 7 years imprisonment."},
      {name:"Indian Penal Code 1860",section:"Section 406",note:"Criminal breach of trust — up to 3 years."},
      {name:"Negotiable Instruments Act 1881",section:"Section 138",note:"Cheque bounce — criminal liability; fine up to 2x cheque amount + 2 years jail."},
      {name:"Prevention of Money Laundering Act 2002",section:"Section 4",note:"Money laundering — up to 7 years imprisonment."},
      {name:"Information Technology Act 2000",section:"Section 66D",note:"Online fraud / cheating using computer — up to 3 years + fine."},
      {name:"Bharatiya Nyaya Sanhita 2023",section:"Section 318",note:"New code replacing IPC for cheating — similar penalties."}
    ],
    penalties:[
      {type:"Online fraud (victim)",value:"File FIR; compensation from perpetrator"},
      {type:"Cheque bounce (accused)",value:"Fine up to 2x cheque amount + up to 2 years jail"},
      {type:"Financial fraud (accused)",value:"Up to 7 years + fine under IPC 420"}
    ],
    rights:[
      "As a VICTIM: You have the right to file an FIR; police CANNOT refuse.",
      "As a VICTIM: You may file a complaint with the Cyber Crime Portal for online fraud.",
      "As ACCUSED: You have the right to remain silent and consult a lawyer.",
      "You have the right to approach the consumer forum for recovery of money."
    ],
    steps:[
      "If you are a VICTIM: Take screenshots of all transactions, messages, and communications.",
      "File an FIR at the nearest police station — bring printed evidence.",
      "File a complaint at cybercrime.gov.in for online fraud.",
      "For cheque bounce: send a legal notice to the issuer within 30 days of dishonour.",
      "File a case in Magistrate Court under Section 138 NI Act within 1 month of notice.",
      "Report to RBI (if bank fraud) or SEBI (if investment fraud)."
    ],
    defenses:[
      "If accused of cheque bounce: prove cheque was given as security (not payment).",
      "Lack of fraudulent intent — genuine dispute over contract terms.",
      "Fraud claim is false — all transactions were authorised."
    ],
    reduce:[
      "Return the money + interest voluntarily before court — magistrate may allow compounding.",
      "Attempt mediation/settlement for civil disputes — faster resolution.",
      "Bank-level fraud recovery requests processed within 7 days if reported promptly."
    ],
    resources:[
      {name:"Cyber Crime Portal",url:"https://cybercrime.gov.in"},
      {name:"RBI Ombudsman (Banking Complaints)",url:"https://rbi.org.in/scripts/Complaints.aspx"},
      {name:"SEBI (Investment Fraud)",url:"https://scores.sebi.gov.in"},
      {name:"National Consumer Helpline",url:"https://consumerhelpline.gov.in"}
    ]
  },
  Cyber: {
    severity:"HIGH",
    urgent:"Preserve all digital evidence immediately — screenshots, emails, transaction records.",
    laws:[
      {name:"Information Technology Act 2000",section:"Section 66C",note:"Identity theft — up to 3 years + ₹1 lakh fine."},
      {name:"Information Technology Act 2000",section:"Section 66D",note:"Cheating by personation using computer — up to 3 years + fine."},
      {name:"Information Technology Act 2000",section:"Section 67",note:"Publishing obscene material online — up to 3 years + ₹5 lakh fine."},
      {name:"Indian Penal Code / BNS 2023",section:"Section 499/500 (Defamation)",note:"Online defamation — criminal and civil liability."},
      {name:"IT (Intermediary Guidelines) Rules 2021",section:"Rule 4",note:"Platforms must take down illegal content within 24–72 hours of complaint."}
    ],
    penalties:[
      {type:"Hacking (victim)",value:"File complaint; perpetrator gets up to 3 years jail"},
      {type:"Online defamation",value:"Criminal: up to 2 years; Civil: damages as assessed by court"},
      {type:"Cyberstalking",value:"Up to 3 years jail + fine"}
    ],
    rights:[
      "You have the right to file a complaint at cybercrime.gov.in from anywhere in India.",
      "You can demand platforms remove defamatory or illegal content within 24–72 hours.",
      "Your personal data is protected under IT Act; data breaches must be reported.",
      "You can request police help to trace cybercriminals even across states."
    ],
    steps:[
      "Take screenshots of everything — do not delete message/email evidence.",
      "Do not transfer more money; block the scammer immediately.",
      "Report to cybercrime.gov.in — national portal, fastest route.",
      "File local FIR at police station with printed evidence.",
      "Contact your bank immediately for financial fraud — reverse within 7 days if promptly reported.",
      "For social media harassment, report to the platform AND the cyber crime cell."
    ],
    defenses:[
      "Mistaken identity — your credentials were stolen and used by another.",
      "Content was shared without your knowledge by a third party.",
      "Satire/parody exceptions for defamation claims."
    ],
    reduce:[
      "Report immediately — faster reporting = higher chance of money recovery.",
      "Cooperate fully with cyber police — provide all logs and access needed.",
      "Change all passwords and enable 2FA after an incident."
    ],
    resources:[
      {name:"National Cyber Crime Reporting Portal",url:"https://cybercrime.gov.in"},
      {name:"Cyber Crime Helpline",url:"tel:1930"},
      {name:"CERT-In (Govt Cyber Security)",url:"https://www.cert-in.org.in"}
    ]
  },
  Consumer: {
    severity:"LOW",
    urgent:null,
    laws:[
      {name:"Consumer Protection Act 2019",section:"Section 2(7)",note:"Defines consumer rights — covers goods and services."},
      {name:"Consumer Protection Act 2019",section:"Section 35",note:"Consumer can file complaint in District Commission (up to ₹1 crore)."},
      {name:"Consumer Protection Act 2019",section:"Section 47",note:"State Commission handles complaints ₹1–₹10 crore."},
      {name:"Legal Metrology Act 2009",section:"Section 36",note:"Overcharging beyond MRP is a criminal offence."},
      {name:"e-Commerce Rules 2020",section:"Rule 6",note:"E-commerce platforms must provide refund and grievance redressal."}
    ],
    penalties:[
      {type:"Seller overcharging above MRP",value:"Fine up to ₹25,000 (first offence)"},
      {type:"Defective goods (seller liable)",value:"Refund + compensation as ordered by Commission"},
      {type:"Service deficiency",value:"Compensation as determined by Consumer Commission"}
    ],
    rights:[
      "Right to be protected against unsafe goods.",
      "Right to information — seller must disclose quality, quantity, price.",
      "Right to choose — seller cannot force a specific brand.",
      "Right to redressal — free to file complaint in Consumer Commission.",
      "Right to refund on defective product within 30 days of purchase (e-commerce)."
    ],
    steps:[
      "First: contact the company's customer care and keep records of your complaint.",
      "Send a legal notice via registered post giving 15–30 days to resolve.",
      "File complaint at National Consumer Helpline: 1800-11-4000 (free).",
      "File online complaint at consumerhelpline.gov.in.",
      "Escalate to District Consumer Commission — filing fee is nominal (₹100–₹500).",
      "No lawyer required — you can represent yourself."
    ],
    defenses:[
      "N/A — This section applies when you are the consumer asserting your rights."
    ],
    reduce:[
      "Attempt resolution directly with the brand — fastest option.",
      "Credit card chargeback for online purchases — contact your bank.",
      "National Consumer Helpline often resolves in 2 weeks without going to court."
    ],
    resources:[
      {name:"National Consumer Helpline (Free)",url:"https://consumerhelpline.gov.in"},
      {name:"e-Daakhil (Online Consumer Filing)",url:"https://edaakhil.nic.in"},
      {name:"Consumer Helpline Phone",url:"tel:1915"}
    ]
  },
  Domestic: {
    severity:"HIGH",
    urgent:"If you are in immediate danger — call 100 (Police) or 181 (Women Helpline) immediately.",
    laws:[
      {name:"Protection of Women from Domestic Violence Act 2005",section:"Section 12/18/19/20/22",note:"Provides civil reliefs — Protection Orders, Residence Orders, Monetary Relief."},
      {name:"Indian Penal Code / BNS 2023",section:"Section 498A",note:"Cruelty by husband or relatives — up to 3 years imprisonment."},
      {name:"Dowry Prohibition Act 1961",section:"Section 3/4",note:"Giving or taking dowry is illegal — up to 5 years imprisonment."},
      {name:"Hindu Marriage Act 1955 / Special Marriage Act 1954",section:"Section 13",note:"Grounds for divorce — cruelty, desertion, adultery."}
    ],
    penalties:[
      {type:"Domestic violence (accused)",value:"Protection order + up to 3 years jail under 498A"},
      {type:"Dowry demand",value:"Up to 5 years jail + ₹15,000 fine or dowry value (whichever higher)"}
    ],
    rights:[
      "Every woman has the right to live in the shared household free from violence.",
      "You have the right to file a complaint with the Protection Officer (free government service).",
      "You have the right to emergency monetary relief, medical expenses, and maintenance orders.",
      "Children's custody can be addressed simultaneously under PWDVA.",
      "You can file an FIR directly at any police station — they MUST register it."
    ],
    steps:[
      "If in immediate danger: call 100 (Police) or 181 (Women Helpline) or 112.",
      "Reach a safe location — shelter homes are available via State Women's Commission.",
      "Document injuries — visit a government hospital and get a medico-legal certificate (MLC).",
      "Contact a Protection Officer at your district's Women and Child Development office.",
      "File an application under PWDVA 2005 in Magistrate court — no court fee.",
      "Seek a Protection Order — court can issue within hours in emergency cases."
    ],
    defenses:[
      "N/A — This section protects victims. If you are falsely accused, consult a lawyer immediately."
    ],
    reduce:[
      "Seek counselling and mediation if both parties are willing — courts encourage this.",
      "Apply for divorce if situation is irretrievable — maintenance and custody orders protect you."
    ],
    resources:[
      {name:"Women Helpline",url:"tel:181"},
      {name:"Police Emergency",url:"tel:100"},
      {name:"National Commission for Women",url:"https://ncw.nic.in"},
      {name:"iCall (Psychological Support)",url:"https://icallhelpline.org"}
    ]
  },
  Property: {
    severity:"MEDIUM",
    urgent:null,
    laws:[
      {name:"Transfer of Property Act 1882",section:"Section 105/108",note:"Governs lease agreements — rights of landlord and tenant."},
      {name:"Rent Control Acts (State-specific)",section:"Various",note:"Each state has its own Rent Control Act regulating rent, eviction, and tenant rights."},
      {name:"Registration Act 1908",section:"Section 17",note:"Any lease exceeding 11 months must be registered."},
      {name:"Indian Easements Act 1882",section:"Section 4",note:"Defines easement rights — right of way, light, and water."},
      {name:"Specific Relief Act 1963",section:"Section 6",note:"If dispossessed without due process, you can recover possession within 6 months."}
    ],
    penalties:[
      {type:"Landlord illegal eviction",value:"Tenant can seek court-ordered restoration of possession"},
      {type:"Encroachment",value:"Civil suit for injunction; criminal trespass — Section 441 IPC"}
    ],
    rights:[
      "Tenant: cannot be evicted without proper notice and court order in most states.",
      "Tenant: entitled to receipt for every rent payment — demand it.",
      "Tenant: landlord cannot cut off water/electricity without court order.",
      "Owner: right to peaceful possession and recovery of property.",
      "Both: right to register a dispute with the Rent Controller/Authority."
    ],
    steps:[
      "For rental disputes: review your rental agreement thoroughly.",
      "Send a written notice (registered post) to the other party outlining the dispute.",
      "Approach the Rent Control Court or Civil Court depending on the issue.",
      "For encroachment: file a civil suit for injunction and recovery of possession.",
      "For property fraud: file FIR under Section 420 IPC and approach civil court.",
      "RERA (Real Estate Regulatory Authority) handles builder disputes for new projects."
    ],
    defenses:[
      "Adverse possession — if occupying land for 12+ years, may claim title (limitation period).",
      "Lack of proper eviction notice — defective notice makes eviction order void.",
      "Agreement not registered — unregistered >11 month lease is invalid as evidence."
    ],
    reduce:[
      "Mediation through Lok Adalat — faster, cheaper resolution.",
      "RERA complaints are resolved within 60 days.",
      "Keep all rent receipts — crucial evidence in any dispute."
    ],
    resources:[
      {name:"RERA (Real Estate Regulatory Authority)",url:"https://rera.org.in"},
      {name:"National Legal Services Authority",url:"https://nalsa.gov.in"},
      {name:"Lok Adalat Information",url:"https://nalsa.gov.in/lok-adalat"}
    ]
  }
};
