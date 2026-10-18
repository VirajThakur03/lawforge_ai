// src/phase6/settlement/SettlementEngine.js

export class SettlementEngine {
  /**
   * Builds a structured settlement agreement text.
   */
  static buildAgreement(response, situation, partyA, partyB) {
    const date = new Date().toLocaleDateString();
    
    let governingLaw = 'General Law';
    if (response?.laws) {
      if (Array.isArray(response.laws)) {
        governingLaw = response.laws[0] || 'General Law';
      } else if (typeof response.laws === 'string') {
        const parts = response.laws.split('\n\n');
        governingLaw = parts[0] ? parts[0].trim() : 'General Law';
      }
    }

    let nextStepsArr = [];
    if (response?.next_steps) {
      if (Array.isArray(response.next_steps)) {
        nextStepsArr = response.next_steps;
      } else if (typeof response.next_steps === 'string') {
        nextStepsArr = response.next_steps.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      }
    }

    const nextSteps = nextStepsArr.length > 0
      ? nextStepsArr.map((s, i) => {
          const cleanStep = s.replace(/^\d+[.\s]+/, '');
          return `${i + 1}. ${cleanStep}`;
        }).join('\n')
      : 'No specific terms extracted.';

    return `
==========================================================
              SMART SETTLEMENT AGREEMENT
==========================================================

Date:     ${date}
Party A:  ${partyA || 'Aggrieved Party'}
Party B:  ${partyB || 'Opposing Party'}

----------------------------------------------------------
STATEMENT OF FACTS
----------------------------------------------------------
${(situation || '').slice(0, 300)}

----------------------------------------------------------
GOVERNING LAW
----------------------------------------------------------
${governingLaw}

----------------------------------------------------------
AGREED TERMS
----------------------------------------------------------
${nextSteps}

----------------------------------------------------------
ACKNOWLEDGEMENT
----------------------------------------------------------
By scanning the QR code issued with this agreement, the
receiving party acknowledges the terms above.

DRAFT — Subject to attorney review before signing.
==========================================================
`.trim();
  }

  /**
   * SHA-256 hashes the agreement text.
   * Uses Web Crypto API if available, otherwise falls back to a simple hex hash string.
   * @param {string} agreementText
   * @returns {Promise<string>} hex string
   */
  static async hashAgreement(agreementText) {
    try {
      if (window.crypto && window.crypto.subtle) {
        const encoded = new TextEncoder().encode(agreementText);
        const buffer = await window.crypto.subtle.digest('SHA-256', encoded);
        return Array.from(new Uint8Array(buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (e) {
      console.warn("Crypto API failed, using fallback hash", e);
    }
    
    // Fallback: Simple pseudo-deterministic hash if crypto is blocked
    // (Note: In production we'd use a library, but for offline resilience we use a basic loop)
    let hash = 0;
    for (let i = 0; i < agreementText.length; i++) {
        const char = agreementText.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'fb-' + Math.abs(hash).toString(16) + Date.now().toString(16);
  }

  /**
   * Encodes the agreement into a compact QR payload.
   * @param {string} agreementText
   * @param {string} hash
   * @returns {string}
   */
  static encodeForQR(agreementText, hash) {
    return JSON.stringify({
      hash,
      timestamp: new Date().toISOString(),
      preview: agreementText.slice(0, 200)
    });
  }
}
