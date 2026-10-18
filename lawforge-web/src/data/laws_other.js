/* UK, AUSTRALIA, CANADA, UAE, GERMANY, SINGAPORE, PAKISTAN, NIGERIA, SOUTH AFRICA, BANGLADESH, MALAYSIA, NEW ZEALAND */

const LAWS_GB = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[
      {name:"Road Traffic Act 1988",section:"Section 3",note:"Careless/inconsiderate driving — fine + points."},
      {name:"Road Traffic Act 1988",section:"Section 5",note:"DUI — driving with alcohol above prescribed limit (80mg/100ml blood)."},
      {name:"Road Traffic Offenders Act 1988",section:"Various",note:"Sets penalties for all road traffic offences."}
    ],
    penalties:[
      {type:"Speeding",value:"£100 fixed penalty + 3 points; court: up to £1,000 fine + ban"},
      {type:"DUI",value:"£2,500 fine + 12 months ban + up to 6 months jail (1st offence)"},
      {type:"No insurance",value:"£300–£1,000 + 6–8 points or disqualification"}
    ],
    rights:["Right to see the officer's ID.","You need not answer questions without a solicitor.","You may contest a Fixed Penalty Notice in court."],
    steps:["Accept the fixed penalty notice or choose to go to court.","Request a police statement if disputing the facts.","Hire a motoring solicitor for serious offences (DUI, disqualification).","Check DVLA for endorsement status: gov.uk/view-driving-licence."],
    defenses:["Medical emergency.","Defect in radar/speed camera — request calibration data.","Incorrect vehicle identification.","Procedural errors in the Fixed Penalty Notice."],
    reduce:["Complete a speed awareness course (if offered) — removes points.","Early guilty plea in court reduces fine by 1/3.","Request fixed penalty rather than prosecution for borderline cases."],
    resources:[{name:"DVLA",url:"https://www.gov.uk/browse/driving"},{name:"Citizens Advice",url:"https://www.citizensadvice.org.uk"}]
  },
  Workplace:{severity:"MEDIUM",urgent:null,
    laws:[
      {name:"Employment Rights Act 1996",section:"Section 94",note:"Right not to be unfairly dismissed after 2 years of employment."},
      {name:"Equality Act 2010",section:"Section 4",note:"Prohibits discrimination based on 9 protected characteristics."},
      {name:"National Minimum Wage Act 1998",section:"Section 1",note:"Employers must pay at least the National Living Wage."},
      {name:"Working Time Regulations 1998",section:"Regulation 4",note:"Max 48-hour working week; right to paid holiday."}
    ],
    penalties:[{type:"Unfair dismissal",value:"Up to £105,707 compensation from Employment Tribunal"},{type:"Discrimination",value:"Unlimited compensation + injury to feelings award"}],
    rights:["Right not to be unfairly dismissed (after 2 years).","Right to written statement of employment particulars.","Right to 28 days paid holiday / year.","Right to Statutory Sick Pay.","Right to file at Employment Tribunal (no fee)."],
    steps:["Raise a formal grievance in writing with your employer first.","If unresolved: contact ACAS (free early conciliation) before tribunal.","File at Employment Tribunal — must be within 3 months of dismissal.","Consult a solicitor or Citizens Advice for complex cases."],
    defenses:["Wrongful dismissal — employer breached contract terms.","Constructive dismissal — made working conditions intolerable.","Whistleblowing protection — dismissed for making protected disclosure."],
    reduce:["ACAS early conciliation resolves many cases without tribunal.","Keep copies of all disciplinary letters and HR correspondence."],
    resources:[{name:"ACAS (Free Conciliation)",url:"https://www.acas.org.uk"},{name:"Employment Tribunal",url:"https://www.gov.uk/employment-tribunals"},{name:"Citizens Advice",url:"https://www.citizensadvice.org.uk"}]
  },
  Police:{severity:"HIGH",urgent:"Contact a solicitor immediately. You have the right to free legal advice.",
    laws:[
      {name:"Police and Criminal Evidence Act 1984 (PACE)",section:"Section 24/28/29",note:"Governs arrest powers — must inform grounds for arrest."},
      {name:"PACE Code C",section:"Detention",note:"Right to free legal advice; must be informed of rights."},
      {name:"Human Rights Act 1998",section:"Article 5/6",note:"Right to liberty; right to a fair trial."}
    ],
    penalties:[{type:"Wrongful arrest",value:"Civil claim for damages against police"},{type:"Police misconduct",value:"Complaint to IOPC (Independent Office for Police Conduct)"}],
    rights:["Right to be told WHY you are being arrested.","Right to FREE legal advice at any police station — ask for duty solicitor.","Right to have someone informed of your arrest.","Right to examine the PACE Code C.","You can be held for max 24 hours without charge (36 hrs for serious offences; 96 hrs with magistrate approval)."],
    steps:["Stay calm. Do not resist.","Clearly ask for the duty solicitor — police must provide one for free.","You may remain silent — say 'No comment' to all questions until solicitor arrives.","If under-18 or vulnerable: request an appropriate adult.","After release: complain to IOPC if rights were violated."],
    defenses:["Illegal arrest — no lawful grounds.","Evidence obtained unlawfully — may be excluded.","No caution given before questioning — statement may be inadmissible."],
    reduce:["Cooperate with solicitor's advice.","Early guilty plea reduces sentence by up to 1/3."],
    resources:[{name:"Duty Solicitor (Free)",url:"tel:0800-155-6705"},{name:"IOPC (Police Complaints)",url:"https://www.policeconduct.gov.uk"},{name:"Legal Aid Agency",url:"https://www.gov.uk/legal-aid"}]
  },
  Consumer:{severity:"LOW",urgent:null,
    laws:[{name:"Consumer Rights Act 2015",section:"Section 9",note:"Goods must be of satisfactory quality, fit for purpose, as described."},{name:"Consumer Contracts Regulations 2013",section:"Regulation 29",note:"14-day right to cancel online/distance purchases."}],
    penalties:[{type:"Faulty goods",value:"Full refund within 30 days; repair/replace after 30 days"},{type:"Online cancellation denied",value:"Extra 12 months to cancel; full refund"}],
    rights:["30-day right to reject faulty goods.","14-day return right for online purchases.","Right to repair or replacement within 6 months of purchase.","Right to file at Small Claims Court (under £10,000) without a lawyer."],
    steps:["Contact seller in writing — give 14 days to resolve.","Escalate to Alternative Dispute Resolution (ADR) scheme if seller participates.","File at Money Claim Online (MCOL) for court resolution.","Chargeback via your bank for credit/debit card purchases."],
    defenses:["N/A — This applies when asserting consumer rights."],
    reduce:["Chargeback via bank is fastest resolution.","Citizens Advice can help draft complaint letters for free."],
    resources:[{name:"Citizens Advice",url:"https://www.citizensadvice.org.uk"},{name:"Money Claim Online",url:"https://www.moneyclaimmake.service.gov.uk"},{name:"Which? Consumer Rights",url:"https://www.which.co.uk/consumer-rights"}]
  }
};

const LAWS_AU = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Road Transport Act 2013 (NSW)",section:"Various",note:"State-based traffic laws govern speeding, DUI, and reckless driving."},{name:"National Road Traffic Act",section:"Regulations 300+",note:"National speed limits and heavy vehicle standards."}],
    penalties:[{type:"Speeding 1–10 km/h over",value:"$123 + 1 demerit point (NSW)"},{type:"DUI (BAC 0.05–0.08)",value:"$561 fine + 3 months licence suspension"},{type:"DUI (BAC >0.15)",value:"Court; up to $3,300 + 3 years disqualification"}],
    rights:["Right to see infringement notice.","Right to elect court rather than pay infringement.","Right to apply for licence review if suspended."],
    steps:["Check the infringement notice carefully for errors.","Pay online OR elect to take it to court within 90 days.","Request Internal Review by the issuing agency first (free, faster).","If suspended: apply for a Section 10 dismissal (no conviction recorded) for first offence."],
    defenses:["Honest and reasonable mistake.","Exceptional circumstances (medical emergency).","Speed camera error — request camera calibration certificate."],
    reduce:["Section 10 dismissal — no conviction, no demerit points for first-time offenders.","Traffic offender program.","Pay promptly to avoid collection action."],
    resources:[{name:"Service NSW",url:"https://www.service.nsw.gov.au"},{name:"Revenue NSW",url:"https://www.revenue.nsw.gov.au"},{name:"Legal Aid NSW",url:"https://www.legalaid.nsw.gov.au"}]
  },
  Workplace:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Fair Work Act 2009",section:"Section 385",note:"Unfair dismissal — must have served minimum employment period."},{name:"Fair Work Act 2009",section:"Section 340",note:"General protections — cannot dismiss for exercising workplace rights."},{name:"National Employment Standards",section:"10 Standards",note:"Minimum entitlements including leave, notice, redundancy pay."}],
    penalties:[{type:"Unfair dismissal",value:"Up to 26 weeks pay compensation"},{type:"General protections breach",value:"Unlimited compensation + civil penalties on employer"}],
    rights:["Right to 10 National Employment Standards.","Right to lodge unfair dismissal claim within 21 days.","Right to join a union without adverse treatment.","Right to request flexible work arrangements."],
    steps:["Lodge an unfair dismissal application with the Fair Work Commission within 21 days of dismissal.","Attend conciliation (free, informal).","If unresolved: proceed to arbitration hearing.","Contact Fair Work Ombudsman for underpayment complaints."],
    defenses:["Procedural unfairness — employer did not follow proper process.","No valid reason for dismissal.","Harsh, unjust, or unreasonable termination."],
    reduce:["Conciliation resolves 80%+ of cases without formal hearing.","Union representation available at no cost to members."],
    resources:[{name:"Fair Work Commission",url:"https://www.fwc.gov.au"},{name:"Fair Work Ombudsman",url:"https://www.fairwork.gov.au"},{name:"Legal Aid",url:"https://www.legalaid.nsw.gov.au"}]
  },
  Police:{severity:"HIGH",urgent:"You have the right to silence and to a lawyer. Exercise both immediately.",
    laws:[{name:"Law Enforcement (Powers and Responsibilities) Act 2002 (NSW)",section:"Section 99",note:"Police can arrest without warrant for certain offences."},{name:"Evidence Act 1995",section:"Section 139",note:"Caution must be given before questioning."}],
    penalties:[{type:"Wrongful detention",value:"Habeas corpus application; civil claim for damages"}],
    rights:["Right to be told grounds of arrest.","Right to remain silent — say 'I do not wish to answer questions.'","Right to contact a friend, relative, or lawyer.","Right to free legal advice from Legal Aid (duty lawyer at court).","Cannot be held more than reasonable time without charge."],
    steps:["Stay calm. Do not resist.","Say: 'I am exercising my right to silence. I want to speak to a lawyer.'","Call Legal Aid: 1300 888 529 (NSW) for free advice.","Do not sign any documents without reading with your lawyer.","After: complain to NSW Police or Law Enforcement Conduct Commission."],
    defenses:["Unlawful arrest — no reasonable grounds.","Evidence obtained by illegal search — inadmissible.","Breach of Evidence Act caution."],
    reduce:["Early guilty plea — reduced sentence.","Attend rehabilitation programs for drug/alcohol offences."],
    resources:[{name:"Legal Aid NSW",url:"https://www.legalaid.nsw.gov.au"},{name:"Law Enforcement Conduct Commission",url:"https://www.lecc.nsw.gov.au"}]
  }
};

const LAWS_CA = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Highway Traffic Act (Ontario)",section:"Section 128",note:"Speeding — fine based on km/h over limit."},{name:"Criminal Code of Canada",section:"Section 253",note:"Impaired driving (DUI) — BAC ≥ 0.08%."}],
    penalties:[{type:"Speeding 1–19 km/h over (Ontario)",value:"$3/km over fine + 0 points"},{type:"Speeding 30–49 km/h over",value:"$9/km over + 4 demerit points"},{type:"DUI",value:"Minimum $1,000 fine + 1 year driving prohibition (1st offence)"}],
    rights:["Right to contest ticket in traffic court.","Right to retain a lawyer for DUI charges.","Right to demand breathalyzer results."],
    steps:["Note all ticket details and deadline.","Elect court trial to contest (before deadline on ticket).","Hire a paralegal (less expensive than lawyer) for traffic tickets in Ontario.","For DUI: retain a criminal defence lawyer immediately."],
    defenses:["Inaccurate speed measurement.","Signage not visible.","Charter of Rights violation (arbitrary detention — Section 9)."],
    reduce:["First offender programs available for DUI.","Clean driving record helps in court.","Speed awareness courses may substitute in some provinces."],
    resources:[{name:"Ontario Court of Justice",url:"https://www.ontariocourts.ca"},{name:"Legal Aid Ontario",url:"https://www.legalaid.on.ca"},{name:"Drive Clean Ontario",url:"https://www.ontario.ca/page/ministry-transportation"}]
  },
  Workplace:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Canada Labour Code",section:"Part III",note:"Unjust dismissal for federally regulated employers."},{name:"Employment Standards Act 2000 (Ontario)",section:"Section 44/54",note:"Minimum notice period and severance pay entitlements."},{name:"Human Rights Code (Ontario)",section:"Section 5",note:"No discrimination in employment."}],
    penalties:[{type:"Wrongful dismissal",value:"Reasonable notice pay (1 week/year of service min)"},{type:"Human rights violation",value:"General damages + monetary compensation"}],
    rights:["Right to termination notice or pay in lieu.","Right to severance pay after 5 years with large employers.","Right to file human rights complaint free of charge.","Right to Employment Insurance (EI) after dismissal without cause."],
    steps:["Review your employment contract for termination provisions.","Apply for Employment Insurance (EI) immediately at Service Canada.","File human rights complaint at HRTO within 1 year.","Consult an employment lawyer — many offer free initial consultation."],
    defenses:["Constructive dismissal — forced to resign due to employer's actions.","Just cause dismissal contested — employer must prove cause clearly."],
    reduce:["Negotiate severance package before signing release.","HRTO mediation is free and faster than full hearing."],
    resources:[{name:"Ontario Human Rights Tribunal",url:"https://www.hrto.ca"},{name:"Service Canada (EI)",url:"https://www.canada.ca/en/services/benefits/ei.html"},{name:"Legal Aid Ontario",url:"https://www.legalaid.on.ca"}]
  }
};

const LAWS_AE = {
  Traffic:{severity:"HIGH",urgent:"UAE traffic fines are strictly enforced. Unpaid fines prevent vehicle registration renewal.",
    laws:[{name:"UAE Federal Traffic Law",section:"Federal Law No. 21 of 1995 (amended)",note:"Governs all road traffic offences in the UAE."},{name:"Dubai Traffic Law",section:"Dubai Police regulations",note:"Dubai-specific camera and black points system."}],
    penalties:[{type:"Speeding 1–20 km/h over",value:"AED 300 + 3 black points"},{type:"Speeding 41–60 km/h over",value:"AED 1,000 + 6 black points + 15-day vehicle impound"},{type:"Drunk driving",value:"AED 25,000 + jail + deportation (for expats)"},{type:"Red light jump",value:"AED 1,000 + 12 black points"},{type:"24 black points in 1 year",value:"Licence cancelled"}],
    rights:["Right to contest fines within 30 days via RTA portal or Traffic Court.","Right to know exact violation details from fine notice.","Expats: right to consult your embassy if arrested."],
    steps:["Check fine on Dubai Police app or Maktoum app.","Pay online to avoid additional penalties.","To contest: submit objection via Dubai Traffic Prosecution within 30 days.","For serious offences: hire a UAE-licensed lawyer immediately."],
    defenses:["Prove vehicle was sold and ownership transferred before violation.","Camera malfunction — request calibration certificate.","Medical emergency at time of offence."],
    reduce:["50% discount on fines during UAE National Day amnesty programs.","Pay promptly — late fees increase the total."],
    resources:[{name:"Dubai Police",url:"https://www.dubaipolice.gov.ae"},{name:"RTA Dubai",url:"https://www.rta.ae"},{name:"Abu Dhabi Traffic",url:"https://www.moi.gov.ae"}]
  },
  Workplace:{severity:"MEDIUM",urgent:null,
    laws:[{name:"UAE Labour Law",section:"Federal Decree-Law No. 33 of 2021",note:"Governs all employment in the private sector in UAE."},{name:"Ministerial Resolution No. 47 of 2022",section:"Various",note:"Rules on employment contracts, wages, and end of service."}],
    penalties:[{type:"Illegal termination",value:"3 months compensation + notice pay"},{type:"Unpaid wages",value:"Employer face blacklisting + fine"},{type:"Forced labour",value:"Criminal prosecution"}],
    rights:["Right to written employment contract.","Right to end-of-service gratuity after 1 year.","Right to 30 days paid annual leave.","Right to file complaint with Ministry of Human Resources (MOHRE) — it is free.","Expats: right to return flight home if terminated without cause."],
    steps:["File complaint at MOHRE website or Tasheel centres — free.","MOHRE mediates within 2 weeks.","If unresolved: case referred to labour court at no cost to employee.","Obtain a labour complaint reference number — keep it safe."],
    defenses:["Arbitrary dismissal — no valid reason given.","Non-compete clause invalid if overbroad under new law.","Termination during sick leave — illegal."],
    reduce:["MOHRE mediation resolves most cases in 2 weeks without court.","New UAE law significantly empowers employees from 2022."],
    resources:[{name:"Ministry of Human Resources (MOHRE)",url:"https://www.mohre.gov.ae"},{name:"Dubai Courts",url:"https://www.dc.gov.ae"}]
  },
  Police:{severity:"HIGH",urgent:"Contact a UAE-licensed lawyer immediately. Silence is your right. Consult your embassy.",
    laws:[{name:"UAE Criminal Procedure Law",section:"Federal Law No. 35 of 1992",note:"Governs arrest, detention, and interrogation rights."},{name:"UAE Constitution",section:"Article 26",note:"No arrest except by judicial order; personal liberty protected."}],
    penalties:[{type:"Wrongful detention",value:"Complaint to Public Prosecution"}],
    rights:["Right to be informed of grounds of arrest.","Right to contact family and embassy immediately.","Right to a lawyer — ask immediately.","Max detention without charge: 48 hours (renewable by prosecutor up to 21 days).","Zero tolerance for drugs — even trace amounts = serious criminal charge."],
    steps:["Stay calm, do not resist.","Immediately say: 'I want to speak to my lawyer and my embassy.'","Do not sign anything without reading with a lawyer.","Family: contact UAE Public Prosecution if access is denied.","Expats: your home country embassy has consular access rights."],
    defenses:["Illegal arrest without judicial approval.","Evidence obtained through coercion is inadmissible.","Mistaken identity."],
    reduce:["Hire an experienced UAE criminal lawyer immediately.","Tribal mediation (sulh) can resolve some offences."],
    resources:[{name:"UAE Public Prosecution",url:"https://pp.gov.ae"},{name:"Dubai Legal Affairs",url:"https://www.dc.gov.ae"},{name:"UAE Embassy Finder",url:"https://www.mofa.gov.ae"}]
  }
};

const LAWS_DE = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Straßenverkehrsordnung (StVO)",section:"§ 3",note:"Speed limits — 50 km/h in towns, 100 km/h outside, no limit on unrestricted Autobahn."},{name:"Straßenverkehrsgesetz (StVG)",section:"§ 24a",note:"DUI — BAC ≥ 0.5‰ is a regulatory offence; ≥1.6‰ is a criminal offence."}],
    penalties:[{type:"Speeding up to 20 km/h over (in town)",value:"€15–€35 fine"},{type:"Speeding 21–30 km/h over",value:"€80 + 1 point"},{type:"DUI (0.5‰–1.59‰)",value:"€500+ + 1 month ban + 2 points"},{type:"Running red light >1 sec",value:"€200 + 2 points + 1 month ban"}],
    rights:["Right to contest Bußgeldbescheid (fine notice) within 2 weeks.","Right to see speed measurement data.","Right to remain silent (Schweigerecht)."],
    steps:["Do not sign acknowledgement of guilt on the spot.","Contest (Einspruch) within 2 weeks of receiving the Bußgeldbescheid.","Request the measurement file (Messakte) through a lawyer.","Hire a Verkehrsanwalt (traffic lawyer) for serious cases."],
    defenses:["Calibration errors in Blitzer (speed camera).","Wrong driver identified.","Emergency circumstances."],
    reduce:["First offence leniency.","Traffic safety course (Aufbauseminar) may restore points.","ADAC legal insurance covers many traffic cases."],
    resources:[{name:"Kraftfahrt-Bundesamt (KBA)",url:"https://www.kba.de"},{name:"ADAC",url:"https://www.adac.de"}]
  },
  Workplace:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Kündigungsschutzgesetz (KSchG)",section:"§ 1",note:"Unfair dismissal protection after 6 months employment."},{name:"Allgemeines Gleichbehandlungsgesetz (AGG)",section:"§ 1",note:"Anti-discrimination — prohibits treatment based on race, gender, religion, disability, etc."},{name:"Mindestlohngesetz",section:"§ 1",note:"Minimum wage law — currently €12.41/hour (2025)."}],
    penalties:[{type:"Unfair dismissal",value:"Severance or reinstatement — negotiated in Labour Court"},{type:"Discrimination",value:"Compensation up to 3 months salary"}],
    rights:["Right to 4 weeks notice (minimum).","Right to Arbeitszeugnis (work reference certificate).","Right to works council representation (Betriebsrat).","Right to 20+ days paid annual leave."],
    steps:["Consult Gewerkschaft (trade union) or a lawyer immediately.","File Kündigungsschutzklage at Arbeitsgericht within 3 weeks of dismissal.","Attend mandatory conciliation hearing (Gütetermin).","Negotiate Abfindung (severance) — standard is 0.5 month salary per year of service."],
    defenses:["Social selection criteria not followed for redundancies.","No works council consultation (Betriebsrat) — dismissal void.","Protected employees: maternity, severely disabled, works council members."],
    reduce:["ARBEITSAMT: Register as unemployed immediately to preserve Arbeitslosengeld (unemployment benefit).","Negotiate Abfindung rather than lengthy court fight."],
    resources:[{name:"Bundesagentur für Arbeit",url:"https://www.arbeitsagentur.de"},{name:"Arbeitsgericht Locator",url:"https://www.justiz.de"},{name:"DGB Trade Union",url:"https://www.dgb.de"}]
  }
};

const LAWS_SG = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Road Traffic Act (Cap 276)",section:"Section 63",note:"Speeding offence."},{name:"Road Traffic Act",section:"Section 67",note:"Drink driving — BAC > 35μg/100ml breath."}],
    penalties:[{type:"Speeding 1–20 km/h over",value:"$150 + 3 demerit points"},{type:"Drink driving (1st offence)",value:"$1,000–$5,000 + up to 6 months jail + 12–24 month ban"}],
    rights:["Right to contest in court — choose court option on summons.","Right to legal representation.","Right to view speed camera evidence."],
    steps:["Respond to summons by deadline.","Pay online via Singapore Police Force portal or select court option.","For serious charges: hire a lawyer; duty counsel available at courts."],
    defenses:["Camera error — request calibration records via court discovery.","Medical necessity.","Wrong vehicle identified."],
    reduce:["Attend Singapore Traffic Police Corrective or Safe Driving Course.","Guilty plea reduces sentence."],
    resources:[{name:"Singapore Police Force",url:"https://www.police.gov.sg"},{name:"Legal Aid Bureau",url:"https://lab.mlaw.gov.sg"}]
  },
  Police:{severity:"HIGH",urgent:"Singapore law is strictly enforced — cooperate fully while exercising your legal rights.",
    laws:[{name:"Criminal Procedure Code 2010",section:"Section 64",note:"Police can arrest without warrant for seizable offences."},{name:"Evidence Act (Cap 97)",section:"Section 22",note:"Right against self-incrimination."}],
    penalties:[{type:"Wrongful detention",value:"Complaint to Independent Police Complaints Commission"}],
    rights:["Right to know grounds of arrest.","Right to legal counsel.","Right to inform family of arrest.","Max 48 hours detention before production to magistrate.","Note: Singapore has zero tolerance for drugs — mandatory death penalty for trafficking."],
    steps:["Stay calm and cooperate.","Immediately ask for a lawyer — Legal Aid Bureau for eligible persons.","Do not answer questions without a lawyer.","Inform your country's consulate if you are a foreigner."],
    defenses:["Illegal arrest — no lawful authority.","Evidence improperly obtained."],
    reduce:["Early voluntary surrender and cooperation can be mitigating.","First-time offence considered in sentencing for minor offences."],
    resources:[{name:"Legal Aid Bureau",url:"https://lab.mlaw.gov.sg"},{name:"Singapore Courts",url:"https://www.judiciary.gov.sg"}]
  }
};

const LAWS_PK = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Motor Vehicles Ordinance 1965",section:"Section 103",note:"Reckless or dangerous driving."},{name:"Punjab Road Safety Authority Act 2014",section:"Various",note:"Punjab-specific traffic fines and enforcement."}],
    penalties:[{type:"Speeding",value:"Rs 1,000–Rs 5,000"},{type:"No helmet",value:"Rs 500–Rs 1,500"},{type:"DUI",value:"Rs 5,000–Rs 30,000 + potential imprisonment"}],
    rights:["Right to demand official challan.","Do not pay bribes — report bribe attempts to Anti-Corruption Establishment.","Right to contest in traffic court within 30 days."],
    steps:["Ask for official challan — not cash payment.","Note the officer's badge number.","Pay via designated banks or online if available.","Contest in Judicial Magistrate court."],
    defenses:["Improper signage.","Vehicle documents/data error.","Emergency situation."],
    reduce:["First offence: magistrate may reduce fine.","Show valid documents to avoid compounding violations."],
    resources:[{name:"Punjab Safe Cities Authority",url:"https://psca.gop.pk"},{name:"National Highways and Motorway Police",url:"https://nhmp.gov.pk"}]
  },
  Workplace:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Industrial Relations Act 2012",section:"Section 33",note:"Unfair labour practices."},{name:"Payment of Wages Act 1936",section:"Section 3",note:"Timely payment of wages."},{name:"Punjab Employees Social Security Ordinance 1965",section:"Various",note:"Social security contributions by employer."}],
    penalties:[{type:"Unpaid wages",value:"Fine + double payment of defaulted wages"},{type:"Unfair termination",value:"Reinstatement or compensation"}],
    rights:["Right to wages paid by 7th of each month.","Right to file with NIRC (National Industrial Relations Commission).","Right to form/join a trade union.","Female workers: 3 months maternity leave."],
    steps:["Send written demand for unpaid wages.","File complaint with Labour Department or NIRC.","Consult Labour Court for termination disputes."],
    defenses:["Wrongful termination — no show cause notice given.","Wages withheld illegally."],
    reduce:["Labour arbitration through NIRC — faster than courts.","Trade union support is free."],
    resources:[{name:"National Industrial Relations Commission",url:"https://nirc.gov.pk"},{name:"Ministry of Overseas Pakistanis",url:"https://moopd.gov.pk"}]
  }
};

const LAWS_NG = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Federal Road Safety Commission (FRSC) Act",section:"Section 10",note:"Establishes traffic enforcement powers."},{name:"Road Traffic Law (Lagos State)",section:"Various",note:"State-specific traffic regulations."}],
    penalties:[{type:"Speeding",value:"₦3,000–₦15,000"},{type:"No seatbelt",value:"₦2,000"},{type:"DUI",value:"₦50,000 + possible jail"}],
    rights:["Demand official ticket — not cash payment.","Report bribery to ICPC or FRSC.","Right to contest in Magistrate Court."],
    steps:["Accept official ticket.","Pay at designated FRSC office or online.","Contest in court if disputing the facts."],
    defenses:["No clear speed limit signage.","Emergency circumstances.","Equipment not properly calibrated."],
    reduce:["Early payment avoids additional penalties.","Attend FRSC Retraining School (for serious violations)."],
    resources:[{name:"FRSC",url:"https://www.frsc.gov.ng"},{name:"Lagos State Traffic Agency",url:"https://www.lastma.lagosstate.gov.ng"}]
  },
  Police:{severity:"HIGH",urgent:"If arrested: contact a lawyer immediately and inform your family.",
    laws:[{name:"Administration of Criminal Justice Act 2015",section:"Section 6/8",note:"Governs arrest powers and rights of suspects."},{name:"Constitution of Nigeria 1999",section:"Section 35",note:"Right to personal liberty — must be charged within 24–48 hours."}],
    penalties:[{type:"Wrongful detention",value:"Fundamental rights enforcement application in Federal High Court"}],
    rights:["Right to be informed of grounds of arrest.","Right to communicate with lawyer and family.","Must be charged within 24 hours (48 hours for weekends/holidays).","Right to bail for bailable offences.","Right to free legal representation if unable to afford one."],
    steps:["Stay calm. Do not resist.","Immediately ask for your lawyer.","Inform family through approved communication.","If not charged within 48 hours: lawyer can file fundamental rights enforcement application."],
    defenses:["Unlawful detention beyond constitutional limit.","No lawful grounds for arrest.","Evidence obtained by torture is inadmissible."],
    reduce:["Engage a lawyer who knows the local jurisdiction.","NHRC complaint for rights violations."],
    resources:[{name:"Legal Aid Council of Nigeria",url:"https://lac.gov.ng"},{name:"National Human Rights Commission",url:"https://nhrc.gov.ng"}]
  }
};

const LAWS_ZA = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"National Road Traffic Act 1996",section:"Section 58",note:"Reckless or negligent driving."},{name:"National Road Traffic Act 1996",section:"Section 65",note:"Driving under the influence — BAC limit is 0.05g/100ml."}],
    penalties:[{type:"Speeding 10–20 km/h over",value:"R250–R500"},{type:"DUI",value:"Fine + up to 6 years imprisonment"},{type:"Running red light",value:"R250–R500 fine"}],
    rights:["Right to contest traffic fine in court.","Right to request speed camera data.","Right to be told grounds if arrested."],
    steps:["Note fine details and deadline.","Pay online or contest at Magistrate's Court.","DUI charge: retain a lawyer immediately."],
    defenses:["Camera calibration error.","Wrong vehicle identified.","Medical emergency."],
    reduce:["Pay early.","First offence — magistrate may impose lesser fine."],
    resources:[{name:"eNaTIS (Licence/Fines)",url:"https://www.enatis.com"},{name:"Legal Aid South Africa",url:"https://www.legal-aid.co.za"}]
  },
  Workplace:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Labour Relations Act 1995",section:"Section 185",note:"Right not to be unfairly dismissed."},{name:"Basic Conditions of Employment Act 1997",section:"Section 37",note:"Minimum notice periods and leave entitlements."},{name:"Employment Equity Act 1998",section:"Section 6",note:"No unfair discrimination in employment."}],
    penalties:[{type:"Unfair dismissal",value:"Up to 12 months' salary at CCMA"},{type:"Discrimination",value:"Compensation + Employment Equity compliance order"}],
    rights:["Right to fair hearing before dismissal.","Right to representation at disciplinary hearing.","Right to file at CCMA (Commission for Conciliation, Mediation and Arbitration) — free.","30 days notice period minimum after 1 year service."],
    steps:["File unfair dismissal dispute at CCMA within 30 days of dismissal.","Attend CCMA conciliation — free, no lawyers needed.","If unresolved: arbitration hearing or Labour Court."],
    defenses:["No valid reason for dismissal.","Procedurally unfair — no hearing or warning.","Automatically unfair dismissal (discrimination, pregnancy, union activity)."],
    reduce:["CCMA conciliation resolves most cases.","Union representation available."],
    resources:[{name:"CCMA",url:"https://www.ccma.org.za"},{name:"Department of Labour",url:"https://www.labour.gov.za"},{name:"Legal Aid SA",url:"https://www.legal-aid.co.za"}]
  }
};

const LAWS_BD = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Road Transport Act 2018",section:"Various",note:"Governs traffic offences in Bangladesh."},{name:"Motor Vehicles Ordinance 1983",section:"Section 117",note:"Reckless driving penalties."}],
    penalties:[{type:"Speeding",value:"৳500–৳5,000"},{type:"No licence",value:"৳500–৳2,000 + vehicle seizure"},{type:"DUI",value:"৳10,000–৳25,000 + up to 3 years jail"}],
    rights:["Right to official receipt for all fines.","Do not pay bribes — report to Anti-Corruption Commission.","Right to contest in Magistrate court."],
    steps:["Demand official challan.","Note officer's badge and time of offence.","Pay at designated traffic police offices.","Contest in Magistrate court within stipulated time."],
    defenses:["Defective signage.","Emergency situation."],
    reduce:["Magistrate discretion for first offences.","Keep vehicle documents current."],
    resources:[{name:"Bangladesh Road Transport Authority (BRTA)",url:"https://www.brta.gov.bd"},{name:"Legal Aid Services Trust",url:"https://www.last.org.bd"}]
  }
};

const LAWS_MY = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Road Transport Act 1987",section:"Section 40/41",note:"Reckless and dangerous driving."},{name:"Road Transport Act 1987",section:"Section 45",note:"Drink driving — BAC ≥ 80mg/100ml blood."}],
    penalties:[{type:"Speeding",value:"RM150–RM300 (compound) or up to RM1,000 (court)"},{type:"DUI",value:"RM1,000–RM6,000 + licence suspension (1st offence)"}],
    rights:["Right to compound (pay fine without court appearance) for minor violations.","Right to contest summons in Magistrate Court.","Demand JPJ or police official receipt."],
    steps:["Check summon at portal.jpj.gov.my.","Pay compound online or opt for court.","Contest before deadline on summons."],
    defenses:["Camera malfunction.","Incorrect vehicle data."],
    reduce:["Discount periods announced by JPJ — up to 50% off compound.","Attend defensive driving course."],
    resources:[{name:"JPJ Malaysia",url:"https://www.jpj.gov.my"},{name:"Royal Malaysia Police",url:"https://www.rmp.gov.my"}]
  }
};

const LAWS_NZ = {
  Traffic:{severity:"MEDIUM",urgent:null,
    laws:[{name:"Land Transport Act 1998",section:"Section 22",note:"Careless driving."},{name:"Land Transport Act 1998",section:"Section 57",note:"Breath alcohol limit — 250μg/litre breath or 50mg/100ml blood."}],
    penalties:[{type:"Speeding 1–10 km/h over",value:"NZ$30"},{type:"Speeding 21–30 km/h over",value:"NZ$120 + 20 demerit points"},{type:"DUI",value:"NZ$700–$4,500 fine + 6 months disqualification"}],
    rights:["Right to contest infringement notice.","Right to request speed camera data."],
    steps:["Pay or contest online at nzta.govt.nz within 28 days.","Request a hearing if disputing the facts.","Hire lawyer for serious charges."],
    defenses:["Calibration error.","Demerit point reduction via safe driving recognition."],
    reduce:["Pay within 28 days to avoid late fee.","Safety Programme (Drive Safe) may apply for demerit reduction."],
    resources:[{name:"NZTA",url:"https://www.nzta.govt.nz"},{name:"Community Law Centres",url:"https://communitylaw.org.nz"}]
  }
};
