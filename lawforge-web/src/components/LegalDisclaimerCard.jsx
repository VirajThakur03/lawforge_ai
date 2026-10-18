// src/components/LegalDisclaimerCard.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { ShieldAlert, Info, ExternalLink, X, Check } from 'lucide-react';

export function LegalDisclaimerCard({ country }) {
  const { disclaimerDismissed, setDisclaimerDismissed } = useStore();
  const [showFullNotice, setShowFullNotice] = useState(false);

  if (disclaimerDismissed && !showFullNotice) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
        transition={{ duration: 0.3 }}
        style={{
          margin: '0 0 1.5rem 0',
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.05))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}
            >
              <ShieldAlert size={16} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>
              Official Legal Notice & Intelligence Boundary ({country?.name || 'Global'})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowFullNotice(!showFullNotice)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              {showFullNotice ? 'Less Details' : 'Why this limitation?'}
            </button>
            <button
              onClick={() => setDisclaimerDismissed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--on-surface-variant)',
                cursor: 'pointer',
                opacity: 0.7,
                padding: '2px'
              }}
              title="Dismiss for this session"
              aria-label="Dismiss notice"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
          LAWFORGE AI provides algorithmic statutory analysis, precedent indexing, and automated defense preparation. It does not establish an attorney-client relationship. In critical proceedings (felonies, arrests, deportation), immediately retain licensed local counsel.
        </p>

        {showFullNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              color: 'var(--on-surface-variant)',
              lineHeight: 1.6
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--on-surface)' }}>1. Statutory Accuracy Guarantee:</strong> Online mode utilizes live Google Search grounding to retrieve real-time statutory amendments and gazettes. Offline sovereign mode references on-device verified snapshot datasets.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--on-surface)' }}>2. Zero Telemetry Privacy:</strong> Your legal situations and vault records are stored exclusively in local browser storage (IndexedDB/WebCrypto). No attorney or third-party entity has visibility into your queries.
            </div>
            <div>
              <strong style={{ color: 'var(--on-surface)' }}>3. Official Resources:</strong> If you cannot afford representation, consult your local Legal Aid Society or National Bar Association for court-appointed public defense.
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setDisclaimerDismissed(true)}
                className="btn-glass"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Check size={12} /> Got It, Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
