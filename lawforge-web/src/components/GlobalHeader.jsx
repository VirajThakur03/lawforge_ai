import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Search, Zap, Globe, Clock, Settings, Briefcase, Cpu, ArrowLeft, Home } from 'lucide-react';
import { useStore } from '../store';
import { LanguageSwitcher } from './LanguageSwitcher';

export function GlobalHeader({ onOpenCommandPalette, onOpenShortcuts }) {
  const { 
    view, 
    setView, 
    activeTab, 
    setActiveTab, 
    isEnterpriseMode, 
    setIsEnterpriseMode, 
    pipelineMode, 
    setPipelineMode,
    selectedCountry
  } = useStore();

  const handleNav = (targetTab) => {
    setIsEnterpriseMode(false);
    setView('dashboard');
    setActiveTab(targetTab);
  };

  const getBreadcrumb = () => {
    if (view === 'hero') return 'Home';
    if (view === 'response') return 'Case Report';
    if (isEnterpriseMode) return 'Enterprise OS';
    switch (activeTab) {
      case 'vault': return 'Legal Vault';
      case 'countries': return 'Jurisdictions';
      case 'history': return 'Intelligence History';
      case 'settings': return 'System Settings';
      default: return 'Vault';
    }
  };

  return (
    <header 
      className="glass-nav"
      style={{
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(186, 158, 255, 0.08)'
      }}
    >
      {/* Left: Brand & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div 
          onClick={() => setView('hero')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}
          title="Return to Home Landing Page"
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(186, 158, 255, 0.2), rgba(0, 227, 253, 0.2))',
            border: '1px solid rgba(186, 158, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(132, 85, 239, 0.2)'
          }}>
            <Scale size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
            LAWFORGE<span style={{ color: 'var(--secondary)' }}>.AI</span>
          </span>
        </div>

        {/* Breadcrumb Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
          <span 
            onClick={() => setView('hero')} 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
          >
            Home
          </span>
          <span>›</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{getBreadcrumb()}</span>
          {selectedCountry && view !== 'hero' && (
            <>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--on-surface)' }}>
                {selectedCountry.flag} {selectedCountry.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div 
        onClick={onOpenCommandPalette}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.45rem 1rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(186, 158, 255, 0.15)',
          borderRadius: '100px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '320px',
          width: '100%'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(186, 158, 255, 0.4)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(186, 158, 255, 0.15)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }}
        title="Search jurisdictions, laws, and commands (Ctrl + K)"
      >
        <Search size={14} style={{ color: 'var(--on-surface-variant)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', flex: 1 }}>Search commands & countries...</span>
        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--primary)', fontWeight: 700 }}>
          ⌘K
        </span>
      </div>

      {/* Right: Quick Links, Pipeline Switcher & Language */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Navigation Shortcut Links */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button 
            onClick={() => handleNav('vault')}
            className="btn-glass"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: '8px',
              border: view === 'dashboard' && activeTab === 'vault' && !isEnterpriseMode ? '1px solid var(--primary)' : '1px solid rgba(186, 158, 255, 0.1)',
              background: view === 'dashboard' && activeTab === 'vault' && !isEnterpriseMode ? 'rgba(132, 85, 239, 0.15)' : 'transparent',
              color: view === 'dashboard' && activeTab === 'vault' && !isEnterpriseMode ? 'var(--primary)' : 'var(--on-surface-variant)'
            }}
          >
            Vault
          </button>

          <button 
            onClick={() => handleNav('countries')}
            className="btn-glass"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: '8px',
              border: view === 'dashboard' && activeTab === 'countries' && !isEnterpriseMode ? '1px solid var(--primary)' : '1px solid rgba(186, 158, 255, 0.1)',
              background: view === 'dashboard' && activeTab === 'countries' && !isEnterpriseMode ? 'rgba(132, 85, 239, 0.15)' : 'transparent',
              color: view === 'dashboard' && activeTab === 'countries' && !isEnterpriseMode ? 'var(--primary)' : 'var(--on-surface-variant)'
            }}
          >
            Countries
          </button>

          <button 
            onClick={() => {
              setIsEnterpriseMode(true);
              setView('dashboard');
            }}
            className="btn-glass"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: '8px',
              border: isEnterpriseMode ? '1px solid var(--secondary)' : '1px solid rgba(0, 227, 253, 0.2)',
              background: isEnterpriseMode ? 'rgba(0, 227, 253, 0.15)' : 'transparent',
              color: isEnterpriseMode ? 'var(--secondary)' : 'var(--on-surface-variant)'
            }}
          >
            Enterprise
          </button>
        </div>

        {/* Pipeline Mode Pill */}
        <div 
          onClick={() => setPipelineMode(pipelineMode === 'ONLINE_LIVE' ? 'OFFLINE_LOCAL' : 'ONLINE_LIVE')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '100px',
            background: pipelineMode === 'ONLINE_LIVE' ? 'rgba(0, 227, 253, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: pipelineMode === 'ONLINE_LIVE' ? '1px solid rgba(0, 227, 253, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 700,
            userSelect: 'none'
          }}
          title="Click to toggle between Cloud Sync and Local Host offline pipeline"
        >
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: pipelineMode === 'ONLINE_LIVE' ? '#00e3fd' : '#f59e0b',
            boxShadow: pipelineMode === 'ONLINE_LIVE' ? '0 0 6px #00e3fd' : '0 0 6px #f59e0b'
          }} />
          <span style={{ color: pipelineMode === 'ONLINE_LIVE' ? 'var(--secondary)' : 'var(--risk-medium)' }}>
            {pipelineMode === 'ONLINE_LIVE' ? 'SYNC' : 'LOCAL'}
          </span>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher align="right" />

        {/* Shortcuts hint */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="btn-glass"
            style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--on-surface-variant)', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Keyboard Shortcuts (?)"
          >
            ?
          </button>
        )}
      </div>
    </header>
  );
}
