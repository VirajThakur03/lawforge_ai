// src/phase6/redline/HighlightEngine.js

export class HighlightEngine {
  /**
   * Draws a semi-transparent highlight rectangle over a text item on a canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {Object} textItem - from pdfjs textContent.items
   * @param {string} color - e.g. 'rgba(239, 68, 68, 0.35)'
   */
  static highlightText(canvas, textItem, color = 'rgba(239, 68, 68, 0.35)', viewport = null) {
    const ctx = canvas.getContext('2d');
    // pdfjs transform: [scaleX, skewY, skewX, scaleY, tx, ty]
    const [, , , scaleY, tx, ty] = textItem.transform;
    const scale = viewport ? viewport.scale : 1.5;
    const txScaled = tx * scale;
    const tyScaled = ty * scale;
    const height = (Math.abs(scaleY) || 12) * scale;
    const width = (textItem.width || 60) * scale;

    ctx.save();
    ctx.fillStyle = color;
    // PDF coords are bottom-left; canvas is top-left
    ctx.fillRect(txScaled, canvas.height - tyScaled - height, width, height);
    ctx.restore();
  }

  /**
   * Draws a red strikethrough line through the centre of a text item.
   */
  static strikethrough(canvas, textItem, viewport = null) {
    const ctx = canvas.getContext('2d');
    const [, , , scaleY, tx, ty] = textItem.transform;
    const scale = viewport ? viewport.scale : 1.5;
    const txScaled = tx * scale;
    const tyScaled = ty * scale;
    const height = (Math.abs(scaleY) || 12) * scale;
    const width = (textItem.width || 60) * scale;
    const midY = canvas.height - tyScaled - height / 2;

    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(txScaled, midY);
    ctx.lineTo(txScaled + width, midY);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws a small yellow margin note at the right edge of the canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {number} yPosition - canvas Y coordinate
   * @param {string} noteText
   */
  static addMarginNote(canvas, yPosition, noteText) {
    const ctx = canvas.getContext('2d');
    const noteX = canvas.width - 140;
    const noteW = 130;
    const noteH = 20;
    const noteY = Math.max(0, yPosition - noteH / 2);

    ctx.save();
    ctx.fillStyle = '#fef08a';           // yellow-200
    ctx.strokeStyle = '#ca8a04';         // yellow-600
    ctx.lineWidth = 1;
    ctx.fillRect(noteX, noteY, noteW, noteH);
    ctx.strokeRect(noteX, noteY, noteW, noteH);

    ctx.fillStyle = '#1a1a1a';
    ctx.font = '9px sans-serif';
    ctx.fillText(noteText.slice(0, 22), noteX + 4, noteY + 13);
    ctx.restore();
  }

  /**
   * Apply all highlights + margin notes for a set of toxic clauses
   * across rendered pages.
   * @param {Array} renderedPages - from PDFRenderer.renderPages / cloneInto
   * @param {Array} toxicClauses - [{type, quote, severity}]
   */
  static applyAll(renderedPages, toxicClauses) {
    if (!toxicClauses || toxicClauses.length === 0) return;

    renderedPages.forEach(({ canvas, textContent, viewport }) => {
      const items = textContent.items;

      toxicClauses.forEach((clause) => {
        const keyword = (clause.quote || clause.text || '').split(' ')[0].toLowerCase();
        if (!keyword) return;

        items.forEach((item) => {
          if (item.str.toLowerCase().includes(keyword)) {
            const color = clause.severity === 'HIGH'
              ? 'rgba(239, 68, 68, 0.35)'
              : 'rgba(245, 158, 11, 0.35)';
            this.highlightText(canvas, item, color, viewport);
            this.strikethrough(canvas, item, viewport);

            // Margin note Y — convert PDF y to canvas y with viewport scale
            const [, , , scaleY, , ty] = item.transform;
            const scale = viewport ? viewport.scale : 1.5;
            const tyScaled = ty * scale;
            const heightScaled = (Math.abs(scaleY) || 12) * scale;
            const noteY = canvas.height - tyScaled - heightScaled / 2;
            this.addMarginNote(canvas, noteY, `⚠️ ${clause.type || 'Risk'}`);
          }
        });
      });
    });
  }
}
