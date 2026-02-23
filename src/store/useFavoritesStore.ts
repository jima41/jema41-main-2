import { create } from 'zustand';
import {
  getUserWishlist,
  toggleWishlist as supabaseToggleWishlist,
  addToWishlist as supabaseAddToWishlist,
  removeFromWishlist as supabaseRemoveFromWishlist,
  subscribeToWishlist,
} from '@/integrations/supabase/supabase';

interface FavoritesStore {
  // State
  favorites: string[];
  isLoading: boolean;
  error: string | null;

  // Initialization & Sync
  initializeFavorites: (userId: string) => Promise<void>;
  setupFavoritesRealtime: (userId: string) => void;
  teardownFavoritesRealtime: () => void;

  // Actions
  addFavorite: (userId: string, productId: string) => Promise<void>;
  removeFavorite: (userId: string, productId: string) => Promise<void>;
  toggleFavorite: (userId: string, productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  getFavorites: () => string[];
  
  // Data integrity
  validateFavorites: (validIds: Set<string>) => void;
}

// Realtime subscription reference
let favoritesRealtimeSubscription: any = null;

export const useFavoritesStore = create<FavoritesStore>()((set, get) => ({
  // Initial State
  favorites: [],
  isLoading: false,
  error: null,

  // ========== INITIALIZATION ==========

  /**
   * Initialise les favoris depuis Supabase
   */
  initializeFavorites: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('❤️ Initialisation des favoris depuis Supabase...');
      const favorites = await getUserWishlist(userId);

      set({
        favorites,
        isLoading: false,
        error: null,
      });

      console.log(`✅ Favoris initialisés: ${favorites.length} produits`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des favoris';
      set({
        isLoading: false,
        error: message,
      });
      console.error('❌ Erreur initializeFavorites:', error);
    }
  },

  /**
   * Active la synchronisation en temps réel des favoris
   */
  setupFavoritesRealtime: (userId: string) => {
    if (favoritesRealtimeSubscription) {
      console.log('📡 Souscription favoris déjà active');
      return;
    }

    console.log('🔌 Activation sync favoris temps réel...');

    favoritesRealtimeSubscription = subscribeToWishlist(
      userId,
      (payload) => {
        const eventType = payload.eventType;
        const newRecord = payload.new;
        const oldRecord = payload.old;

        if (eventType === 'INSERT' && newRecord) {
          set((state) => {
            if (!state.favorites.includes(newRecord.product_id)) {
              return {
                favorites: [...state.favorites, newRecord.product_id],
              };
            }
            return state;
          });
          console.log('❤️ Produit ajouté aux favoris');
        } else if (eventType === 'DELETE' && oldRecord) {
          set((state) => ({
            favorites: state.favorites.filter((id) => id !== oldRecord.product_id),
          }));
          console.log('🤍 Produit retiré des favoris');
        }
      },
      (error) => {
        console.error('❌ Erreur sync favoris:', error);
        setTimeout(() => {
          console.log('🔄 Tentative de reconnexion favoris...');
          favoritesRealtimeSubscription = null;
          get().setupFavoritesRealtime(userId);
        }, 5000);
      }
    );
  },

  /**
   * Désactive la synchronisation favoris
   */
  teardownFavoritesRealtime: () => {
    if (favoritesRealtimeSubscription) {
      favoritesRealtimeSubscription.unsubscribe();
      favoritesRealtimeSubscription = null;
    }
  },

  // ========== ACTIONS ==========

  /**
   * Ajoute un produit aux favoris
   */
  addFavorite: async (userId: string, productId: string) => {
    try {
      // Optimistic update
      set((state) => {
        if (!state.favorites.includes(productId)) {
          return { favorites: [...state.favorites, productId] };
        }
        return state;
      });

      // Sync avec Supabase
      await supabaseAddToWishlist(userId, productId);
      console.log('❤️ Produit ajouté aux favoris');
    } catch (error) {
      console.error('❌ Erreur addFavorite:', error);
      throw error;
    }
  },

  /**
   * Retire un produit des favoris
   */
  removeFavorite: async (userId: string, productId: string) => {
    try {
      // Optimistic update
      set((state) => ({
        favorites: state.favorites.filter((id) => id !== productId),
      }));

      // Sync avec Supabase
      await supabaseRemoveFromWishlist(userId, productId);
      console.log('🤍 Produit retiré des favoris');
    } catch (error) {
      console.error('❌ Erreur removeFavorite:', error);
      throw error;
    }
  },

  /**
   * Ajoute/retire un produit des favoris
   */
  toggleFavorite: async (userId: string, productId: string) => {
    const state = get();
    if (state.isFavorite(productId)) {
      await get().removeFavorite(userId, productId);
    } else {
      await get().addFavorite(userId, productId);
    }
  },

  /**
   * Vérifie si un produit est en favoris
   */
  isFavorite: (productId: string) => {
    return get().favorites.includes(productId);
  },

  /**
   * Retourne la liste des favoris
   */
  getFavorites: () => {
    return get().favorites;
  },

  /**
   * Valide les favoris (nettoie les produits orphelins)
   */
  validateFavorites: (validIds: Set<string>) => {
    set((state) => ({
      favorites: state.favorites.filter((id) => validIds.has(id)),
    }));
  },
}));

// Hook personnalisé pour utiliser les favoris
export const useFavorites = () => {
  const {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavorites,
    isLoading,
    error,
  } = useFavoritesStore();

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavorites,
    isLoading,
    error,
  };
};

export default useFavoritesStore;
