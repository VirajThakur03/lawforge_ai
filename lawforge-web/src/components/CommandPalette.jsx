import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Home, Briefcase, Clock, Settings, Zap, ArrowRight, X, Shield, FileText, Cpu } from 'lucide-react';
import { useStore } from '../store';
import { COUNTRIES } from '../data/countries';

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { 
    setView, 
    setActiveTab, 
    setSelectedCountry, 
    isEnterpriseMode, 
    setIsEnterpriseMode, 
    pipelineMode, 
    setPipelineMode, 
    isAgentMode, 
    setIsAgentMode,
    showToast 
  } = useStore();

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }

  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setSelectedIndex(0);
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const items = useMemo(() => {
    const q = query.toLowerCase().trim();

    const staticCommands = [
      {
        id: 'nav-home',
        category: 'Navigation',
        icon: <Home size={15} color="var(--primary)" />,
        title: 'Home Landing Page',
        desc: 'Return to LawForge overview and presentation',
        action: () => { setView('hero'); showToast('Navigated to Home'); }
      },
      {
        id: 'nav-vault',
        category: 'Navigation',
        icon: <Zap size={15} color="var(--secondary)" />,
        title: 'Legal Vault Workspace',
        desc: 'Primary AI legal reasoning and document intake terminal',
        action: () => { setIsEnterpriseMode(false); setView('dashboard'); setActiveTab('vault'); showToast('Opened Legal Vault'); }
      },
      {
        id: 'nav-countries',
        category: 'Navigation',
        icon: <Globe size={15} color="#10b981" />,
        title: 'Browse Global Jurisdictions',
        desc: 'Directory of common law, civil law, and hybrid legal systems',
        action: () => { setIsEnterpriseMode(false); setView('dashboard'); setActiveTab('countries'); showToast('Opened Jurisdictions'); }
      },
      {
        id: 'nav-history',
        category: 'Navigation',
        icon: <Clock size={15} color="#f59e0b" />,
        title: 'Recent Intelligence History',
        desc: 'Access saved case analyses and offline reports',
        action: () => { setIsEnterpriseMode(false); setView('dashboard'); setActiveTab('history'); showToast('Opened History'); }
      },
      {
        id: 'nav-settings',
        category: 'Navigation',
        icon: <Settings size={15} color="#ba9eff" />,
        title: 'System Settings & Sandbox',
        desc: 'Configure pipeline modes, languages, and storage cache',
        action: () => { setIsEnterpriseMode(false); setView('dashboard'); setActiveTab('settings'); showToast('Opened Settings'); }
      },
      {
        id: 'toggle-enterprise',
        category: 'Workspaces',
        icon: <Briefcase size={15} color="var(--secondary)" />,
        title: isEnterpriseMode ? 'Switch to Standard Workspace' : 'Launch Enterprise Law Firm OS',
        desc: isEnterpriseMode ? 'Return to consumer Sovereign Vault' : 'Activate CRM matters, billing stopwatch & client invoicing',
        action: () => { 
          setIsEnterpriseMode(!isEnterpriseMode); 
          setView('dashboard'); 
          showToast(isEnterpriseMode ? 'Standard Workspace Active' : 'Enterprise OS Active', 'success'); 
        }
      },
      {
        id: 'toggle-pipeline',
        category: 'Engine Controls',
        icon: <Cpu size={15} color={pipelineMode === 'ONLINE_LIVE' ? 'var(--secondary)' : '#f59e0b'} />,
        title: pipelineMode === 'ONLINE_LIVE' ? 'Switch to Offline Local Host' : 'Switch to Cloud Live Sync',
        desc: pipelineMode === 'ONLINE_LIVE' ? 'Run strictly on on-device WebGPU and SQLite' : 'Enable live statutory web expansion',
        action: () => { 
          const next = pipelineMode === 'ONLINE_LIVE' ? 'OFFLINE_LOCAL' : 'ONLINE_LIVE';
          setPipelineMode(next);
          showToast(`Pipeline set to ${next === 'ONLINE_LIVE' ? 'Cloud Sync' : 'Local Host'}`, 'info');
        }
      },
      {
        id: 'toggle-agent',
        category: 'Engine Controls',
        icon: <Shield size={15} color="#10b981" />,
        title: isAgentMode ? 'Deactivate Autonomous Agent Mode' : 'Activate Autonomous Agent Mode',
        desc: 'Multi-step self-reflective legal research loop',
        action: () => { 
          setIsAgentMode(!isAgentMode);
          showToast(`Agent mode ${!isAgentMode ? 'enabled' : 'disabled'}`, 'info');
        }
      }
    ];

    // Filter static commands
    const filteredStatic = staticCommands.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.desc.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q)
    );

    // Filter countries
    const filteredCountries = COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) || 
      c.system.toLowerCase().includes(q)
    ).slice(0, 8).map(c => ({
      id: `country-${c.code}`,
      category: 'Jurisdiction',
      icon: <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>,
      title: `${c.name} (${c.code})`,
      desc: `${c.system} legal system`,
      action: () => {
        setSelectedCountry(c);
        setIsEnterpriseMode(false);
        setView('dashboard');
        setActiveTab('vault');
        showToast(`Active Jurisdiction set to ${c.name}`, 'success');
      }
    }));

    return [...filteredStatic, ...filteredCountries];
  }, [
    query, 
    isEnterpriseMode, 
    pipelineMode, 
    isAgentMode, 
    setView, 
    setActiveTab, 
    setSelectedCountry, 
    setIsEnterpriseMode, 
    setPipelineMode, 
    setIsAgentMode, 
    showToast
  ]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (items.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % (items.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(5, 9, 20, 0.75)', backdropFilter: 'blur(16px)' }}
      />

      {/* Palette Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -15 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          width: '92%',
          maxWidth: '620px',
          background: 'rgba(11, 19, 38, 0.96)',
          border: '1px solid rgba(186, 158, 255, 0.25)',
          borderRadius: '18px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(132, 85, 239, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.15rem 1.25rem', borderBottom: '1px solid rgba(186, 158, 255, 0.1)' }}>
          <Search size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, jurisdiction (e.g. India, USA), or workspace..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--on-surface)',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              fontWeight: 500
            }}
          />
          {query && (
            <X size={16} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }} onClick={() => setQuery('')} />
          )}
          <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div ref={listRef} style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem' }}>
          {items.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>No commands or jurisdictions match "{query}"</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Try searching for a country name, "settings", or "enterprise".</p>
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => { item.action(); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(132, 85, 239, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(186, 158, 255, 0.2)' : '1px solid transparent',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(132, 85, 239, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--on-surface)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight size={14} style={{ color: 'var(--primary)' }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', borderTop: '1px solid rgba(186, 158, 255, 0.06)', background: 'rgba(7, 14, 30, 0.6)', fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span><strong style={{ color: 'var(--on-surface)' }}>↑↓</strong> Navigate</span>
            <span><strong style={{ color: 'var(--on-surface)' }}>↵</strong> Select</span>
            <span><strong style={{ color: 'var(--on-surface)' }}>ESC</strong> Close</span>
          </div>
          <span style={{ opacity: 0.6 }}>LawForge AI 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
