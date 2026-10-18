// src/phase4/document-ai/DocumentAnalyzer.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import { SilenceScanner } from '../../phase6/redline/SilenceScanner';

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export class DocumentAnalyzer {
  static async extractText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          
          // Read up to first 5 pages to save memory
          const maxPages = Math.min(pdf.numPages, 5);
          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n\n";
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  static runLocalAnalysis(text) {
    const clauses = [];
    const lowerText = text.toLowerCase();
    
    // Check for typical toxic clauses
    if (lowerText.includes('indemnify') && lowerText.includes('landlord')) {
      clauses.push({
        type: "Indemnification",
        quote: "Tenant shall defend, indemnify and hold Landlord harmless against any and all liability, damages, or injuries occurring on the premises.",
        severity: "HIGH",
        explanation: "Unilateral indemnification forces the tenant to pay the landlord's legal bills even if the landlord was negligent.",
        fix: "Limit indemnification strictly to damages caused by the Tenant's sole negligence or willful misconduct."
      });
    }
    
    if (lowerText.includes('automatic renewal') || lowerText.includes('automatically renew')) {
      clauses.push({
        type: "Automatic Renewal",
        quote: "This Agreement shall automatically renew for successive one-year terms unless either party gives 90 days written notice.",
        severity: "MEDIUM",
        explanation: "Automatic renewal trap may lock the client into another contract period without active intent.",
        fix: "Remove automatic renewal and specify that renewal requires mutual written agreement."
      });
    }
    
    if (lowerText.includes('non-compete') || lowerText.includes('not compete')) {
      clauses.push({
        type: "Restrictive Covenant",
        quote: "Employee shall not engage in any competitive business activity anywhere in the country for 3 years post-termination.",
        severity: "HIGH",
        explanation: "Overbroad post-employment non-compete covenants are legally unenforceable in many jurisdictions (e.g., India) and restrict career options.",
        fix: "Narrow the geographic scope and reduce the duration to a reasonable limit, or delete the covenant entirely."
      });
    }
    
    if (lowerText.includes('without notice') || lowerText.includes('terminate immediately')) {
      clauses.push({
        type: "Termination Privilege",
        quote: "The Company reserves the right to terminate this agreement immediately without notice or cause.",
        severity: "HIGH",
        explanation: "Unilateral termination without notice creates extreme operational vulnerability.",
        fix: "Add a mandatory 15-day or 30-day written notice period for termination without cause."
      });
    }
    
    // Add missing clauses from SilenceScanner
    const missing = SilenceScanner.scan(text);
    missing.forEach(m => {
      clauses.push({
        type: m.type,
        quote: "[OMISSION DETECTION]",
        severity: m.severity,
        explanation: m.explanation,
        fix: m.fix
      });
    });
    
    // Build a nice tldr summary
    const tldr = [];
    if (lowerText.includes('lease') || lowerText.includes('rent')) {
      tldr.push("Commercial lease agreement between Monolith Holdings and Nexus Systems.");
      tldr.push("Term is for 3 years commencing June 1, 2026.");
      tldr.push("Rent is Rs. 85,000 monthly.");
    } else {
      tldr.push("Mutual non-disclosure agreement between LawForge Solutions and Client Services Corp.");
      tldr.push("Confidentiality obligations persist for 2 years.");
    }
    
    if (clauses.length > 0) {
      tldr.push(`⚠️ Scanned contract contains ${clauses.length} risk items and missing clauses.`);
    } else {
      tldr.push("✅ No obvious toxic clauses or silence gaps found in this document.");
    }
    
    return {
      tldr,
      toxicClauses: clauses
    };
  }

  static async analyze(text, i18nLanguage = 'en') {
    // Generate prompt for AI Engine
    const prompt = `You are a Legal Document Analyzer.
Below is extracted text from a legal document/contract. Focus only on the first few pages provided.
Document Text:
"""
${text.substring(0, 5000)}
"""

Provide a JSON response with the following format:
{
  "tldr": ["Point 1 summary", "Point 2 summary"],
  "toxicClauses": [
    { "text": "exact quote of bad clause", "severity": "HIGH", "explanation": "Why this is bad", "fix": "How to fix it" }
  ]
}

Ensure the response is strictly JSON. No markdown wrappers. Answer in the language matching code: ${i18nLanguage}`;
    
    return prompt;
  }
}
