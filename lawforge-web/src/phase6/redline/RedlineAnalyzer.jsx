// src/phase6/redline/RedlineAnalyzer.jsx
import { useRef, useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Eye, EyeOff, Download, Copy, Check, Sparkles, ShieldAlert } from 'lucide-react';
import { PDFRenderer } from './PDFRenderer';
import { HighlightEngine } from './HighlightEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * RedlineAnalyzer can work in two modes:
 * 1. Standalone upload mode (no props) — upload + call AI
 * 2. Result mode (result prop from DocumentUploader) — uses existing toxicClauses
 */
export function RedlineAnalyzer({ result }) {
  const cleanContainerRef = useRef(null);
  const markedContainerRef = useRef(null);

  const [file, setFile] = useState(result?.file || null);
  const [isRendering, setIsRendering] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [renderedPages, setRenderedPages] = useState([]);
  const [toxicClauses, setToxicClauses] = useState(result?.toxicClauses || []);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const getSubstituteClause = (clause) => {
    if (clause.fix) return clause.fix;
    const t = (clause.type || '').toLowerCase();
    const q = (clause.quote || '').toLowerCase();
    if (t.includes('indemn') || q.includes('indemn')) {
      return "Each party agrees to indemnify and hold harmless the other party strictly against third-party claims arising from gross negligence or willful misconduct, capped at the total contract value paid in the preceding 12 months.";
    }
    if (t.includes('non-compete') || q.includes('compete') || q.includes('restraint')) {
      return "During the term of this Agreement and for a period of six (6) months following termination, the Contractor shall not solicit proprietary enterprise clients directly introduced during this engagement, limited strictly to the geographical area of actual operation.";
    }
    if (t.includes('liabilit') || q.includes('liabilit') || q.includes('damages')) {
      return "Neither party shall be liable for indirect, incidental, or consequential damages. Total aggregate liability for direct claims shall not exceed the fees paid under this Agreement.";
    }
    if (t.includes('termination') || q.includes('terminat')) {
      return "Either party may terminate this Agreement without cause upon providing thirty (30) business days prior written notice, subject to payment for deliverables completed prior to notice.";
    }
    return "The parties agree to execute a mutually negotiated amendment to bring this clause into standard commercial parity under applicable statutory standards.";
  };

  const handleCopySubstitute = (clause, idx) => {
    const text = getSubstituteClause(clause);
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const loadSampleContract = () => {
    setToxicClauses([
      {
        type: 'Unilateral Indemnification',
        severity: 'HIGH',
        quote: 'Contractor shall defend, indemnify, and hold harmless Enterprise from any and all claims, losses, or legal costs arising without limitation.',
        explanation: 'Extreme one-sided indemnification with no cap and no reciprocal protection.'
      },
      {
        type: 'Infinite Non-Compete',
        severity: 'HIGH',
        quote: 'Contractor agrees not to engage in any competing software development globally for three (3) years post-termination.',
        explanation: 'Overbroad global restraint of trade, legally unenforceable in most jurisdictions but creates high litigation exposure.'
      },
      {
        type: 'Unlimited Consequential Liability',
        severity: 'MEDIUM',
        quote: 'Enterprise retains the right to claim lost future profits, indirect damages, and punitive penalties.',
        explanation: 'Absence of mutual waiver for indirect or consequential damages exposes contractor to uncapped commercial liability.'
      }
    ]);
  };

  // Auto-render when result prop is provided
  useEffect(() => {
    if (result?.file) {
      setFile(result.file);
      setToxicClauses(result.toxicClauses || []);
    }
  }, [result]);

  // Render PDF whenever file changes
  useEffect(() => {
    if (!file) return;
    renderPDF(file);
  }, [file]);

  // Re-apply overlays when showOverlay or renderedPages change
  useEffect(() => {
    if (renderedPages.length === 0 || !markedContainerRef.current) return;
    // Clone clean pages into marked container
    const markedPages = PDFRenderer.cloneInto(renderedPages, markedContainerRef);
    if (showOverlay && toxicClauses.length > 0) {
      HighlightEngine.applyAll(markedPages, toxicClauses);
    }
  }, [showOverlay, renderedPages, toxicClauses]);

  const renderPDF = async (pdfFile) => {
    setIsRendering(true);
    setError('');
    setRenderedPages([]);
    try {
      const pages = await PDFRenderer.renderPages(pdfFile, cleanContainerRef);
      setRenderedPages(pages);
    } catch (e) {
      console.error(e);
      setError('Failed to render PDF. Ensure it is a text-based PDF (not scanned image).');
    } finally {
      setIsRendering(false);
    }
  };

  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (!f || f.type !== 'application/pdf') { setError('Please upload a valid PDF.'); return; }
    setFile(f);
  };

  const handleDownload = async () => {
    if (!markedContainerRef.current) return;
    setIsExporting(true);
    try {
      const snapshot = await html2canvas(markedContainerRef.current, { scale: 1.5, useCORS: true });
      const imgData = snapshot.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [snapshot.width, snapshot.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, snapshot.width, snapshot.height);
      pdf.save('redline-analysis.pdf');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const severityColor = (s) => s === 'HIGH' ? '#ef4444' : '#f59e0b';
  const severityBg = (s) => s === 'HIGH' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, margin: 0 }}>
          <FileText size={20} color="#ef4444" />
          Red-Line Contract Analyzer
        </h3>

        {renderedPages.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className="btn-glass"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {showOverlay ? <EyeOff size={14} /> : <Eye size={14} />}
              {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="btn-glass"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isExporting ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
              Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Upload zone — only shown when no file and no result prop */}
      {!file && !result?.file && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2.5rem', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '12px',
            cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
          }}>
            <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Upload Contract PDF</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.3rem' }}>
              Toxic clauses highlighted directly on the document
            </span>
            <input type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={loadSampleContract}
              className="btn-glass"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)', borderColor: 'rgba(0,227,253,0.3)' }}
            >
              <Sparkles size={13} />
              Load High-Risk Sample Contract & Redline
            </button>
          </div>
        </div>
      )}

      {isRendering && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', justifyContent: 'center' }}>
          <Loader2 size={28} className="spin" style={{ color: '#ef4444' }} />
          <span>Rendering PDF and applying analysis…</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem' }}>
          {error}
        </div>
      )}

      {/* Two-panel PDF layout */}
      {renderedPages.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', overflowX: 'auto' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Original
            </p>
            <div ref={cleanContainerRef} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#ef4444', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Red-Lined
            </p>
            <div ref={markedContainerRef} style={{ border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', overflow: 'hidden' }} />
          </div>
        </div>
      )}

      {/* Toxic clause cards */}
      {toxicClauses.length > 0 && (
        <AnimatePresence>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {toxicClauses.length} Risk{toxicClauses.length !== 1 ? 's' : ''} Identified
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {toxicClauses.map((clause, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    padding: '0.875rem 1rem',
                    background: severityBg(clause.severity),
                    border: `1px solid ${severityColor(clause.severity)}44`,
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <AlertCircle size={14} color={severityColor(clause.severity)} />
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: severityColor(clause.severity) }}>
                      {clause.severity || 'MEDIUM'} — {clause.type || 'Risk'}
                    </span>
                  </div>
                  {clause.quote && (
                    <blockquote style={{ margin: '0 0 0.4rem 0', paddingLeft: '0.75rem', borderLeft: `2px solid ${severityColor(clause.severity)}66`, fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                      "{clause.quote}"
                    </blockquote>
                  )}
                  {clause.explanation && (
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem' }}>{clause.explanation}</p>
                  )}

                  {/* Inline Suggested Substitute Clause */}
                  <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00e3fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Sparkles size={11} /> Suggested Balanced Substitute
                      </span>
                      <button
                        onClick={() => handleCopySubstitute(clause, i)}
                        className="btn-glass"
                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {copiedIndex === i ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                        {copiedIndex === i ? 'Copied' : 'Copy Clause'}
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>
                      "{getSubstituteClause(clause)}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatePresence>
      )}

      {renderedPages.length > 0 && toxicClauses.length === 0 && !isRendering && (
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
          ✅ No alarming clauses detected.
        </p>
      )}
    </div>
  );
}
