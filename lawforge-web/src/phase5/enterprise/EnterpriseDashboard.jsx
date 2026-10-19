// src/phase5/enterprise/EnterpriseDashboard.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Briefcase, FileText, Search, UserCheck, Play, Square, Plus, DollarSign, Download, Clipboard, Trash2, CheckCircle, Clock, Scale, Home, ArrowLeft, Shield } from 'lucide-react';
import { useStore } from '../../store';
import { DocumentUploader } from '../../phase4/document-ai/DocumentUploader';
import { MattersDatabase } from './MattersDatabase';
import { InvoiceGenerator } from './InvoiceGenerator';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay }
});

function generateFallbackHash(fileHash) {
  if (fileHash) return fileHash;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'hash-' + String(Date.now());
}

export function EnterpriseDashboard() {
  const { situation, setSituation, setView, setIsEnterpriseMode, setIsAgentMode } = useStore();
  const textareaRef = useRef(null);

  // Matters state
  const [matters, setMatters] = useState([]);
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [newClient, setNewClient] = useState('');
  const [newCategory, setNewCategory] = useState('Contract');
  
  // Billing Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [billRate, setBillRate] = useState(250);
  const [billDesc, setBillDesc] = useState('Consultation');
  const [billingLogs, setBillingLogs] = useState([]);
  const [matterDocs, setMatterDocs] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const timerRef = useRef(null);

  const loadAllMatters = useCallback(async () => {
    try {
      const all = await MattersDatabase.getMatters();
      if (Array.isArray(all)) {
        setMatters(all);
        if (all.length > 0) {
          setSelectedMatter(prev => prev || all[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load matters", e);
    }
  }, []);

  const loadMatterRelations = useCallback(async (matterId) => {
    try {
      const logs = await MattersDatabase.getBillings(matterId);
      const docs = await MattersDatabase.getDocuments(matterId);
      setBillingLogs(Array.isArray(logs) ? logs : []);
      setMatterDocs(Array.isArray(docs) ? docs : []);
    } catch (e) {
      console.error("Failed to load relations", e);
    }
  }, []);

  // Load matters on mount
  useEffect(() => {
    let isSubscribed = true;
    MattersDatabase.getMatters().then(all => {
      if (isSubscribed && Array.isArray(all)) {
        setMatters(all);
        if (all.length > 0) {
          setSelectedMatter(all[0]);
        }
      }
    }).catch(err => console.error("Failed to load matters", err));

    return () => { isSubscribed = false; };
  }, []);

  // Reload selected matter relations when selectedMatter changes
  useEffect(() => {
    let isSubscribed = true;
    if (selectedMatter) {
      Promise.all([
        MattersDatabase.getBillings(selectedMatter.id),
        MattersDatabase.getDocuments(selectedMatter.id)
      ]).then(([logs, docs]) => {
        if (isSubscribed) {
          setBillingLogs(logs);
          setMatterDocs(docs);
        }
      }).catch(err => console.error("Failed to load relations", err));
    }
    return () => { isSubscribed = false; };
  }, [selectedMatter]);

  const handleAddMatter = async (e) => {
    e.preventDefault();
    if (!newClient.trim()) return;

    try {
      const newId = await MattersDatabase.addMatter(newClient, newCategory);
      setNewClient('');
      await loadAllMatters();
      
      // Auto-select the newly created matter
      const all = await MattersDatabase.getMatters();
      const match = all.find(m => m.id === newId);
      if (match) setSelectedMatter(match);
      
      showFeedback(`Created new matter for ${newClient}`);
    } catch (err) {
      console.error("Failed to add matter", err);
    }
  };

  const handleDeleteMatter = async (id) => {
    try {
      await MattersDatabase.deleteMatter(id);
      if (selectedMatter?.id === id) {
        setSelectedMatter(null);
      }
      await loadAllMatters();
      showFeedback("Matter deleted.");
    } catch (err) {
      console.error(err);
    }
  };

  // Timer logic
  const toggleTimer = () => {
    if (timerActive) {
      // Stopping
      clearInterval(timerRef.current);
      setTimerActive(false);
    } else {
      // Starting
      setTimerActive(true);
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
  };

  const saveTimerLog = async () => {
    if (timeElapsed === 0 || !selectedMatter) return;
    try {
      await MattersDatabase.addBilling(selectedMatter.id, timeElapsed, billRate, billDesc);
      setTimeElapsed(0);
      setBillDesc('Consultation');
      await loadMatterRelations(selectedMatter.id);
      showFeedback("Billing session saved to local database.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDocUploaded = async (res) => {
    if (!selectedMatter) {
      alert("Please select or create an active Matter in the sidebar first to attach documents.");
      return;
    }
    try {
      // Generate a mock hash for safety
      const docHash = generateFallbackHash(res.fileHash);
      await MattersDatabase.addDocument(selectedMatter.id, docHash, res.fileName);
      await loadMatterRelations(selectedMatter.id);
      showFeedback(`Attached "${res.fileName}" to matter.`);
      
      // Also update situation patterned context
      setSituation(prev => {
        const header = prev.trim() ? prev + "\n\n" : "";
        return header + `[MATTER CRM DEED: ${res.fileName}]\nContent excerpt:\n${res.text.substring(0, 200)}...\nRisks: ${res.toxicClauses?.length || 0}`;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportInvoice = async () => {
    if (!selectedMatter) return;
    try {
      await InvoiceGenerator.generateInvoice(selectedMatter, billingLogs);
      showFeedback("Invoice compiled and downloaded.");
    } catch (e) {
      console.error(e);
      alert("Invoice compile failed.");
    }
  };

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const formatStopwatch = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleIntakeStart = () => {
    if (!situation.trim()) return;
    setIsAgentMode(true);
    setView('response');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Enterprise Top Navigation Bar ── */}
      <nav className="glass-nav" style={{ padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(186,158,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div 
            onClick={() => setView('hero')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            title="Return to Home landing page"
          >
            <Scale size={20} style={{ color: 'var(--primary)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
              LAWFORGE <span style={{ color: 'var(--secondary)', fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', background: 'rgba(0,227,253,0.1)', borderRadius: '6px', border: '1px solid rgba(0,227,253,0.3)', verticalAlign: 'middle', marginLeft: '6px' }}>ENTERPRISE</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
            <span onClick={() => setView('hero')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'inherit'}>Home</span>
            <span>›</span>
            <span onClick={() => { setIsEnterpriseMode(false); setView('dashboard'); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'inherit'}>Vault</span>
            <span>›</span>
            <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Enterprise OS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => setView('hero')}
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.95rem', fontSize: '0.8rem', borderRadius: '10px' }}
          >
            <Home size={14} /> Home
          </button>
          <button 
            onClick={() => { setIsEnterpriseMode(false); setView('dashboard'); }}
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.95rem', fontSize: '0.8rem', borderRadius: '10px', color: 'var(--primary)', borderColor: 'rgba(186,158,255,0.3)' }}
          >
            <ArrowLeft size={14} /> Legal Vault
          </button>
          <LanguageSwitcher align="right" />
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', paddingTop: '2rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        
        {/* ── Enterprise Header ── */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="display-lg" style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
              Law Firm <span className="gradient-text">Operating System</span>
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Briefcase size={16} color="var(--primary)" /> Sovereign Enterprise Workspace Node
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <button 
              onClick={() => { setIsEnterpriseMode(false); setView('dashboard'); }}
              className="btn-glass"
              style={{ 
                padding: '0.4rem 0.85rem', 
                fontSize: '0.75rem', 
                border: '1px solid rgba(0,227,253,0.3)', 
                color: 'var(--secondary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ← Back to Standard
            </button>
            
            {selectedMatter && (
              <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: '0 0 0.15rem 0' }}>Session Billable</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace', margin: 0, color: timerActive ? '#ef4444' : '#fff' }}>
                  {formatStopwatch(timeElapsed)}
                </p>
              </div>
            )}
          </div>
        </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '0.6rem 1rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={14} />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Matter Focus Area */}
          {selectedMatter ? (
            <motion.div {...fadeUp(0.2)} className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(0,227,253,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(0,227,253,0.1)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Active Matter #{selectedMatter.id}
                  </span>
                  <h2 style={{ fontSize: '1.25rem', margin: '0.25rem 0 0 0', fontWeight: 600 }}>{selectedMatter.client} — {selectedMatter.category}</h2>
                </div>
                <button 
                  onClick={handleExportInvoice}
                  disabled={billingLogs.length === 0}
                  className="btn-glass"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' }}
                >
                  <Download size={14} /> Export Invoice PDF
                </button>
              </div>

              {/* CRM Relational Hub Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem' }}>
                
                {/* Billing and Stopwatch section */}
                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Clock size={12} color="var(--primary)" /> Billing & Timer Logger
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 700, color: timerActive ? '#ef4444' : '#fff' }}>
                        {formatStopwatch(timeElapsed)}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={toggleTimer}
                          className="btn-glass"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', background: timerActive ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)' }}
                        >
                          {timerActive ? <Square size={12} color="#ef4444" /> : <Play size={12} color="#10b981" />}
                          {timerActive ? 'Pause' : 'Start'}
                        </button>
                        
                        <button 
                          onClick={saveTimerLog}
                          disabled={timeElapsed === 0}
                          className="btn-glass"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}
                        >
                          <Plus size={12} /> Save Session
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.2rem' }}>Rate / Hour ($)</label>
                        <input 
                          type="number" 
                          value={billRate}
                          onChange={(e) => setBillRate(Number(e.target.value))}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.3rem', fontSize: '0.75rem', color: '#fff' }}
                        />
                      </div>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.2rem' }}>Session Description</label>
                        <input 
                          type="text" 
                          value={billDesc}
                          onChange={(e) => setBillDesc(e.target.value)}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.3rem', fontSize: '0.75rem', color: '#fff' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Logs List */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Saved Billing entries</div>
                    <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {billingLogs.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>No billing logs.</div>
                      ) : (
                        billingLogs.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', padding: '0.3rem', background: 'rgba(0,0,0,0.15)', borderRadius: '4px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.description} ({(item.durationSeconds / 3600).toFixed(2)}h)</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>${((item.durationSeconds / 3600) * item.ratePerHour).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents relational section */}
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <FileText size={12} color="var(--primary)" /> Matter Documents ({matterDocs.length})
                  </h3>
                  
                  <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {matterDocs.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>No documents attached yet. Use Document AI below.</div>
                    ) : (
                      matterDocs.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
                            <FileText size={10} color="var(--primary)" /> {doc.title}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--on-surface-variant)' }}>
                            <span>Hash: {doc.fileHash.slice(0, 15)}...</span>
                            <span>{new Date(doc.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
              Create or select a Case Matter in the sidebar to begin tracking.
            </div>
          )}

          {/* Intake Pattern Dictator */}
          <motion.div {...fadeUp(0.25)}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="var(--primary)" /> Client Interview Intake Pattern
            </h2>
            <div className="input-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <textarea
                ref={textareaRef}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Paste client details, oral statements, or fact patterns..."
                style={{ width: '100%', minHeight: '110px', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
              />
              <button 
                onClick={handleIntakeStart}
                disabled={!situation.trim()}
                className="btn-primary" 
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <Search size={16} /> Execute Adversarial AI Dossier
              </button>
            </div>
          </motion.div>

          {/* Document AI OCR Segment */}
          {selectedMatter && (
            <motion.div {...fadeUp(0.3)}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--primary)" /> Sovereign Document Analysis & Attachment
              </h2>
              <DocumentUploader onAnalysisComplete={handleDocUploaded} />
            </motion.div>
          )}

        </div>

        {/* Sidebar Column: Relational Matter Lists */}
        <motion.div {...fadeUp(0.35)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Create new case matter */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)' }}>
              New Case Matter
            </h3>
            <form onSubmit={handleAddMatter} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.2rem' }}>Client Name</label>
                <input 
                  type="text" 
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.2rem' }}>Case Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem', color: '#fff' }}
                >
                  <option value="Contract">Contract Review</option>
                  <option value="Property">Property Dispute</option>
                  <option value="Workplace">Employment / Labor</option>
                  <option value="Cyber">Cyber Liability</option>
                  <option value="Financial">Financial Fraud</option>
                  <option value="Criminal">Criminal defense</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={12} /> Create Local Case
              </button>
            </form>
          </div>

          {/* Active Matters directory index */}
          <div className="glass-card" style={{ padding: '1.25rem', flex: 1, minHeight: '220px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)' }}>
              <BookMarked size={14} color="var(--primary)" /> Case Records Directory ({matters.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {matters.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                  No case records found.
                </div>
              ) : (
                matters.map(m => {
                  const isActiveMatter = selectedMatter?.id === m.id;
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => setSelectedMatter(m)}
                      style={{ 
                        padding: '0.6rem 0.75rem', 
                        borderRadius: '6px', 
                        background: isActiveMatter ? 'rgba(0,227,253,0.08)' : 'rgba(255,255,255,0.01)', 
                        border: `1px solid ${isActiveMatter ? 'rgba(0,227,253,0.3)' : 'rgba(255,255,255,0.04)'}`, 
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0, color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.client}
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: '0.15rem 0 0 0' }}>
                          #{m.id} • {m.category}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMatter(m.id);
                        }}
                        className="btn-icon" 
                        title="Delete Matter"
                        style={{ padding: '0.2rem', color: 'var(--on-surface-variant)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = 'var(--on-surface-variant)'} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </motion.div>

      </div>
      
    </div>
  </div>
  );
}
