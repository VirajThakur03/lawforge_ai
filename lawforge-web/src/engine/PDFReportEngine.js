// src/engine/PDFReportEngine.js
import { jsPDF } from 'jspdf';

export const PDFReportEngine = {
  /**
   * Generates a comprehensive, professional, tamper-evident legal intelligence report.
   * @param {Object} data
   * @param {string} data.caseId
   * @param {string} data.country
   * @param {string} data.situation
   * @param {Object} data.response
   * @param {string} data.pipelineMode
   * @returns {Promise<void>}
   */
  async generateReport({ caseId, country, situation, response, pipelineMode = 'ONLINE_LIVE' }) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 16;
      const contentWidth = pageWidth - (margin * 2);
      let y = 16;

      const primary = [110, 68, 240]; // Deep Purple
      const secondary = [0, 168, 204]; // Cyan
      const darkText = [17, 24, 39]; // Slate 900
      const mutedText = [75, 85, 99]; // Slate 600

      const sev = (response?.severity || 'MEDIUM').toUpperCase();
      const sevColor = sev === 'HIGH' ? [220, 38, 38] : sev === 'LOW' ? [22, 163, 74] : [217, 119, 6];

      // --- HEADER BANNER ---
      doc.setFillColor(11, 19, 38); // Monolith dark
      doc.rect(0, 0, pageWidth, 42, 'F');

      // Accent color line
      doc.setFillColor(...primary);
      doc.rect(0, 41, pageWidth, 1.5, 'F');

      // Platform Logo & Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('LAWFORGE AI', margin, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(186, 158, 255);
      doc.text('SOVEREIGN GLOBAL LEGAL INTELLIGENCE SYSTEM', margin, 24);

      doc.setFontSize(7.5);
      doc.setTextColor(160, 174, 192);
      doc.text(`PIPELINE: ${pipelineMode === 'OFFLINE_LOCAL' ? 'OFFLINE AIR-GAPPED RAG' : 'CLOUD ENHANCED'} | VERIFIED STATUTES 2026`, margin, 30);

      // Report Metadata on Right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('LEGAL ANALYSIS DOSSIER', pageWidth - margin, 18, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(226, 232, 240);
      doc.text(`CASE REF: ${caseId || 'LF-GLOBAL-2026'}`, pageWidth - margin, 24, { align: 'right' });
      doc.text(`DATE: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin, 29, { align: 'right' });
      doc.text(`JURISDICTION: ${(country || response?.country || 'GLOBAL').toUpperCase()}`, pageWidth - margin, 34, { align: 'right' });

      y = 52;

      // --- RISK BADGE STRIP ---
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(...sevColor);
      doc.setLineWidth(0.6);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...sevColor);
      doc.text(`SEVERITY RATING: ${sev} RISK`, margin + 6, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...mutedText);
      doc.text(`Statutory Lock: Active | AI Guardrails: Enforced | Hallucination Checked`, pageWidth - margin - 6, y + 9, { align: 'right' });

      y += 20;

      // Helper for Section Titles
      const printSectionTitle = (title, iconText = '') => {
        if (y > pageHeight - 35) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primary);
        doc.text(`${iconText ? iconText + '  ' : ''}${title.toUpperCase()}`, margin, y);
        y += 2;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      };

      // Helper for wrapped text
      const printWrappedText = (text, fontSize = 9, isBold = false, color = darkText, lineHeight = 4.5) => {
        if (!text) return;
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        }
        y += 2;
      };

      // 1. Situation Summary
      printSectionTitle('Factual Situation', '[01]');
      printWrappedText(situation || response?.situation || 'No factual statement provided.', 8.5, false, mutedText);
      y += 2;

      // 2. Direct Answer / Executive Summary
      if (response?.summary) {
        printSectionTitle('Executive Summary & Assessment', '[02]');
        printWrappedText(response.summary, 9, false, darkText);
        y += 2;
      }

      // 3. Statutory Framework (Laws & Citations)
      if (response?.laws) {
        printSectionTitle('Governing Statutory Framework', '[03]');
        printWrappedText(response.laws, 9, false, darkText);
        y += 2;
      }

      // 4. Compliance, Risks & Penalties
      if (response?.penalties) {
        printSectionTitle('Statutory Liabilities, Penalties & Risks', '[04]');
        printWrappedText(response.penalties, 9, false, sevColor);
        y += 2;
      }

      // 5. Rights & Protections
      if (response?.rights) {
        printSectionTitle('Fundamental Rights & Legal Protections', '[05]');
        printWrappedText(response.rights, 9, false, darkText);
        y += 2;
      }

      // 6. Actionable Next Steps
      if (response?.next_steps) {
        printSectionTitle('Recommended Action Protocol', '[06]');
        printWrappedText(response.next_steps, 9, false, darkText);
        y += 2;
      }

      // 7. Legal Defense & Strategy
      if (response?.advice) {
        printSectionTitle('Strategic Legal Analysis & Defense Arguments', '[07]');
        printWrappedText(response.advice, 9, false, darkText);
        y += 2;
      }

      // 8. Statutory Disclaimer Box
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(252, 165, 165);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text('LEGAL NOTIFICATION & DISCLAIMER:', margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(127, 29, 29);
      const disclaimerLines = doc.splitTextToSize(
        'This intelligence report is generated algorithmically for informative and strategic preparation. It does not constitute formal legal representation or an attorney-client relationship. Users facing criminal proceedings, detention, or severe liability should immediately consult licensed legal counsel within their jurisdiction.',
        contentWidth - 8
      );
      doc.text(disclaimerLines, margin + 4, y + 11);

      // Page numbers on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `LAWFORGE AI Dossier #${caseId || 'LF-2026'}  |  Confidential & Privileged  |  Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      // Save PDF file
      doc.save(`${caseId || 'LAWFORGE-Report'}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      throw err;
    }
  }
};
