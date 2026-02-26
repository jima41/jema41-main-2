import { create } from 'zustand';
import {
  getUserCart,
  addToCart as supabaseAddToCart,
  updateCartItemQuantity,
  removeFromCart as supabaseRemoveFromCart,
  clearCart as supabaseClearCart,
  subscribeToCart,
  updateCartItemsByProductId,
  removeCartItemsByProductId,
  type CartItemDB,
} from '@/integrations/supabase/supabase';
import { supabase } from '@/integrations/supabase/supabase';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  scent?: string;
  category?: string;
  quantity: number;
  userId?: string;
}

// ========== GUEST CART LOCALSTORAGE HELPERS ==========
const GUEST_CART_KEY = 'rayha_guest_cart';

// Promo persistence key (guest)
const GUEST_PROMO_KEY = 'rayha_guest_promo';

const loadGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    console.warn('⚠️ Impossible de sauvegarder le guest cart dans localStorage');
  }
};

const clearGuestCartStorage = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(GUEST_PROMO_KEY);
  } catch { /* ignore */ }
};

const loadGuestPromo = (): { code: string | null; discount: number } => {
  try {
    const raw = localStorage.getItem(GUEST_PROMO_KEY);
    if (!raw) return { code: null, discount: 0 };
    const parsed = JSON.parse(raw);
    const discount = Number(parsed.discount);
    return { code: parsed.code || null, discount: Number.isFinite(discount) ? discount : 0 };
  } catch {
    return { code: null, discount: 0 };
  }
};

const saveGuestPromo = (code: string | null, discount: number) => {
  try {
    localStorage.setItem(GUEST_PROMO_KEY, JSON.stringify({ code, discount }));
  } catch {
    console.warn('⚠️ Impossible de sauvegarder le promo code dans localStorage');
  }
};

const clearGuestPromo = () => {
  try {
    localStorage.removeItem(GUEST_PROMO_KEY);
  } catch { /* ignore */ }
};

interface CartStoreState {
  // State
  cartItems: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  error: string | null;
  promoCode: string | null;
  promoDiscount: number;

  // Computations
  cartItemsCount: number;
  cartTotal: number;

  // Initialization & Sync
  initializeCart: (userId: string) => Promise<void>;
  initializeGuestCart: () => void;
  setupCartRealtime: (userId: string) => void;
  teardownCartRealtime: () => void;

  // Actions
  addToCart: (product: {
    productId: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
    scent?: string;
    category?: string;
  }, userId: string) => Promise<void>;
  addToCartGuest: (product: {
    productId: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
    scent?: string;
    category?: string;
  }) => void;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  updateQuantityGuest: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => Promise<void>;
  removeItemGuest: (cartItemId: string) => void;
  clearCart: (userId: string) => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;
  migrateGuestPromo: (userId: string) => Promise<void>;
  setIsCartOpen: (open: boolean) => void;
  setPromoCode: (code: string, discount: number) => void;
  clearPromoCode: () => void;

  // Observers
  getCartItems: () => CartItem[];
  watchCartChanges: (callback: (items: CartItem[]) => void) => () => void;

  // Data integrity
  validateCart: (validIds: Set<string>) => void;

  // Sync produit → panier (appelé par l'admin quand un produit est modifié)
  syncProductToCart: (productId: string, updates: {
    name?:     string;
    price?:    number;
    brand?:    string;
    image?:    string;
    scent?:    string;
    category?: string;
    stock?:    number;
  }) => void;
}

// Helper to calculate cart totals
const calculateTotals = (items: CartItem[]) => ({
  cartItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
});

// Convert Supabase CartItemDB to CartItem
const dbToCartItem = (dbItem: CartItemDB): CartItem => ({
  id: dbItem.id,
  productId: dbItem.product_id,
  name: dbItem.product_name,
  brand: dbItem.product_brand,
  price: dbItem.product_price,
  image: dbItem.product_image || undefined,
  scent: dbItem.product_scent || undefined,
  category: dbItem.product_category || undefined,
  quantity: dbItem.quantity,
  userId: dbItem.user_id,
});

// Realtime subscription reference
let cartRealtimeSubscription: any = null;

export const useCartStore = create<CartStoreState>()((set, get) => ({
  // Initial State
  cartItems: [],
  isCartOpen: false,
  isLoading: false,
  error: null,
  promoCode: null,
  promoDiscount: 0,
  cartItemsCount: 0,
  cartTotal: 0,

  // ========== INITIALIZATION ==========

  /**
   * Initialise le guest cart depuis localStorage
   */
  initializeGuestCart: () => {
    const items = loadGuestCart();
    const promo = loadGuestPromo();
    const totals = calculateTotals(items);
    set({ cartItems: items, ...totals, isLoading: false, promoCode: promo.code, promoDiscount: promo.discount });
    console.log(`📦 Guest cart chargé: ${items.length} articles`);
  },

  /**
   * Migrer le promo stocké en local (guest) vers l'état courant après login.
   * Ne tente pas d'écrire dans la DB (pas de table promo dédiée) — applique simplement
   * le code au store authentifié et nettoie le localStorage.
   */
  migrateGuestPromo: async (userId: string) => {
    try {
      const promo = loadGuestPromo();
      if (promo && promo.code) {
        // Appliquer le code dans l'état courant
        set({ promoCode: promo.code, promoDiscount: promo.discount });
        // Nettoyer le guest promo
        clearGuestPromo();
        console.log(`🔁 Promo migré pour user ${userId}: ${promo.code}`);
      }
    } catch (error) {
      console.error('❌ Erreur migrateGuestPromo:', error);
    }
  },

  /**
   * Initialise le panier depuis Supabase pour l'utilisateur connecté
   */
  initializeCart: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📦 Initialisation du panier depuis Supabase...');
      const dbItems = await getUserCart(userId);
      const cartItems = dbItems.map(dbToCartItem);
      const totals = calculateTotals(cartItems);

      set({
        cartItems,
        ...totals,
        isLoading: false,
        error: null,
      });

      console.log(`✅ Panier initialisé: ${cartItems.length} articles`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement du panier';
      set({
        isLoading: false,
        error: message,
      });
      console.error('❌ Erreur initializeCart:', error);
    }
  },

  /**
   * Active la synchronisation en temps réel du panier
   */
  setupCartRealtime: (userId: string) => {
    if (cartRealtimeSubscription) {
      console.log('📡 Souscription panier déjà active');
      return;
    }

    console.log('🔌 Activation sync panier temps réel...');

    cartRealtimeSubscription = subscribeToCart(
      userId,
      (payload) => {
        const state = get();
        const eventType = payload.eventType;
        const newRecord = payload.new as CartItemDB | null;
        const oldRecord = payload.old as CartItemDB | null;

        if (eventType === 'INSERT' && newRecord) {
          const newItem = dbToCartItem(newRecord);
          set((s) => {
            // Vérifier si cet item existe déjà (par id DB ou par productId)
            const existsById = s.cartItems.some((item) => item.id === newItem.id);
            if (existsById) {
              // Déjà présent (ajouté via le retour de addToCart), ignorer
              return s;
            }
            // Remplacer un item temp_ avec le même productId
            const tempIdx = s.cartItems.findIndex(
              (item) => item.id.startsWith('temp_') && item.productId === newItem.productId
            );
            if (tempIdx >= 0) {
              const items = s.cartItems.map((item, i) => i === tempIdx ? newItem : item);
              return { cartItems: items, ...calculateTotals(items) };
            }
            // Vérifier par productId (item déjà consolidé)
            const existsByProduct = s.cartItems.some((item) => item.productId === newItem.productId);
            if (existsByProduct) {
              // L'item existe déjà, ne pas dupliquer
              return s;
            }
            // Vraiment nouveau (ajouté depuis un autre onglet/appareil)
            const items = [...s.cartItems, newItem];
            return { cartItems: items, ...calculateTotals(items) };
          });
          console.log('🆕 Article ajouté au panier');
        } else if (eventType === 'UPDATE' && newRecord) {
          const updatedItem = dbToCartItem(newRecord);
          set((s) => {
            // Chercher par ID exact d'abord, sinon par productId
            let found = false;
            let items = s.cartItems.map((item) => {
              if (item.id === updatedItem.id) {
                found = true;
                return updatedItem;
              }
              return item;
            });
            if (!found) {
              // Remplacer par productId (cas d'un temp_ item)
              items = s.cartItems.map((item) =>
                item.productId === updatedItem.productId ? updatedItem : item
              );
            }
            return {
              cartItems: items,
              ...calculateTotals(items),
            };
          });
          console.log('🔄 Article du panier mis à jour');
        } else if (eventType === 'DELETE' && oldRecord) {
          set((s) => {
            const items = s.cartItems.filter((item) => item.id !== oldRecord.id);
            return {
              cartItems: items,
              ...calculateTotals(items),
            };
          });
          console.log('🗑️ Article retiré du panier');
        }
      },
      (error) => {
        console.error('❌ Erreur sync panier:', error);
        setTimeout(() => {
          console.log('🔄 Tentative de reconnexion panier...');
          cartRealtimeSubscription = null;
          get().setupCartRealtime(userId);
        }, 5000);
      }
    );
  },

  /**
   * Désactive la synchronisation panier
   */
  teardownCartRealtime: () => {
    if (cartRealtimeSubscription) {
      cartRealtimeSubscription.unsubscribe();
      cartRealtimeSubscription = null;
    }
  },

  // ========== ACTIONS ==========

  /**
   * Ajoute un produit au panier GUEST (localStorage uniquement)
   */
  addToCartGuest: (product) => {
    const productPriceNum = typeof product.price === 'string'
      ? parseFloat(product.price as unknown as string)
      : product.price;

    set((state) => {
      const existingIndex = state.cartItems.findIndex(
        (item) => item.productId === product.productId
      );

      let items: CartItem[];
      if (existingIndex >= 0) {
        items = state.cartItems.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          productId: product.productId,
          name: product.name,
          brand: product.brand,
          price: productPriceNum,
          image: product.image,
          scent: product.scent,
          category: product.category,
          quantity: 1,
        };
        items = [...state.cartItems, newItem];
      }

      saveGuestCart(items);
      return {
        cartItems: items,
        ...calculateTotals(items),
        isCartOpen: true,
      };
    });
    console.log('🛒 Article ajouté au guest cart');
  },

  /**
   * Met à jour la quantité d'un article GUEST
   */
  updateQuantityGuest: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItemGuest(cartItemId);
      return;
    }
    set((state) => {
      const items = state.cartItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      );
      saveGuestCart(items);
      return { cartItems: items, ...calculateTotals(items) };
    });
  },

  /**
   * Retire un article du guest cart
   */
  removeItemGuest: (cartItemId) => {
    set((state) => {
      const items = state.cartItems.filter((item) => item.id !== cartItemId);
      saveGuestCart(items);
      return { cartItems: items, ...calculateTotals(items) };
    });
  },

  /**
   * Fusionne le guest cart dans Supabase au login, puis vide le localStorage
   */
  mergeGuestCart: async (userId: string) => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return;

    console.log(`🔀 Fusion du guest cart: ${guestItems.length} articles`);
    try {
      for (const item of guestItems) {
        await supabaseAddToCart(userId, item.productId, {
          name: item.name,
          brand: item.brand,
          price: item.price,
          image: item.image,
          scent: item.scent,
          category: item.category,
        }, item.quantity);
      }
      clearGuestCartStorage();
      console.log('✅ Guest cart fusionné dans Supabase');
    } catch (error) {
      console.error('❌ Erreur mergeGuestCart:', error);
    }
  },

  /**
   * Ajoute un produit au panier (utilisateur connecté → Supabase)
   */
  addToCart: async (product, userId) => {
    try {
      const productPriceNum = typeof product.price === 'string' 
        ? parseFloat(product.price) 
        : product.price;

      // Optimistic update - vérifier si le produit existe déjà
      set((state) => {
        const existingIndex = state.cartItems.findIndex(
          (item) => item.productId === product.productId
        );

        let items: CartItem[];
        if (existingIndex >= 0) {
          // Incrémenter la quantité de l'article existant
          items = state.cartItems.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Ajouter un nouvel article
          const newItem: CartItem = {
            id: `temp_${Date.now()}`,
            productId: product.productId,
            name: product.name,
            brand: product.brand,
            price: productPriceNum,
            image: product.image,
            scent: product.scent,
            category: product.category,
            quantity: 1,
            userId,
          };
          items = [...state.cartItems, newItem];
        }

        return {
          cartItems: items,
          ...calculateTotals(items),
          isCartOpen: true,
        };
      });

      // Sauvegarde dans Supabase (gère déjà le upsert côté DB)
      const dbResult = await supabaseAddToCart(userId, product.productId, {
        name: product.name,
        brand: product.brand,
        price: productPriceNum,
        image: product.image,
        scent: product.scent,
        category: product.category,
      });

      // Remplacer l'item temp par l'item réel de la DB
      if (dbResult) {
        const realItem = dbToCartItem(dbResult);
        set((state) => {
          // Remplacer temp_ item ou item existant par la version DB
          const hasReal = state.cartItems.some((item) => item.id === realItem.id);
          let items: CartItem[];
          if (hasReal) {
            // L'item DB existe déjà, juste mettre à jour
            items = state.cartItems
              .filter((item) => !(item.id.startsWith('temp_') && item.productId === realItem.productId))
              .map((item) => item.id === realItem.id ? realItem : item);
          } else {
            // Remplacer le temp_ par le vrai item
            const tempIdx = state.cartItems.findIndex(
              (item) => item.id.startsWith('temp_') && item.productId === realItem.productId
            );
            if (tempIdx >= 0) {
              items = state.cartItems.map((item, i) => i === tempIdx ? realItem : item);
            } else {
              // Aucun temp trouvé, mettre à jour par productId
              const existIdx = state.cartItems.findIndex((item) => item.productId === realItem.productId);
              if (existIdx >= 0) {
                items = state.cartItems.map((item, i) => i === existIdx ? realItem : item);
              } else {
                items = [...state.cartItems, realItem];
              }
            }
          }
          return {
            cartItems: items,
            ...calculateTotals(items),
          };
        });
      }

      console.log('🛒 Article ajouté au panier');
    } catch (error) {
      console.error('❌ Erreur addToCart:', error);
      throw error;
    }
  },

  /**
   * Met à jour la quantité d'un article
   */
  updateQuantity: async (cartItemId, quantity) => {
    try {
      if (quantity <= 0) {
        await get().removeItem(cartItemId);
        return;
      }

      // Optimistic update
      set((state) => {
        const items = state.cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        return {
          cartItems: items,
          ...calculateTotals(items),
        };
      });

      // Sync avec Supabase
      await updateCartItemQuantity(cartItemId, quantity);
      console.log('🔄 Quantité mise à jour');
    } catch (error) {
      console.error('❌ Erreur updateQuantity:', error);
      throw error;
    }
  },

  /**
   * Retire un article du panier
   */
  removeItem: async (cartItemId) => {
    try {
      // Optimistic update
      set((state) => {
        const items = state.cartItems.filter((item) => item.id !== cartItemId);
        return {
          cartItems: items,
          ...calculateTotals(items),
        };
      });

      // Sync avec Supabase
      await supabaseRemoveFromCart(cartItemId);
      console.log('🗑️ Article retiré du panier');
    } catch (error) {
      console.error('❌ Erreur removeItem:', error);
      throw error;
    }
  },

  /**
   * Vide le panier
   */
  clearCart: async (userId) => {
    try {
      // Optimistic update
      set({
        cartItems: [],
        cartItemsCount: 0,
        cartTotal: 0,
        promoCode: null,
        promoDiscount: 0,
      });

      // Sync avec Supabase
      await supabaseClearCart(userId);
      console.log('🗑️ Panier vidé');
    } catch (error) {
      console.error('❌ Erreur clearCart:', error);
      throw error;
    }
  },

  /**
   * Change l'état d'ouverture/fermeture du panier
   */
  setIsCartOpen: (open) =>
    set({
      isCartOpen: open,
    }),

  setPromoCode: (code, discount) => {
    saveGuestPromo(code, discount);
    set({
      promoCode: code,
      promoDiscount: discount,
    });
  },

  clearPromoCode: () => {
    clearGuestPromo();
    set({
      promoCode: null,
      promoDiscount: 0,
    });
  },

  // ========== OBSERVERS ==========

  /**
   * Retourne les articles du panier
   */
  getCartItems: () => get().cartItems,

  /**
   * S'abonne aux changements du panier
   */
  watchCartChanges: (callback) => {
    callback(get().cartItems);

    const unsubscribe = useCartStore.subscribe(
      (state) => state.cartItems,
      (items) => {
        callback(items);
      }
    );

    return unsubscribe;
  },

  /**
   * Synchronise les données d'un produit dans tous les paniers (mémoire + Supabase + localStorage).
   * Appelé automatiquement par l'admin après chaque modification de produit.
   */
  syncProductToCart: (productId, updates) => {
    // Stock tombé à 0 → retirer le produit de tous les paniers
    if (updates.stock !== undefined && updates.stock <= 0) {
      set((state) => {
        const items = state.cartItems.filter(item => item.productId !== productId);
        if (items.length === state.cartItems.length) return state;
        saveGuestCart(items);
        return { cartItems: items, ...calculateTotals(items) };
      });
      // Supabase : suppression en arrière-plan (tous les users)
      removeCartItemsByProductId(productId).catch(console.error);
      return;
    }

    // Construire les champs à mettre à jour dans CartItem
    const cartUpdates: Partial<CartItem> = {};
    const dbUpdates: Record<string, unknown> = {};

    if (updates.name     !== undefined) { cartUpdates.name     = updates.name;     dbUpdates.product_name     = updates.name; }
    if (updates.price    !== undefined) { cartUpdates.price    = updates.price;    dbUpdates.product_price    = updates.price; }
    if (updates.brand    !== undefined) { cartUpdates.brand    = updates.brand;    dbUpdates.product_brand    = updates.brand; }
    if (updates.image    !== undefined) { cartUpdates.image    = updates.image;    dbUpdates.product_image    = updates.image ?? null; }
    if (updates.scent    !== undefined) { cartUpdates.scent    = updates.scent;    dbUpdates.product_scent    = updates.scent ?? null; }
    if (updates.category !== undefined) { cartUpdates.category = updates.category; dbUpdates.product_category = updates.category ?? null; }

    if (Object.keys(cartUpdates).length === 0) return;

    set((state) => {
      const hasItem = state.cartItems.some(item => item.productId === productId);
      if (!hasItem) return state;
      const items = state.cartItems.map(item =>
        item.productId === productId ? { ...item, ...cartUpdates } : item
      );
      saveGuestCart(items);
      return { cartItems: items, ...calculateTotals(items) };
    });

    // Supabase : mise à jour en arrière-plan (tous les users connectés)
    updateCartItemsByProductId(productId, dbUpdates as Parameters<typeof updateCartItemsByProductId>[1])
      .catch(console.error);
  },

  /**
   * Valide le panier (nettoie les articles orphelins)
   */
  validateCart: (validIds: Set<string>) => {
    set((state) => {
      const cleanedItems = state.cartItems.filter((item) =>
        validIds.has(item.productId)
      );
      const totals = calculateTotals(cleanedItems);
      return {
        cartItems: cleanedItems,
        ...totals,
      };
    });
  },
}));

// Hook personnalisé pour utiliser le panier
export const useCart = () => {
  const {
    cartItems,
    isCartOpen,
    cartItemsCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
    isLoading,
    error,
  } = useCartStore();

  return {
    cartItems,
    isCartOpen,
    cartItemsCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
    isLoading,
    error,
  };
};

export default useCartStore;
