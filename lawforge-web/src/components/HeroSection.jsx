import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Scale, Zap, Globe, Shield, Cpu, Lock, ArrowRight, ChevronRight, Keyboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay } }
})

const FEATURES = [
  {
    icon: <Globe size={20} />,
    color: '#00e3fd',
    title: '195 Jurisdictions',
    desc: 'Covers every sovereign legal system including Common Law, Civil Law, Sharia, and Hybrid frameworks.',
  },
  {
    icon: <Cpu size={20} />,
    color: '#ba9eff',
    title: 'WebGPU Inference',
    desc: 'On-device AI reasoning via WebGPU. Zero cloud dependency, zero data leakage.',
  },
  {
    icon: <Shield size={20} />,
    color: '#4ade80',
    title: 'Evidence Vault',
    desc: 'RFC-3161 timestamped evidence vault with SHA-256 hashing and encrypted local storage.',
  },
  {
    icon: <Lock size={20} />,
    color: '#fb923c',
    title: 'Air-Gapped Privacy',
    desc: 'Zero-trust architecture. Your legal data never touches a server unless you explicitly allow it.',
  },
]

const STATS = [
  { value: '195+', label: 'Countries' },
  { value: '< 80ms', label: 'Avg. Latency' },
  { value: '100%', label: 'Offline-Ready' },
  { value: 'AES-256', label: 'Encryption' },
]

// Typewriter effect component
function TypewriterText({ texts, speed = 60, pause = 2000 }) {
  const [displayed, setDisplayed] = useState('')
  const [textIdx, setTextIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIdx]
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), speed)
      return () => clearTimeout(t)
    } else if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx(c => c - 1), speed / 2)
      return () => clearTimeout(t)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setTextIdx(i => (i + 1) % texts.length)
    }
  }, [charIdx, deleting, textIdx, texts, speed, pause])

  useEffect(() => {
    setDisplayed(texts[textIdx].substring(0, charIdx))
  }, [charIdx, textIdx, texts])

  return (
    <span>
      {displayed}
      <span style={{
        display: 'inline-block', width: '2px', height: '0.9em',
        background: 'var(--primary)', verticalAlign: 'middle',
        animation: 'blink-cursor 1s step-end infinite', marginLeft: '2px'
      }} />
    </span>
  )
}

export function HeroSection({ onOpenCommandPalette, onOpenShortcuts }) {
  const { setView, setActiveTab, setIsEnterpriseMode } = useStore()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient light leaks */}
      <div className="light-leak light-leak-purple" />
      <div className="light-leak light-leak-cyan" />
      {/* Extra subtle grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(186,158,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(186,158,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* ─── Nav ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        className="glass-nav"
        style={{ padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => setView('hero')}>
          <div style={{
            width: 34, height: 34, borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(186, 158, 255, 0.2), rgba(0, 227, 253, 0.2))',
            border: '1px solid rgba(186, 158, 255, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(132, 85, 239, 0.25)'
          }}>
            <Scale size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
            LAWFORGE<span style={{ color: 'var(--secondary)' }}>.AI</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hero-nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span
            className="nav-link"
            onClick={() => { setIsEnterpriseMode(false); setActiveTab('vault'); setView('dashboard'); }}
            style={{ cursor: 'pointer' }}
          >
            Vault
          </span>

          <span
            className="nav-link"
            onClick={() => { setIsEnterpriseMode(false); setActiveTab('countries'); setView('dashboard'); }}
            style={{ cursor: 'pointer' }}
          >
            {t('nav.countries')}
          </span>

          <span
            className="nav-link"
            onClick={() => { setIsEnterpriseMode(true); setView('dashboard'); }}
            style={{ cursor: 'pointer', color: 'var(--secondary)' }}
          >
            Enterprise OS
          </span>

          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="btn-glass"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '100px' }}
              title="Search (Ctrl + K)"
            >
              <span>Search</span>
              <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--primary)' }}>⌘K</span>
            </button>
          )}

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="btn-glass"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '100px' }}
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--primary)' }}>?</span>
            </button>
          )}

          <ThemeToggle />
          <LanguageSwitcher align="right" />

          <button className="btn-primary" style={{ padding: '0.55rem 1.35rem', fontSize: '0.85rem' }} onClick={() => { setIsEnterpriseMode(false); setActiveTab('vault'); setView('dashboard'); }}>
            {t('nav.enter_vault')}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-hamburger"
          onClick={() => setMobileMenuOpen(m => !m)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--on-surface)' }}
          aria-label="Toggle menu"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 22, height: 2, background: 'var(--on-surface)', borderRadius: 2, transition: 'all 0.3s' }} />
            ))}
          </div>
        </button>
      </motion.nav>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass"
          style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(186,158,255,0.1)', zIndex: 99, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {[
            { label: 'Legal Vault', action: () => { setIsEnterpriseMode(false); setActiveTab('vault'); setView('dashboard'); setMobileMenuOpen(false); } },
            { label: 'Jurisdictions', action: () => { setIsEnterpriseMode(false); setActiveTab('countries'); setView('dashboard'); setMobileMenuOpen(false); } },
            { label: 'Enterprise OS', action: () => { setIsEnterpriseMode(true); setView('dashboard'); setMobileMenuOpen(false); } },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="btn-glass" style={{ width: '100%', textAlign: 'left', borderRadius: '10px' }}>
              {item.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* ─── Hero Content ─── */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
        alignItems: 'center', gap: '4rem',
        padding: '5rem 6rem 3rem',
        maxWidth: '1400px', margin: '0 auto', width: '100%',
        position: 'relative', zIndex: 1
      }} className="hero-grid">

        {/* 3D Orb — Left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
        >
          {/* Outer ring decorations */}
          <div style={{
            position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
            border: '1px solid rgba(186,158,255,0.06)',
            animation: 'orb-float 8s ease-in-out infinite reverse'
          }} />
          <div style={{
            position: 'absolute', width: '320px', height: '320px', borderRadius: '50%',
            border: '1px dashed rgba(0,227,253,0.08)',
            animation: 'orb-float 6s ease-in-out infinite'
          }} />
          
          {/* Feature orbit dots */}
          {FEATURES.map((f, i) => {
            const angle = (i / FEATURES.length) * 2 * Math.PI - Math.PI / 2
            const r = 175
            const x = Math.cos(angle) * r
            const y = Math.sin(angle) * r
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.8 + i * 0.15 } }}
                style={{
                  position: 'absolute', left: `calc(50% + ${x}px - 20px)`,
                  top: `calc(50% + ${y}px - 20px)`,
                  width: 40, height: 40, borderRadius: '12px',
                  background: `rgba(${f.color === '#00e3fd' ? '0,227,253' : f.color === '#ba9eff' ? '186,158,255' : f.color === '#4ade80' ? '74,222,128' : '251,146,60'},0.15)`,
                  border: `1px solid ${f.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, boxShadow: `0 0 12px ${f.color}22`
                }}
                title={f.title}
              >
                {f.icon}
              </motion.div>
            )
          })}

          <div className="orb-3d">
            <div className="orb-pulse" />
            <div className="orb-pulse orb-pulse-2" />
            <div className="orb-3d-inner">
              <span className="orb-3d-label">LF</span>
            </div>
          </div>
        </motion.div>

        {/* Text — Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.div {...fadeUp(0.15)}>
            <span className="badge badge-purple">
              <Zap size={11} /> {t('hero.badge')}
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.25)} className="display-xl" style={{ color: 'var(--on-surface)' }}>
            {t('hero.title_1')}<br />
            {t('hero.title_2')}<br />
            <span className="gradient-text">{t('hero.title_3')}</span>
          </motion.h1>

          <motion.p {...fadeUp(0.32)} style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, maxWidth: '440px' }}>
            <TypewriterText
              texts={[
                'Your sovereign AI legal counsel. No cloud. No compromise.',
                'Analyze laws across 195 jurisdictions instantly.',
                'Offline-first. Air-gapped. Privacy absolute.',
                'RFC-3161 timestamped evidence. Battle-tested defense.'
              ]}
              speed={45}
              pause={2500}
            />
          </motion.p>

          <motion.div {...fadeUp(0.4)} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0.9rem 2.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setView('dashboard')}
            >
              {t('hero.analyze_cta')} <ArrowRight size={16} />
            </button>
            <button
              className="btn-glass"
              onClick={onOpenCommandPalette}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {t('hero.watch_demo')}
              <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--primary)' }}>⌘K</span>
            </button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            {...fadeUp(0.5)}
            style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}
          >
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.35rem', color: 'var(--primary)', letterSpacing: '-0.03em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── Features Strip ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.6 } }}
        style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 4rem 4rem', width: '100%', position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.75 + i * 0.08 } }}
              className="glass-card"
              style={{ padding: '1.25rem' }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '10px', marginBottom: '0.85rem',
                background: `${f.color}18`, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--on-surface)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            t('trust.countries'),
            t('trust.offline'),
            t('trust.hybrid'),
            t('trust.latency'),
            t('trust.free')
          ].map(tr => (
            <span key={tr} className="trust-chip">{tr}</span>
          ))}
        </div>
      </motion.div>

      {/* ─── Bottom CTA strip ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1, duration: 0.6 } }}
        style={{
          borderTop: '1px solid rgba(186,158,255,0.06)',
          padding: '1.5rem 4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
          © 2026 LAWFORGE AI · Sovereign Legal Terminal · Built on WebGPU + WASM
        </span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { label: 'Vault', action: () => { setIsEnterpriseMode(false); setActiveTab('vault'); setView('dashboard'); } },
            { label: 'Enterprise', action: () => { setIsEnterpriseMode(true); setView('dashboard'); } },
          ].map(link => (
            <button
              key={link.label}
              onClick={link.action}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
            >
              {link.label} <ChevronRight size={12} />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
