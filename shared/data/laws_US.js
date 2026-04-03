/* USA — Legal Database */
const LAWS_US = {
  Traffic: {
    severity:"MEDIUM",
    urgent:null,
    laws:[
      {name:"Uniform Vehicle Code",section:"Various",note:"Model traffic law adopted by states — speed limits, signals, DUI standards."},
      {name:"State Traffic Statutes",section:"State-specific",note:"Each state has its own Vehicle Code (e.g., California Vehicle Code)."},
      {name:"National Highway Traffic Safety Administration (NHTSA) Regulations",section:"49 CFR",note:"Federal standards for DUI blood alcohol content (BAC ≥ 0.08%)."}
    ],
    penalties:[
      {type:"Speeding (1–15 mph over)",value:"$150–$300 fine + 1–2 points on licence"},
      {type:"Speeding (16–30 mph over)",value:"$300–$500 + possible court appearance"},
      {type:"DUI (1st offence)",value:"$1,000–$2,000 fine + 6 months licence suspension + possible jail"},
      {type:"Reckless driving",value:"Up to $2,500 fine + up to 1 year jail (misdemeanor)"},
      {type:"Running red light",value:"$400–$600 fine + 2 points on licence"}
    ],
    rights:[
      "You have the right to remain silent — you do not have to answer questions beyond providing licence, registration, and insurance.",
      "You cannot be searched without consent or probable cause — clearly and calmly say: 'I do not consent to a search.'",
      "You have the right to refuse a portable breathalyzer in most states (may result in licence suspension).",
      "You have the right to contest any citation in traffic court.",
      "You have the right to a lawyer if charged criminally (DUI, reckless driving)."
    ],
    steps:[
      "Pull over safely and turn off the engine.",
      "Be polite — say 'I'm not answering questions without my attorney present' for serious matters.",
      "Accept the ticket — arguing on the spot will not help; fight it in court.",
      "Note the officer's badge number, patrol car number, and exact alleged violation.",
      "To contest: plead 'Not Guilty' on the ticket or mail/appear by the deadline.",
      "Consider hiring a traffic attorney — many reduce or dismiss tickets for a flat fee."
    ],
    defenses:[
      "Speed trap — radar gun not recently calibrated (request calibration records via discovery).",
      "Necessity / emergency — you were speeding due to a genuine emergency.",
      "Improper or missing speed limit signage.",
      "Officer's failure to appear in court — case is often dismissed.",
      "Factual dispute — wrong car, wrong location."
    ],
    reduce:[
      "Traffic school / defensive driving course — may remove points from your record.",
      "Request a deferred adjudication — keep your record clean if no violations for 6–12 months.",
      "Negotiate with the prosecutor for a lesser charge (e.g., 'defective equipment').",
      "Pay online promptly to avoid additional late fees."
    ],
    resources:[
      {name:"NHTSA (Road Safety)",url:"https://www.nhtsa.gov"},
      {name:"Find Your State DMV",url:"https://www.usa.gov/motor-vehicle-services"},
      {name:"Traffic Court Help",url:"https://www.courts.ca.gov/selfhelp-traffic.htm"}
    ]
  },
  Workplace: {
    severity:"MEDIUM",
    urgent:null,
    laws:[
      {name:"Title VII of the Civil Rights Act 1964",section:"42 U.S.C. § 2000e",note:"Prohibits discrimination based on race, colour, religion, sex, or national origin."},
      {name:"Fair Labor Standards Act (FLSA) 1938",section:"29 U.S.C. § 206",note:"Sets federal minimum wage ($7.25/hr) and overtime pay (1.5x after 40 hrs/week)."},
      {name:"Family and Medical Leave Act (FMLA) 1993",section:"29 U.S.C. § 2601",note:"Up to 12 weeks unpaid leave for qualifying reasons."},
      {name:"Occupational Safety and Health Act 1970",section:"29 U.S.C. § 654",note:"Employer must provide a safe workplace free from recognized hazards."},
      {name:"Americans with Disabilities Act 1990",section:"42 U.S.C. § 12101",note:"Prohibits disability discrimination; requires reasonable accommodations."}
    ],
    penalties:[
      {type:"Discrimination (employer)",value:"Back pay + compensatory damages + up to $300,000 punitive damages"},
      {type:"Unpaid wages",value:"Back pay + equal amount liquidated damages + attorney fees"},
      {type:"OSHA violation",value:"$15,625–$156,259 per willful violation"},
      {type:"FMLA violation",value:"12 weeks wages + benefits + attorney fees"}
    ],
    rights:[
      "You have the right to be free from discrimination based on race, gender, religion, age (40+), or disability.",
      "You have the right to minimum wage and overtime pay.",
      "You have the right to a safe workplace — report OSHA violations without retaliation.",
      "You have the right to take FMLA leave without losing your job (if employer has 50+ employees).",
      "You have the right to discuss your salary with coworkers under the NLRA.",
      "You have the right to file a charge with the EEOC free of charge."
    ],
    steps:[
      "Document all incidents with dates, witnesses, and exact quotes.",
      "Report to your HR department in writing — keep a copy.",
      "File a charge with the EEOC at eeoc.gov (must be done within 180–300 days of discrimination).",
      "For wage theft: file a complaint with the Department of Labor's Wage and Hour Division.",
      "For safety violations: file an anonymous complaint with OSHA.",
      "Consult an employment attorney — many work on contingency (no upfront fee)."
    ],
    defenses:[
      "At-will employment — employer can fire for any legal reason; exceptions apply (discrimination, retaliation).",
      "Document that termination was pretextual (real reason was discrimination).",
      "Retaliation claim if fired after reporting legal violations."
    ],
    reduce:[
      "Request EEOC mediation — faster than litigation.",
      "Negotiate a severance agreement — understand what you are signing.",
      "File for unemployment benefits immediately after job loss."
    ],
    resources:[
      {name:"EEOC (Equal Employment Opportunity Commission)",url:"https://www.eeoc.gov"},
      {name:"Department of Labor (Wage Claims)",url:"https://www.dol.gov/agencies/whd"},
      {name:"OSHA (Safety Complaints)",url:"https://www.osha.gov/workers"},
      {name:"Legal Aid (Free)",url:"https://www.lawhelp.org"}
    ]
  },
  Police: {
    severity:"HIGH",
    urgent:"Contact a criminal defense attorney immediately. Exercise your right to remain silent.",
    laws:[
      {name:"U.S. Constitution",section:"4th Amendment",note:"Protection against unreasonable searches and seizures — police need warrant or probable cause."},
      {name:"U.S. Constitution",section:"5th Amendment",note:"Right to remain silent — cannot be compelled to self-incriminate."},
      {name:"U.S. Constitution",section:"6th Amendment",note:"Right to a speedy trial, confront witnesses, and have an attorney."},
      {name:"Miranda v. Arizona (1966)",section:"Supreme Court ruling",note:"Police must read your rights before custodial interrogation."},
      {name:"U.S. Constitution",section:"14th Amendment",note:"Equal protection — no discrimination in law enforcement."}
    ],
    penalties:[
      {type:"False arrest",value:"Civil lawsuit for damages against the officer/department"},
      {type:"Excessive force",value:"Section 1983 civil rights lawsuit; criminal charges may be brought"}
    ],
    rights:[
      "You have the right to REMAIN SILENT — say 'I am invoking my right to remain silent.'",
      "You have the right to an attorney — say 'I want a lawyer.' All questioning must stop.",
      "You have the right to refuse consent to a search — say 'I do not consent to this search.'",
      "You have the right to know if you are being detained — ask 'Am I free to go?'",
      "If arrested: you have the right to a phone call.",
      "If read Miranda rights: anything you say CAN be used against you."
    ],
    steps:[
      "Stay calm. Do not flee or physically resist — even from an illegal arrest.",
      "Ask: 'Am I being detained or am I free to go?' — if free to go, calmly walk away.",
      "If arrested: say clearly: 'I invoke my right to remain silent. I want a lawyer.'",
      "Do not consent to any search — verbally refuse clearly.",
      "Do not answer questions until your lawyer is present.",
      "Record the interaction if safe to do so — it is legal in most states.",
      "After release: document everything and consult a civil rights attorney."
    ],
    defenses:[
      "Illegal search and seizure — evidence obtained without warrant may be inadmissible.",
      "Miranda violation — statements made before rights are read may be excluded.",
      "Lack of probable cause for arrest — case may be dismissed.",
      "Mistaken identity / alibi evidence."
    ],
    reduce:[
      "Hire a criminal defense attorney early — the earlier the better.",
      "Pre-trial diversion programs may be available for first-time offenders.",
      "Plea agreements — prosecutor may offer lesser charge in exchange for guilty plea."
    ],
    resources:[
      {name:"ACLU (Civil Rights)",url:"https://www.aclu.org"},
      {name:"Public Defender (Free Legal Aid)",url:"https://www.nlada.org"},
      {name:"Know Your Rights (ACLU)",url:"https://www.aclu.org/know-your-rights/stopped-by-police"}
    ]
  },
  Financial: {
    severity:"HIGH",
    urgent:"If you are a fraud victim, act within 48–72 hours to maximize money recovery chances.",
    laws:[
      {name:"Federal Trade Commission Act",section:"15 U.S.C. § 45",note:"FTC prohibits unfair or deceptive business practices."},
      {name:"Wire Fraud Statute",section:"18 U.S.C. § 1343",note:"Using wire/internet to commit fraud — up to 20 years federal prison."},
      {name:"Bank Secrecy Act",section:"31 U.S.C. § 5311",note:"Requires reporting of suspicious financial transactions."},
      {name:"Electronic Fund Transfer Act (EFTA)",section:"15 U.S.C. § 1693",note:"Limits your liability for unauthorized electronic transactions."},
      {name:"Fair Debt Collection Practices Act",section:"15 U.S.C. § 1692",note:"Debt collectors cannot harass or use deceptive practices."}
    ],
    penalties:[
      {type:"Wire fraud (accused)",value:"Up to 20 years federal prison + fines"},
      {type:"Credit card fraud",value:"Up to 15 years prison + full restitution"},
      {type:"FDCPA violation (debt collector)",value:"Up to $1,000 per violation + attorney fees payable to you"}
    ],
    rights:[
      "You have the right to dispute unauthorized charges — liability limited to $50 for credit cards.",
      "You have the right to request debt validation from collectors within 30 days.",
      "You have the right to tell debt collectors to stop calling — put it in writing.",
      "You have the right to receive a full refund for unauthorized bank transactions within 60 days."
    ],
    steps:[
      "If fraud victim: contact your bank immediately — report unauthorized transactions.",
      "Place a fraud alert on your credit report at Equifax, Experian, or TransUnion.",
      "File a report at the FTC: reportfraud.ftc.gov.",
      "File an IC3 complaint (Internet Crime Complaint Center) at ic3.gov for online fraud.",
      "File local police report for documentation.",
      "For investment fraud: complain to SEC (sec.gov/tcr) or FINRA."
    ],
    defenses:[
      "Good faith — you genuinely believed the transaction was legitimate.",
      "No fraudulent intent — dispute civil money claims.",
      "Statute of limitations — fraud charges have time limits."
    ],
    reduce:[
      "Voluntary restitution before sentencing reduces penalties significantly.",
      "Cooperation with federal investigators reduces charges.",
      "First-time offenders may qualify for deferred prosecution agreements."
    ],
    resources:[
      {name:"FTC (Report Fraud)",url:"https://reportfraud.ftc.gov"},
      {name:"IC3 (Internet Crime)",url:"https://www.ic3.gov"},
      {name:"Consumer Financial Protection Bureau",url:"https://www.consumerfinance.gov/complaint"},
      {name:"SEC (Investment Fraud)",url:"https://www.sec.gov/tcr"}
    ]
  },
  Cyber: {
    severity:"HIGH",
    urgent:"Preserve all digital evidence immediately. Change all passwords.",
    laws:[
      {name:"Computer Fraud and Abuse Act (CFAA)",section:"18 U.S.C. § 1030",note:"Unauthorised access to computer systems — up to 10 years prison."},
      {name:"CAN-SPAM Act",section:"15 U.S.C. § 7701",note:"Regulates commercial email — spam violations carry civil penalties."},
      {name:"Identity Theft Enforcement and Restitution Act 2008",section:"18 U.S.C. § 1028",note:"Identity theft — up to 15 years prison."},
      {name:"Electronic Communications Privacy Act",section:"18 U.S.C. § 2510",note:"Protects electronic communications from unauthorized interception."}
    ],
    penalties:[
      {type:"Hacking (accused)",value:"5–10 years federal prison + fines"},
      {type:"Identity theft",value:"Up to 15 years + restitution to victims"},
      {type:"Online harassment / cyberstalking",value:"Up to 5 years federal prison"}
    ],
    rights:[
      "Report cybercrime to FBI's IC3 — free, nationwide.",
      "You can seek a civil restraining order against cyberstalkers.",
      "Your ISP must respond to legal requests — private communications are protected.",
      "Platforms must remove CSAM and may cooperate with identity takedown requests."
    ],
    steps:[
      "Preserve all evidence — screenshots, email headers, transaction IDs.",
      "Change all passwords and enable multi-factor authentication immediately.",
      "Report to FBI IC3.gov for internet crimes.",
      "Contact your bank for any financial fraud — request chargeback.",
      "File local police report for documentation.",
      "Consult a cybersecurity attorney for severe cases (deep fake, data breach)."
    ],
    defenses:[
      "Authorized access — you had permission to access the system.",
      "No criminal intent — accidental access to unsecured system.",
      "First Amendment protections for online speech (with limits)."
    ],
    reduce:[
      "Cooperate with investigators; provide full disclosure.",
      "Restitution paid voluntarily reduces sentencing.",
      "For civil claims: DMCA takedown notices resolve content disputes quickly."
    ],
    resources:[
      {name:"FBI Internet Crime Complaint Center",url:"https://www.ic3.gov"},
      {name:"FTC Identity Theft",url:"https://www.identitytheft.gov"},
      {name:"Cybersecurity & Infrastructure Security Agency",url:"https://www.cisa.gov"}
    ]
  },
  Consumer: {
    severity:"LOW",
    urgent:null,
    laws:[
      {name:"Federal Trade Commission Act",section:"15 U.S.C. § 45",note:"Prohibits deceptive or unfair business practices."},
      {name:"Magnuson-Moss Warranty Act",section:"15 U.S.C. § 2301",note:"Rules for written warranties on consumer products."},
      {name:"Truth in Lending Act (TILA)",section:"15 U.S.C. § 1601",note:"Lenders must disclose full terms of credit."},
      {name:"State Lemon Laws",section:"State-specific",note:"Protect consumers who purchased defective vehicles."}
    ],
    penalties:[
      {type:"FTC violation (company)",value:"Up to $50,120 civil penalty per violation"},
      {type:"Warranty breach",value:"Replacement, refund, or cash damages + attorney fees"},
      {type:"Credit reporting violation",value:"Up to $1,000 per violation payable to you"}
    ],
    rights:[
      "Right to accurate advertising — file FTC complaint for false advertising.",
      "Right to dispute credit report errors — credit bureaus must investigate within 30 days.",
      "Right to a refund or replacement for defective products under warranty.",
      "Right to a 3-day cooling-off period for door-to-door sales over $25.",
      "State Small Claims Court — resolve disputes up to $5,000–$25,000 without a lawyer."
    ],
    steps:[
      "Document all receipts, order confirmations, refund denials, chats.",
      "Contact the company in writing and demand resolution within 14 days.",
      "File a complaint with the FTC at reportfraud.ftc.gov.",
      "File a complaint with your state Attorney General's consumer protection office.",
      "File in small claims court — filing fee is under $100 in most states.",
      "Credit card chargeback — most powerful tool for online purchases."
    ],
    defenses:[
      "N/A — This section assists consumers asserting rights."
    ],
    reduce:[
      "Use the credit card chargeback process — fastest resolution.",
      "BBB (Better Business Bureau) complaint — companies often resolve immediately.",
      "Small claims court — no lawyer needed, quick resolution."
    ],
    resources:[
      {name:"FTC Consumer Protection",url:"https://consumer.ftc.gov"},
      {name:"Consumer Financial Protection Bureau",url:"https://www.consumerfinance.gov"},
      {name:"USA.gov Consumer Help",url:"https://www.usa.gov/consumer-issues"}
    ]
  }
};
