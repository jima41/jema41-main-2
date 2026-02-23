import { useEffect } from 'react';
import { dataSyncService, DataSyncReport, DataIntegrity } from '@/services/dataSyncService';

/**
 * Hook pour initialiser et gérer la synchronisation des données
 * Doit être appelé dans un App wrapper (une seule fois au démarrage)
 */
export const useDataSync = () => {
  useEffect(() => {
    // Synchronisation initiale au montage
    const initialReport = dataSyncService.sync();
    
    // Vérifier l'intégrité des données
    const integrity = dataSyncService.checkIntegrity();
    
    if (!integrity.isConsistent) {
      console.warn('[DataSync] Data integrity issues detected:', integrity.issues);
    }

    // Synchronisation périodique toutes les 5 minutes
    const syncInterval = setInterval(() => {
      const report = dataSyncService.sync();
      if (!report.isValid) {
        console.error('[DataSync] Sync error:', report.errors);
      }
    }, 5 * 60 * 1000);

    // Synchronisation lors du changement d'onglet/fenêtre
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[DataSync] Tab became visible, syncing data...');
        dataSyncService.sync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Synchronisation avant de quitter la page
    const handleBeforeUnload = () => {
      dataSyncService.sync();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    sync: () => dataSyncService.sync(),
    checkIntegrity: () => dataSyncService.checkIntegrity(),
    exportData: () => dataSyncService.exportData(),
    importData: (backup: any) => dataSyncService.importData(backup),
    getSyncLogs: () => dataSyncService.getSyncLogs(),
    subscribe: (callback: (report: DataSyncReport) => void) =>
      dataSyncService.subscribe(callback),
  };
};

export type { DataSyncReport, DataIntegrity } from '@/services/dataSyncService';
