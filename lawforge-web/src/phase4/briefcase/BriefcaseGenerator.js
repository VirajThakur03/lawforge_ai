// src/phase4/briefcase/BriefcaseGenerator.js
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export class BriefcaseGenerator {
  static async generate(caseId, situation, aiResponse, elementIdToCapture) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;

      // Cover Page
      pdf.setFontSize(24);
      pdf.setTextColor(132, 85, 239); // Primary color
      pdf.text("LAWFORGE AI", margin, 40);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Client Legal Briefcase", margin, 55);
      
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Case ID: ${caseId}`, margin, 70);
      pdf.text(`Date Generated: ${new Date().toLocaleString()}`, margin, 80);

      // Situation
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Client Situation:", margin, 110);
      pdf.setFontSize(11);
      pdf.setTextColor(50, 50, 50);
      const splitSit = pdf.splitTextToSize(situation, pageWidth - (margin*2));
      pdf.text(splitSit, margin, 120);

      // Try capturing real UI DOM
      if (elementIdToCapture) {
        const el = document.getElementById(elementIdToCapture);
        if (el) {
          // ensure styles are clean before capturing
          const canvas = await html2canvas(el, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          
          pdf.addPage();
          pdf.setFontSize(16);
          pdf.setTextColor(0, 0, 0);
          pdf.text("Intelligence Analysis Snapshot", margin, 20);
          
          const imgProps = pdf.getImageProperties(imgData);
          const pdfHeight = (imgProps.height * (pageWidth - margin*2)) / imgProps.width;
          pdf.addImage(imgData, 'PNG', margin, 30, pageWidth - margin*2, pdfHeight);
        }
      }

      pdf.save(`LAWFORGE_Briefcase_${caseId}.pdf`);
      return true;
    } catch (e) {
      console.error("Failed to generate briefcase", e);
      return false;
    }
  }
}
