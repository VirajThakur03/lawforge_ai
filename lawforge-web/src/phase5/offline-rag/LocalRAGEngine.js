// src/phase5/offline-rag/LocalRAGEngine.js
import { isFeatureEnabled } from '../../config/feature-flags';

class LocalRAGEngineService {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.callbacks = {}; // Maps message types to promises
  }

  init() {
    if (!isFeatureEnabled('enableOfflineRAG')) return;
    if (this.worker) return;

    // Use Vite's worker syntax
    this.worker = new Worker(new URL('./ragWorker.js', import.meta.url), { type: 'module' });

    this.worker.addEventListener('message', (event) => {
      const { type, payload } = event.data;
      
      if (type === 'progress') {
        // e.g. payload: { status: 'downloading', name: '...', progress: 45 }
        if (this.callbacks['onProgress']) this.callbacks['onProgress'](payload);
      }
      else if (type === 'ready') {
        this.isReady = true;
        if (this.callbacks['ready']) this.callbacks['ready'](payload);
      }
      else if (type === 'indexing_progress') {
        if (this.callbacks['onIndexingProgress']) this.callbacks['onIndexingProgress'](payload);
      }
      else if (type === 'indexing_complete') {
        if (this.callbacks['indexing_complete']) this.callbacks['indexing_complete'](payload);
      }
      else if (type === 'query_complete') {
        if (this.callbacks['query_complete']) this.callbacks['query_complete'](payload);
      }
      else if (type === 'error' || type === 'query_error') {
        console.error("Local RAG Error:", payload);
        if (this.callbacks['error']) this.callbacks['error'](payload);
      }
    });

    // Start loading models ASAP
    this.worker.postMessage({ type: 'load' });
  }

  async embedDocument(text, onProgress) {
    if (!this.worker) this.init();
    
    return new Promise((resolve, reject) => {
      this.callbacks['onIndexingProgress'] = onProgress;
      this.callbacks['indexing_complete'] = () => resolve();
      this.callbacks['error'] = (err) => reject(err);
      
      this.worker.postMessage({ type: 'embed_document', payload: { text } });
    });
  }

  async queryDocument(query) {
    if (!this.worker) throw new Error("RAG Worker not initialized.");

    return new Promise((resolve, reject) => {
      this.callbacks['query_complete'] = (results) => resolve(results);
      this.callbacks['error'] = (err) => reject(err);
      this.worker.postMessage({ type: 'query', payload: { query } });
    });
  }

  onModelDownLoadProgress(callback) {
    this.callbacks['onProgress'] = callback;
  }
}

export const LocalRAGEngine = new LocalRAGEngineService();
