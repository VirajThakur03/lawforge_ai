// src/config/feature-flags.js

const DEFAULT_FLAGS = {
  enableDocumentAI: true,   // Allow PDF Drag and Drop testing
  enableVoiceAgent: true,   // Allow voice input
  enableBriefcase: true,    // Generate PDF dossier
  enableMiniRAG: true,      // Historical precedent retrieval
  enablePWA: true,          // Experimental offline PWA support
  enableCryptoVault: true,  // Phase 5: Blockchain Evidence Vault
  enableOfflineRAG: true,   // Phase 5: Fully Local Document RAG via Transformers
  enableEnterpriseMode: true, // Phase 5: Enterprise Whitelabel Switch
  enableAdversarialSimulator: true, // Phase 6: Opposing Counsel Simulator
  enablePanicMode: true, // Phase 6: P2P Panic Witness Streaming
  enableGeoIntelligence: true, // Phase 6: Hyper-Local Geo Intelligence
  enableRedlineAnalysis: true, // Phase 6: Red-Line Visual Contract Analyzer
  enableSmartSettlement: true // Phase 6: Smart Settlement QR Escrow
};

export const loadFlags = () => {
  try {
    const stored = localStorage.getItem('LAWFORGE_FEATURE_FLAGS');
    if (stored) {
      return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn("Failed to load feature flags from localStorage", e);
  }
  return DEFAULT_FLAGS;
};

export const saveFlags = (flags) => {
  try {
    localStorage.setItem('LAWFORGE_FEATURE_FLAGS', JSON.stringify(flags));
  } catch (e) {
    console.error("Failed to save feature flags", e);
  }
};

export const isFeatureEnabled = (flagName) => {
  const flags = loadFlags();
  return !!flags[flagName];
};
