import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export function Toast() {
  const { toast, toasts, dismissToast, hideToast } = useStore();

  // Support both single toast and array of toasts
  const activeList = toasts && toasts.length > 0 
    ? toasts 
    : (toast ? [toast] : []);

  if (activeList.length === 0) return null;

  const icons = {
    success: <CheckCircle2 size={16} color="#10b981" />,
    warning: <AlertTriangle size={16} color="#f59e0b" />,
    error: <XCircle size={16} color="#ef4444" />,
    info: <Info size={16} color="var(--secondary)" />
  };

  const borders = {
    success: 'rgba(16, 185, 129, 0.35)',
    warning: 'rgba(245, 158, 11, 0.35)',
    error: 'rgba(239, 68, 68, 0.35)',
    info: 'rgba(0, 227, 253, 0.35)'
  };

  const backgrounds = {
    success: 'rgba(16, 185, 129, 0.15)',
    warning: 'rgba(245, 158, 11, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
    info: 'rgba(0, 227, 253, 0.15)'
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '2rem', 
        right: '2rem', 
        zIndex: 999999, 
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-end'
      }}
    >
      <AnimatePresence>
        {activeList.map((item) => {
          const currentType = item.type || 'info';
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1.15rem',
                borderRadius: '12px',
                background: 'var(--surface-high, rgba(11, 19, 38, 0.95))',
                border: `1px solid ${borders[currentType]}`,
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 227, 253, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: 'var(--on-surface)',
                fontSize: '0.85rem',
                fontWeight: 500,
                maxWidth: '420px',
                minWidth: '260px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '8px',
                background: backgrounds[currentType]
              }}>
                {icons[currentType] || icons.info}
              </div>

              <span style={{ flex: 1, lineHeight: 1.4 }}>{item.message}</span>

              <button
                onClick={() => dismissToast ? dismissToast(item.id) : hideToast()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--on-surface-variant)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.6,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                title="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
