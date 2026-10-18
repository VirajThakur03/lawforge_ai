// src/phase6/adversarial/AdversarialEngine.js
import { AIEngine } from '../../engine/AIEngine';

export class AdversarialEngine {
  static getSystemPrompt(persona) {
    const prompts = {
      opposing_lawyer: "You are an aggressive opposing litigation counsel in a contentious legal dispute. Your goal is to dissect procedural flaws, missing evidentiary backing, and contradictions in the user's statement. You are formal, sharp, intimidating, and demand strict statutory compliance. Point out why their argument will crumble under cross-examination.",
      police_officer: "You are a stern, skeptical police detective interrogating the user. You highlight discrepancies in their statement, lack of corroboration, and potential statutory offenses. Keep your responses direct, authoritative, and questioning.",
      landlord: "You are an uncompromising, contract-strict property manager/landlord. You focus on lease breaches, covenant violations, damages, rent delinquency, and eviction remedies. You dismiss subjective excuses.",
      employer: "You are an executive corporate legal counsel and HR director. You cite employment agreements, at-will clauses, insubordination, NDA breaches, and company policy violations. You are icy, precise, and dismissive.",
      multi_agent_bench: "You are the judicial panel in a contentious oral argument hearing. Provide three distinct perspectives:\n1. ⚖️ PROSECUTOR: Sharp statutory objection to the user's defense.\n2. 🔨 PRESIDING JUDGE: Formal ruling (Sustained or Overruled) citing procedural rules.\n3. 🛡️ DEFENSE CO-COUNSEL: Tactical advisory on how to counter."
    };
    return prompts[persona] || prompts.opposing_lawyer;
  }

  static async challenge(userStatement, persona, country, caseContext) {
    const systemPrompt = this.getSystemPrompt(persona);
    const lawsContext = caseContext?.laws ? (Array.isArray(caseContext.laws) ? caseContext.laws.map(l => typeof l === 'object' ? l.name : l).join('; ') : String(caseContext.laws)) : 'General statutory framework';
    const penaltyContext = caseContext?.penalties ? (Array.isArray(caseContext.penalties) ? caseContext.penalties.join('; ') : String(caseContext.penalties)) : 'Civil damages and statutory penalties';

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    const isOffline = !apiKey || !navigator.onLine;

    if (isOffline) {
      return this.generateOfflineRebuttal(userStatement, persona, country, lawsContext);
    }

    const fullPrompt = `${systemPrompt}
    
Jurisdiction: ${country || 'International / Applicable Jurisdiction'}
Governing Statutory Framework: ${lawsContext}
Potential Consequences / Penalties: ${penaltyContext}

User's Defense / Statement: "${userStatement}"

Instruction:
Respond in the first person directly to the user as ${persona}.
1. Directly quote or reference a key specific point the user claimed.
2. Attack the legal or factual weakness of that specific point.
3. Assert that procedural rules, burden of proof, or statutory requirements in ${country || 'this jurisdiction'} heavily favor your position.
Keep your response under 80 words, razor sharp, professional, and intimidating.`;

    try {
      const response = await AIEngine.runOnlineGeneration(fullPrompt, 'en');
      let rebuttal = "";
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          rebuttal = parsed.advice || parsed.summary || parsed.rebuttal || parsed.text || response;
        } else {
          rebuttal = response;
        }
      } catch {
        rebuttal = response;
      }
      
      if (typeof rebuttal !== 'string') {
        rebuttal = JSON.stringify(rebuttal);
      }

      return rebuttal.replace(/```json/g, '').replace(/```/g, '').replace(/["'{}]/g, '').trim();
    } catch (error) {
      console.warn("Online adversarial generation failed, switching to dynamic offline rebuttal:", error);
      return this.generateOfflineRebuttal(userStatement, persona, country, lawsContext);
    }
  }

  static generateOfflineRebuttal(userStatement, persona, country, laws = []) {
    const rawStmt = (userStatement || '').trim();
    const stmt = rawStmt.toLowerCase();
    const jur = country || 'this jurisdiction';
    const lawsCitation = (Array.isArray(laws) && laws.length > 0 && laws[0]?.name)
      ? ` (${laws[0].section ? laws[0].section + ' - ' : ''}${laws[0].name})`
      : '';

    // Extract an impactful snippet to reflect back to the user
    const words = rawStmt.split(/\s+/);
    let keyExcerpt = "";
    if (words.length > 8) {
      keyExcerpt = words.slice(0, 7).join(' ') + '...';
    } else if (words.length > 0) {
      keyExcerpt = rawStmt;
    }

    // ── Multi-Agent Judicial Bench Persona ──
    if (persona === 'multi_agent_bench') {
      const isSearch = stmt.includes('search') || stmt.includes('warrant') || stmt.includes('police') || stmt.includes('cop');
      const isTraffic = stmt.includes('speed') || stmt.includes('traffic') || stmt.includes('radar') || stmt.includes('challan');
      const isRent = stmt.includes('rent') || stmt.includes('evict') || stmt.includes('landlord') || stmt.includes('lease');
      
      let objection = `Objection! The defense assertion regarding "${keyExcerpt}" lacks certified evidentiary backing and attempts to shift the burden of proof.`;
      let ruling = `OVERRULED in part. The bench notes that procedural requirements in ${jur}${lawsCitation} require strict initial compliance from the state before summary penalties apply.`;
      let counselTip = `Tactical tip: File an immediate motion for production of administrative logs and dispute service of notice.`;

      if (isSearch) {
        objection = `Objection! Claiming "${keyExcerpt}" ignores reasonable suspicion and established exigent circumstances doctrines.`;
        ruling = `SUSTAINED as to search standards. The state must provide recorded written justification under applicable statutory procedure.`;
        counselTip = `File an exclusionary motion to suppress all physical evidence under constitutional search protections.`;
      } else if (isTraffic) {
        objection = `Objection! Speeding is a strict liability statutory violation under the transportation code.`;
        ruling = `CONDITIONAL: The court orders production of the speed radar device calibration certificate within 14 days, failing which the citation is dismissed.`;
        counselTip = `Challenge the calibration interval certificate and the operating officer's certification.`;
      } else if (isRent) {
        objection = `Objection! Non-payment of rent constitutes an incurable lease violation.`;
        ruling = `OVERRULED. The court will not grant possession without proof of statutory pre-eviction cure notice.`;
        counselTip = `Deposit disputed rent into a court escrow registry to demonstrate good faith and block eviction orders.`;
      }

      return `⚖️ PROSECUTOR:\n"${objection}"\n\n🔨 PRESIDING JUDGE:\n"${ruling}"\n\n🛡️ DEFENSE CO-COUNSEL:\n"${counselTip}"`;
    }

    // ── Opposing Lawyer Persona ──
    if (persona === 'opposing_lawyer') {
      if (stmt.includes('speed') || stmt.includes('radar') || stmt.includes('km/h') || stmt.includes('mph') || stmt.includes('traffic')) {
        return `Your defense concerning "${keyExcerpt}" is procedurally dead. In ${jur}, vehicular speed violations are absolute liability offenses. Personal necessity or traffic flow does not negate the statutory measurement. We have certified calibration records, and your claim will be struck down at trial.`;
      }
      if (stmt.includes('search') || stmt.includes('warrant') || stmt.includes('police') || stmt.includes('cop') || stmt.includes('arrest')) {
        return `Regarding your assertion that "${keyExcerpt}", statutory procedure in ${jur} expressly empowers law enforcement under exigent circumstances and reasonable suspicion. Your motion to suppress will be denied for lack of jurisdictional standing.`;
      }
      if (stmt.includes('rent') || stmt.includes('landlord') || stmt.includes('lease') || stmt.includes('evict') || stmt.includes('deposit')) {
        return `You claim "${keyExcerpt}", but tenancy law in ${jur} strictly forbids unilateral withholding of rent without prior judicial escrow escrow deposit. You are in material breach, and my client is immediately filing for summary judgment for possession.`;
      }
      if (stmt.includes('fire') || stmt.includes('employ') || stmt.includes('job') || stmt.includes('work') || stmt.includes('severance') || stmt.includes('boss')) {
        return `Your allegation regarding "${keyExcerpt}" completely ignores company documentation. Under the employment regulations of ${jur}, your employer has documented performance deficits and material insubordination. We will file a motion to dismiss your wrongful termination claim with full prejudice.`;
      }
      if (stmt.includes('contract') || stmt.includes('agreement') || stmt.includes('breach') || stmt.includes('sign') || stmt.includes('terms')) {
        return `Your interpretation of "${keyExcerpt}" violates the parol evidence rule in ${jur}. The written contract contains an explicit integration clause that supersedes oral discussions. You are liable for liquidated damages and legal fees.`;
      }
      if (stmt.includes('scam') || stmt.includes('fraud') || stmt.includes('money') || stmt.includes('crypto') || stmt.includes('invest') || stmt.includes('bank')) {
        return `You claim "${keyExcerpt}", but you bore the affirmative duty of due diligence under financial statutes in ${jur}. You signed the risk disclosure covenants, and your attempt to shift commercial liability onto third parties is legally frivolous.`;
      }
      if (stmt.includes('medical') || stmt.includes('doctor') || stmt.includes('hospital') || stmt.includes('surgery') || stmt.includes('negligen')) {
        return `To establish medical negligence in ${jur}, you must prove a breach of the standard Bolam/reasonable doctor test with certified expert testimony. Your personal grievance regarding "${keyExcerpt}" fails to meet the evidentiary bar.`;
      }
      if (stmt.includes('divorce') || stmt.includes('custody') || stmt.includes('child') || stmt.includes('alimony') || stmt.includes('spouse') || stmt.includes('marriage')) {
        return `Family courts in ${jur} prioritize documented statutory welfare assessments over assertions like "${keyExcerpt}". We have documented cross-petitions ready for filing, and you will not receive the custody terms you are demanding.`;
      }
      if (stmt.includes('copyright') || stmt.includes('patent') || stmt.includes('trademark') || stmt.includes('ip') || stmt.includes('intellectual')) {
        return `Your argument on "${keyExcerpt}" constitutes willful infringement under the intellectual property code of ${jur}. We have secured timestamped chain-of-custody certificates and will seek treble statutory damages in court.`;
      }
      if (stmt.includes('defam') || stmt.includes('slander') || stmt.includes('libel') || stmt.includes('reputation') || stmt.includes('post')) {
        return `Your defense of "${keyExcerpt}" will fail. The statements you published caused quantifiable commercial harm under ${jur} tort law. You cannot establish truth or qualified privilege, and we are proceeding with an expedited libel suit.`;
      }

      // Dynamic rotation reflecting user text
      const dynamicOptions = [
        `You assert that "${keyExcerpt}", but you have produced zero admissible exhibits to substantiate that claim. Under ${jur} civil procedure, the burden of proof rests squarely upon you, and your testimony will collapse on cross-examination.`,
        `Your argument stating "${keyExcerpt}" shifts the statutory burden onto my client in direct contradiction of established precedent in ${jur}. We have already initiated formal discovery demands and will seek sanctions for non-compliance.`,
        `Having reviewed your statement on "${keyExcerpt}", it is evident that you failed to provide requisite statutory notice before taking action. The tribunal in ${jur} will not tolerate this procedural irregularity.`,
        `We have thoroughly scrutinized your claim that "${keyExcerpt}". You lack contemporaneous documentation or witness affidavits. My client will not enter into settlement discussions on such baseless assertions.`
      ];
      return this.selectByHash(rawStmt, dynamicOptions);
    }

    // ── Police Officer Persona ──
    if (persona === 'police_officer') {
      if (stmt.includes('speed') || stmt.includes('radar') || stmt.includes('driving') || stmt.includes('car')) {
        return `The radar unit clocked you significantly above the statutory threshold. Your claim that "${keyExcerpt}" does not constitute an emergency exemption under the traffic code of ${jur}. Hand over your license, registration, and proof of insurance now.`;
      }
      if (stmt.includes('search') || stmt.includes('warrant') || stmt.includes('cooperate')) {
        return `Officers on the scene observed reasonable suspicion prior to the search. You claiming "${keyExcerpt}" is being recorded in the official dashcam audio. Step out of the vehicle and keep your hands visible.`;
      }
      const officerOptions = [
        `Your story about "${keyExcerpt}" directly contradicts the dispatch report and witness statements on file. I advise you to think carefully before making any further sworn declarations.`,
        `That explanation about "${keyExcerpt}" is not adding up. We have surveillance footage of the area that paints a very different picture. Answer our questions directly without evading.`,
        `You claim "${keyExcerpt}", but that does not excuse the infraction under ${jur} statutes. Cooperating with the investigation now is in your best interest.`
      ];
      return this.selectByHash(rawStmt, officerOptions);
    }

    // ── Landlord Persona ──
    if (persona === 'landlord') {
      if (stmt.includes('repair') || stmt.includes('fix') || stmt.includes('damage') || stmt.includes('mold') || stmt.includes('broken')) {
        return `You signed the move-in inspection certificate acknowledging the premises were in satisfactory condition. Claiming "${keyExcerpt}" after defaulting on rent is a bad-faith defense. You are liable for all repair expenses.`;
      }
      const landlordOptions = [
        `The lease agreement is unequivocal. Your excuse regarding "${keyExcerpt}" does not exempt you from clause 14 of your signed lease. If the full account balance is not settled within 48 hours, eviction proceedings will commence.`,
        `I have heard repeated justifications like "${keyExcerpt}". Property taxes and building maintenance cannot wait on your convenience. I am handing this matter to our eviction attorneys immediately.`
      ];
      return this.selectByHash(rawStmt, landlordOptions);
    }

    // ── Employer Persona ──
    if (persona === 'employer') {
      const employerOptions = [
        `Your defense regarding "${keyExcerpt}" directly breaches section 4.2 of the employee code of conduct you signed. In ${jur}, at-will separation requires no further negotiation, and this termination is irreversible.`,
        `Management reviewed your explanation that "${keyExcerpt}" and found it completely unacceptable. Your actions created serious compliance liabilities for the company. HR will mail your exit documents.`
      ];
      return this.selectByHash(rawStmt, employerOptions);
    }

    return `Under ${jur} legal standards, your argument that "${keyExcerpt}" fails to establish a legally cognizable defense. You have not met the threshold evidentiary requirements to defeat our claim.`;
  }

  static selectByHash(str, array) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % array.length;
    return array[idx];
  }

  static calculatePersuasionScore(rebuttal) {
    const weaknesses = [
      "however", "failed to", "insufficient", "no evidence", 
      "you cannot", "contradicts", "violation of", "flaw", 
      "weakness", "unlikely", "prove", "breach", "frivolous", "dead"
    ];
    
    let keywordCount = 0;
    const lowerRebuttal = (rebuttal || '').toLowerCase();
    
    weaknesses.forEach(word => {
      if (lowerRebuttal.includes(word)) {
        keywordCount++;
      }
    });

    const score = Math.max(10, Math.min(95, 100 - (keywordCount * 12)));
    return score;
  }
}
