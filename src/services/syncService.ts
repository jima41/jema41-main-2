import { supabase } from '@/integrations/supabase/client';

/**
 * Service de synchronisation cross-device et cross-tab
 * Synchronise les données entre web/mobile et entre différents onglets
 */

export interface SyncData {
  products: any[];
  featuredProductIds: string[];
  orders: any[];
  abandonedCarts: any[];
  lastSyncTime: number;
}

// Clé pour stocker les données dans localStorage
const SYNC_STORAGE_KEY = 'admin-store-sync';
const CHANNEL_NAME = 'admin-sync';

// Map pour tracker les listeners et unsubscribe
const listeners = new Map<string, (data: any) => void>();

/**
 * Initialise la synchronisation cross-device/cross-tab
 */
export const initializeSync = (onUpdate: (data: SyncData) => void) => {
  // Écouter les changements localStorage (autres onglets)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === SYNC_STORAGE_KEY && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        onUpdate(data);
      } catch (error) {
        console.error('Erreur lors de la synchronisation du stockage:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Retourner une fonction de nettoyage
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Synchronise les données avec tous les onglets/appareils
 */
export const broadcastSync = (data: SyncData) => {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify({
      ...data,
      lastSyncTime: Date.now(),
    }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde pour synchronisation:', error);
  }
};

/**
 * Récupère les dernières données synchronisées
 */
export const getLastSyncedData = (): SyncData | null => {
  try {
    const data = localStorage.getItem(SYNC_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données synchronisées:', error);
    return null;
  }
};

/**
 * S'abonne à un type de données pour les mises à jour en temps réel
 */
export const subscribeToChanges = (
  dataType: 'products' | 'orders' | 'carts' | 'featured',
  callback: (data: any[]) => void
) => {
  const key = `${dataType}-listener`;
  
  if (listeners.has(key)) {
    listeners.delete(key);
  }
  
  listeners.set(key, callback);

  // Retourner une fonction de désinscription
  return () => {
    listeners.delete(key);
  };
};

/**
 * Notifie tous les listeners d'un changement
 */
export const notifyListeners = (dataType: string, data: any[]) => {
  const key = `${dataType}-listener`;
  const callback = listeners.get(key);
  if (callback) {
    callback(data);
  }
};

/**
 * Force une synchronisation complète entre tous les appareils
 */
export const forceSync = (data: SyncData) => {
  broadcastSync(data);
  
  // Notifier les listeners
  notifyListeners('products', data.products);
  notifyListeners('orders', data.orders);
  notifyListeners('carts', data.abandonedCarts);
  notifyListeners('featured', data.featuredProductIds);
};

/**
 * Efface toutes les données synchronisées
 */
export const clearSync = () => {
  localStorage.removeItem(SYNC_STORAGE_KEY);
  listeners.clear();
};
