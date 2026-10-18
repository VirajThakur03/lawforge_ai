import { AnimatePresence, motion } from 'framer-motion'
import { HeroSection } from './components/HeroSection'
import { DashboardSection } from './components/DashboardSection'
import { ResponseSection } from './components/ResponseSection'
import { GeoIntelligence } from './phase6/geo/GeoIntelligence'
import { Toast } from './components/Toast'
import { useStore } from './store'
import { useEffect, useState, lazy, Suspense } from 'react'
import { SessionManager } from './engine/SessionManager'
import './App.css'

// Lazy-loaded heavy modules for optimal initial load (Task 11.2)
const EnterpriseDashboard = lazy(() => import('./phase5/enterprise/EnterpriseDashboard').then(m => ({ default: m.EnterpriseDashboard })))
const WitnessReceiver = lazy(() => import('./phase6/panic/WitnessReceiver').then(m => ({ default: m.WitnessReceiver })))
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })))
const KeyboardShortcutsPanel = lazy(() => import('./components/KeyboardShortcutsPanel').then(m => ({ default: m.KeyboardShortcutsPanel })))

function App() {
  const { view, isEnterpriseMode, setIsEnterpriseMode, setGeoZone, featureFlags, showToast, setActiveTab, setView } = useStore()
  const [isWitnessMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.has('witness') && !!featureFlags['enablePanicMode'];
    }
    return false;
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isShortcutsPanelOpen, setIsShortcutsPanelOpen] = useState(false)
  const [isSessionLocked, setIsSessionLocked] = useState(false)

  // Listeners & Shortcuts
  useEffect(() => {
    if (featureFlags['enableGeoIntelligence']) {
      GeoIntelligence.getLocalContext().then(zone => {
        if (zone) setGeoZone(zone);
      });
    }

    const handleKeyDown = (e) => {
      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }

      // Keyboard shortcuts panel (?)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setIsShortcutsPanelOpen(prev => !prev);
      }

      // Enterprise toggle shortcut (Ctrl+Shift+E)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        if (featureFlags['enableEnterpriseMode']) {
          const next = !isEnterpriseMode;
          setIsEnterpriseMode(next);
          showToast(next ? 'Switched to Enterprise OS' : 'Switched to Standard Workspace', 'info');
        }
      }

      // Alt + 1-4 for tab switching
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const tabMap = { '1': 'vault', '2': 'countries', '3': 'history', '4': 'settings' };
        if (tabMap[e.key]) {
          e.preventDefault();
          setIsEnterpriseMode(false);
          setView('dashboard');
          setActiveTab(tabMap[e.key]);
          showToast(`Navigated to ${tabMap[e.key]}`, 'info');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleOffline = () => {
      console.log("Connection lost: Automatically switching Lex-AI Pipeline to local host mode.");
      useStore.getState().setPipelineMode('OFFLINE_LOCAL');
      showToast('Offline detected: Switched to Local Host', 'warning');
    };
    window.addEventListener('offline', handleOffline);

    const handleOnline = () => {
      console.log("Connection restored: Pipeline ready for sync.");
      showToast('Connection restored', 'success');
    };
    window.addEventListener('online', handleOnline);

    if (!navigator.onLine) {
      useStore.getState().setPipelineMode('OFFLINE_LOCAL');
    }

    // Session idle auto-lock (Task 10.6)
    SessionManager.start(() => {
      setIsSessionLocked(true);
      showToast('Session locked due to inactivity.', 'warning');
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      SessionManager.stop();
    };
  }, [isEnterpriseMode, setIsEnterpriseMode, showToast, featureFlags, setActiveTab, setGeoZone, setView]);

  if (isWitnessMode) {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070e1e', color: '#00e3fd' }}>Connecting Secure Channel...</div>}>
        <WitnessReceiver />
      </Suspense>
    )
  }

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {view === 'hero' && (
          <HeroSection 
            key="hero" 
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} 
            onOpenShortcuts={() => setIsShortcutsPanelOpen(true)}
          />
        )}
        {view === 'dashboard' && !isEnterpriseMode && (
          <DashboardSection 
            key="dashboard" 
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} 
            onOpenShortcuts={() => setIsShortcutsPanelOpen(true)}
          />
        )}
        {view === 'dashboard' && isEnterpriseMode && (
          <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', color: 'var(--secondary)' }}>Loading Enterprise OS...</div>}>
            <EnterpriseDashboard 
              key="enterprise-dashboard" 
            />
          </Suspense>
        )}
        {view === 'response' && (
          <ResponseSection 
            key="response" 
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} 
            onOpenShortcuts={() => setIsShortcutsPanelOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      {isCommandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette 
            isOpen={isCommandPaletteOpen} 
            onClose={() => setIsCommandPaletteOpen(false)} 
          />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Panel */}
      {isShortcutsPanelOpen && (
        <Suspense fallback={null}>
          <KeyboardShortcutsPanel
            isOpen={isShortcutsPanelOpen}
            onClose={() => setIsShortcutsPanelOpen(false)}
          />
        </Suspense>
      )}

      {/* Global Floating Toast */}
      <Toast />

      {/* Session Idle Lock Screen (Task 10.6) */}
      <AnimatePresence>
        {isSessionLocked && (
          <motion.div
            key="session-lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(6,8,15,0.97)',
              backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '1.5rem'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.4rem' }}>
                Session Locked
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', maxWidth: '280px' }}>
                Your session was locked after 15 minutes of inactivity. Click below to resume.
              </div>
            </div>
            <button
              onClick={() => {
                setIsSessionLocked(false);
                SessionManager.resume(() => {
                  setIsSessionLocked(true);
                  showToast('Session locked due to inactivity.', 'warning');
                });
              }}
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                border: 'none', borderRadius: '12px',
                padding: '0.85rem 2.5rem',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 12px 24px -10px rgba(132,85,239,0.45)'
              }}
            >
              Unlock Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
