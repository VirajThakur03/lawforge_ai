// src/components/LegalPagesModal.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, FileText, X, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export function LegalPagesModal({ initialTab = 'privacy', isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'rgba(5, 11, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a1022',
            border: '1px solid rgba(186, 158, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(132, 85, 239, 0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(132, 85, 239, 0.15)',
                border: '1px solid rgba(186, 158, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Shield size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                  LAWFORGE AI Legal & Trust Center
                </h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
                  Sovereign Architecture & Regulatory Disclosures
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--on-surface)',
                cursor: 'pointer'
              }}
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}>
            {[
              { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={14} /> },
              { id: 'terms', label: 'Terms of Service', icon: <FileText size={14} /> },
              { id: 'security', label: 'Security & RFC 9116', icon: <Shield size={14} /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                    backgroundColor: isActive ? 'rgba(132, 85, 239, 0.15)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Content Body */}
          <div style={{
            padding: '1.75rem',
            overflowY: 'auto',
            fontSize: '0.88rem',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {activeTab === 'privacy' && (
              <>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                    Zero-Knowledge Privacy Policy
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    Effective Date: November 2026 · Global Compliance: GDPR (Art. 25 Privacy by Design) & DPDP Act 2023
                  </p>
                </div>

                <div style={{ background: 'rgba(0, 227, 253, 0.05)', border: '1px solid rgba(0, 227, 253, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00e3fd', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <CheckCircle size={16} /> Absolute Zero Server-Side Telemetry Guarantee
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    LAWFORGE AI operates on a sovereign, client-side paradigm. We do not operate user analytics trackers, marketing pixels, or centralized query databases. Your case strategy and evidence never touch a LAWFORGE server.
                  </p>
                </div>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    1. Data Processed Entirely in Browser Memory
                  </h4>
                  <p>
                    All statutory lookups, scenario computations, and court deadline calculations are performed locally in your browser sandbox using deterministic engines and local WebAssembly / WebGPU workers.
                  </p>
                </section>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    2. Cryptographic Evidence Vault (Local Storage)
                  </h4>
                  <p>
                    Case notes, evidence hashes, and matters stored in your local Evidence Vault and Enterprise CRM reside solely in your browser's <code>IndexedDB</code> and <code>localStorage</code>. Data is encrypted using AES-256-GCM with keys derived from your personal passphrase via PBKDF2 (100,000 iterations). We possess zero access to your cryptographic keys.
                  </p>
                </section>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    3. Optional "Bring Your Own Key" (BYOK) External AI Synthesis
                  </h4>
                  <p>
                    By default, LAWFORGE AI runs completely offline with zero network requests. If you optionally choose to input your personal Google Gemini API Key in the Settings tab for conversational synthesis, requests are transmitted directly and securely from your browser to Google's official endpoints over encrypted HTTPS. LAWFORGE AI does not proxy, log, or inspect these communications.
                  </p>
                </section>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    4. Your Right to Instant Erasure
                  </h4>
                  <p>
                    You retain total sovereignty over your machine. At any point, clicking the <strong>Emergency Panic Button</strong> or using the "Clear Vault" action permanently wipes all local cryptographic keys, matters, and IndexedDB stores from your browser.
                  </p>
                </section>
              </>
            )}

            {activeTab === 'terms' && (
              <>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                    Terms of Service & Intelligence Boundaries
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    Standard Open-Source Assistive License (MIT) · Governing Use of LAWFORGE AI
                  </p>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <AlertTriangle size={16} /> Assistive Legal Technology Notice
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                    LAWFORGE AI is an informational and procedural research intelligence tool. It does NOT provide formal legal representation, nor does its use establish an attorney-client relationship.
                  </p>
                </div>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    1. Informational & Research Purpose
                  </h4>
                  <p>
                    The statutory analyses, limitation deadlines, and scenario roadmaps generated by LAWFORGE AI are compiled from publicly enacted statutes (including India's BNS/BNSS/BSA, US Federal Rules, EU AI Act, and UK Common Law). They serve as assistive preparation materials for legal research, educational evaluation, and client intake structuring.
                  </p>
                </section>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    2. Obligation of Independent Verification
                  </h4>
                  <p>
                    Legal frameworks are subject to legislative amendment, administrative gazette updates, and judicial discretion. Users must independently verify all statutory sections, court limitation dates, and procedural requirements with a qualified advocate or attorney licensed in their jurisdiction prior to filing legal pleadings or taking irrevocable action.
                  </p>
                </section>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    3. Limitation of Liability
                  </h4>
                  <p>
                    LAWFORGE AI and its open-source contributors provide this software "AS IS", without warranty of any kind, express or implied. Under no circumstances shall the authors be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the software.
                  </p>
                </section>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                    Security Policy & RFC 9116 Disclosure
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    Standard Security Contact: <code>security@lawforge.ai</code> · PGP / SHA-256 Verified
                  </p>
                </div>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    1. Coordinated Vulnerability Disclosure
                  </h4>
                  <p>
                    We welcome vulnerability reports from independent security researchers. If you identify a potential security vulnerability in LAWFORGE AI, please submit a report directly to:
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: '0.82rem', color: '#00e3fd' }}>
                    Contact: security@lawforge.ai<br />
                    Canonical Policy: https://lawforge-ai-4wzf.vercel.app/.well-known/security.txt
                  </div>
                </section>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    2. Cryptographic Architecture Specifications
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li><strong>At-Rest Encryption:</strong> Authenticated AES-GCM 256-bit with random 12-byte initialization vectors per record.</li>
                    <li><strong>Key Derivation:</strong> PBKDF2 using SHA-256 with 100,000 hash iterations and cryptographically random 16-byte salts.</li>
                    <li><strong>Integrity Auditing:</strong> Immutable SHA-256 hash chains linking every operation in sequence to prevent post-hoc record alteration.</li>
                    <li><strong>Inactivity Auto-Lock:</strong> Inactivity supervisor automatically purges decrypted in-memory states after 15 minutes of idle time.</li>
                  </ul>
                </section>

                <section>
                  <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                    3. HTTP Security Headers
                  </h4>
                  <p>
                    Our production edge network enforces strict security headers including <code>Strict-Transport-Security: max-age=63072000; includeSubDomains; preload</code>, <code>X-Frame-Options: DENY</code>, <code>X-Content-Type-Options: nosniff</code>, and <code>Referrer-Policy: strict-origin-when-cross-origin</code>.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer Action */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
              LAWFORGE AI Core v6.1 · All computations sovereign to your device
            </span>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem' }}
            >
              Acknowledge & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

