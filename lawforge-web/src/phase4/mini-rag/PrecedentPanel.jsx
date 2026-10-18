// src/phase4/mini-rag/PrecedentPanel.jsx
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export function PrecedentPanel({ precedents }) {
  if (!precedents || precedents.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.4rem', borderRadius: '8px' }}>
          <BookOpen size={18} style={{ color: '#ec4899' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Historical Precedents</h3>
        <span className="badge badge-medium" style={{ marginLeft: 'auto' }}>Mini-RAG Search</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {precedents.map((p, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #ec4899' }}>
            <div style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              {p.category}
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>
              {p.title}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, opacity: 0.9 }}>
              {p.summary}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
