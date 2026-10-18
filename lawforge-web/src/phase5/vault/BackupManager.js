// src/phase5/vault/BackupManager.js

export const BackupManager = {
  /**
   * Encrypts the workspace data with AES-GCM using a password-derived key.
   * Returns a downloadable Blob representing a encrypted .lawforge archive.
   */
  async encryptBackup(dataObj, password) {
    try {
      const textEncoder = new TextEncoder();
      const plaintext = textEncoder.encode(JSON.stringify(dataObj));
      
      // Generate secure random salt and iv
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Import password as raw key material
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        textEncoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
      
      // Derive AES-GCM key using PBKDF2
      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      
      // Encrypt the workspace payload
      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        aesKey,
        plaintext
      );
      
      // Package into single binary payload: [SALT (16 bytes)] [IV (12 bytes)] [CIPHERTEXT]
      const archiveBuffer = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
      archiveBuffer.set(salt, 0);
      archiveBuffer.set(iv, salt.byteLength);
      archiveBuffer.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);
      
      return new Blob([archiveBuffer], { type: "application/octet-stream" });
    } catch (e) {
      console.error("Encryption backup failed", e);
      throw new Error("Failed to secure backup with password.");
    }
  },

  /**
   * Decrypts a binary payload representing a .lawforge archive.
   * Returns the original JSON object.
   */
  async decryptBackup(arrayBuffer, password) {
    try {
      const textEncoder = new TextEncoder();
      const textDecoder = new TextDecoder();
      
      const fullBytes = new Uint8Array(arrayBuffer);
      if (fullBytes.length < 28) {
        throw new Error("Invalid backup file: file too short.");
      }
      
      // Extract salt, iv, and ciphertext
      const salt = fullBytes.slice(0, 16);
      const iv = fullBytes.slice(16, 28);
      const ciphertext = fullBytes.slice(28);
      
      // Import password
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        textEncoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
      
      // Derive AES-GCM key using same PBKDF2 configuration
      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      
      // Decrypt ciphertext
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        aesKey,
        ciphertext
      );
      
      const decryptedString = textDecoder.decode(decryptedBuffer);
      return JSON.parse(decryptedString);
    } catch (e) {
      console.error("Decryption backup failed", e);
      throw new Error("Incorrect password or corrupted backup file.");
    }
  }
};
