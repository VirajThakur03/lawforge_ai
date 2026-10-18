// src/phase6/panic/IPFSEncryptor.js

export const IPFSEncryptor = {
  /**
   * Encrypts a media Blob using AES-GCM and a temporary session key.
   */
  async encryptBlob(blob, password) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const textEncoder = new TextEncoder();
      
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        textEncoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
      
      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 10000, // lower iterations for real-time streaming performance
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      
      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        aesKey,
        arrayBuffer
      );
      
      const packed = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
      packed.set(salt, 0);
      packed.set(iv, salt.byteLength);
      packed.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);
      
      return new Blob([packed], { type: "application/octet-stream" });
    } catch (e) {
      console.error("Failed to encrypt stream chunk", e);
      throw e;
    }
  },

  /**
   * Simulates uploading the encrypted blob to an IPFS node (e.g. Infura/Helia endpoint).
   * Returns a simulated CID and gateway link.
   */
  async uploadToIPFS(encryptedBlob) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate simulated IPFS Content Identifier (CIDv1)
        const bytes = new Uint8Array(32);
        if (typeof window !== 'undefined' && window.crypto) {
          window.crypto.getRandomValues(bytes);
        } else {
          for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
        }
        
        // Convert to pseudo Base58 hash (starting with Qm... or bafy...)
        const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let cid = "Qm";
        for (let i = 0; i < 44; i++) {
          cid += chars[bytes[i % 32] % chars.length];
        }
        
        resolve({
          cid,
          gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
          sizeBytes: encryptedBlob.size,
          provider: "Local Sovereign IPFS gateway Node (Helia)"
        });
      }, 500);
    });
  }
};
