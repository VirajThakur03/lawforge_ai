import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../store';
import { AIEngine } from '../engine/AIEngine';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

export function LanguageSwitcher({ align = 'left' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { response, selectedCountry, situation, setResponse, setLoading, view } = useStore();

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  // Close on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = async (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);

    if (view === 'response' && response && selectedCountry && situation) {
      setLoading(true);
      try {
        const result = await AIEngine.query(selectedCountry.code, selectedCountry.name, situation, null, code);
        setResponse(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', zIndex: isOpen ? 9999 : 10 }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-glass"
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.45rem', 
          padding: '0.45rem 0.85rem', 
          borderRadius: '20px', 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          color: 'var(--on-surface)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid rgba(186, 158, 255, 0.2)',
          background: isOpen ? 'rgba(132, 85, 239, 0.15)' : 'rgba(27, 37, 62, 0.6)',
          cursor: 'pointer'
        }}
        title="Select Language"
      >
        <Globe size={14} style={{ color: 'var(--primary)' }} />
        <span>{currentLang.name}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="glass"
            style={{
              position: 'absolute', 
              top: 'calc(100% + 8px)', 
              left: align === 'left' ? 0 : 'auto',
              right: align === 'right' ? 0 : 'auto',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px',
              padding: '0.5rem', 
              borderRadius: '14px', 
              minWidth: '160px',
              zIndex: 99999, 
              border: '1px solid rgba(186, 158, 255, 0.25)',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(132, 85, 239, 0.15)',
              background: 'rgba(16, 25, 46, 0.96)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
              Select Language
            </div>
            {LANGUAGES.map(lang => {
              const active = lang.code === currentLang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '0.85rem', 
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--primary)' : 'var(--on-surface)',
                    background: active ? 'rgba(132, 85, 239, 0.18)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {active && <Check size={14} style={{ color: 'var(--primary)' }} />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
