// src/phase4/document-ai/DocumentUploader.jsx
import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { DocumentAnalyzer } from './DocumentAnalyzer';
import { AIEngine } from '../../engine/AIEngine';
import { LocalRAGEngine } from '../../phase5/offline-rag/LocalRAGEngine';
import { isFeatureEnabled } from '../../config/feature-flags';
import { useStore } from '../../store';

export function DocumentUploader({ onAnalysisComplete, i18nLanguage }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ragProgress, setRagProgress] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      alert('Only PDF files are supported currently.');
      return;
    }
    setFile(selectedFile);
    await performAnalysis(selectedFile);
  };

  const performAnalysis = async (docFile) => {
    setAnalyzing(true);
    setRagProgress(null);
    try {
      // 1. Extract text using standard PDF parser
      let extractedText = await DocumentAnalyzer.extractText(docFile);
      
      // If the extracted text is empty/extremely short, trigger background Web Worker OCR
      if (!extractedText || extractedText.trim().length < 50) {
        setRagProgress("Scanned PDF detected. Initiating background OCR worker...");
        extractedText = await new Promise((resolve, reject) => {
          try {
            const ocrWorker = new Worker('/workers/OCRWorker.js');
            ocrWorker.onmessage = (e) => {
              const { type, progress, status, text, error } = e.data;
              if (type === 'progress') {
                setRagProgress(`OCR Processing: ${Math.round(progress * 100)}% - ${status}`);
              } else if (type === 'success') {
                ocrWorker.terminate();
                resolve(text);
              } else if (type === 'error') {
                ocrWorker.terminate();
                reject(new Error(error));
              }
            };
            ocrWorker.postMessage({ type: 'ocr_scan', fileBlob: docFile });
          } catch (err) {
            reject(err);
          }
        });
      }
      
      // 2. Start offline embedding if Phase 5 enabled
      if (isFeatureEnabled('enableOfflineRAG')) {
        LocalRAGEngine.embedDocument(extractedText, (prog) => {
           setRagProgress(`Local indexing chunk ${prog.current}/${prog.total}`);
        }).catch(err => console.error("RAG Embedding Error:", err));
      }

      // Check current pipeline mode to see if we should run local or online analysis
      const { pipelineMode } = useStore.getState();
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
      const isOffline = pipelineMode === 'OFFLINE_LOCAL' || !apiKey || !navigator.onLine;

      let finalResult;

      if (isOffline) {
        setRagProgress("Running local sovereign document scanner...");
        await new Promise(resolve => setTimeout(resolve, 800)); // smooth progress visualization
        const localAnalysis = DocumentAnalyzer.runLocalAnalysis(extractedText);
        finalResult = {
          fileName: docFile.name,
          file: docFile,
          text: extractedText,
          ...localAnalysis
        };
      } else {
        // 3. Build prompt & Online fallback
        const prompt = await DocumentAnalyzer.analyze(extractedText, i18nLanguage);
        const rawResponse = await AIEngine.runOnlineGeneration(prompt, i18nLanguage);
        
        // Parse JSON from response
        let analysisResult = { tldr: [], toxicClauses: [] };
        try {
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]);
          }
        } catch(e) {
          console.error("Failed to parse doc analysis", e);
        }

        // Map text fields to quote fields for Redline highlighter compat
        const normalizedToxicClauses = (analysisResult.toxicClauses || []).map(tc => ({
          type: tc.type || "Critical Provision",
          quote: tc.text || tc.quote || "",
          severity: tc.severity || "HIGH",
          explanation: tc.explanation || "",
          fix: tc.fix || ""
        }));
        
        finalResult = {
          fileName: docFile.name,
          file: docFile,
          text: extractedText,
          tldr: analysisResult.tldr || [],
          toxicClauses: normalizedToxicClauses
        };
      }

      onAnalysisComplete(finalResult);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze document.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div 
      className={`glass-card p-6 rounded-2xl border-2 transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5'}`}
      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      style={{ textAlign: 'center', cursor: 'pointer' }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} style={{ display: 'none' }} />
      
      {!file && !analyzing && (
        <div style={{ padding: '2rem' }}>
          <UploadCloud size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Drag & Drop Legal Document</h3>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Supports PDFs up to 5MB. We'll automatically scan for toxic clauses.</p>
        </div>
      )}

      {file && analyzing && (
        <div style={{ padding: '2rem' }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Analyzing "{file.name}"...</h3>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Extracting clauses and building summary...</p>
          {ragProgress && <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem', fontFamily: 'monospace' }}>{ragProgress}</p>}
        </div>
      )}
    </div>
  );
}
