// src/phase6/settlement/SmartSettlement.jsx
import { useState } from 'react';
import { Handshake, QrCode, Lock, CheckCircle2, FileDown, Loader2 } from 'lucide-react';
import { SettlementEngine } from './SettlementEngine';
import { QRGenerator } from './QRGenerator';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

export function SmartSettlement({ response }) {
  const { situation } = useStore();

  const [partyAName, setPartyAName] = useState('');
  const [partyBName, setPartyBName] = useState('');
  const [agreementText, setAgreementText] = useState('');
  const [hash, setHash] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Defensive icon helper: prevents crash if an icon is missing in this version of lucide
  const IconRender = (Component, size = 16, color) => {
    if (typeof Component !== 'function' && typeof Component !== 'object') {
       return <span style={{ width: size, height: size, display: 'inline-block' }}>•</span>;
    }
    return <Component size={size} color={color} />;
  };

  const handleGenerate = async () => {
    setErrorMsg(null);
    if (!partyAName.trim() || !partyBName.trim()) {
      alert('Please enter both party names before generating the agreement.');
      return;
    }
    setIsGenerating(true);
    try {
      console.log("[SmartSettlement] Starting generation...");
      // Step 1: Build structured agreement text
      const text = SettlementEngine.buildAgreement(response, situation, partyAName, partyBName);
      setAgreementText(text);

      // Step 2: Hash the agreement
      const h = await SettlementEngine.hashAgreement(text);
      setHash(h);

      // Step 3: Encode for QR
      const qrPayload = SettlementEngine.encodeForQR(text, h);

      // Step 4: Generate QR data URL
      const url = await QRGenerator.toDataURL(qrPayload);
      setQrDataUrl(url);
      
      if (!url) {
        console.warn("[SmartSettlement] Component: QR generation returned empty url");
      }
    } catch (e) {
      console.error('Settlement generation error:', e);
      setErrorMsg("Failed to generate secure agreement. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignAndLock = async () => {
    setIsSigned(true);
    // Log hash into the console as an Evidence Vault event (EvidenceHasher not needed for a text hash)
    console.info('[LawForge Evidence Vault] Settlement locked. SHA-256:', hash);
  };

  const handleExportPDF = async () => {
    if (!agreementText || !qrDataUrl) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // Agreement text
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(9);
      const lines = pdf.splitTextToSize(agreementText, 480);
      pdf.text(lines, 56, 60);

      // QR code image below text
      const textHeight = lines.length * 11;
      const qrY = Math.min(60 + textHeight + 20, 620);
      pdf.addImage(qrDataUrl, 'PNG', 200, qrY, 200, 200);
      pdf.setFontSize(8);
      pdf.text('Scan to verify settlement terms', 225, qrY + 210);

      pdf.save('settlement-agreement.pdf');
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '0.65rem 1rem',
    color: 'var(--on-surface)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    flex: 1,
    minWidth: 0,
    transition: 'border-color 0.2s',
    pointerEvents: isSigned ? 'none' : 'auto',
    opacity: isSigned ? 0.5 : 1,
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderLeft: '4px solid #7c3aed' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>
        {IconRender(Handshake, 20, "#7c3aed")}
        Smart Settlement QR Escrow
      </h3>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {errorMsg}
        </div>
      )}

      {/* Party Name Inputs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          style={inputStyle}
          placeholder="Your Name (Party A)"
          value={partyAName}
          onChange={e => !isSigned && setPartyAName(e.target.value)}
          disabled={isSigned}
        />
        <input
          style={inputStyle}
          placeholder="Opposing Party Name (Party B)"
          value={partyBName}
          onChange={e => !isSigned && setPartyBName(e.target.value)}
          disabled={isSigned}
        />
      </div>

      {/* Generate Button */}
      {!agreementText && (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            border: 'none', borderRadius: '10px', padding: '0.65rem 1.5rem',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            cursor: isGenerating ? 'wait' : 'pointer', transition: 'opacity 0.2s',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? <div className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : IconRender(QrCode, 16)}
          {isGenerating ? 'Generating…' : 'Generate Agreement & QR'}
        </button>
      )}

      <AnimatePresence>
        {agreementText && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Agreement Preview Card with DRAFT watermark */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              {!isSigned && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-30deg)',
                  fontSize: '4rem', fontWeight: 900, color: 'rgba(239,68,68,0.08)',
                  pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap', zIndex: 0
                }}>
                  DRAFT
                </div>
              )}
              <pre style={{
                position: 'relative', zIndex: 1,
                background: 'rgba(0,0,0,0.25)', borderRadius: '10px',
                padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.72rem',
                lineHeight: 1.7, color: 'var(--on-surface)', maxHeight: '260px',
                overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                border: isSigned ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)',
                pointerEvents: isSigned ? 'none' : 'auto',
              }}>
                {agreementText}
              </pre>
            </div>

            {/* QR Code + Hash Badge row */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {qrDataUrl && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={qrDataUrl}
                    alt="Settlement QR"
                    style={{ width: 200, height: 200, borderRadius: '10px', border: '2px solid rgba(124,58,237,0.4)' }}
                  />
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                    Scan to acknowledge terms on any device
                  </p>
                </div>
              )}

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Hash Badge */}
                {hash && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '999px', padding: '0.35rem 0.85rem', fontSize: '0.72rem',
                    fontFamily: 'monospace', fontWeight: 600, color: '#a78bfa',
                    width: 'fit-content',
                  }}>
                    🔐 {hash.slice(0, 16)}…
                  </div>
                )}

                {/* Sign & Lock or Locked Badge */}
                {!isSigned ? (
                  <button
                    onClick={handleSignAndLock}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem',
                      color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                      cursor: 'pointer', width: 'fit-content',
                    }}
                  >
                    {IconRender(Lock, 15)} Sign & Lock Agreement
                  </button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
                      borderRadius: '10px', padding: '0.65rem 1.25rem', width: 'fit-content',
                      color: '#10b981', fontWeight: 700, fontSize: '0.85rem',
                    }}
                  >
                    {IconRender(CheckCircle2, 16)} Agreement Locked
                  </motion.div>
                )}

                {/* Export PDF Button */}
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px', padding: '0.55rem 1rem', color: 'var(--on-surface)',
                    fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer', width: 'fit-content',
                    transition: 'all 0.2s',
                  }}
                >
                  {isExporting ? <div className="spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : IconRender(FileDown, 14)}
                  Export Agreement PDF
                </button>

                {/* Regenerate */}
                {!isSigned && (
                  <button
                    onClick={() => { setAgreementText(''); setHash(''); setQrDataUrl(''); }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--on-surface-variant)',
                      fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0,
                    }}
                  >
                    ↩ Re-generate
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
