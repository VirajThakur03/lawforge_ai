import { motion } from 'framer-motion'
import { useState } from 'react'
import { Calendar, Clock, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DeadlineEngine } from '../engine/DeadlineEngine'
import { CalendarManager } from './CalendarManager'

const URGENCY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', pulse: true,  label: 'CRITICAL' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', pulse: true,  label: 'URGENT' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', pulse: false, label: 'SOON' },
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', pulse: false, label: 'PLANNED' },
}

function DeadlineRow({ deadline, index }) {
  const cfg = URGENCY_CONFIG[deadline.urgency] || URGENCY_CONFIG.low

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1rem', borderRadius: '10px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        marginBottom: '0.5rem',
      }}
    >
      {/* Urgency dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: cfg.color, flexShrink: 0,
        boxShadow: cfg.pulse ? `0 0 8px ${cfg.color}` : 'none',
        animation: cfg.pulse ? 'pulse 2s ease-in-out infinite' : 'none'
      }} />

      {/* Title + source */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>
          {deadline.title}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
          {deadline.source}
        </div>
      </div>

      {/* Days remaining */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
          {deadline.daysRemaining}
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          days
        </div>
      </div>

      {/* Due date */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface)' }}>
          {deadline.dueDate}
        </div>
        <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: cfg.border, color: cfg.color, fontWeight: 700 }}>
          {cfg.label}
        </span>
      </div>

      {/* Calendar download */}
      <button
        onClick={() => CalendarManager.downloadICS(deadline.title, deadline.dueDate, deadline.source)}
        title="Add to Calendar (.ics)"
        style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer',
          color: 'var(--on-surface-variant)', flexShrink: 0,
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        <Calendar size={13} />
      </button>
    </motion.div>
  )
}

export function DeadlinePanel({ deadlines = [] }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  if (!deadlines || deadlines.length === 0) return null

  const criticalCount = deadlines.filter(d => d.urgency === 'critical' || d.urgency === 'high').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="glass-card"
      style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}
    >
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: collapsed ? 0 : '1.25rem', cursor: 'pointer' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
          <Clock size={18} color="#ef4444" />
          {t('deadline.title', 'Legal Action Deadlines')}
          {criticalCount > 0 && (
            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 700 }}>
              {criticalCount} {t('deadline.urgent', 'URGENT')}
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              CalendarManager.downloadAllICS(deadlines, 'Court-Deadlines');
            }}
            className="btn-glass"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', borderColor: 'rgba(186,158,255,0.3)' }}
            title="Download all deadlines into a single .ics calendar"
          >
            <Calendar size={13} />
            <span>Sync All (.ics)</span>
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: '0.25rem' }}>
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {deadlines.map((dl, i) => (
            <DeadlineRow key={i} deadline={dl} index={i} />
          ))}
          <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.5, margin: '1rem 0 0', lineHeight: 1.5 }}>
            {t('deadline.disclaimer', 'Deadlines are calculated from today\'s date. Verify with a licensed attorney. Click 📅 to add to calendar.')}
          </p>
        </>
      )}
    </motion.div>
  )
}
