import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { ArrowLeft, Download, Share2, PhoneCall, ShieldAlert, Scale, Gavel,
         FileText, CheckSquare, MapPin, Swords, TrendingDown, Link2,
         AlertTriangle, Copy, Printer, ChevronDown, ChevronUp, Clock, Home, Search, Keyboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { DeadlinePanel } from './DeadlinePanel'
import { ScenarioSimulator } from './ScenarioSimulator'
import { AdversarialSimulator } from '../phase6/adversarial/AdversarialSimulator'
import { DocumentEngine } from '../engine/DocumentEngine'
import { BriefcaseGenerator } from '../phase4/briefcase/BriefcaseGenerator'
import { PrecedentPanel } from '../phase4/mini-rag/PrecedentPanel'
import { RedlineAnalyzer } from '../phase6/redline/RedlineAnalyzer'
import { SmartSettlement } from '../phase6/settlement/SmartSettlement'
import { GlossaryText } from './GlossaryTooltip'
import { ThemeToggle } from './ThemeToggle'
import { PDFReportEngine } from '../engine/PDFReportEngine'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay } }
})

// Animated number counter
function Counter({ target, suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      start = Math.min(start + step, target)
      setVal(Math.round(start))
      if (start >= target) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [target, duration])
  return <>{val}{suffix}</>
}

// Generate a short case ID
function makeCaseId(country) {
  const cc = (country || 'XX').substring(0, 2).toUpperCase()
  const yr = new Date().getFullYear()
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID().substring(0, 4).toUpperCase() 
    : Date.now().toString(36).substring(2, 6).toUpperCase()
  return `LF-${cc}-${yr}-${rand}`
}

export function ResponseSection({ onOpenCommandPalette, onOpenShortcuts }) {
  const { response, selectedCountry, setView, pipelineMode, featureFlags, showToast } = useStore()
  const { t, i18n } = useTranslation()
  const [docType, setDocType] = useState('legal_notice')
  const [docEditing, setDocEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showChecklist, setShowChecklist] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState({})
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const draftRef = useRef(null)

  const [caseId] = useState(() => makeCaseId(response?.country))
  const [analysisTime] = useState(() => new Date().toLocaleTimeString())

  const [checklistDone, setChecklistDone] = useState(() => {
    if (typeof localStorage === 'undefined') return {};
    try {
      const stored = localStorage.getItem(`lawforge_checklist_${caseId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [docContent, setDocContent] = useState(() => {
    if (!response) return '';
    return DocumentEngine.generate(docType, {
      country: response.country,
      situation: response.situation,
      category: response._meta?.category,
      laws_raw: response.laws_raw,
    });
  });

  const [prevDocKey, setPrevDocKey] = useState(() => `${docType}_${response?.country || ''}_${response?._meta?.category || ''}`);
  const currentDocKey = `${docType}_${response?.country || ''}_${response?._meta?.category || ''}`;
  if (prevDocKey !== currentDocKey) {
    setPrevDocKey(currentDocKey);
    if (response) {
      setDocContent(DocumentEngine.generate(docType, {
        country: response.country,
        situation: response.situation,
        category: response._meta?.category,
        laws_raw: response.laws_raw,
      }));
    }
  }

  if (!response) return null

  const sev = (response.severity || 'MEDIUM').toUpperCase()
  const sevColor = sev === 'HIGH' ? '#ef4444' : sev === 'LOW' ? '#22c55e' : '#f59e0b'
  const sevClass = sev === 'HIGH' ? 'high' : sev === 'LOW' ? 'low' : 'medium'
  const orbBg = sev === 'HIGH'
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : sev === 'LOW'
    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
    : 'linear-gradient(135deg, #f59e0b, #d97706)'
  const score = sev === 'HIGH' ? 8 : sev === 'LOW' ? 3 : 6

  const SECTIONS = [
    { id: 'summary',    key: 'summary',    icon: '📋', title: pipelineMode === 'OFFLINE_LOCAL' ? 'Direct Answer' : t('response.summary'),    span: 2 },
    { id: 'laws',       key: 'laws',       icon: '⚖️', title: pipelineMode === 'OFFLINE_LOCAL' ? 'Statutory Framework' : t('response.laws'),       span: 1 },
    { id: 'penalties',  key: 'penalties',  icon: '🔨', title: pipelineMode === 'OFFLINE_LOCAL' ? 'Compliance & Risks' : t('response.penalties'),  span: 1 },
    { id: 'rights',     key: 'rights',     icon: '🛡️', title: t('response.rights'),     span: 1 },
    { id: 'next_steps', key: 'next_steps', icon: '🎯', title: t('response.next_steps'), span: 1 },
    { id: 'advice',     key: 'advice',     icon: '🗡️', title: pipelineMode === 'OFFLINE_LOCAL' ? 'Analysis' : t('response.advice'),     span: 1 },
    { id: 'warning',    key: 'warning',    icon: '⚠️', title: pipelineMode === 'OFFLINE_LOCAL' ? 'Status Warning' : t('response.warning'),    span: 2 },
  ]

  // Handle checklist toggle + persist
  const toggleChecklist = (idx) => {
    const next = { ...checklistDone, [idx]: !checklistDone[idx] }
    setChecklistDone(next)
    localStorage.setItem(`lawforge_checklist_${caseId}`, JSON.stringify(next))
  }
  const checklist = response.agent_data?.checklist || []
  const doneCount = checklist.filter((_, i) => checklistDone[i]).length

  // Section Collapsible state handlers (Task 8.4)
  const toggleSection = (id) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllCollapsed = SECTIONS.every(s => !!collapsedSections[s.id]);
  const toggleAllSections = () => {
    const nextState = !areAllCollapsed;
    const map = {};
    SECTIONS.forEach(s => { map[s.id] = nextState; });
    setCollapsedSections(map);
  };

  // Download markdown export
  const handleDownload = () => {
    const text = [
      `# LAWFORGE Legal Intelligence Report`,
      `Case ID: ${caseId}  |  ${response.country}  |  ${analysisTime}`,
      `Severity: ${sev}`,
      `\n## Situation\n${response.situation}`,
      `\n## Summary\n${response.summary}`,
      `\n## Laws\n${response.laws}`,
      `\n## Penalties\n${response.penalties}`,
      `\n## Your Rights\n${response.rights}`,
      `\n## Next Steps\n${response.next_steps}`,
      `\n## Legal Defense\n${response.advice}`,
      `\n---\n${response.warning}`,
    ].join('\n')
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${caseId}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  // Official PDF Dossier Generator (Task 8.8)
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast?.('Compiling official legal dossier PDF...', 'info', 2000);
      await PDFReportEngine.generateReport({
        caseId,
        country: selectedCountry?.name || response.country,
        situation: response.situation,
        response,
        pipelineMode
      });
      showToast?.('PDF Dossier downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('PDF compilation error: ' + (err.message || 'Check console'), 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Copy full intelligence report in structured Markdown format
  const handleCopyFullReport = () => {
    const fullMarkdown = [
      `# LAWFORGE AI — Official Legal Intelligence Dossier`,
      `Case Ref: ${caseId}  |  Jurisdiction: ${selectedCountry?.name || response.country}  |  Severity: ${sev}`,
      `Timestamp: ${analysisTime}  |  Pipeline: ${pipelineMode === 'OFFLINE_LOCAL' ? 'Offline Sovereign RAG' : 'Cloud Verified'}`,
      `\n---\n`,
      `### Factual Statement\n${response.situation || '—'}`,
      `\n### Executive Summary / Direct Answer\n${response.summary || '—'}`,
      `\n### Statutory Framework\n${response.laws || '—'}`,
      `\n### Liabilities, Penalties & Risks\n${response.penalties || '—'}`,
      `\n### Fundamental Rights & Protections\n${response.rights || '—'}`,
      `\n### Recommended Next Steps\n${response.next_steps || '—'}`,
      `\n### Strategic Legal Analysis & Defenses\n${response.advice || '—'}`,
      `\n---\n*${response.warning || 'Informative report generated by LAWFORGE AI. Not formal legal representation.'}*`
    ].join('\n');

    navigator.clipboard.writeText(fullMarkdown).then(() => {
      showToast?.('Full Legal Dossier copied to clipboard in Markdown format!', 'success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      showToast?.('Could not copy to clipboard', 'error');
    });
  };

  // Share summary to clipboard
  const handleShare = () => {
    const text = `⚖️ LAWFORGE Legal Report\nCase: ${caseId}\nCountry: ${response.country}\nSeverity: ${sev}\n${response.situation?.slice(0,120)}...\n\nGenerated by LAWFORGE AI — lawforge.ai`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  // Print document
  const handlePrint = () => {
    window.print()
  }

  // Copy draft
  const handleCopyDraft = () => {
    navigator.clipboard.writeText(docContent)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // Export Phase 4 Briefcase
  const handleExportBriefcase = async () => {
    // Generate briefcase by capturing the main container or passing response data
    await BriefcaseGenerator.generate(
      caseId, 
      response.situation, 
      response, 
      'response-card-grid' // The ID we will add to the grid
    );
  }

  return (
    <div className="response-root" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--on-surface)' }}>

      {/* ── Header ── */}
      <motion.header {...fadeUp(0)} style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(10,10,30,0.85)', borderBottom: '1px solid rgba(186,158,255,0.08)', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setView('dashboard')} className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
            <ArrowLeft size={14} /> {t('response.back')}
          </button>
          <button onClick={() => setView('hero')} className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }} title="Return to Home Landing">
            <Home size={14} /> Home
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.7, fontFamily: 'monospace' }}>
              {caseId}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', opacity: 0.45 }}>
              Analyzed at {analysisTime}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="btn-glass"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.45rem 0.75rem', borderRadius: '100px' }}
              title="Search commands & countries (Ctrl + K)"
            >
              <Search size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--primary)', fontWeight: 700 }}>⌘K</span>
            </button>
          )}

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="btn-glass"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.45rem 0.65rem', borderRadius: '100px' }}
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--primary)', fontWeight: 700 }}>?</span>
            </button>
          )}

          <ThemeToggle />
          <LanguageSwitcher align="right" />
          <button className="btn-glass" onClick={handleCopyFullReport} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.5rem 0.875rem' }} title="Copy complete intelligence dossier in Markdown">
            <Copy size={14} /> {copied ? '✓ Copied' : 'Copy Dossier'}
          </button>
          
          <button className="btn-glass" onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            <Share2 size={14} /> {t('response.share', 'Share')}
          </button>
          
          <button className="btn-glass" onClick={handleDownloadPDF} disabled={isGeneratingPdf} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem', borderColor: 'var(--primary)', color: 'var(--primary)' }} title="Export Official Branded PDF Report">
            <Download size={14} /> {isGeneratingPdf ? 'Compiling...' : 'Download PDF'}
          </button>

          {featureFlags['enableBriefcase'] ? (
            <button className="btn-glass" onClick={handleExportBriefcase} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
              <Download size={14} /> Briefcase
            </button>
          ) : (
            <button className="btn-glass" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }} title="Download raw markdown">
              <Download size={14} /> .MD
            </button>
          )}
          
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            <PhoneCall size={14} /> {t('response.consult')}
          </button>
        </div>
      </motion.header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2.5rem', position: 'relative', zIndex: 1 }}>

        {/* ── Case Header ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
          <motion.div {...fadeUp(0.1)}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="badge badge-purple">{selectedCountry?.flag} {selectedCountry?.name || response.country}</span>
              <span className={`badge badge-${sevClass}`}><ShieldAlert size={10} /> {t(`risk.${sev}`)}</span>
              <span className="badge badge-cyan" style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>{caseId}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--on-surface-variant)', fontSize: '0.65rem' }}>
                {new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="display-lg" style={{ marginBottom: '0.75rem' }}>
              {t('response.title_1')}<br /><span className="gradient-text">{t('response.title_2')}</span>
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', maxWidth: '500px', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{response.situation?.slice(0, 120)}{response.situation?.length > 120 ? '...' : ''}"
            </p>
          </motion.div>

          {/* 3D Risk / Agent Orb */}
          <motion.div initial={{ opacity: 0, scale: 0.5, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 } }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative' }}
            title={`Risk based on ${sev} severity. Confidence: MEDIUM`}
          >
            {response.isAgentSession && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                style={{ position: 'absolute', top: -15, left: -15, right: -15, bottom: -15, border: '1px solid #10b981', borderRadius: '50%', opacity: 0.3, animation: 'orb-float 3s ease-in-out infinite reverse' }} />
            )}
            <div style={{ width: 140, height: 140, borderRadius: '50%', background: orbBg, boxShadow: `0 0 80px ${sevColor}40, 0 0 0 1px ${sevColor}20, inset 0 2px 4px rgba(255,255,255,0.15)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'orb-float 4s ease-in-out infinite', position: 'relative', zIndex: 2 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                <Counter target={score} />
              </span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>/10</span>
            </div>
            {response.isAgentSession ? (
              <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontSize: '0.65rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '4px', animation: 'pulse 2s infinite' }} />
                {t('agent.status_active')}
              </span>
            ) : (
              <span className={`badge badge-${sevClass}`} style={{ fontSize: '0.65rem' }}>{t(`risk.${sev}`)} {t('response.risk_level')}</span>
            )}
          </motion.div>
        </div>

        {/* ── Analysis Grid Header / Toolbar (Task 8.4) ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--on-surface)' }}>
              Statutory Intelligence Analysis
            </span>
            <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)' }}>
              {SECTIONS.length} Sections
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleCopyFullReport}
              className="btn-glass"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Copy all analysis sections as formatted report"
            >
              <Copy size={12} /> Copy All
            </button>
            <button
              onClick={toggleAllSections}
              className="btn-glass"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title={areAllCollapsed ? 'Expand all analysis sections' : 'Collapse all analysis sections'}
            >
              {areAllCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              {areAllCollapsed ? 'Expand All' : 'Collapse All'}
            </button>
          </div>
        </div>

        {/* ── Analysis Grid ── */}
        <div id="response-card-grid" className="analysis-grid" style={{ gap: '1rem' }}>
          {SECTIONS.map((s, i) => {
            const isCollapsed = !!collapsedSections[s.id];
            const content = response[s.key] || '—';
            return (
              <motion.div
                key={s.id}
                {...fadeUp(0.15 + i * 0.05)}
                className="analysis-card"
                style={{
                  gridColumn: s.span === 2 ? '1 / -1' : 'auto',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  ...(s.id === 'warning' ? { background: `rgba(${sev === 'HIGH' ? '239,68,68' : sev === 'LOW' ? '34,197,94' : '245,158,11'},0.05)`, borderColor: `${sevColor}20` } : {})
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCollapsed ? '0' : '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="analysis-card-icon" style={{ marginBottom: 0 }}>{s.icon}</span>
                    <p className="analysis-card-title" style={{ marginBottom: 0 }}>{s.title}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`### ${s.title}\n${content}`);
                        showToast?.(`Copied ${s.title}`, 'success', 2000);
                      }}
                      className="btn-glass"
                      style={{ padding: '3px 6px', fontSize: '0.7rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      title={`Copy ${s.title}`}
                      aria-label={`Copy ${s.title}`}
                    >
                      <Copy size={13} style={{ opacity: 0.6 }} />
                    </button>
                    <button
                      onClick={() => toggleSection(s.id)}
                      className="btn-glass"
                      style={{ padding: '3px 6px', fontSize: '0.7rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      title={isCollapsed ? `Expand ${s.title}` : `Collapse ${s.title}`}
                      aria-label={isCollapsed ? `Expand ${s.title}` : `Collapse ${s.title}`}
                    >
                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>
                </div>

                {isCollapsed ? (
                  <p
                    onClick={() => toggleSection(s.id)}
                    style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.7 }}
                  >
                    {content.slice(0, 90)}... <span style={{ color: 'var(--primary)', fontWeight: 600 }}>[Click to Expand]</span>
                  </p>
                ) : (
                  <p className="analysis-card-content" style={{ whiteSpace: 'pre-wrap', ...(s.id === 'warning' ? { color: sevColor, fontWeight: 600 } : {}) }}>
                    <GlossaryText text={content} currentLanguage={i18n?.language || 'en'} />
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Scenario Simulator ── */}
        {response.scenarios?.length > 0 && (
          <ScenarioSimulator scenarios={response.scenarios} />
        )}

        {/* ── Historical Precedent (Mini-RAG) ── */}
        {featureFlags['enableMiniRAG'] && response.precedents?.length > 0 && (
           <div style={{ marginTop: '2rem' }}>
              <PrecedentPanel precedents={response.precedents} />
           </div>
        )}

        {/* ── Predictive Forecasting Panel ── */}
        {response.forecast && (
          <motion.div {...fadeUp(0.5)} className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid rgba(132,85,239,0.3)', background: 'linear-gradient(145deg, rgba(132,85,239,0.05), transparent)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={18} color="var(--primary)" /> {t('forecast.title')}
            </h3>
            <div className="forecast-grid" style={{ gap: '2rem' }}>
              {/* Success Rate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="label-sm">{t('forecast.success_chance')}</span>
                  <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
                    <Counter target={response.forecast.success_chance} suffix="%" />
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${response.forecast.success_chance}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }} style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                </div>
              </div>
              {/* Fine Reduction */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="label-sm">{t('forecast.penalty_reduction')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                    <Counter target={response.forecast.penalty_reduction} suffix="%" />
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${response.forecast.penalty_reduction}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
                </div>
              </div>
              {/* Lawyer Necessity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="label-sm">👨‍⚖️ Lawyer Necessity</span>
                  <span style={{ fontWeight: 700, color: sevColor, fontSize: '1rem' }}>
                    <Counter target={sev === 'HIGH' ? 95 : sev === 'MEDIUM' ? 65 : 30} suffix="%" />
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${sev === 'HIGH' ? 95 : sev === 'MEDIUM' ? 65 : 30}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.9 }} style={{ height: '100%', background: `linear-gradient(90deg, ${sevColor}, ${sevColor}88)` }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', background: `rgba(${sev === 'HIGH' ? '239,68,68' : sev === 'LOW' ? '34,197,94' : '132,85,239'},0.06)`, borderRadius: '8px', borderLeft: `3px solid ${sev === 'HIGH' ? '#ef4444' : sev === 'LOW' ? '#22c55e' : 'var(--primary)'}` }}>
              <p style={{ fontSize: '0.83rem', color: 'var(--on-surface-variant)', fontStyle: 'italic', margin: 0 }}>"{response.forecast.trend}"</p>
            </div>
          </motion.div>
        )}

        {/* ── Legal Deadline Calculator ── */}
        <DeadlinePanel deadlines={response.deadlines} />

        {/* ── Agent Panel: Checklist + Document Generator ── */}
        {response.isAgentSession && response.agent_data && (
          <motion.div {...fadeUp(0.6)} style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' }} />
              {t('agent.title')}
            </h2>

            <div className="agent-grid" style={{ gap: '1rem' }}>
              {/* Evidence Checklist */}
              <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', cursor: 'pointer' }} onClick={() => setShowChecklist(!showChecklist)}>
                  <h4 style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <CheckSquare size={15} /> {t('agent.checklist')}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>{doneCount}/{checklist.length}</span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${checklist.length ? (doneCount / checklist.length) * 100 : 0}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: '#10b981' }} />
                </div>
                {showChecklist && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {checklist.map((item, i) => (
                      <li key={i} onClick={() => toggleChecklist(i)} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer', alignItems: 'flex-start', textDecoration: checklistDone[i] ? 'line-through' : 'none', opacity: checklistDone[i] ? 0.5 : 1, transition: 'all 0.2s' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: checklistDone[i] ? 'none' : '1px solid rgba(255,255,255,0.25)', background: checklistDone[i] ? '#10b981' : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                          {checklistDone[i] && <span style={{ fontSize: 10, color: '#fff' }}>✓</span>}
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {doneCount === checklist.length && checklist.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', fontSize: '0.75rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
                    ✅ All items complete
                  </motion.div>
                )}
              </div>

              {/* Document Generator */}
              <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <FileText size={15} /> {t('agent.draft')}
                  </h4>
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={handleCopyDraft} title="Copy" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Copy size={11} /> {copied ? '✓' : 'Copy'}
                    </button>
                    <button onClick={handlePrint} title="Print / Save PDF" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Printer size={11} /> PDF
                    </button>
                  </div>
                </div>

                {/* Document type tabs */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                  {DocumentEngine.getTypes().map(dt => (
                    <button key={dt.id} onClick={() => setDocType(dt.id)} style={{ background: docType === dt.id ? 'rgba(132,85,239,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${docType === dt.id ? 'rgba(132,85,239,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer', color: docType === dt.id ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: '0.68rem', fontWeight: docType === dt.id ? 700 : 400, transition: 'all 0.2s' }}>
                      {dt.icon} {dt.label.replace(/^[^\s]+\s/, '')}
                    </button>
                  ))}
                </div>

                {/* Document preview */}
                <div id="lawforge-print-area" style={{ background: '#fff', borderRadius: '4px', padding: '1.25rem', color: '#1a1a1a', fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'pre-wrap', lineHeight: 1.7, position: 'relative', maxHeight: '320px', overflowY: 'auto' }}>
                  <div style={{ position: 'sticky', top: 0, left: 0, right: 0, padding: '0.2rem', background: '#dc2626', color: '#fff', fontSize: '0.55rem', textAlign: 'center', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem', borderRadius: '2px' }}>
                    ⚠️ {t('agent.disclaimer')}
                  </div>
                  <div
                    contentEditable={docEditing}
                    suppressContentEditableWarning
                    ref={draftRef}
                    onBlur={(e) => setDocContent(e.currentTarget.innerText)}
                    style={{ outline: docEditing ? `1px dashed rgba(132,85,239,0.5)` : 'none', minHeight: 80 }}
                  >
                    {docContent}
                  </div>
                </div>
                <button onClick={() => setDocEditing(!docEditing)} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--on-surface-variant)', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.5 }}>
                  {docEditing ? '✓ Done editing' : '✏️ Edit draft'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Smart Settlement ── */}
        {featureFlags['enableSmartSettlement'] && (
          <motion.div {...fadeUp(0.78)}>
            <SmartSettlement response={response} />
          </motion.div>
        )}

        {/* ── Red-Line Analyzer ── */}
        {featureFlags['enableRedlineAnalysis'] && (
          <motion.div {...fadeUp(0.8)}>
            <RedlineAnalyzer />
          </motion.div>
        )}

        {/* ── Adversarial Simulator ── */}
        {featureFlags['enableAdversarialSimulator'] && (
          <motion.div {...fadeUp(0.85)} style={{ marginTop: '2rem' }}>
            <AdversarialSimulator />
          </motion.div>
        )}

        {/* ── Confidence Footer ── */}
        <motion.div {...fadeUp(0.75)} className="glass-card" style={{ marginTop: '2rem', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div><span className="label-sm" style={{ opacity: 0.4 }}>{t('response.confidence')}</span><br /><span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fbbf24' }}>🟡 MEDIUM</span></div>
            <div><span className="label-sm" style={{ opacity: 0.4 }}>{t('response.verified')}</span><br /><span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span></div>
            <div><span className="label-sm" style={{ opacity: 0.4 }}>{t('response.engine')}</span><br /><span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {import.meta.env.VITE_GEMINI_API_KEY ? '⚡ Gemini Flash' : '🔒 LAWFORGE Offline'}
            </span></div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.5, maxWidth: '400px', lineHeight: 1.5 }}>
            {t('response.disclaimer_short')}
          </p>
        </motion.div>
      </div>

      {/* Print-only styles handled by CSS @media print */}
    </div>
  )
}
