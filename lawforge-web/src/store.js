import { create } from 'zustand'
import { loadFlags, saveFlags } from './config/feature-flags'

export const useStore = create((set) => ({
  // Feature Flags
  featureFlags: loadFlags(),
  toggleFeatureFlag: (flagName) => set((state) => {
    const updated = { ...state.featureFlags, [flagName]: !state.featureFlags[flagName] };
    saveFlags(updated);
    return { featureFlags: updated };
  }),
  
  // Navigation
  view: 'hero', // 'hero', 'dashboard', 'response'
  setView: (view) => set({ view }),
  activeTab: 'vault', // 'vault', 'countries', 'history', 'settings'
  setActiveTab: (activeTab) => set({ activeTab }),

  // Data
  selectedCountry: null,
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  situation: '',
  setSituation: (situation) => set({ situation }),
  response: null,
  setResponse: (response) => set({ response }),
  geoZone: null,
  setGeoZone: (zone) => set({ geoZone: zone }),
  
  // Agent Mode
  isAgentMode: false,
  setIsAgentMode: (mode) => set({ isAgentMode: mode }),

  // Lex-AI Pipeline Mode
  pipelineMode: 'ONLINE_LIVE', // 'ONLINE_LIVE' or 'OFFLINE_LOCAL'
  setPipelineMode: (mode) => set({ pipelineMode: mode }),
  localDbVersionDate: '2026-05-25',
  setLocalDbVersionDate: (date) => set({ localDbVersionDate: date }),

  // Enterprise Mode
  isEnterpriseMode: localStorage.getItem('LAWFORGE_ENTERPRISE') === 'true',
  setIsEnterpriseMode: (mode) => {
    localStorage.setItem('LAWFORGE_ENTERPRISE', mode)
    set({ isEnterpriseMode: mode })
  },

  // Theme Management (dark, light, system)
  theme: typeof localStorage !== 'undefined' ? (localStorage.getItem('lf_theme') || 'dark') : 'dark',
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lf_theme', theme);
    }
    if (typeof document !== 'undefined') {
      const resolved = theme === 'system'
        ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      document.documentElement.setAttribute('data-theme', resolved);
    }
    set({ theme });
  },

  // Onboarding & Guidance
  hasCompletedOnboarding: typeof localStorage !== 'undefined' ? localStorage.getItem('lf_onboarding_done') === 'true' : false,
  setHasCompletedOnboarding: (done) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lf_onboarding_done', done ? 'true' : 'false');
    }
    set({ hasCompletedOnboarding: done });
  },
  disclaimerDismissed: typeof localStorage !== 'undefined' ? localStorage.getItem('lf_disclaimer_dismissed') === 'true' : false,
  setDisclaimerDismissed: (dismissed) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lf_disclaimer_dismissed', dismissed ? 'true' : 'false');
    }
    set({ disclaimerDismissed: dismissed });
  },

  // Toast Notification System (Single & Queue capable)
  toast: null,
  toasts: [],
  showToast: (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };
    set((state) => ({
      toast: newToast,
      toasts: [...state.toasts.slice(-2), newToast]
    }));
    setTimeout(() => {
      set((state) => ({
        toast: state.toast?.id === id ? null : state.toast,
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },
  dismissToast: (id) => set((state) => ({
    toast: state.toast?.id === id ? null : state.toast,
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  hideToast: () => set({ toast: null, toasts: [] }),

  // UI State
  loading: false,
  setLoading: (loading) => set({ loading }),
  history: typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('lf_history') || '[]') : [],
  addToHistory: (item) => set((state) => {
    const newHistory = [item, ...state.history].slice(0, 15);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lf_history', JSON.stringify(newHistory));
    }
    return { history: newHistory };
  }),
  clearHistory: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('lf_history');
    }
    set({ history: [] });
  },
  removeFromHistory: (index) => set((state) => {
    const newHistory = state.history.filter((_, i) => i !== index);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lf_history', JSON.stringify(newHistory));
    }
    return { history: newHistory };
  })
}))
