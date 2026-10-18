// src/engine/VaultCrypto.js
/**
 * LAWFORGE AI — Sovereign Vault Cryptographic Engine
 * Provides End-to-End AES-256-GCM encryption with PBKDF2 key derivation
 * for client-side document storage, case notes, and confidential evidence.
 */

export const VaultCrypto = {
  SALT_BYTE_LENGTH: 16,
  IV_BYTE_LENGTH: 12,
  PBKDF2_ITERATIONS: 100000,

  /**
   * Encrypts plaintext string or JSON object using a user-provided passphrase
   * Returns a compact Base64 payload containing [SALT][IV][CIPHERTEXT]
   */
  async encrypt(data, passphrase) {
    if (!passphrase || typeof passphrase !== 'string') {
      throw new Error("Passphrase must be a non-empty string.");
    }

    const text = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(text);

    // Generate cryptographically secure random salt & IV
    const cryptoObj = (typeof window !== 'undefined' && window.crypto) ? window.crypto : (await import('crypto')).webcrypto;
    const salt = cryptoObj.getRandomValues(new Uint8Array(this.SALT_BYTE_LENGTH));
    const iv = cryptoObj.getRandomValues(new Uint8Array(this.IV_BYTE_LENGTH));

    // Derive PBKDF2 key
    const rawKey = await cryptoObj.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const aesKey = await cryptoObj.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      rawKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    // Encrypt
    const ciphertext = await cryptoObj.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encodedData
    );

    // Pack into binary buffer: [SALT (16B)] [IV (12B)] [CIPHERTEXT]
    const combined = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.byteLength);
    combined.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

    // Convert to Base64
    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return (typeof btoa !== 'undefined') ? btoa(binary) : Buffer.from(combined).toString('base64');
  },

  /**
   * Decrypts a Base64 payload encrypted with VaultCrypto.encrypt
   */
  async decrypt(base64Payload, passphrase) {
    if (!base64Payload || !passphrase) {
      throw new Error("Payload and passphrase are required for decryption.");
    }

    // Decode Base64 to Uint8Array
    let combined;
    if (typeof atob !== 'undefined') {
      const binary = atob(base64Payload);
      combined = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        combined[i] = binary.charCodeAt(i);
      }
    } else {
      combined = new Uint8Array(Buffer.from(base64Payload, 'base64'));
    }

    const minLength = this.SALT_BYTE_LENGTH + this.IV_BYTE_LENGTH;
    if (combined.length <= minLength) {
      throw new Error("Invalid encrypted payload: insufficient bytes.");
    }

    const salt = combined.slice(0, this.SALT_BYTE_LENGTH);
    const iv = combined.slice(this.SALT_BYTE_LENGTH, minLength);
    const ciphertext = combined.slice(minLength);

    const cryptoObj = (typeof window !== 'undefined' && window.crypto) ? window.crypto : (await import('crypto')).webcrypto;
    const encoder = new TextEncoder();

    const rawKey = await cryptoObj.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const aesKey = await cryptoObj.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      rawKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    try {
      const decryptedBuffer = await cryptoObj.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        ciphertext
      );

      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedBuffer);

      // Attempt parsing JSON, otherwise return raw string
      try {
        return JSON.parse(decryptedText);
      } catch {
        return decryptedText;
      }
    } catch {
      throw new Error("Decryption failed: Incorrect passphrase or corrupted payload.");
    }
  }
};
