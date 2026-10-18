import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useEffect } from 'react'

const SHORTCUTS = [
  {
    section: 'Navigation',
    items: [
      { keys: ['Ctrl', 'K'], desc: 'Open Command Palette' },
      { keys: ['?'], desc: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', 'Shift', 'E'], desc: 'Toggle Enterprise OS' },
      { keys: ['Esc'], desc: 'Close modals / palettes' },
    ]
  },
  {
    section: 'Analysis',
    items: [
      { keys: ['Ctrl', 'Enter'], desc: 'Run legal analysis' },
      { keys: ['Ctrl', 'Shift', 'V'], desc: 'Toggle voice input' },
      { keys: ['Ctrl', 'Shift', 'A'], desc: 'Toggle Agent Mode' },
    ]
  },
  {
    section: 'Dashboard Tabs',
    items: [
      { keys: ['Alt', '1'], desc: 'Go to Vault tab' },
      { keys: ['Alt', '2'], desc: 'Go to Countries tab' },
      { keys: ['Alt', '3'], desc: 'Go to History tab' },
      { keys: ['Alt', '4'], desc: 'Go to Settings tab' },
    ]
  },
  {
    section: 'Report Actions',
    items: [
      { keys: ['Ctrl', 'P'], desc: 'Print / Export report' },
      { keys: ['Ctrl', 'C'], desc: 'Copy selected citation' },
      { keys: ['Ctrl', 'D'], desc: 'Download case backup' },
    ]
  }
]

export function KeyboardShortcutsPanel({ isOpen, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(7, 14, 30, 0.8)',
              backdropFilter: 'blur(8px)'
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10001,
              width: '660px', maxWidth: '95vw',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'rgba(11, 19, 38, 0.98)',
              border: '1px solid rgba(186,158,255,0.2)',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(132,85,239,0.08)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: 'rgba(186,158,255,0.1)',
                  border: '1px solid rgba(186,158,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Keyboard size={18} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--on-surface)' }}>
                    Keyboard Shortcuts
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
                    LAWFORGE AI · Sovereign Terminal Controls
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '0.4rem', borderRadius: '8px', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {SHORTCUTS.map(section => (
                <div key={section.section}>
                  <div style={{
                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--primary)', opacity: 0.8,
                    marginBottom: '0.75rem'
                  }}>
                    {section.section}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {section.items.map(item => (
                      <div
                        key={item.desc}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                          {item.desc}
                        </span>
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          {item.keys.map((k, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <kbd style={{
                                padding: '2px 7px', borderRadius: '5px',
                                background: 'rgba(186,158,255,0.1)',
                                border: '1px solid rgba(186,158,255,0.25)',
                                color: 'var(--primary)',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.72rem', fontWeight: 700
                              }}>
                                {k}
                              </kbd>
                              {i < item.keys.length - 1 && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', opacity: 0.4 }}>+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '1.5rem', paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', opacity: 0.5 }}>
                Press <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--on-surface)', fontFamily: 'var(--font-display)', fontSize: '0.7rem' }}>?</kbd> or <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--on-surface)', fontFamily: 'var(--font-display)', fontSize: '0.7rem' }}>Esc</kbd> to close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
