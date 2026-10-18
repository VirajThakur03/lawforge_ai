// src/engine/InputSanitizer.js
/**
 * Zero-Trust Input Sanitizer & Defensive Guardrail Engine.
 * Strips dangerous HTML/script injection vectors, control characters, and hostile patterns
 * before processing in legal engines and document parsers.
 */

export const InputSanitizer = {
  /**
   * Sanitizes plain text input by stripping executable tags, dangerous attributes, and null bytes.
   * @param {string} input - raw user input string
   * @param {number} maxLength - optional max character length limit
   * @returns {string} clean sanitized text
   */
  sanitizeText(input, maxLength = 10000) {
    if (typeof input !== 'string') return '';

    let clean = input
      // Remove null bytes and dangerous control characters
      .replace(/\0/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      // Strip script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Strip iframe, embed, object, and style tags
      .replace(/<(iframe|embed|object|style|applet|meta|link)\b[^>]*>/gi, '')
      .replace(/<\/(iframe|embed|object|style|applet|meta|link)>/gi, '')
      // Neutralize javascript: and data: event handlers
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, 'blocked_script:')
      .replace(/vbscript:/gi, 'blocked_script:');

    // Truncate if exceeds max length
    if (clean.length > maxLength) {
      clean = clean.slice(0, maxLength);
    }

    return clean.trim();
  },

  /**
   * Validates if input contains suspicious script or injection attempt.
   * @param {string} text
   * @returns {{ suspicious: boolean, reason?: string }}
   */
  detectAdversarialPayload(text) {
    if (!text || typeof text !== 'string') return { suspicious: false };

    const scriptPattern = /<script|javascript:|data:text\/html|onload\s*=|onerror\s*=/i;
    if (scriptPattern.test(text)) {
      return { suspicious: true, reason: 'Disallowed script injection pattern detected.' };
    }

    const sqlPattern = /(\b(UNION\s+ALL\s+SELECT|DROP\s+TABLE|ALTER\s+TABLE|EXEC(\s|\+)+(s|x)p_)\b)/i;
    if (sqlPattern.test(text)) {
      return { suspicious: true, reason: 'Hostile database injection pattern detected.' };
    }

    return { suspicious: false };
  }
};
