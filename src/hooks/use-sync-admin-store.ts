import { useEffect, useRef } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  broadcastSync, 
  forceSync, 
  initializeSync,
  getLastSyncedData,
  type SyncData 
} from '@/services/syncService';

/**
 * Hook pour synchroniser le store admin en temps réel
 * Synchronise les données entre web/mobile et entre différents onglets/fenêtres
 */
export const useSyncAdminStore = () => {
  const isInitialized = useRef(false);
  
  // Récupérer les données du store
  const products = useAdminStore((state) => state.products);
  const orders = useAdminStore((state) => state.orders);
  const abandonedCarts = useAdminStore((state) => state.abandonedCarts);
  const featuredProductIds = useAdminStore((state) => state.featuredProductIds);

  // Initialiser la synchronisation
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initialiser l'écoute des changements depuis d'autres onglets
    const unsubscribe = initializeSync((syncData: SyncData) => {
      const currentState = useAdminStore.getState();
      const incomingProducts = Array.isArray(syncData.products) ? syncData.products : [];
      const incomingFeatured = Array.isArray(syncData.featuredProductIds) ? syncData.featuredProductIds : [];
      const incomingOrders = Array.isArray(syncData.orders) ? syncData.orders : [];
      const incomingCarts = Array.isArray(syncData.abandonedCarts) ? syncData.abandonedCarts : [];

      // Évite d'écraser un état valide par un snapshot vide (cas de synchro instable mobile/cross-tab)
      const shouldKeepLocalProducts = incomingProducts.length === 0 && currentState.products.length > 0;

      // Mettre à jour le store avec les données synchronisées
      useAdminStore.setState({
        products: shouldKeepLocalProducts ? currentState.products : incomingProducts,
        orders: incomingOrders,
        abandonedCarts: incomingCarts,
        featuredProductIds: shouldKeepLocalProducts ? currentState.featuredProductIds : incomingFeatured,
      });
    });

    // Charger les dernières données synchronisées au démarrage
    const lastSyncedData = getLastSyncedData();
    const hasLastSyncedData =
      !!lastSyncedData &&
      (
        (Array.isArray(lastSyncedData.products) && lastSyncedData.products.length > 0) ||
        (Array.isArray(lastSyncedData.orders) && lastSyncedData.orders.length > 0) ||
        (Array.isArray(lastSyncedData.abandonedCarts) && lastSyncedData.abandonedCarts.length > 0) ||
        (Array.isArray(lastSyncedData.featuredProductIds) && lastSyncedData.featuredProductIds.length > 0)
      );

    if (hasLastSyncedData && lastSyncedData) {
      useAdminStore.setState({
        products: lastSyncedData.products,
        orders: lastSyncedData.orders,
        abandonedCarts: lastSyncedData.abandonedCarts,
        featuredProductIds: lastSyncedData.featuredProductIds,
      });
    }

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Syncer les changements du store
  useEffect(() => {
    // Évite de pousser un snapshot totalement vide qui écrase les autres vues
    const hasAnyData =
      products.length > 0 ||
      orders.length > 0 ||
      abandonedCarts.length > 0 ||
      featuredProductIds.length > 0;

    if (!hasAnyData) {
      return;
    }

    const syncData: SyncData = {
      products,
      featuredProductIds,
      orders,
      abandonedCarts,
      lastSyncTime: Date.now(),
    };

    // Broadcaster les changements à tous les appareils/onglets
    broadcastSync(syncData);
  }, [products, orders, abandonedCarts, featuredProductIds]);

  return {
    products,
    orders,
    abandonedCarts,
    featuredProductIds,
  };
};

/**
 * Hook pour forcer une synchronisation complète
 */
export const useForceSync = () => {
  return () => {
    const state = useAdminStore.getState();
    const syncData: SyncData = {
      products: state.products,
      featuredProductIds: state.featuredProductIds,
      orders: state.orders,
      abandonedCarts: state.abandonedCarts,
      lastSyncTime: Date.now(),
    };
    forceSync(syncData);
  };
};
