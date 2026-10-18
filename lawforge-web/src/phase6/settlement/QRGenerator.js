import QRCodeLib from 'qrcode';

// Support both default and named imports depending on the environment bundler
const QRCode = QRCodeLib.toDataURL ? QRCodeLib : (QRCodeLib.default || QRCodeLib);

export class QRGenerator {
  /**
   * Generates a QR code data URL from a text string.
   * Purple-on-dark color scheme to match LawForge aesthetic.
   * @param {string} text
   * @returns {Promise<string>} base64 data URL
   */
  static async toDataURL(text) {
    if (!text) return '';
    
    // Safety check: standard QR limit is around 2k-4k chars depending on ECC
    // Our JSON payload is around 300-500 chars, but we slice just in case.
    const safeText = text.length > 2000 ? text.slice(0, 2000) : text;

    try {
      return await QRCode.toDataURL(safeText, {
        width: 300,
        margin: 2,
        color: { dark: '#7c3aed', light: '#0a0a1e' },
        errorCorrectionLevel: 'M'
      });
    } catch (e) {
      console.error("QR Generation failed", e);
      // Return a placeholder or empty string instead of throwing
      return '';
    }
  }
}
