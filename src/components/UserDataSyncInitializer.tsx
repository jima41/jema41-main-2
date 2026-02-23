import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { supabase } from '@/integrations/supabase/supabase';

/**
 * Composant qui gère l'initialisation et la synchronisation en temps réel
 * des données utilisateur (panier et favoris) depuis Supabase.
 *
 * - Quand l'utilisateur est connecté : merge le guest cart dans Supabase,
 *   puis charge le panier complet depuis la DB et active le realtime.
 * - Quand l'utilisateur se déconnecte : restaure le panier local
 *   depuis le localStorage (guest cart).
 */
export const UserDataSyncInitializer = () => {
  const { user } = useAuth();
  const {
    initializeCart,
    initializeGuestCart,
    mergeGuestCart,
    migrateGuestPromo,
    setupCartRealtime,
    teardownCartRealtime,
  } = useCartStore();
  const { initializeFavorites, setupFavoritesRealtime, teardownFavoritesRealtime } = useFavoritesStore();

  useEffect(() => {
    if (!user?.id) {
      // Utilisateur déconnecté: nettoyer les subscriptions et charger le guest cart
      console.log('🔐 Utilisateur déconnecté - chargement guest cart');
      teardownCartRealtime();
      teardownFavoritesRealtime();
      initializeGuestCart();
      useFavoritesStore.setState({ favorites: [] });
      return;
    }

    // Utilisateur connecté: fusionner le guest cart, puis initialiser depuis Supabase
    console.log(`✅ Utilisateur connecté: ${user.email}`);

    const initializeUserData = async () => {
      try {
        const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
          Promise.race([
            promise,
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`${label} timeout après ${ms}ms`)), ms)
            ),
          ]);

        // 1. Fusionner le guest cart dans Supabase
        await withTimeout(mergeGuestCart(user.id), 15000, 'mergeGuestCart');

        // 1b. Migrer le promo code stocké en local vers le store utilisateur
        await withTimeout(migrateGuestPromo(user.id), 5000, 'migrateGuestPromo');

        // 2. Charger le panier complet depuis Supabase (inclut les articles fusionnés)
        await withTimeout(initializeCart(user.id), 10000, 'initializeCart');
        setupCartRealtime(user.id);

        // 3. Charger les favoris
        await withTimeout(initializeFavorites(user.id), 10000, 'initializeFavorites');
        setupFavoritesRealtime(user.id);

        console.log('✅ Synchronisation utilisateur complète');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des données utilisateur:', error);
      }
    };

    initializeUserData();

    return () => {
      teardownCartRealtime();
      teardownFavoritesRealtime();
    };
  }, [user?.id]);

  return null;
};

export default UserDataSyncInitializer;
