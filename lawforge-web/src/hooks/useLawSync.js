import { useState, useEffect, useCallback } from 'react';
import { LawSyncManager } from '../engine/LawSyncManager';
import { useStore } from '../store';

export function useLawSync() {
  const [offlineDb, setOfflineDb] = useState(() => LawSyncManager.getActiveDatabase());
  const [lastSync, setLastSync] = useState(() => LawSyncManager.getLastSyncDate());
  const [version, setVersion] = useState(() => LawSyncManager.getActiveVersion());
  const [isSyncing, setIsSyncing] = useState(false);
  const { showToast } = useStore();

  const syncNow = useCallback(async (isManual = false) => {
    setIsSyncing(true);
    try {
      const result = await LawSyncManager.checkAndSync(isManual);
      if (result.success) {
        setOfflineDb(LawSyncManager.getActiveDatabase());
        setLastSync(LawSyncManager.getLastSyncDate());
        setVersion(LawSyncManager.getActiveVersion());

        if (result.updated) {
          showToast(`⚡ Legal Database Updated: ${result.version} active`, 'success');
        } else if (isManual) {
          showToast(`Legal database is verified up-to-date (${result.version})`, 'info');
        }
      } else if (isManual) {
        showToast(result.message || 'Sync failed', 'warning');
      }
      return result;
    } catch (err) {
      console.error("Manual sync failed:", err);
      if (isManual) showToast('Failed to check for legal updates', 'warning');
      return { success: false, error: err };
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Check for updates on mount if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      syncNow(false);
    }

    const handleOnline = () => {
      syncNow(false);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncNow]);

  return { offlineDb, lastSync, version, isSyncing, syncNow };
}
