// src/components/GlossaryTooltip.jsx
import { useState } from 'react';
import { legalGlossary } from '../data/legalGlossary';

function GlossaryTooltip({ term, data, language }) {
  const [hovered, setHovered] = useState(false);
  
  // Use localized term/definition if active language is available in locales override
  const activeData = (language && data.locales?.[language]) ? data.locales[language] : data;

  return (
    <span 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        color: 'var(--secondary)',
        fontWeight: 700,
        cursor: 'help',
        borderBottom: '1px dashed var(--secondary)',
        padding: '0 2px'
      }}
    >
      {term}
      
      {hovered && (
        <span 
          style={{
            position: 'absolute',
            bottom: '130%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 10, 26, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 227, 253, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 0.875rem',
            width: '260px',
            color: '#fff',
            fontSize: '0.75rem',
            boxShadow: '0 10px 25px rgba(0, 227, 253, 0.15)',
            zIndex: 99999,
            lineHeight: 1.4,
            textAlign: 'left',
            fontWeight: 400,
            pointerEvents: 'none',
            display: 'block'
          }}
        >
          <strong style={{ display: 'block', color: 'var(--secondary)', marginBottom: '0.3rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {activeData.term}
          </strong>
          {activeData.definition}
          {language !== 'en' && data.locales?.[language] && (
            <span style={{ display: 'block', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.4rem', paddingTop: '0.4rem', color: '#10b981', fontSize: '0.65rem' }}>
              English definition: {data.definition}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/**
 * GlossaryText component parses text, splits by glossary keys,
 * and inserts GlossaryTooltip triggers.
 */
export function GlossaryText({ text, currentLanguage = 'en' }) {
  if (!text) return null;
  
  const terms = Object.keys(legalGlossary);
  if (terms.length === 0) return <span>{text}</span>;
  
  // Sort terms by length descending to match longer multi-word phrases (e.g. force majeure) first
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
  
  const pattern = new RegExp(`\\b(${sortedTerms.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);
  
  return (
    <span>
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const termData = legalGlossary[lowerPart];
        
        if (termData) {
          return (
            <GlossaryTooltip 
              key={i} 
              term={part} 
              data={termData} 
              language={currentLanguage} 
            />
          );
        }
        
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
