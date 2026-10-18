import { motion } from 'framer-motion'

// Skeleton pulse animation — respects design system surface colors
function Skeleton({ width = '100%', height = '1rem', radius = '8px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(27,37,62,0.7) 25%, rgba(40,55,90,0.9) 50%, rgba(27,37,62,0.7) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style
      }}
    />
  )
}

// Full analysis loading overlay shown while AI is computing
export function AnalysisLoadingOverlay({ country }) {
  const steps = [
    { icon: '⚖️', label: 'Parsing statutory database…', delay: 0 },
    { icon: '🔍', label: 'Identifying applicable legislation…', delay: 0.4 },
    { icon: '🛡️', label: 'Generating defense strategy matrix…', delay: 0.8 },
    { icon: '📊', label: 'Computing risk severity score…', delay: 1.2 },
    { icon: '📋', label: 'Drafting legal document templates…', delay: 1.6 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(7, 14, 30, 0.92)',
        backdropFilter: 'blur(24px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '2rem'
      }}
    >
      {/* Spinning orb */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(ellipse at 35% 30%, rgba(186,158,255,0.9), rgba(100,50,200,0.5))',
          boxShadow: '0 0 60px rgba(132,85,239,0.4)',
          animation: 'spin 2s linear infinite'
        }} />
        <div style={{
          position: 'absolute', inset: 6, borderRadius: '50%',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem'
        }}>⚖️</div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.3rem' }}>
          Lex-AI Reasoning…
        </div>
        {country && (
          <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
            Analyzing <strong style={{ color: 'var(--primary)' }}>{country.name}</strong> statutory framework
          </div>
        )}
      </div>

      {/* Processing steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '340px', width: '100%' }}>
        {steps.map((step) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay, duration: 0.4 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.9rem', borderRadius: '10px',
              background: 'rgba(186,158,255,0.05)',
              border: '1px solid rgba(186,158,255,0.08)'
            }}
          >
            <span style={{ fontSize: '1rem' }}>{step.icon}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{step.label}</span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: step.delay + 0.2, repeat: Infinity, duration: 1.2 }}
              style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: '320px', height: '3px', borderRadius: '2px', background: 'rgba(186,158,255,0.1)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '95%' }}
          transition={{ duration: 8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, var(--primary-dim), var(--secondary))' }}
        />
      </div>
    </motion.div>
  )
}

// Skeleton cards for the Response page while loading
export function ResponseSkeleton() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Skeleton width="48px" height="48px" radius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton width="40%" height="1.2rem" />
          <Skeleton width="25%" height="0.8rem" />
        </div>
      </div>

      {/* Hero metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[0,1,2].map(i => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Skeleton width="60%" height="0.75rem" />
            <Skeleton width="40%" height="2rem" radius="6px" />
          </div>
        ))}
      </div>

      {/* Content cards */}
      {[1,2,3].map(i => (
        <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton width="30%" height="0.75rem" />
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton width="75%" height="1rem" />
        </div>
      ))}
    </div>
  )
}
