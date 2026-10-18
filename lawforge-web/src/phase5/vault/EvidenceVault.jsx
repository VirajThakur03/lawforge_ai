// src/phase5/vault/EvidenceVault.jsx
import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, UploadCloud, Copy, Terminal, Clock, Anchor, Download, FolderOpen, Key, AlertTriangle, FileCode, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { EvidenceHasher } from './EvidenceHasher';
import { TSAService } from './TSAService';
import { BlockchainNotary } from './BlockchainNotary';
import { BackupManager } from './BackupManager';
import { useStore } from '../../store';

export function EvidenceVault() {
  const [logs, setLogs] = useState([]);
  const [isHashing, setIsHashing] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // 'timestamp' | 'notarize' | 'backup' | 'restore'
  
  const fileRef = useRef(null);
  const backupImportRef = useRef(null);
  const { history } = useStore();

  // Load persistent logs from localStorage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('lf_evidence_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to parse evidence logs", e);
      }
    }
  }, []);

  const saveLogs = (newLogs) => {
    setLogs(newLogs);
    localStorage.setItem('lf_evidence_logs', JSON.stringify(newLogs));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsHashing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const hash = await EvidenceHasher.hashFile(file);
      const timestamp = new Date().toISOString();
      
      const uuid = crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now();

      const newLog = {
        id: uuid,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        hash,
        timestamp,
        tsaReceipt: null,
        l2Receipt: null
      };

      saveLogs([newLog, ...logs]);
      setSuccessMsg(`Successfully calculated SHA-256 fingerprint for ${file.name}`);
    } catch (err) {
      console.error("Hashing failed", err);
      setErrorMsg("Failed to compute hash fingerprint.");
    } finally {
      setIsHashing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const triggerTimestamp = async (logId) => {
    const log = logs.find(l => l.id === logId);
    if (!log || log.tsaReceipt) return;

    setLoadingAction(`tsa-${logId}`);
    try {
      const receipt = await TSAService.requestTimestamp(log.hash);
      const updated = logs.map(l => {
        if (l.id === logId) return { ...l, tsaReceipt: receipt };
        return l;
      });
      saveLogs(updated);
      setSuccessMsg(`RFC-3161 Certified Timestamp obtained for ${log.name}`);
    } catch {
      setErrorMsg("Failed to request timestamp certificate.");
    } finally {
      setLoadingAction(null);
    }
  };

  const triggerNotarization = async (logId) => {
    const log = logs.find(l => l.id === logId);
    if (!log || log.l2Receipt) return;

    setLoadingAction(`l2-${logId}`);
    try {
      const receipt = await BlockchainNotary.anchorHash(log.hash, log.name);
      const updated = logs.map(l => {
        if (l.id === logId) return { ...l, l2Receipt: receipt };
        return l;
      });
      saveLogs(updated);
      setSuccessMsg(`Anchored ${log.name} to Layer 2 Ledger gaslessly.`);
    } catch {
      setErrorMsg("Failed to anchor on-chain proof.");
    } finally {
      setLoadingAction(null);
    }
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setSuccessMsg("Copied to clipboard!");
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleExportProofJSON = (log) => {
    const proofManifest = {
      "@context": "https://w3id.org/security/v2",
      type: "LawForgeEvidenceProof",
      version: "2.0.0",
      generatedAt: new Date().toISOString(),
      evidence: {
        id: log.id,
        name: log.name,
        size: log.size,
        recordedTimestamp: log.timestamp,
        sha256Digest: log.hash,
        hashAlgorithm: "SHA-256",
        cryptographicStandard: "FIPS PUB 180-4"
      },
      notarization: {
        rfc3161TSA: log.tsaReceipt ? {
          status: "CERTIFIED",
          authority: log.tsaReceipt.authority,
          serialNumber: log.tsaReceipt.serialNumber,
          timestamp: log.tsaReceipt.timestamp
        } : "LOCAL_AIR_GAPPED_VERIFICATION",
        l2LedgerAnchor: log.l2Receipt ? {
          status: "ANCHORED",
          network: log.l2Receipt.network || "Ethereum Sepolia / Arbitrum L2",
          blockNumber: log.l2Receipt.blockNumber,
          txHash: log.l2Receipt.txHash
        } : "NOT_ANCHORED"
      },
      verification: {
        command: `sha256sum "${log.name}"`,
        expectedHash: log.hash
      }
    };

    const blob = new Blob([JSON.stringify(proofManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${log.name.replace(/[^a-zA-Z0-9._-]/g, '_')}.proof.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMsg(`Verifiable proof manifest downloaded for ${log.name}`);
  };

  const handleExportPDFDossier = (log) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("LAWFORGE AI — EVIDENCE INTEGRITY CERTIFICATE", 14, 20);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Sovereign Cryptographic Chain of Custody (RFC-3161 / FIPS 180-4)", 14, 27);
      doc.setDrawColor(186, 158, 255);
      doc.line(14, 30, 196, 30);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. EVIDENCE RECORD DETAILS", 14, 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`File Name: ${log.name}`, 14, 48);
      doc.text(`File Size: ${log.size}`, 14, 55);
      doc.text(`Local Registration Time: ${new Date(log.timestamp).toUTCString()}`, 14, 62);
      doc.text(`Evidence UUID: ${log.id}`, 14, 69);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. CRYPTOGRAPHIC FINGERPRINT (SHA-256)", 14, 82);
      doc.setFont("courier", "bold");
      doc.setFontSize(8);
      doc.text(log.hash, 14, 90);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("3. NOTARIZATION & TRUST ATTESTATIONS", 14, 104);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (log.tsaReceipt) {
        doc.text(`RFC-3161 Authority: ${log.tsaReceipt.authority}`, 14, 112);
        doc.text(`Certificate Serial: ${log.tsaReceipt.serialNumber}`, 14, 119);
      } else {
        doc.text("RFC-3161 Status: Local Zero-Trust Cryptographic Fingerprint generated on-device", 14, 112);
      }

      if (log.l2Receipt) {
        doc.text(`L2 Ledger Block: ${log.l2Receipt.blockNumber}`, 14, 130);
        doc.text(`Transaction Hash: ${log.l2Receipt.txHash}`, 14, 137);
      } else {
        doc.text("L2 Decentralized Anchor: Ready for gasless anchoring", 14, 130);
      }

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Generated by LAWFORGE AI Sovereign Terminal. Tamper-evident verification guaranteed via mathematical hash equality.", 14, 160);

      doc.save(`${log.name.replace(/[^a-zA-Z0-9._-]/g, '_')}_Certificate.pdf`);
      setSuccessMsg(`Evidence integrity certificate PDF generated for ${log.name}`);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to generate PDF certificate.");
    }
  };

  const handleExportBackup = async () => {
    if (!password) {
      setErrorMsg("Please enter a password to encrypt your backup.");
      return;
    }
    setLoadingAction('export');
    setErrorMsg('');
    try {
      const backupData = {
        evidence_logs: logs,
        history_items: history,
        versionDate: new Date().toISOString()
      };
      
      const encryptedBlob = await BackupManager.encryptBackup(backupData, password);
      
      // Trigger download
      const url = URL.createObjectURL(encryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lawforge-backup-${new Date().toISOString().slice(0,10)}.lawforge`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMsg("AES-GCM secured backup archive downloaded successfully.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to create secure backup.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!password) {
      setErrorMsg("Please enter the decryption password first.");
      if (backupImportRef.current) backupImportRef.current.value = '';
      return;
    }

    setLoadingAction('import');
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const restored = await BackupManager.decryptBackup(reader.result, password);
          
          if (restored.evidence_logs) {
            saveLogs(restored.evidence_logs);
          }
          if (restored.history_items) {
             // Sync back to Zustand history if needed, or update localStorage directly
             localStorage.setItem('lf_history', JSON.stringify(restored.history_items));
             // Refresh page or update local state
             useStore.setState({ history: restored.history_items });
          }
          
          setSuccessMsg("Sovereign backup restored successfully. Workspace updated!");
        } catch (err) {
          setErrorMsg(err.message || "Decryption failed. Check password.");
        } finally {
          setLoadingAction(null);
          if (backupImportRef.current) backupImportRef.current.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    } catch {
      setErrorMsg("Failed to read file.");
      setLoadingAction(null);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '1.5rem', border: '1px solid rgba(16,185,129,0.3)', position: 'relative' }}>
      
      {/* Title block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
          <ShieldCheck size={24} color="#10b981" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Zero-Trust Evidence Vault</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', margin: '0.2rem 0 0 0' }}>
            Local SHA-256 fingerprinting, RFC-3161 notarization, and AES-GCM secure workspace backups.
          </p>
        </div>
        <span className="badge" style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem' }}>
          Air-Gapped & Active
        </span>
      </div>

      {/* Message alerts */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={14} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', fontSize: '0.8rem', marginBottom: '1rem' }}>
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Drag-drop box */}
      <div 
        onClick={() => fileRef.current?.click()}
        style={{ 
          border: '2px dashed rgba(16,185,129,0.3)', 
          borderRadius: '12px', 
          padding: '1.75rem', 
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(16,185,129,0.02)',
          transition: 'all 0.2s ease',
          marginBottom: '1.5rem'
        }}
      >
        <input type="file" ref={fileRef} onChange={handleFileChange} style={{ display: 'none' }} />
        {isHashing ? (
          <div className="spin" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
            <Terminal size={32} color="#10b981" />
          </div>
        ) : (
          <UploadCloud size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
        )}
        <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
          {isHashing ? 'Computing cryptographic hash signature...' : 'Select document file to secure in local Vault'}
        </p>
        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Hash calculated client-side. File content never leaves browser.</span>
      </div>

      {/* Workspace Encryption & Backup Manager */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 style={{ fontSize: '0.8rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Key size={14} color="var(--primary)" />
          Encrypted Workspace Backup Manager
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="password" 
            placeholder="Enter AES encryption password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              flex: 1, minWidth: '180px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#fff'
            }}
          />
          <button 
            onClick={handleExportBackup} 
            disabled={loadingAction === 'export'}
            className="btn-glass"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Download size={14} />
            Export Backup (.lawforge)
          </button>
          
          <label 
            className="btn-glass" 
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            <FolderOpen size={14} />
            Import Backup
            <input 
              type="file" 
              ref={backupImportRef} 
              onChange={handleImportBackup} 
              accept=".lawforge" 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      {/* Receipts listing */}
      {logs.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '0.75rem', marginTop: 0 }}>
            Hashed Evidence Records ({logs.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{log.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: '0.2rem 0 0 0' }}>
                      {new Date(log.timestamp).toLocaleString()} • {log.size}
                    </p>
                  </div>
                  <button onClick={() => copyText(log.hash)} className="btn-glass" title="Copy SHA-256" style={{ padding: '0.3rem', borderRadius: '4px' }}>
                    <Copy size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>SHA-256</span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#10b981', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', flex: 1 }}>{log.hash}</span>
                </div>

                {/* Notarization Panel */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  {/* Timestamp Receipt */}
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    {log.tsaReceipt ? (
                      <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.15rem' }}>
                          <Clock size={12} /> Certified Timestamp
                        </div>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                          Serial: {log.tsaReceipt.serialNumber}<br />
                          TSA: {log.tsaReceipt.authority}
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => triggerTimestamp(log.id)}
                        disabled={loadingAction === `tsa-${log.id}`}
                        className="btn-glass"
                        style={{ width: '100%', fontSize: '0.7rem', padding: '0.35rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', borderColor: 'rgba(59,130,246,0.3)' }}
                      >
                        <Clock size={12} color="#3b82f6" />
                        {loadingAction === `tsa-${log.id}` ? 'Signing...' : 'Request RFC-3161 TSA'}
                      </button>
                    )}
                  </div>

                  {/* Blockchain L2 Anchor */}
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    {log.l2Receipt ? (
                      <div style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#a78bfa', fontWeight: 600, marginBottom: '0.15rem' }}>
                          <Anchor size={12} /> Anchored Proof
                        </div>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Block: {log.l2Receipt.blockNumber}<br />
                          Tx: <span style={{ color: '#a78bfa', cursor: 'pointer' }} onClick={() => copyText(log.l2Receipt.txHash)}>{log.l2Receipt.txHash.slice(0, 14)}...</span>
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => triggerNotarization(log.id)}
                        disabled={loadingAction === `l2-${log.id}`}
                        className="btn-glass"
                        style={{ width: '100%', fontSize: '0.7rem', padding: '0.35rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', borderColor: 'rgba(167,139,250,0.3)' }}
                      >
                        <Anchor size={12} color="#a78bfa" />
                        {loadingAction === `l2-${log.id}` ? 'Anchoring...' : 'Register L2 Anchor'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Proof & PDF Export Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                  <button 
                    onClick={() => handleExportProofJSON(log)}
                    className="btn-glass"
                    style={{ flex: 1, fontSize: '0.7rem', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
                    title="Download RFC-3161 JSON Cryptographic Manifest"
                  >
                    <FileCode size={12} /> Export Proof (.proof.json)
                  </button>
                  <button 
                    onClick={() => handleExportPDFDossier(log)}
                    className="btn-glass"
                    style={{ flex: 1, fontSize: '0.7rem', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: 'var(--primary)', borderColor: 'rgba(186,158,255,0.3)' }}
                    title="Generate PDF Certificate of Cryptographic Custody"
                  >
                    <FileCheck size={12} /> PDF Chain of Custody
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
