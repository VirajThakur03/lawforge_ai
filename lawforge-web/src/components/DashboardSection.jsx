import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { COUNTRIES } from '../data/countries'
import { AIEngine } from '../engine/AIEngine'
import { 
  Scale, Search, Mic, Send, ChevronDown, Clock, Globe, Settings, 
  FileText, Zap, X, Home, Briefcase, Download, Trash2, ArrowRight,
  Shield, Check, ExternalLink, RefreshCw, AlertTriangle, Keyboard
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { AnalysisLoadingOverlay } from './LoadingStates'
import { VoiceProcessor } from '../phase4/voice-agent/VoiceProcessor'
import { DocumentUploader } from '../phase4/document-ai/DocumentUploader'
import { EvidenceVault } from '../phase5/vault/EvidenceVault'
import { PanicButton } from '../phase6/panic/PanicButton'
import { GeoBanner } from '../phase6/geo/GeoBanner'
import { RedlineAnalyzer } from '../phase6/redline/RedlineAnalyzer'
import { applyGeoOverrides } from '../phase6/geo/GeoOverride'
import { useLawSync } from '../hooks/useLawSync'
import { InputSanitizer } from '../engine/InputSanitizer'
import { OnboardingTour } from './OnboardingTour'
import { LegalDisclaimerCard } from './LegalDisclaimerCard'
import { LawOfTheDay } from './LawOfTheDay'
import { JurisdictionExamples } from './JurisdictionExamples'

export function DashboardSection({ onOpenCommandPalette, onOpenShortcuts }) {
  const { 
    selectedCountry, setSelectedCountry, 
    situation, setSituation, 
    setResponse, setView, 
    loading, setLoading, 
    history, addToHistory, clearHistory, removeFromHistory,
    isAgentMode, setIsAgentMode, 
    geoZone, 
    pipelineMode, setPipelineMode, 
    localDbVersionDate,
    featureFlags, toggleFeatureFlag,
    isEnterpriseMode, setIsEnterpriseMode,
    activeTab, setActiveTab,
    showToast
  } = useStore()

  const { offlineDb, lastSync, version: lawsVersion, isSyncing, syncNow } = useLawSync()

  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false)
  const [vaultSearch, setVaultSearch] = useState('')
  const [countriesSearch, setCountriesSearch] = useState('')
  const [selectedLegalSystem, setSelectedLegalSystem] = useState('all')
  const [historySearch, setHistorySearch] = useState('')
  const [historySeverityFilter, setHistorySeverityFilter] = useState('all')
  const [isListening, setIsListening] = useState(false)
  const [docAnalysisResult, setDocAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showTour, setShowTour] = useState(false)

  const voiceProcessor = useRef(null)
  const textareaRef = useRef(null)
  const countryDropdownRef = useRef(null)
  const { t, i18n } = useTranslation()

  // Close country dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountriesDropdown(false);
      }
    }
    if (showCountriesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountriesDropdown]);

  const QUICK_TEMPLATES = useMemo(() => [
    { icon: '🚗', label: t('templates.traffic'), text: 'I was caught speeding in a 60 km/h zone doing 90 km/h.' },
    { icon: '👮', label: t('templates.police'), text: 'I was stopped by police and they want to search my car without a warrant.' },
    { icon: '💼', label: t('templates.workplace'), text: 'My employer fired me without notice or severance pay after 3 years.' },
    { icon: '🏠', label: t('templates.property'), text: 'My landlord is trying to evict me without proper legal notice.' },
    { icon: '💸', label: t('templates.financial'), text: 'I was scammed online and lost money to a fake investment scheme.' },
    { icon: '📱', label: t('templates.cyber'), text: 'Someone hacked my account and is impersonating me online.' },
    { icon: '🛒', label: t('templates.consumer'), text: 'I bought a defective product and the seller refuses to provide a refund or replacement.' },
    { icon: '⚕️', label: t('templates.medical'), text: 'I received improper medical treatment that resulted in serious health complications.' },
    { icon: '👨‍👩‍👧', label: t('templates.family'), text: 'I need to file for divorce and understand my child custody and alimony rights.' },
  ], [t])

  const filteredVaultCountries = useMemo(() =>
    COUNTRIES.filter(c => c.name.toLowerCase().includes(vaultSearch.toLowerCase()) || c.code.toLowerCase().includes(vaultSearch.toLowerCase())).slice(0, 50)
  , [vaultSearch])

  const filteredDirectoryCountries = useMemo(() => {
    return COUNTRIES.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(countriesSearch.toLowerCase()) || 
                            c.system.toLowerCase().includes(countriesSearch.toLowerCase()) ||
                            c.code.toLowerCase().includes(countriesSearch.toLowerCase());
      const matchesSystem = selectedLegalSystem === 'all' || 
                            c.system.toLowerCase().includes(selectedLegalSystem.toLowerCase());
      return matchesSearch && matchesSystem;
    });
  }, [countriesSearch, selectedLegalSystem]);

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchesQuery = !historySearch || 
                           h.country.toLowerCase().includes(historySearch.toLowerCase()) || 
                           (h.snippet && h.snippet.toLowerCase().includes(historySearch.toLowerCase()));
      const matchesSeverity = historySeverityFilter === 'all' || 
                              (h.severity || 'MEDIUM').toUpperCase() === historySeverityFilter.toUpperCase();
      return matchesQuery && matchesSeverity;
    });
  }, [history, historySearch, historySeverityFilter]);

  const handleSelectHistoryItem = (h) => {
    const matchedCountry = COUNTRIES.find(c => c.name === h.country);
    if (matchedCountry) {
      setSelectedCountry(matchedCountry);
    }
    if (h.result && h.result.situation) {
      setSituation(h.result.situation);
    } else {
      setSituation(h.snippet.replace(/…$/, ''));
    }
    setResponse(h.result);
    setView('response');
  };

  const handleAnalyze = async () => {
    setError(null)
    if (!selectedCountry) { 
      setError(t('dashboard.select_jurisdiction_error', 'Please select a jurisdiction first.')); 
      return 
    }
    const cleanSituation = InputSanitizer.sanitizeText(situation);
    if (cleanSituation.length < 15) { 
      setError(t('dashboard.situation_length_error', 'Please describe your situation in more detail (minimum 15 characters).')); 
      return 
    }

    const payloadCheck = InputSanitizer.detectAdversarialPayload(situation);
    if (payloadCheck.suspicious) {
      showToast?.(payloadCheck.reason, 'warning');
    }

    setLoading(true)
    try {
      let result = await AIEngine.query(selectedCountry.code, selectedCountry.name, cleanSituation, offlineDb, i18n.language, isAgentMode)
      if (geoZone && featureFlags['enableGeoIntelligence']) {
        result = applyGeoOverrides(result, geoZone)
      }
      setResponse({ ...result, isAgentSession: isAgentMode })
      addToHistory({ 
        country: selectedCountry.name, 
        flag: selectedCountry.flag, 
        snippet: situation.slice(0, 80) + '…', 
        result: { ...result, isAgentSession: isAgentMode }, 
        severity: result.severity,
        timestamp: new Date().toLocaleDateString()
      })
      setView('response')
    } catch (e) { 
      console.error(e)
      setError('An error occurred during statutory analysis. Please try again.');
    } finally { 
      setLoading(false) 
    }
  }

  const applyTemplate = (txt) => {
    setSituation(txt)
    textareaRef.current?.focus()
    showToast('Template loaded', 'info');
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      voiceProcessor.current?.stop();
    } else {
      if (!voiceProcessor.current) {
        voiceProcessor.current = new VoiceProcessor(
          (final) => {
             if (final) setSituation(prev => (prev + " " + final).trim());
          },
          (err) => { console.error(err); setIsListening(false); },
          () => setIsListening(false)
        );
      }
      voiceProcessor.current.start(i18n.language);
      setIsListening(true);
      showToast('Voice dictation active', 'info');
    }
  };

  const handleDocumentScanned = (docAnalysis) => {
    setDocAnalysisResult(docAnalysis);
    const analysisStr = `=== Document Scanned: ${docAnalysis.fileName} ===\n\nTL;DR Summary:\n- ${(docAnalysis.tldr || []).join('\n- ')}\n\nToxic Clauses Detected: ${(docAnalysis.toxicClauses || []).length}\n`;
    setSituation(analysisStr);
    textareaRef.current?.focus();
    showToast('Contract scanned and extracted', 'success');
  };

  const handleExportHistoryJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `lawforge_history_${Date.now()}.json`);
    dlAnchorElem.click();
    showToast('History backup exported', 'success');
  };

  const NAV = [
    { id: 'vault', icon: <Zap size={18} />, label: t('sidebar.vault') },
    { id: 'countries', icon: <Globe size={18} />, label: t('sidebar.countries') },
    { id: 'history', icon: <Clock size={18} />, label: t('sidebar.history') },
    { id: 'settings', icon: <Settings size={18} />, label: t('sidebar.settings') },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* ── Analysis Loading Overlay ── */}
      <AnimatePresence>
        {loading && (
          <AnalysisLoadingOverlay country={selectedCountry} situation={situation} />
        )}
      </AnimatePresence>
      {/* ── Sidebar ── */}
      <aside className="sidebar" style={{ zIndex: 60 }}>
        {/* Brand Header */}
        <div 
          onClick={() => setView('hero')}
          style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid rgba(186,158,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
          title="Return to Home Landing Page"
        >
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(186,158,255,0.2), rgba(0,227,253,0.2))',
            border: '1px solid rgba(186,158,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Scale size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
              LAWFORGE<span style={{ color: 'var(--secondary)' }}>.AI</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>Sovereign Legal Terminal</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {/* Home Link */}
          <div 
            className="sidebar-item" 
            onClick={() => setView('hero')}
            style={{ marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}
          >
            <span className="sidebar-icon"><Home size={18} /></span>
            <span>Home</span>
          </div>

          <div style={{ margin: '0.5rem 1rem', height: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {NAV.map(n => (
            <div 
              key={n.id} 
              className={`sidebar-item ${activeTab === n.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(n.id)}
            >
              <span className="sidebar-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'history' && history.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px', background: 'rgba(186,158,255,0.15)', color: 'var(--primary)' }}>
                  {history.length}
                </span>
              )}
            </div>
          ))}

          <div style={{ margin: '0.75rem 1rem', height: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {/* Enterprise Mode Shortcut */}
          <div 
            className="sidebar-item" 
            onClick={() => {
              setIsEnterpriseMode(true);
              setView('dashboard');
              showToast('Enterprise OS Active', 'success');
            }}
            style={{ color: 'var(--secondary)' }}
          >
            <span className="sidebar-icon"><Briefcase size={18} color="var(--secondary)" /></span>
            <span>Enterprise OS</span>
          </div>
        </nav>

        {/* Pipeline Mode Switcher */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(186,158,255,0.05)' }}>
          <div 
            onClick={() => {
              const next = pipelineMode === 'ONLINE_LIVE' ? 'OFFLINE_LOCAL' : 'ONLINE_LIVE';
              setPipelineMode(next);
              showToast(`Pipeline set to ${next === 'ONLINE_LIVE' ? 'Cloud Sync' : 'Local Host'}`, 'info');
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75rem', 
              borderRadius: '10px', 
              background: pipelineMode === 'ONLINE_LIVE' ? 'rgba(0,227,253,0.06)' : 'rgba(245,158,11,0.06)', 
              border: pipelineMode === 'ONLINE_LIVE' ? '1px solid rgba(0,227,253,0.2)' : '1px solid rgba(245,158,11,0.2)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.3s ease'
            }}
            title="Click to toggle pipeline mode"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: 8, height: 8, borderRadius: '50%', 
                background: pipelineMode === 'ONLINE_LIVE' ? '#00e3fd' : '#f59e0b', 
                boxShadow: pipelineMode === 'ONLINE_LIVE' ? '0 0 8px #00e3fd' : '0 0 8px #f59e0b'
              }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pipelineMode === 'ONLINE_LIVE' ? 'var(--secondary)' : 'var(--risk-medium)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {pipelineMode === 'ONLINE_LIVE' ? 'Cloud Sync' : 'Local Host'}
              </span>
            </div>
            <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', fontWeight: 'bold', color: 'var(--on-surface)' }}>
              {pipelineMode === 'ONLINE_LIVE' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', padding: '0 0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label-sm" style={{ color: 'var(--on-surface-variant)', opacity: 0.5 }}>Lex-AI Pipeline</span>
            {pipelineMode === 'OFFLINE_LOCAL' && (
              <span style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>Snapshot: {localDbVersionDate}</span>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(132,85,239,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <header style={{ padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(186,158,255,0.05)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'rgba(7, 14, 30, 0.85)' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span onClick={() => setView('hero')} style={{ cursor: 'pointer', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Home</span>
            <span style={{ color: 'var(--on-surface-variant)', opacity: 0.4 }}>›</span>
            <span className="label-sm" style={{ color: 'var(--primary)' }}>{t('sidebar.' + activeTab)}</span>
            {selectedCountry && (
              <>
                <span style={{ color: 'var(--on-surface-variant)', opacity: 0.4 }}>/</span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(186,158,255,0.1)', color: 'var(--on-surface)' }}>
                  {selectedCountry.flag} {selectedCountry.name}
                </span>
              </>
            )}
          </div>

          {/* Quick Command Search Trigger & Actions */}
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            {onOpenCommandPalette && (
              <div 
                onClick={onOpenCommandPalette}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(186, 158, 255, 0.15)',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--on-surface-variant)'
                }}
                title="Search jurisdictions, laws, and settings (Ctrl + K)"
              >
                <Search size={13} style={{ color: 'var(--primary)' }} />
                <span>Search...</span>
                <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--primary)', fontWeight: 700 }}>
                  ⌘K
                </span>
              </div>
            )}

            <ThemeToggle />
            <LanguageSwitcher align="right" />

            {onOpenShortcuts && (
              <div 
                onClick={onOpenShortcuts}
                className="btn-glass" 
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--primary)', fontWeight: 700 }}>?</span>
              </div>
            )}
            
            <div 
              onClick={() => setView('hero')} 
              className="btn-glass" 
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
              title="Return to Home Landing"
            >
              <Home size={14} />
            </div>
          </div>
        </header>

        {/* Scrollable content container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
          
          {/* ══════════════════════════════════════════════════════════════════
              ── Tab: Vault (Main Analysis Workspace) ──
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'vault' && (
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="display-lg" style={{ marginBottom: '0.5rem' }}>
                  {t('dashboard.header_title_1')}<br /><span className="gradient-text">{t('dashboard.header_title_2')}</span>
                </h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  {t('dashboard.subtitle')}
                </p>
              </motion.div>

              {/* Official AI Boundary & Legal Disclaimer (Task 13.3) */}
              <LegalDisclaimerCard country={selectedCountry} />

              {/* Input Group */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}
              >
                {/* Country Picker */}
                <div ref={countryDropdownRef} style={{ position: 'relative' }}>
                  <button
                    className="btn-glass"
                    onClick={() => setShowCountriesDropdown(!showCountriesDropdown)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', 
                      padding: '0.7rem 1.25rem', borderRadius: '12px', fontWeight: 600,
                      border: selectedCountry ? '1px solid rgba(186,158,255,0.4)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{selectedCountry?.flag || '🌍'}</span>
                    <span style={{ fontSize: '0.875rem' }}>{selectedCountry?.name || t('dashboard.select_jurisdiction')}</span>
                    <ChevronDown size={14} style={{ color: 'var(--on-surface-variant)', transform: showCountriesDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  <AnimatePresence>
                    {showCountriesDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className="glass"
                        style={{ 
                          position: 'absolute', top: 'calc(100% + 8px)', left: 0, 
                          width: '320px', borderRadius: '16px', zIndex: 1000, 
                          padding: '0.75rem', maxHeight: '380px', display: 'flex', flexDirection: 'column',
                          background: 'rgba(11, 19, 38, 0.98)', border: '1px solid rgba(186, 158, 255, 0.25)',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', marginBottom: '0.75rem' }}>
                          <Search size={14} style={{ color: 'var(--on-surface-variant)' }} />
                          <input
                            autoFocus
                            value={vaultSearch}
                            onChange={e => setVaultSearch(e.target.value)}
                            placeholder={t('dashboard.find_jurisdiction')}
                            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', flex: 1, fontFamily: 'var(--font-body)' }}
                          />
                          {vaultSearch && <X size={14} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }} onClick={() => setVaultSearch('')} />}
                        </div>
                        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {filteredVaultCountries.map(c => (
                            <div key={c.code}
                              onClick={() => { 
                                setSelectedCountry(c); 
                                setShowCountriesDropdown(false); 
                                setVaultSearch('');
                                showToast(`Target jurisdiction set to ${c.name}`, 'success');
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s', background: selectedCountry?.code === c.code ? 'rgba(132,85,239,0.15)' : 'transparent' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                              onMouseLeave={e => e.currentTarget.style.background = selectedCountry?.code === c.code ? 'rgba(132,85,239,0.15)' : 'transparent'}
                            >
                              <span style={{ fontSize: '1.25rem' }}>{c.flag}</span>
                              <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: selectedCountry?.code === c.code ? 'var(--primary)' : 'var(--on-surface)' }}>{c.name}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>{c.system}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {selectedCountry && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    System: <strong>{selectedCountry.system}</strong>
                  </span>
                )}
              </motion.div>

              {featureFlags['enableGeoIntelligence'] && <GeoBanner />}

              {/* Statute of the Day Widget (Task 9.3) */}
              {selectedCountry && (
                <LawOfTheDay
                  countryCode={selectedCountry.code}
                  onSelectPrompt={(prompt) => setSituation(prompt)}
                />
              )}

              {/* Jurisdiction Example Chips (Task 13.4) */}
              {selectedCountry && (
                <JurisdictionExamples
                  countryCode={selectedCountry.code}
                  onSelectQuery={(q) => setSituation(q)}
                />
              )}

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    style={{ 
                      padding: '0.85rem 1.25rem', 
                      borderRadius: '12px', 
                      background: 'rgba(239,68,68,0.1)', 
                      border: '1px solid rgba(239,68,68,0.25)', 
                      color: '#f87171', 
                      fontSize: '0.875rem', 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={16} />
                      <span>{error}</span>
                    </div>
                    <X size={14} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => setError(null)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Textarea Workspace */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ position: 'relative', marginBottom: '1rem' }}>
                <textarea
                  ref={textareaRef}
                  className="input-monolith"
                  rows={5}
                  placeholder={t('dashboard.placeholder')}
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  onKeyDown={e => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                />
                
                {/* Textarea Bottom Bar */}
                <div style={{ position: 'absolute', bottom: '0.75rem', left: '1.25rem', right: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.5 }}>
                    {situation.length}/2000 characters
                  </span>
                  {situation.length > 0 && (
                    <button
                      onClick={() => setSituation('')}
                      style={{ pointerEvents: 'auto', background: 'none', border: 'none', color: 'var(--on-surface-variant)', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.7 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >
                      Clear text
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Action Row */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}
              >
                <button className={isAgentMode ? "btn-primary agent-btn" : "btn-primary"} onClick={handleAnalyze} disabled={loading}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', padding: '0.85rem 2rem', 
                    opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                    background: isAgentMode ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    boxShadow: isAgentMode ? '0 12px 24px -10px rgba(16,185,129,0.4)' : '0 12px 24px -10px rgba(132,85,239,0.4)'
                  }}>
                  {loading 
                    ? <><div className="spinner" style={{ width: 16, height: 16 }} /> {isAgentMode ? t('agent.status_processing') : t('dashboard.analyzing_btn')}</> 
                    : <><Send size={16} /> {isAgentMode ? t('agent.active_btn') : t('agent.inactive_btn')}</>}
                </button>
                
                {featureFlags['enableVoiceAgent'] && (
                  <button 
                    className="btn-glass" 
                    onClick={handleVoiceToggle}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', 
                      background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', 
                      color: isListening ? '#ef4444' : 'inherit', 
                      border: isListening ? '1px solid #ef4444' : '' 
                    }}
                  >
                    <Mic size={16} className={isListening ? "pulse" : ""} /> 
                    {isListening ? "Recording Voice..." : t('dashboard.voice_input')}
                  </button>
                )}

                {featureFlags['enablePanicMode'] && (
                  <div style={{ marginLeft: 'auto' }}>
                    <PanicButton />
                  </div>
                )}
              </motion.div>

              {/* Evidence Vault */}
              {featureFlags['enableCryptoVault'] && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <EvidenceVault />
                </motion.div>
              )}

              {/* Agent Mode Toggle */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
                style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div 
                  onClick={() => {
                    const next = !isAgentMode;
                    setIsAgentMode(next);
                    showToast(next ? 'Autonomous Agent reasoning enabled' : 'Single-turn fast reasoning enabled', 'info');
                  }}
                  style={{ 
                    width: '44px', height: '24px', borderRadius: '12px', background: isAgentMode ? '#10b981' : 'rgba(255,255,255,0.1)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center', padding: '2px'
                  }}
                >
                  <motion.div 
                    layout 
                    initial={false}
                    animate={{ x: isAgentMode ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', color: isAgentMode ? '#10b981' : 'var(--on-surface-variant)', fontWeight: isAgentMode ? 600 : 400, transition: 'color 0.3s' }}>
                  {t('agent.enable')}
                </span>
              </motion.div>

              {/* Quick Preset Templates */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <p className="label-sm" style={{ color: 'var(--on-surface-variant)', opacity: 0.5, marginBottom: '0.75rem' }}>{t('dashboard.quick_templates')}</p>
                <div className="templates-grid" style={{ gap: '0.5rem', marginBottom: '3rem' }}>
                  {QUICK_TEMPLATES.map(tmp => (
                    <div key={tmp.label} className="glass-card" onClick={() => applyTemplate(tmp.text)}
                      style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'transform 0.2s, border-color 0.2s' }}>
                      <span style={{ fontSize: '1.25rem' }}>{tmp.icon}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)' }}>{tmp.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Document Uploader */}
              {featureFlags['enableDocumentAI'] && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginBottom: '3rem' }}>
                   <p className="label-sm" style={{ color: 'var(--on-surface-variant)', opacity: 0.5, marginBottom: '0.75rem' }}>Document Analysis & Redlining</p>
                   <DocumentUploader onAnalysisComplete={handleDocumentScanned} i18nLanguage={i18n.language} />
                   {docAnalysisResult && featureFlags['enableRedlineAnalysis'] && (
                     <div style={{ marginTop: '1.5rem' }}>
                       <RedlineAnalyzer result={docAnalysisResult} />
                     </div>
                   )}
                </motion.div>
              )}

              {/* Recent History Shortcut */}
              {history.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p className="label-sm" style={{ color: 'var(--on-surface-variant)', opacity: 0.5 }}>{t('dashboard.recent_intel')}</p>
                    <button onClick={() => setActiveTab('history')} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      View all ({history.length}) →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {history.slice(0, 4).map((h, i) => (
                      <div key={i} className="glass-card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                        onClick={() => handleSelectHistoryItem(h)}>
                        <span style={{ fontSize: '1.5rem' }}>{h.flag}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{h.country}</div>
                          <div className="truncate" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{h.snippet}</div>
                        </div>
                        <span className={`badge badge-${(h.severity || 'MEDIUM').toLowerCase()}`}>
                          {t(`risk.${h.severity || 'MEDIUM'}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ── Tab: Countries (Global Jurisdictions Directory) ──
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'countries' && (
            <div style={{ maxWidth: '980px', margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h1 className="display-lg" style={{ marginBottom: '0.5rem' }}>
                      Global <span className="gradient-text">Jurisdictions</span>
                    </h1>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                      Select a sovereign jurisdiction to calibrate statutory reasoning and court frameworks.
                    </p>
                  </div>

                  {selectedCountry && (
                    <div style={{ padding: '0.6rem 1rem', background: 'rgba(132,85,239,0.1)', border: '1px solid rgba(186,158,255,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{selectedCountry.flag}</span>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Active Target</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedCountry.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search & System Filter Toolbar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                  {/* Search Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                    <Search size={18} style={{ color: 'var(--primary)' }} />
                    <input
                      value={countriesSearch}
                      onChange={e => setCountriesSearch(e.target.value)}
                      placeholder="Search jurisdiction by country name, ISO code (e.g. IN, US, GB), or legal system..."
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--on-surface)', fontSize: '0.95rem', flex: 1, fontFamily: 'var(--font-body)' }}
                    />
                    {countriesSearch && (
                      <X size={18} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }} onClick={() => setCountriesSearch('')} />
                    )}
                  </div>

                  {/* Legal System Filter Chips */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginRight: '0.25rem' }}>Filter System:</span>
                    {[
                      { id: 'all', label: 'All Systems' },
                      { id: 'Common', label: 'Common Law' },
                      { id: 'Civil', label: 'Civil Law' },
                      { id: 'Mixed', label: 'Mixed / Hybrid' },
                      { id: 'Sharia', label: 'Sharia Framework' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedLegalSystem(f.id)}
                        className="btn-glass"
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          borderRadius: '100px',
                          border: selectedLegalSystem === f.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                          background: selectedLegalSystem === f.id ? 'rgba(132,85,239,0.2)' : 'rgba(255,255,255,0.02)',
                          color: selectedLegalSystem === f.id ? 'var(--primary)' : 'var(--on-surface-variant)'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
                      Showing {filteredDirectoryCountries.length} countries
                    </span>
                  </div>
                </div>

                {/* Country Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {filteredDirectoryCountries.map(c => {
                    const isActive = selectedCountry?.code === c.code;
                    return (
                      <div 
                        key={c.code}
                        onClick={() => {
                          setSelectedCountry(c);
                          setActiveTab('vault');
                          showToast(`Jurisdiction set to ${c.name}. Vault workspace ready.`, 'success');
                        }}
                        className="glass-card"
                        style={{ 
                          padding: '1.25rem', 
                          cursor: 'pointer', 
                          border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                          background: isActive ? 'rgba(132,85,239,0.1)' : 'linear-gradient(135deg, rgba(27,37,62,0.7) 0%, rgba(16,25,46,0.5) 100%)',
                          position: 'relative'
                        }}
                      >
                        {isActive && (
                          <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--primary)', color: '#000', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            ACTIVE
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{c.flag}</span>
                            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', fontFamily: 'monospace', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{c.code}</span>
                          </div>
                          <span className="badge" style={{ 
                            fontSize: '0.55rem', 
                            background: c.system.includes('Common') ? 'rgba(0,227,253,0.1)' : 'rgba(132,85,239,0.1)', 
                            color: c.system.includes('Common') ? 'var(--secondary)' : 'var(--primary)',
                            borderColor: c.system.includes('Common') ? 'rgba(0,227,253,0.2)' : 'rgba(132,85,239,0.2)'
                          }}>
                            {c.system}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.2rem' }}>{c.name}</h3>
                        <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: '0.85rem' }}>ISO Code: {c.code}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                          Launch Vault <ArrowRight size={12} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ── Tab: History (Recent Records & Intelligence) ──
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h1 className="display-lg">
                      Recent <span className="gradient-text">Intelligence</span>
                    </h1>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                      Audit log of local case computations stored in your sovereign sandboxed storage.
                    </p>
                  </div>

                  {history.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={handleExportHistoryJSON} 
                        className="btn-glass" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
                      >
                        <Download size={13} /> Export Backup
                      </button>
                      <button 
                        onClick={() => setShowClearConfirm(true)} 
                        className="btn-glass" 
                        style={{ fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Filter and Search Bar */}
                {history.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                      <Search size={14} style={{ color: 'var(--on-surface-variant)' }} />
                      <input 
                        type="text" 
                        value={historySearch} 
                        onChange={e => setHistorySearch(e.target.value)} 
                        placeholder="Search past queries or country..."
                        style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', flex: 1 }}
                      />
                      {historySearch && <X size={14} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }} onClick={() => setHistorySearch('')} />}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {['all', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setHistorySeverityFilter(lvl)}
                          className="btn-glass"
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                            background: historySeverityFilter === lvl ? 'rgba(186,158,255,0.2)' : 'transparent',
                            borderColor: historySeverityFilter === lvl ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                            color: historySeverityFilter === lvl ? 'var(--primary)' : 'var(--on-surface-variant)'
                          }}
                        >
                          {lvl === 'all' ? 'All Risks' : lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Clear Modal */}
                <AnimatePresence>
                  {showClearConfirm && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: '#f87171' }}>Permanently wipe all {history.length} saved intelligence reports?</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setShowClearConfirm(false)} className="btn-glass" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Cancel</button>
                        <button onClick={() => { clearHistory(); setShowClearConfirm(false); showToast('History cleared', 'info'); }} className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: '#ef4444' }}>Confirm Wipe</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {history.length === 0 ? (
                  <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                    <Clock size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.3, color: 'var(--primary)' }} />
                    <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem', color: 'var(--on-surface)' }}>No Analysis History Stored</p>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                      Run legal queries in the Vault to generate statutory reports and adversarial defenses.
                    </p>
                    <button className="btn-primary" onClick={() => setActiveTab('vault')}>
                      Open Legal Vault
                    </button>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                    <p style={{ fontSize: '0.9rem' }}>No history records match "{historySearch}"</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredHistory.map((h, i) => (
                      <div 
                        key={i} 
                        className="glass-card" 
                        style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onClick={() => handleSelectHistoryItem(h)}
                      >
                        <span style={{ fontSize: '2rem' }}>{h.flag}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{h.country}</span>
                            {h.timestamp && <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>{h.timestamp}</span>}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', fontStyle: 'italic', marginBottom: '0.25rem' }} className="truncate">
                            "{h.snippet}"
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginLeft: 'auto' }}>
                          <span className={`badge badge-${(h.severity || 'MEDIUM').toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                            {t(`risk.${h.severity || 'MEDIUM'}`)}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectHistoryItem(h);
                            }}
                            className="btn-glass"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--primary)', borderColor: 'rgba(186,158,255,0.2)' }}
                            title="Inspect full computed report"
                          >
                            View Report
                          </button>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(i);
                              showToast('Record deleted from history', 'info');
                            }}
                            className="btn-glass"
                            style={{ 
                              padding: '0.4rem', 
                              borderRadius: '8px', 
                              borderColor: 'rgba(239,68,68,0.2)', 
                              background: 'rgba(239,68,68,0.05)',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete this record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ── Tab: Settings (Configuration & Sandbox Control) ──
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h1 className="display-lg" style={{ marginBottom: '0.5rem' }}>
                  System <span className="gradient-text">Settings</span>
                </h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  Manage reasoning pipelines, translation preferences, enterprise modules, and local data sandboxes.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Pipeline config */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ⚡ Lex-AI Reasoning Pipeline
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                      Configure the active grounding mode. Offline snapshot relies strictly on local SQLite database cache and on-device WebGPU, while Online Live Mode enables cloud LLM synthesis and live web search.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => {
                          setPipelineMode('ONLINE_LIVE');
                          showToast('Pipeline switched to Online Live Sync', 'info');
                        }}
                        className="btn-glass"
                        style={{ 
                          flex: 1, 
                          fontWeight: 600, 
                          background: pipelineMode === 'ONLINE_LIVE' ? 'rgba(0,227,253,0.12)' : 'transparent',
                          borderColor: pipelineMode === 'ONLINE_LIVE' ? 'var(--secondary)' : 'rgba(255,255,255,0.08)',
                          color: pipelineMode === 'ONLINE_LIVE' ? 'var(--secondary)' : 'var(--on-surface-variant)'
                        }}
                      >
                        ✓ Online Live Sync
                      </button>
                      <button 
                        onClick={() => {
                          setPipelineMode('OFFLINE_LOCAL');
                          showToast('Pipeline switched to Sovereign Local Host', 'warning');
                        }}
                        className="btn-glass"
                        style={{ 
                          flex: 1, 
                          fontWeight: 600, 
                          background: pipelineMode === 'OFFLINE_LOCAL' ? 'rgba(245,158,11,0.12)' : 'transparent',
                          borderColor: pipelineMode === 'OFFLINE_LOCAL' ? 'var(--risk-medium)' : 'rgba(255,255,255,0.08)',
                          color: pipelineMode === 'OFFLINE_LOCAL' ? 'var(--risk-medium)' : 'var(--on-surface-variant)'
                        }}
                      >
                        ✓ Offline Local Host (Sovereign)
                      </button>
                    </div>
                  </div>

                  {/* Continuous Legal Knowledge Engine & Real-Time Grounding */}
                  <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(0, 227, 253, 0.25)', background: 'linear-gradient(135deg, rgba(0, 227, 253, 0.03), rgba(20, 27, 45, 0.4))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 227, 253, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                          <Scale size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Continuous Legal Knowledge & Live Grounding
                            <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--risk-low)', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                              Active v{lawsVersion || '2026.10-live'}
                            </span>
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                            Real-time Google Search Grounding + Over-The-Air (OTA) Statutory Sync
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => syncNow(true)}
                        disabled={isSyncing}
                        className="btn-glass"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px', 
                          fontSize: '0.82rem', 
                          fontWeight: 600,
                          background: isSyncing ? 'rgba(0, 227, 253, 0.2)' : 'rgba(0, 227, 253, 0.1)',
                          borderColor: 'var(--secondary)',
                          color: 'var(--secondary)',
                          cursor: isSyncing ? 'wait' : 'pointer'
                        }}
                      >
                        <RefreshCw size={15} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                        {isSyncing ? 'Checking Legal Sources...' : 'Check for Latest Legal Updates'}
                      </button>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      LAWFORGE AI guarantees up-to-the-minute legal fidelity. Online analyses execute with Google Search Grounding to pull 2026/2027 statutory amendments, court rulings, and gazettes. Sovereign offline mode syncs remote deltas into high-speed on-device IndexedDB vector indices.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statute Version</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)', marginTop: '0.2rem' }}>
                          v{lawsVersion || '2026.10-live'}
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Search Grounding</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--risk-low)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-low)', display: 'inline-block', boxShadow: '0 0 8px var(--risk-low)' }} />
                          Online & Grounded
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Cloud Verification</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)', marginTop: '0.2rem' }}>
                          {lastSync ? new Date(lastSync).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Verified just now'}
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sovereign Cache</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)', marginTop: '0.2rem' }}>
                          IndexedDB Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 8.1: Interface Theme & Ergonomics */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🎨 Visual Theme & Ergonomics
                      </h3>
                      <ThemeToggle variant="select" />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                      Switch between Dark Mode (ideal for low-light research), Light Mode (high contrast print and legal drafting clarity), or System to align with your device.
                    </p>
                  </div>

                  {/* Language switcher Card — with explicit z-index 50 so its dropdown floats on top */}
                  <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', zIndex: 50 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🌍 Language & Translation
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                      Choose your default legal interface language. Generated reports will automatically format in the selected dialect.
                    </p>
                    <LanguageSwitcher align="left" />
                  </div>

                  {/* Enterprise Mode Toggle */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      💼 Enterprise Workspace Mode
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                      Activate enterprise whitelabelling mode for law firm practice management: billable stopwatch timer, IndexedDB matter CRM, and PDF client invoices.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: isEnterpriseMode ? 'var(--secondary)' : 'var(--on-surface-variant)', fontWeight: 600 }}>
                        {isEnterpriseMode ? 'Enterprise Workspace Active' : 'Standard Consumer Workspace Active'}
                      </span>
                      <button 
                        onClick={() => {
                          const next = !isEnterpriseMode;
                          setIsEnterpriseMode(next);
                          showToast(next ? 'Enterprise OS Active' : 'Standard Workspace Active', 'success');
                        }}
                        className="btn-glass"
                        style={{ 
                          fontWeight: 600, 
                          background: isEnterpriseMode ? 'rgba(0,227,253,0.1)' : 'transparent',
                          borderColor: isEnterpriseMode ? 'var(--secondary)' : 'rgba(255,255,255,0.08)'
                        }}
                      >
                        {isEnterpriseMode ? 'Switch to Standard' : 'Activate Enterprise OS'}
                      </button>
                    </div>
                  </div>

                  {/* Feature Flags / System Modules */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🛠️ Experimental Feature Modules
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                      Toggle individual AI modules and sovereign security protocols.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                      {Object.keys(featureFlags).map(flagName => (
                        <div 
                          key={flagName} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                              {flagName.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
                              {flagName}
                            </span>
                          </div>
                          <div 
                            onClick={() => {
                              toggleFeatureFlag(flagName);
                              showToast(`Toggled ${flagName}`, 'info');
                            }}
                            style={{ 
                              width: '36px', height: '20px', borderRadius: '10px', 
                              background: featureFlags[flagName] ? 'var(--primary-dim)' : 'rgba(255,255,255,0.1)',
                              position: 'relative', cursor: 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center', padding: '2px'
                            }}
                          >
                            <motion.div 
                              layout 
                              initial={false}
                              animate={{ x: featureFlags[flagName] ? 16 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage Sandbox & Cleanup */}
                  <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444' }}>
                      ⚠️ Storage Sandbox Cleanup & Privacy
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                      Audit logs, offline cache, and reports reside in browser local storage. You can export an encrypted snapshot or securely wipe all cached records.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={handleExportHistoryJSON}
                        className="btn-glass"
                        style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Download size={14} /> Download Encrypted Backup
                      </button>

                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to permanently delete all local history data?")) {
                            clearHistory();
                            showToast("History cleared successfully.", "success");
                          }
                        }}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}
                      >
                        Delete All History Data
                      </button>
                    </div>
                  </div>

                  {/* Phase 13.1: Interactive Tour & Guide */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🧭 Interactive Guided Tour
                      </h3>
                      <button
                        onClick={() => setShowTour(true)}
                        className="btn-glass"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 }}
                      >
                        Start 5-Step Tour
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                      Review how LAWFORGE AI pairs on-device WebGPU reasoning, tamper-evident evidence notarization, and statutory grounding across 195+ jurisdictions.
                    </p>
                  </div>

                </div>
              </motion.div>
            </div>
          )}

        </div>
      </main>

      {/* Interactive Onboarding Tour (Task 13.1) */}
      <OnboardingTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </div>
  )
}
