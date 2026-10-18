// public/workers/OCRWorker.js

self.onmessage = async (e) => {
  const { type, fileBlob } = e.data;
  
  if (type === 'ocr_scan') {
    try {
      // Simulate step-by-step local OCR progress
      const steps = [
        { progress: 0.1, status: "Loading local OCR engine..." },
        { progress: 0.3, status: "Preprocessing image: binarizing and deskewing..." },
        { progress: 0.55, status: "Analyzing page layout & segmenting paragraphs..." },
        { progress: 0.8, status: "Performing character recognition (Tesseract Engine)..." },
        { progress: 0.95, status: "Reassembling semantic sections..." }
      ];
      
      for (const step of steps) {
        self.postMessage({ type: 'progress', progress: step.progress, status: step.status });
        // Sleep to simulate async computation
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      // Default mock text extracted from scanned document
      const docName = fileBlob ? fileBlob.name.toLowerCase() : '';
      let extractedText = "";
      
      if (docName.includes('lease') || docName.includes('rent') || docName.includes('property')) {
        extractedText = `COMMERCIAL LEASE AGREEMENT
This Commercial Lease Agreement (the "Agreement") is made this 12th day of May, 2026, by and between MONOLITH HOLDINGS LLC (hereinafter "Landlord") and NEXUS SYSTEMS (hereinafter "Tenant").
1. PREMISES: Landlord hereby leases to Tenant the commercial property located at 505 Cyber Plaza, Bangalore, India.
2. TERM: The lease term shall commence on June 1, 2026, and shall terminate on May 31, 2029.
3. RENT: Tenant agrees to pay Landlord monthly rent of Rs. 85,000, payable on the first day of each month.
4. INDEMNIFICATION: Tenant shall defend and hold Landlord harmless against any liability for injuries or damages occurring on the premises.
5. GOVERNING LAW: This Agreement shall be governed by the laws of India.
[Missing clause: Force Majeure, Severability, Arbitration]`;
      } else {
        extractedText = `MUTUAL NON-DISCLOSURE AGREEMENT
This Non-Disclosure Agreement is entered into by and between LAWFORGE SOLUTIONS and CLIENT SERVICES CORP.
The Parties wish to explore a potential business relationship and share proprietary technology.
1. CONFIDENTIAL INFORMATION: Confidential Information refers to any proprietary data marked as confidential.
2. USE OF INFORMATION: The receiving party shall only use the information for evaluating the business partnership.
3. TERM: The obligations of confidentiality shall remain in effect for a period of 2 years from date of receipt.
[Missing clause: Severability, Governing Law, Arbitration, Indemnification]`;
      }
      
      self.postMessage({ type: 'success', text: extractedText });
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
};
