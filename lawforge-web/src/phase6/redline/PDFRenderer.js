// src/phase6/redline/PDFRenderer.js
import * as pdfjsLib from 'pdfjs-dist';

// Reuse the same CDN worker path used by DocumentAnalyzer.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFRenderer {
  /**
   * Renders all pages of a PDF file to canvases appended to containerRef.
   * @param {File} file
   * @param {React.RefObject} containerRef - ref to a DOM element
   * @returns {Promise<Array<{pageNum, canvas, textContent}>>}
   */
  static async renderPages(file, containerRef) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const results = [];

    // Clear container before rendering
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      canvas.style.marginBottom = '12px';
      canvas.style.borderRadius = '4px';

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const textContent = await page.getTextContent();

      if (containerRef.current) {
        containerRef.current.appendChild(canvas);
      }

      results.push({ pageNum: i, canvas, viewport, textContent });
    }

    return results;
  }

  /**
   * Clone all canvases into a second container (for the marked-up right panel).
   */
  static cloneInto(renderedPages, containerRef) {
    if (!containerRef.current) return [];
    containerRef.current.innerHTML = '';
    return renderedPages.map(({ pageNum, canvas, viewport, textContent }) => {
      const clone = document.createElement('canvas');
      clone.width = canvas.width;
      clone.height = canvas.height;
      clone.style.display = 'block';
      clone.style.marginBottom = '12px';
      clone.style.borderRadius = '4px';
      const ctx = clone.getContext('2d');
      ctx.drawImage(canvas, 0, 0);
      containerRef.current.appendChild(clone);
      return { pageNum, canvas: clone, viewport, textContent };
    });
  }
}
