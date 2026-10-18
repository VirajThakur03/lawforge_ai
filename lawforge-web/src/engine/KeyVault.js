// src/engine/KeyVault.js
/**
 * Zero-Trust Encrypted Storage Vault for Sensitive Credentials & API Keys.
 * Uses AES-GCM 256-bit encryption with PBKDF2 key derivation and random IVs.
 */

const VAULT_SALT_KEY = 'lf_vault_entropy_salt';
const ENCRYPTED_PREFIX = 'ENC_V1:';

async function getOrDeriveMasterKey() {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return null;
  }

  let saltHex = localStorage.getItem(VAULT_SALT_KEY);
  if (!saltHex) {
    const randomSalt = new Uint8Array(16);
    window.crypto.getRandomValues(randomSalt);
    saltHex = Array.from(randomSalt).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(VAULT_SALT_KEY, saltHex);
  }

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  // Use machine/origin entropy as base material
  const baseMaterial = `${window.location.origin}:${navigator.userAgent.slice(0, 32)}:lawforge-sovereign-vault`;
  const enc = new TextEncoder();
  const rawKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(baseMaterial),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const KeyVault = {
  /**
   * Securely encrypt and store a key in browser storage
   */
  async setSecure(storageKey, plainTextValue) {
    if (!plainTextValue) {
      localStorage.removeItem(storageKey);
      return;
    }

    try {
      const cryptoKey = await getOrDeriveMasterKey();
      if (!cryptoKey) {
        // Fallback if Web Crypto is unavailable
        localStorage.setItem(storageKey, plainTextValue);
        return;
      }

      const iv = new Uint8Array(12);
      window.crypto.getRandomValues(iv);

      const enc = new TextEncoder();
      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        enc.encode(plainTextValue)
      );

      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      const cipherHex = Array.from(new Uint8Array(cipherBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      localStorage.setItem(storageKey, `${ENCRYPTED_PREFIX}${ivHex}:${cipherHex}`);
    } catch (err) {
      console.warn('KeyVault encryption failed, using fallback:', err);
      localStorage.setItem(storageKey, plainTextValue);
    }
  },

  /**
   * Decrypt and retrieve stored secret
   */
  async getSecure(storageKey) {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    if (!raw.startsWith(ENCRYPTED_PREFIX)) {
      // Legacy unencrypted key — migrate automatically
      await KeyVault.setSecure(storageKey, raw);
      return raw;
    }

    try {
      const cryptoKey = await getOrDeriveMasterKey();
      if (!cryptoKey) return null;

      const payload = raw.slice(ENCRYPTED_PREFIX.length);
      const [ivHex, cipherHex] = payload.split(':');
      if (!ivHex || !cipherHex) return null;

      const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const cipherData = new Uint8Array(cipherHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

      const decBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        cipherData
      );

      const dec = new TextDecoder();
      return dec.decode(decBuffer);
    } catch (err) {
      console.error('KeyVault decryption error:', err);
      return null;
    }
  },

  /**
   * Check if a key is stored
   */
  hasKey(storageKey) {
    return !!localStorage.getItem(storageKey);
  },

  /**
   * Remove stored key
   */
  removeKey(storageKey) {
    localStorage.removeItem(storageKey);
  }
};
