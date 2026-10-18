// src/phase5/offline-rag/ragWorker.js
import { pipeline, env } from '@xenova/transformers';

// Skip local model checks and use remote Hub since we don't pack the ONNX model locally due to size
env.allowLocalModels = false;

class RAGPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// Similarity math (Cosine)
function cosineSimilarity(A, B) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// State
let documentChunks = [];
let documentEmbeddings = [];

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  try {
    if (type === 'load') {
      // Pre-load the model
      await RAGPipeline.getInstance((progress) => {
        self.postMessage({ type: 'progress', payload: progress });
      });
      self.postMessage({ type: 'ready' });
    } 
    
    else if (type === 'embed_document') {
      const { text } = payload;
      // Simple chunking strategy (by sentence/paragraph, max ~200 chars)
      const rawChunks = text.split('\n').map(c => c.trim()).filter(c => c.length > 20);
      
      const extractor = await RAGPipeline.getInstance();
      documentChunks = rawChunks;
      documentEmbeddings = [];

      self.postMessage({ type: 'indexing_start', payload: { total: rawChunks.length } });

      for (let i = 0; i < rawChunks.length; i++) {
        const output = await extractor(rawChunks[i], { pooling: 'mean', normalize: true });
        documentEmbeddings.push(Array.from(output.data));
        self.postMessage({ type: 'indexing_progress', payload: { current: i + 1, total: rawChunks.length } });
      }

      self.postMessage({ type: 'indexing_complete' });
    } 
    
    else if (type === 'query') {
      const { query } = payload;
      if (documentEmbeddings.length === 0) {
        self.postMessage({ type: 'query_error', payload: "No document indexed." });
        return;
      }

      const extractor = await RAGPipeline.getInstance();
      const queryOutput = await extractor(query, { pooling: 'mean', normalize: true });
      const queryVector = Array.from(queryOutput.data);

      // Score all chunks
      const results = documentChunks.map((chunk, idx) => ({
        text: chunk,
        score: cosineSimilarity(queryVector, documentEmbeddings[idx])
      }));

      // Sort by score
      results.sort((a, b) => b.score - a.score);

      // Return top 3 most relevant chunks
      self.postMessage({ type: 'query_complete', payload: results.slice(0, 3) });
    }
  } catch (err) {
    self.postMessage({ type: 'error', payload: err.message });
  }
});
