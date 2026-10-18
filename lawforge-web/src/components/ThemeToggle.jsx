import { Sun, Moon, Monitor } from 'lucide-react'
import { useStore } from '../store'

export function ThemeToggle({ className = '', variant = 'pill' }) {
  const { theme, setTheme, showToast } = useStore()

  const cycleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setTheme(next)
    showToast(`Theme changed to ${next.toUpperCase()}`, 'info', 2000)
  }

  if (variant === 'select') {
    return (
      <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255,255,255,0.1)' }}>
        {[
          { key: 'dark', icon: Moon, label: 'Dark' },
          { key: 'light', icon: Sun, label: 'Light' },
          { key: 'system', icon: Monitor, label: 'System' }
        ].map(({ key, icon: Icon, label }) => {
          const isActive = theme === key
          return (
            <button
              key={key}
              onClick={() => {
                setTheme(key)
                showToast(`Theme: ${label}`, 'info', 2000)
              }}
              aria-label={`Switch to ${label} theme`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 500,
                borderRadius: '6px',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--on-primary, #fff)' : 'var(--on-surface-variant)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none'
              }}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <button
      onClick={cycleTheme}
      className={`btn-glass ${className}`}
      title={`Current Theme: ${theme.toUpperCase()} (Click to toggle Dark / Light / System)`}
      aria-label={`Current Theme: ${theme}. Toggle theme`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.78rem',
        padding: '0.45rem 0.75rem',
        borderRadius: '100px',
        cursor: 'pointer'
      }}
    >
      {theme === 'dark' ? (
        <Moon size={13} style={{ color: 'var(--primary)' }} />
      ) : theme === 'light' ? (
        <Sun size={13} style={{ color: '#f59e0b' }} />
      ) : (
        <Monitor size={13} style={{ color: 'var(--secondary)' }} />
      )}
      <span style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{theme}</span>
    </button>
  )
}
