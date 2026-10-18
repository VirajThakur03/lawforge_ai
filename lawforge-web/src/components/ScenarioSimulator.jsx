import { motion } from 'framer-motion'
import { useState } from 'react'
import { GitBranch, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const TYPE_CONFIG = {
  best:    { label: 'Best Path',    color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  icon: TrendingUp,   emoji: '✅' },
  neutral: { label: 'Neutral Path', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  icon: Minus,        emoji: '⚖️' },
  worst:   { label: 'Worst Path',   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   icon: TrendingDown, emoji: '⚠️' },
}

function ScenarioCard({ scenario, index, selected, onSelect }) {
  const { t } = useTranslation()
  const cfg = TYPE_CONFIG[scenario.type] || TYPE_CONFIG.neutral
  const Icon = cfg.icon
  const riskSign = scenario.risk_delta > 0 ? '+' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      onClick={() => onSelect(scenario.type)}
      style={{
        padding: '1.25rem', borderRadius: '14px', border: `1px solid ${selected ? cfg.color : cfg.border}`,
        background: selected ? cfg.bg : 'rgba(255,255,255,0.03)',
        cursor: 'pointer', transition: 'all 0.25s', position: 'relative',
        boxShadow: selected ? `0 0 24px ${cfg.color}20` : 'none',
      }}
      whileHover={{ scale: 1.02 }}
    >
      {scenario.recommendation && (
        <div style={{ position: 'absolute', top: -10, left: 12, background: '#10b981', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>
          RECOMMENDED
        </div>
      )}

      {/* Type header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '8px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={cfg.color} />
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {cfg.emoji} {t(`scenario.${scenario.type}`, cfg.label)}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: cfg.color, padding: '0.2rem 0.5rem', background: cfg.bg, borderRadius: '6px', border: `1px solid ${cfg.border}` }}>
          {riskSign}{scenario.risk_delta}% risk
        </div>
      </div>

      {/* Action */}
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.4 }}>
        <ChevronRight size={13} style={{ verticalAlign: 'middle', marginRight: 4, color: cfg.color }} />
        {scenario.action}
      </p>

      {/* Outcome */}
      <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: '1rem' }}>
        {scenario.outcome}
      </p>

      {/* Time + Cost chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--on-surface-variant)' }}>
          ⏱ {scenario.time_estimate}
        </span>
        <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--on-surface-variant)' }}>
          💰 {scenario.cost_estimate}
        </span>
      </div>

      {selected && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: `${cfg.color}15`, borderRadius: '6px', border: `1px solid ${cfg.border}` }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color }}>✓ PATH SELECTED</span>
        </div>
      )}
    </motion.div>
  )
}

export function ScenarioSimulator({ scenarios = [] }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(null)

  if (!scenarios || scenarios.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      style={{ marginTop: '2rem' }}
    >
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <GitBranch size={18} color="var(--primary)" />
        {t('scenario.title', '"What If" Scenario Simulator')}
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: '1.25rem' }}>
        {t('scenario.subtitle', 'See 3 possible outcome paths based on your next action. Click a path to select it.')}
      </p>

      <div className="scenario-grid" style={{ gap: '1rem' }}>
        {scenarios.map((s, i) => (
          <ScenarioCard
            key={s.type}
            scenario={s}
            index={i}
            selected={selected === s.type}
            onSelect={setSelected}
          />
        ))}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(132,85,239,0.08)', borderRadius: '8px', border: '1px solid rgba(132,85,239,0.2)', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}
        >
          💡 {t('scenario.selected_tip', 'Your selected path has been noted. Discuss this strategy with your lawyer for best results.')}
        </motion.div>
      )}
    </motion.div>
  )
}
