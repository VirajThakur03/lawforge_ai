// src/phase5/enterprise/MattersDatabase.js

const DB_NAME = "LawForgeCRM";
const DB_VERSION = 1;

// In-memory fallback if IndexedDB is blocked or unavailable
const memoryStore = {
  matters: [],
  documents: [],
  billing: [],
  autoId: 1
};

export class MattersDatabase {
  static db = null;
  static isMemoryFallback = false;

  static async init() {
    if (this.db) return this.db;
    if (this.isMemoryFallback) return null;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn("IndexedDB not available, using in-memory CRM store.");
      this.isMemoryFallback = true;
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Table 1: matters
          if (!db.objectStoreNames.contains("matters")) {
            const store = db.createObjectStore("matters", { keyPath: "id", autoIncrement: true });
            store.createIndex("client", "client", { unique: false });
            store.createIndex("category", "category", { unique: false });
          }

          // Table 2: documents
          if (!db.objectStoreNames.contains("documents")) {
            const store = db.createObjectStore("documents", { keyPath: "id", autoIncrement: true });
            store.createIndex("matterId", "matterId", { unique: false });
          }

          // Table 3: billing
          if (!db.objectStoreNames.contains("billing")) {
            const store = db.createObjectStore("billing", { keyPath: "id", autoIncrement: true });
            store.createIndex("matterId", "matterId", { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = (event) => {
          console.warn("IndexedDB CRM failed to open, falling back to memory store:", event.target.error);
          this.isMemoryFallback = true;
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB exception, falling back to memory store:", err);
        this.isMemoryFallback = true;
        resolve(null);
      }
    });
  }

  // --- MATTERS CRUD ---
  static async addMatter(client, category, status = "Active") {
    const db = await this.init();
    if (!db) {
      const id = memoryStore.autoId++;
      memoryStore.matters.push({ id, client, category, status, createdAt: new Date().toISOString() });
      return id;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["matters"], "readwrite");
      const store = transaction.objectStore("matters");
      const request = store.add({ client, category, status, createdAt: new Date().toISOString() });

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  static async getMatters() {
    const db = await this.init();
    if (!db) {
      return [...memoryStore.matters];
    }

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(["matters"], "readonly");
        const store = transaction.objectStore("matters");
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result || []);
        request.onerror = () => resolve([...memoryStore.matters]);
      } catch (e) {
        resolve([...memoryStore.matters]);
      }
    });
  }

  static async deleteMatter(id) {
    const db = await this.init();
    if (!db) {
      memoryStore.matters = memoryStore.matters.filter(m => m.id !== id);
      memoryStore.documents = memoryStore.documents.filter(d => d.matterId !== id);
      memoryStore.billing = memoryStore.billing.filter(b => b.matterId !== id);
      return true;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["matters", "documents", "billing"], "readwrite");
      
      // Delete matter
      transaction.objectStore("matters").delete(id);
      
      // Clean up associated documents and billing logs
      try {
        const docIndex = transaction.objectStore("documents").index("matterId");
        docIndex.openKeyCursor(IDBKeyRange.only(id)).onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            transaction.objectStore("documents").delete(cursor.primaryKey);
            cursor.continue();
          }
        };

        const billIndex = transaction.objectStore("billing").index("matterId");
        billIndex.openKeyCursor(IDBKeyRange.only(id)).onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            transaction.objectStore("billing").delete(cursor.primaryKey);
            cursor.continue();
          }
        };
      } catch (err) {
        console.warn("Could not cascade delete relations:", err);
      }
      
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = (event) => reject(event.target.error);
    });
  }

  // --- DOCUMENTS CRUD ---
  static async addDocument(matterId, fileHash, title) {
    const db = await this.init();
    if (!db) {
      const id = memoryStore.autoId++;
      memoryStore.documents.push({ id, matterId: Number(matterId), fileHash, title, timestamp: new Date().toISOString() });
      return id;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.add({ matterId: Number(matterId), fileHash, title, timestamp: new Date().toISOString() });

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  static async getDocuments(matterId) {
    const db = await this.init();
    if (!db) {
      return memoryStore.documents.filter(d => d.matterId === Number(matterId));
    }

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(["documents"], "readonly");
        const store = transaction.objectStore("documents");
        const index = store.index("matterId");
        const request = index.getAll(Number(matterId));

        request.onsuccess = (event) => resolve(event.target.result || []);
        request.onerror = () => resolve(memoryStore.documents.filter(d => d.matterId === Number(matterId)));
      } catch (e) {
        resolve(memoryStore.documents.filter(d => d.matterId === Number(matterId)));
      }
    });
  }

  // --- BILLING CRUD ---
  static async addBilling(matterId, durationSeconds, ratePerHour, description) {
    const db = await this.init();
    if (!db) {
      const id = memoryStore.autoId++;
      memoryStore.billing.push({
        id,
        matterId: Number(matterId),
        durationSeconds: Number(durationSeconds),
        ratePerHour: Number(ratePerHour),
        description,
        timestamp: new Date().toISOString()
      });
      return id;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["billing"], "readwrite");
      const store = transaction.objectStore("billing");
      const request = store.add({
        matterId: Number(matterId),
        durationSeconds: Number(durationSeconds),
        ratePerHour: Number(ratePerHour),
        description,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  static async getBillings(matterId) {
    const db = await this.init();
    if (!db) {
      return memoryStore.billing.filter(b => b.matterId === Number(matterId));
    }

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(["billing"], "readonly");
        const store = transaction.objectStore("billing");
        const index = store.index("matterId");
        const request = index.getAll(Number(matterId));

        request.onsuccess = (event) => resolve(event.target.result || []);
        request.onerror = () => resolve(memoryStore.billing.filter(b => b.matterId === Number(matterId)));
      } catch (e) {
        resolve(memoryStore.billing.filter(b => b.matterId === Number(matterId)));
      }
    });
  }
}
