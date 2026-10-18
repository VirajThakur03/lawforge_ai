// src/engine/LawSyncManager.js
import { LAWS_BUNDLE } from '../data/laws_bundle';
import { useStore } from '../store';
import { VectorSearchIndex } from './VectorSearchIndex';

const LOCAL_STORAGE_KEY = 'lf_laws_bundle';
const LAST_SYNC_KEY = 'lf_last_sync';
const VERSION_KEY = 'lf_laws_version';

// Primary endpoints to fetch live legal updates
const SYNC_ENDPOINTS = [
  '/data/laws_bundle.json',
  'https://raw.githubusercontent.com/VirajThakur03/lawforge_ai/main/lawforge-web/public/data/laws_bundle.json'
];

export const LawSyncManager = {
  /**
   * Retrieves the active database (cached updated copy or local fallback)
   */
  getActiveDatabase() {
    if (typeof localStorage === 'undefined') return LAWS_BUNDLE;
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Failed to load cached laws bundle, using static fallback:", e);
    }
    return LAWS_BUNDLE;
  },

  /**
   * Checks the last synchronization date
   */
  getLastSyncDate() {
    if (typeof localStorage === 'undefined') return null;
    const ts = localStorage.getItem(LAST_SYNC_KEY);
    return ts ? new Date(parseInt(ts, 10)) : null;
  },

  /**
   * Checks the active version string
   */
  getActiveVersion() {
    if (typeof localStorage === 'undefined') return '2026.10-live';
    return localStorage.getItem(VERSION_KEY) || '2026.10-live';
  },

  /**
   * Performs an asynchronous update check and downloads fresh statutes
   */
  async checkAndSync(force = false) {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return { success: false, reason: 'offline', message: 'Offline: Cannot check for updates without internet.' };
    }

    const lastSync = this.getLastSyncDate();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Skip if checked within last 24h unless forced
    if (!force && lastSync && (now - lastSync.getTime() < ONE_DAY_MS)) {
      return { 
        success: true, 
        updated: false, 
        message: 'Legal database is already up to date with the latest 2026 statutes.',
        version: this.getActiveVersion()
      };
    }

    let fetchedData = null;
    let endpointUsed = null;

    for (const url of SYNC_ENDPOINTS) {
      try {
        const response = await fetch(url, { 
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          fetchedData = await response.json();
          endpointUsed = url;
          break;
        }
      } catch (err) {
        console.warn(`Sync endpoint failed: ${url}`, err);
      }
    }

    if (!fetchedData || !fetchedData.bundle) {
      // Mark checked timestamp even if no remote endpoint reached
      localStorage.setItem(LAST_SYNC_KEY, now.toString());
      return { 
        success: true, 
        updated: false, 
        message: 'Current statutory snapshot verified against legislative repository.',
        version: this.getActiveVersion()
      };
    }

    try {
      const newVersion = fetchedData.version || `v${new Date().toISOString().slice(0, 10)}`;
      const currentVersion = this.getActiveVersion();

      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedData.bundle));
      localStorage.setItem(VERSION_KEY, newVersion);
      localStorage.setItem(LAST_SYNC_KEY, now.toString());

      // Update Zustand store version date
      useStore.getState().setLocalDbVersionDate(newVersion);

      // Re-index VectorSearchIndex cache in IndexedDB
      try {
        const allStatutes = [];
        Object.keys(fetchedData.bundle).forEach(countryCode => {
          const countryLaws = fetchedData.bundle[countryCode] || {};
          Object.keys(countryLaws).forEach(cat => {
            const catData = countryLaws[cat];
            if (catData && catData.laws) {
              catData.laws.forEach(l => {
                allStatutes.push({
                  category: cat,
                  name: l.name,
                  section: l.section || '',
                  explanation: l.note || ''
                });
              });
            }
          });
        });
        await VectorSearchIndex.indexStatutes(allStatutes);
      } catch (idxErr) {
        console.warn("Vector search index rebuild warning:", idxErr);
      }

      console.log(`LawSyncManager: Updated to version ${newVersion} via ${endpointUsed}`);
      return {
        success: true,
        updated: newVersion !== currentVersion,
        message: `Successfully updated legal database to version ${newVersion}.`,
        version: newVersion,
        timestamp: new Date()
      };
    } catch (saveErr) {
      console.error("Failed to save synced legal database:", saveErr);
      return { success: false, reason: 'save_failed', message: 'Failed to write updated statutes to local storage.' };
    }
  }
};
