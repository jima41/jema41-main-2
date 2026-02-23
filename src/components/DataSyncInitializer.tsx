import { useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { useCartStore } from '@/store/useCartStore';
import { usePromoCodesStore } from '@/store/usePromoCodesStore';
import { useToast } from '@/hooks/use-toast';

/**
 * Composant d'initialisation de la synchronisation des données
 * Charge les produits depuis Supabase et active la synchronisation temps réel
 */
export function DataSyncInitializer({ children }: { children: React.ReactNode }) {
  const initializeProducts = useAdminStore((state) => state.initializeProducts);
  const setupRealtimeSync = useAdminStore((state) => state.setupRealtimeSync);
  const teardownRealtimeSync = useAdminStore((state) => state.teardownRealtimeSync);
  const isInitialized = useAdminStore((state) => state.isInitialized);
  const productsLoading = useAdminStore((state) => state.productsLoading);
  const products = useAdminStore((state) => state.products);

  // Promo code validation
  const appliedPromoCode = useCartStore((state) => state.promoCode);
  const clearPromoCode = useCartStore((state) => state.clearPromoCode);
  const promoCodes = usePromoCodesStore((state) => state.promoCodes);
  const { toast } = useToast();

  // Log statut uniquement lorsqu'il y a un changement significatif
  // (évite d'émettre un log à chaque rendu et de créer une boucle avec `SyncStatus`)
  // Note: SyncStatus capture les console logs et les met dans son propre état.
  // On ne veut pas déclencher cela à chaque rendu.
  
  useEffect(() => {
    console.log('🟢 [DataSyncInitializer] STATUS', { isInitialized, productsLoading, productsCount: products.length });
  }, [isInitialized, productsLoading, products.length]);

  // Initialisation des produits au montage du composant
  useEffect(() => {
    console.log('🟡 [DataSyncInitializer] useEffect 1 - Conditions:', { isInitialized, productsLoading });
    
    if (!isInitialized && !productsLoading) {
      console.log('🔷 [DataSyncInitializer] APPEL initializeProducts()');
      initializeProducts().then(() => {
        console.log('🟢 [DataSyncInitializer] initializeProducts() COMPLÉTÉ');
      }).catch((error) => {
        console.error('🔴 [DataSyncInitializer] initializeProducts() ERREUR:', error);
      });
    } else {
      console.log('🟠 [DataSyncInitializer] CONDITIONS NON MET - isInitialized:', isInitialized, ', productsLoading:', productsLoading);
    }
  }, [isInitialized, productsLoading]);

  // Configuration de la synchronisation en temps réel
  useEffect(() => {
    console.log('🟡 [DataSyncInitializer] useEffect 2 - isInitialized:', isInitialized);
    
    if (isInitialized) {
      console.log('📡 [DataSyncInitializer] setupRealtimeSync()');
      setupRealtimeSync();

      // Nettoyage lors de la destruction du composant
      return () => {
        console.log('🧹 [DataSyncInitializer] teardownRealtimeSync()');
        teardownRealtimeSync();
      };
    }
  }, [isInitialized]);

  // Validation automatique du code promo appliqué au panier
  useEffect(() => {
    if (!appliedPromoCode) return;

    const promo = promoCodes.find(
      (p) => p.code === appliedPromoCode
    );

    if (!promo) {
      // Le code promo a été supprimé par l'admin
      clearPromoCode();
      toast({
        title: 'Code promo expiré',
        description: `Le code "${appliedPromoCode}" n'est plus disponible et a été retiré de votre panier.`,
        variant: 'destructive',
        duration: 6000,
      });
    } else if (!promo.active) {
      // Le code promo a été désactivé par l'admin
      clearPromoCode();
      toast({
        title: 'Code promo désactivé',
        description: `Le code "${appliedPromoCode}" a été désactivé et a été retiré de votre panier.`,
        variant: 'destructive',
        duration: 6000,
      });
    }
  }, [appliedPromoCode, promoCodes, clearPromoCode, toast]);

  return <>{children}</>;
}

export default DataSyncInitializer;
