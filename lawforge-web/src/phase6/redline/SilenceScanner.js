// src/phase6/redline/SilenceScanner.js

export const SilenceScanner = {
  /**
   * Scans document text for missing crucial clauses.
   * Returns a list of identified omissions.
   */
  scan(text) {
    if (!text) return [];
    
    const cleanText = text.toLowerCase();
    const omissions = [];
    
    // 1. Governing Law / Jurisdiction
    const hasGoverningLaw = /governing\s+law|jurisdiction|applicable\s+law|choice\s+of\s+law/i.test(cleanText);
    if (!hasGoverningLaw) {
      omissions.push({
        type: "Silence: Governing Law",
        severity: "HIGH",
        explanation: "No governing law or jurisdiction is defined. In case of dispute, courts will struggle to determine which regional law applies, leading to lengthy jurisdictional litigation.",
        fix: "This Agreement shall be governed by, and construed in accordance with, the laws of the active jurisdiction, without regard to conflict of laws principles. The parties submit to the exclusive jurisdiction of the competent courts therein."
      });
    }
    
    // 2. Force Majeure
    const hasForceMajeure = /force\s+majeure|act\s+of\s+god|unavoidable\s+delay|casualty/i.test(cleanText);
    if (!hasForceMajeure) {
      omissions.push({
        type: "Silence: Force Majeure",
        severity: "MEDIUM",
        explanation: "No Force Majeure clause is present. If an unexpected, unavoidable event (e.g., natural disaster, war, government shutdown) halts operations, parties remain strictly liable for non-performance.",
        fix: "Neither party shall be liable for any delay or failure in performance resulting directly or indirectly from acts of God, war, terrorism, labor disputes, civil disturbances, government regulations, or other causes beyond its reasonable control."
      });
    }
    
    // 3. Indemnification
    const hasIndemnify = /indemnify|indemnification|hold\s+harmless|defense\s+costs/i.test(cleanText);
    if (!hasIndemnify) {
      omissions.push({
        type: "Silence: Indemnification",
        severity: "HIGH",
        explanation: "No indemnification framework is established. If third-party claims or regulatory fines arise out of one party's negligence, the other party has no clear right to recover their legal defense fees or settlement costs.",
        fix: "Each party agrees to indemnify, defend, and hold harmless the other party from and against any and all claims, liabilities, damages, or costs (including attorney fees) arising from the breach of this Agreement or negligent acts of the indemnifying party."
      });
    }
    
    // 4. Severability
    const hasSeverability = /severability|severable|invalidity|unenforceable/i.test(cleanText);
    if (!hasSeverability) {
      omissions.push({
        type: "Silence: Severability",
        severity: "MEDIUM",
        explanation: "No Severability clause is present. Under standard contract law, if a court strikes down a single minor clause as illegal or unconscionable, the entire contract could be declared void.",
        fix: "If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions of this Agreement shall remain in full force."
      });
    }
    
    // 5. Arbitration / Alternative Dispute Resolution (ADR)
    const hasArbitration = /arbitration|mediation|dispute\s+resolution|arbitrate/i.test(cleanText);
    if (!hasArbitration) {
      omissions.push({
        type: "Silence: Dispute Resolution / Arbitration",
        severity: "MEDIUM",
        explanation: "No arbitration or mediation route is specified. Any dispute arising under this agreement will default to formal litigation, which is slow, public, and expensive.",
        fix: "Any dispute, controversy, or claim arising out of or relating to this contract shall be settled by binding arbitration in accordance with the rules of the local Arbitration Council. The place of arbitration shall be the capital city of the active jurisdiction."
      });
    }
    
    return omissions;
  }
};
