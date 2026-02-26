import { create } from 'zustand';
import { DEFAULT_PRODUCTS } from '@/lib/products';
import { classifyPerfume, type OlfactoryFamily } from '@/lib/olfactory';
import {
  fetchAllProducts,
  createProduct as supabaseCreate,
  updateProduct as supabaseUpdate,
  deleteProduct as supabaseDelete,
  subscribeToProducts,
  batchUpdateFeatured,
  SupabaseError,
  fetchAllOrders,
  insertOrder,
  updateOrderStatusInDB,
  deleteOrderFromDB,
  fetchAllAbandonedCarts,
  upsertAbandonedCart,
  updateAbandonedCartInDB,
  type ProductRow,
  type OrderRow,
  type AbandonedCartRow,
} from '@/integrations/supabase/supabase';
import { useCartStore } from '@/store/useCartStore';

// Importer les images
import perfume1 from '@/assets/perfume-1.jpg';
import perfume2 from '@/assets/perfume-2.jpg';
import perfume3 from '@/assets/perfume-3.jpg';
import perfume4 from '@/assets/perfume-4.jpg';
import perfume5 from '@/assets/perfume-5.jpg';
import perfume6 from '@/assets/perfume-6.jpg';
import perfume7 from '@/assets/perfume-7.jpg';
import perfume8 from '@/assets/perfume-8.jpg';
import perfume9 from '@/assets/perfume-9.jpg';
import perfume10 from '@/assets/perfume-10.jpg';
import perfume11 from '@/assets/perfume-11.jpg';
import perfume12 from '@/assets/perfume-12.jpg';
import perfume13 from '@/assets/perfume-13.jpg';
import perfume14 from '@/assets/perfume-14.jpg';
import perfume15 from '@/assets/perfume-15.jpg';
import perfume16 from '@/assets/perfume-16.jpg';
import perfume17 from '@/assets/perfume-17.jpg';
import perfume18 from '@/assets/perfume-18.jpg';
import perfume19 from '@/assets/perfume-19.jpg';
import perfume20 from '@/assets/perfume-20.jpg';
import perfume21 from '@/assets/perfume-21.jpg';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AbandonedCartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface AbandonedCart {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: AbandonedCartItem[];
  totalValue: number;
  abandonedAt: Date | string;
  recoveryAttempts: number;
  lastRecoveryEmail?: Date | string;
  recovered: boolean;
  recoveryDate?: Date | string;
  discountOffered?: number;
}

export type ProductGender = 'homme' | 'femme' | 'mixte';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  image_url?: string;
  scent: string;
  category?: string;
  concentration?: string;
  gender?: ProductGender;
  families: OlfactoryFamily[];
  description?: string;
  notes?: string[];
  notes_tete: string[];
  notes_coeur: string[];
  notes_fond: string[];
  volume?: string;
  stock: number;
  monthlySales: number;
  is_featured?: boolean;
  featured_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CRMStats {
  total: number;
  recovered: number;
  abandoned: number;
  totalValue: number;
  averageAttempts: number;
  recoveryRate: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  volume?: string;
}

export interface Order {
  id: string;
  reference?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  timestamp: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  // Horodatages de chaque étape (unix ms)
  pendingAt?: number;
  confirmedAt?: number;
  shippedAt?: number;
  deliveredAt?: number;
  notes?: string;
  promoCode?: string;
  promoDiscount?: number;
}

interface AdminStoreState {
  // Abandoned Carts
  abandonedCarts: AbandonedCart[];
  
  // Products
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  isInitialized: boolean;

  // Orders
  orders: Order[];

  // Featured Products (Notre Sélection)
  featuredProductIds: string[];

  // Initialization & Sync
  initializeProducts: () => Promise<void>;
  setupRealtimeSync: () => void;
  teardownRealtimeSync: () => void;

  // Featured Products Management (Notre Sélection)
  setFeaturedProducts: (productIds: string[]) => Promise<void>;
  getFeaturedProducts: () => Product[];
  addFeaturedProduct: (productId: string) => void;
  removeFeaturedProduct: (productId: string) => void;
  reorderFeaturedProducts: (productIds: string[]) => void;
  validateFeaturedProducts: () => void;
  loadFeaturedFromProducts: () => void;

  // CRUD Operations for Carts
  trackAbandonedCart: (cart: AbandonedCart) => void;
  sendRecoveryEmail: (cartId: string, discount: number) => void;
  markRecovered: (cartId: string) => void;
  getFilteredCarts: (filter: 'all' | 'pending' | 'recovered' | 'urgent') => AbandonedCart[];

  // CRUD Operations for Products
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateProductStock: (id: string, newStock: number) => Promise<void>;
  updateProductVelocity: (id: string, newMonthlySales: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProductsToDefaults: () => void;

  // CRUD Operations for Orders
  createOrder: (order: Omit<Order, 'id' | 'timestamp'>) => Order;
  completeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  deductStock: (items: OrderItem[]) => boolean; // Returns true if all items have enough stock
  getOrdersByUserId: (userId: string) => Order[];
  getOrderHistory: () => Order[];
  getTotalOrderValue: () => number;

  // Calculated Stats
  getStatistics: () => CRMStats;

  // Filters & Searches
  filterProductsByScent: (scent: string) => Product[];
  filterProductsByCategory: (category: string) => Product[];

  // Utility
  calculateProductVelocity: (productId: string) => number;
}

// Exporter les types olfactifs pour faciliter l'utilisation
export type { OlfactoryFamily } from '@/lib/olfactory';
export { classifyPerfume, type OlfactoryFamily } from '@/lib/olfactory';

// ============================================================================
// IMAGE MAPPING
// ============================================================================

// Mappage des images locales par ordre d'ajout
const PRODUCT_IMAGES = [
  perfume1, perfume2, perfume3, perfume4, perfume5,
  perfume6, perfume7, perfume8, perfume9, perfume10,
  perfume11, perfume12, perfume13, perfume14, perfume15,
  perfume16, perfume17, perfume18, perfume19, perfume20, perfume21,
];

/**
 * Associe une image à un produit basé sur son index ou son ID
 */
const getProductImageByIndex = (index: number): string => {
  const image = PRODUCT_IMAGES[index % PRODUCT_IMAGES.length];
  return image;
};

/**
 * Associe une image à un produit basé sur son ID numérique
 */
const getProductImageById = (id: string): string => {
  const numericId = parseInt(id, 10);
  if (!isNaN(numericId) && numericId > 0 && numericId <= PRODUCT_IMAGES.length) {
    const image = PRODUCT_IMAGES[numericId - 1];
    return image;
  }
  // Fallback sur un hash simple de l'ID
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const image = PRODUCT_IMAGES[hash % PRODUCT_IMAGES.length];
  return image;
};

// ============================================================================
// MIGRATION PRODUCTS FUNCTION
// ============================================================================

const convertProductRowToProduct = (row: ProductRow, index: number = 0): Product => {
  // Essayer d'utiliser l'ID pour mapper l'image, sinon utiliser l'index
  const imageUrl = row.image_url || getProductImageById(row.id) || getProductImageByIndex(index);
  
  // Log seulement les premiers 3 products pour éviter la surcharge
  if (index < 3) {
    console.log(`🖼️ Converting product ${row.name} (ID: ${row.id}, Index: ${index}):`, {
      hasImageUrl: !!row.image_url,
      finalImage: imageUrl?.substring?.(0, 50),
      imageType: typeof imageUrl,
    });
  }
  
  // category column stores the concentration code (EDP/EDT/EX)
  const CONCENTRATION_CODES = ['EDP', 'EDT', 'EX'];
  const concentration = CONCENTRATION_CODES.includes(row.category || '')
    ? row.category!
    : 'EDP';

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: row.price,
    image: imageUrl,
    image_url: imageUrl,
    scent: row.scent || 'Inconnu',
    category: row.category || undefined,
    concentration,
    gender: (row.gender as ProductGender) || undefined,
    families: (row.families || []) as OlfactoryFamily[],
    description: row.description || undefined,
    notes_tete: (row.notes_tete || []) as string[],
    notes_coeur: (row.notes_coeur || []) as string[],
    notes_fond: (row.notes_fond || []) as string[],
    volume: row.volume || undefined,
    stock: row.stock || 0,
    monthlySales: row.monthlysales || 0,
    is_featured: row.is_featured || false,
    featured_order: row.featured_order || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const convertProductToRow = (product: Product) => {
  return {
    name: product.name,
    brand: product.brand,
    price: product.price,
    image_url: product.image_url || product.image,
    description: product.description,
    scent: product.scent,
    // Store concentration in the category column (families[] already holds olfactory families)
    category: product.concentration || product.category || 'EDP',
    gender: product.gender || 'mixte',
    families: product.families || [],
    notes_tete: product.notes_tete || [],
    notes_coeur: product.notes_coeur || [],
    notes_fond: product.notes_fond || [],
    volume: product.volume,
    stock: product.stock || 0,
    monthlysales: product.monthlySales || 0,
  };
};

// ============================================================================
// ORDER CONVERSION
// ============================================================================

const convertOrderRowToOrder = (row: OrderRow): Order => ({
  id:              row.id,
  reference:       row.reference       ?? undefined,
  userId:          row.user_id         ?? undefined,
  userName:        row.user_name       ?? undefined,
  userEmail:       row.user_email      ?? undefined,
  items:           (row.items as OrderItem[]) || [],
  totalAmount:     row.total_amount,
  shippingAddress: row.shipping_address ?? undefined,
  status:          row.status as Order['status'],
  timestamp:       row.timestamp,
  pendingAt:       row.pending_at      ?? undefined,
  confirmedAt:     row.confirmed_at    ?? undefined,
  shippedAt:       row.shipped_at      ?? undefined,
  deliveredAt:     row.delivered_at    ?? undefined,
  notes:           row.notes           ?? undefined,
  promoCode:       row.promo_code      ?? undefined,
  promoDiscount:   row.promo_discount  ?? undefined,
});

// ============================================================================
// ABANDONED CART CONVERSION
// ============================================================================

const convertAbandonedCartRowToCart = (row: AbandonedCartRow): AbandonedCart => ({
  id:                  row.id,
  clientId:            row.client_id    ?? '',
  clientName:          row.client_name  ?? 'Client inconnu',
  clientEmail:         row.client_email ?? '',
  items:               (row.items as AbandonedCartItem[]) || [],
  totalValue:          row.total_value,
  abandonedAt:         new Date(row.abandoned_at),
  recoveryAttempts:    row.recovery_attempts,
  lastRecoveryEmail:   row.last_recovery_email ? new Date(row.last_recovery_email) : undefined,
  recovered:           row.recovered,
  recoveryDate:        row.recovery_date ? new Date(row.recovery_date) : undefined,
  discountOffered:     row.discount_offered ?? undefined,
});

// ============================================================================
// ZUSTAND STORE WITH SUPABASE INTEGRATION
// ============================================================================

let realtimeSubscription: any = null;

export const useAdminStore = create<AdminStoreState>()((set, get) => ({
  // Initial State
  abandonedCarts: [],
  products: [],
  productsLoading: false,
  productsError: null,
  isInitialized: false,
  orders: [],
  featuredProductIds: [],

  // ========== INITIALIZATION & SYNC ==========

  /**
   * Initialise les produits depuis Supabase
   * Appelée une seule fois au chargement de l'app
   */
  initializeProducts: async () => {
    const state = get();
    if (state.isInitialized) {
      console.log('✅ Produits déjà initialisés');
      return;
    }

    try {
      set({ productsLoading: true, productsError: null });
      console.log('📥 Récupération des produits et commandes depuis Supabase...');

      // Charger produits, commandes et paniers abandonnés en parallèle
      const [rows, orderRows, cartRows] = await Promise.all([
        fetchAllProducts(),
        fetchAllOrders().catch((err) => {
          console.warn('⚠️ Impossible de charger les commandes (table manquante ?):', err?.message);
          return [] as OrderRow[];
        }),
        fetchAllAbandonedCarts().catch((err) => {
          console.warn('⚠️ Impossible de charger les paniers abandonnés (table manquante ?):', err?.message);
          return [] as AbandonedCartRow[];
        }),
      ]);

      console.log(`📦 ${rows.length} produits reçus de Supabase`);
      console.log(`🛒 ${orderRows.length} commandes reçues de Supabase`);
      console.log(`🛍️ ${cartRows.length} paniers abandonnés reçus de Supabase`);

      const products = rows.map((row, index) => convertProductRowToProduct(row, index));
      const orders = orderRows.map(convertOrderRowToOrder);
      const abandonedCarts = cartRows.map(convertAbandonedCartRowToCart);
      console.log(`✅ ${products.length} produits convertis avec images`);

      // Log du premier produit pour vérifier les images
      if (products.length > 0) {
        console.log('🔍 Premier produit converti:', {
          name: products[0].name,
          image: products[0].image?.substring?.(0, 100),
          image_url: products[0].image_url?.substring?.(0, 100),
        });
      }

      set({
        products,
        orders,
        abandonedCarts,
        productsLoading: false,
        productsError: null,
        isInitialized: true,
      });

      // Load featured products from DB data
      const featuredProducts = products
        .filter((p) => p.is_featured)
        .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
      if (featuredProducts.length > 0) {
        set({ featuredProductIds: featuredProducts.map((p) => p.id) });
        console.log('📌 Featured products loaded from DB:', featuredProducts.length);
      }

      console.log('✅ Produits chargés depuis Supabase:', products.length);
      console.log('✅ Commandes chargées depuis Supabase:', orders.length);
    } catch (error) {
      console.error('❌ Erreur initializeProducts:', error);

      // Fallback to default products
      console.log('🔄 Utilisation des produits par défaut...');
      const defaultProducts = DEFAULT_PRODUCTS.map((product, index) => ({
        ...product,
        id: product.id,
        families: [], // classifyPerfume(product.scent),
        notes_tete: [],
        notes_coeur: [],
        notes_fond: [],
        stock: 10,
        monthlySales: 0,
        is_featured: false,
        featured_order: 0,
      }));

      set({
        products: defaultProducts,
        productsLoading: false,
        productsError: null,
        isInitialized: true,
      });

      console.log('✅ Produits par défaut chargés:', defaultProducts.length);
    }
  },

  /**
   * Active la synchronisation en temps réel des produits
   */
  setupRealtimeSync: () => {
    if (realtimeSubscription) {
      console.log('📡 Souscription temps réel déjà active');
      return; // Déjà en cours
    }

    console.log('🔌 Activation de la synchronisation temps réel...');

    realtimeSubscription = subscribeToProducts(
      (payload) => {
        const state = get();
        const action = payload.eventType;
        const newRecord = payload.new as ProductRow | null;
        const oldRecord = payload.old as ProductRow | null;

        if (action === 'INSERT' && newRecord) {
          const newProduct = convertProductRowToProduct(newRecord);
          set({ products: [...state.products, newProduct] });
          console.log('🆕 Nouveau produit ajouté:', newProduct.name);
        } else if (action === 'UPDATE' && newRecord) {
          const updatedProduct = convertProductRowToProduct(newRecord);
          set({
            products: state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
          });
          console.log('🔄 Produit mis à jour:', updatedProduct.name);
        } else if (action === 'DELETE' && oldRecord) {
          set({
            products: state.products.filter((p) => p.id !== oldRecord.id),
          });
          console.log('🗑️ Produit supprimé');
        }
      },
      (error) => {
        console.error('❌ Erreur synchronisation temps réel:', error);
        // Tentative de reconnexion après 5 secondes
        setTimeout(() => {
          console.log('🔄 Tentative de reconnexion...');
          realtimeSubscription = null; // Reset subscription
          get().setupRealtimeSync(); // Reconnect
        }, 5000);
      }
    );
  },

  /**
   * Désactive la synchronisation en temps réel
   */
  teardownRealtimeSync: () => {
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
      realtimeSubscription = null;
    }
  },

  // ========== FEATURED PRODUCTS OPERATIONS ==========

  setFeaturedProducts: async (productIds: string[]) => {
    // Optimistic UI: update local state immediately
    set(() => ({
      featuredProductIds: productIds,
    }));

    // Persist to Supabase
    try {
      const updates = productIds.map((id, index) => ({
        id,
        is_featured: true,
        featured_order: index + 1,
      }));
      await batchUpdateFeatured(updates);

      // Update local product objects with featured flags
      set((state) => ({
        products: state.products.map((p) => {
          const featuredIndex = productIds.indexOf(p.id);
          return {
            ...p,
            is_featured: featuredIndex >= 0,
            featured_order: featuredIndex >= 0 ? featuredIndex + 1 : 0,
          };
        }),
      }));

      console.log('✅ Featured products saved to Supabase:', productIds.length);
    } catch (error) {
      console.error('❌ Failed to save featured products to Supabase:', error);
    }
  },

  getFeaturedProducts: () => {
    const state = get();
    return state.featuredProductIds
      .map((id) => state.products.find((p) => p.id === id))
      .filter((p) => p !== undefined) as Product[];
  },

  addFeaturedProduct: (productId: string) =>
    set((state) => {
      if (state.featuredProductIds.includes(productId)) {
        return state;
      }
      return {
        featuredProductIds: [...state.featuredProductIds, productId],
      };
    }),

  removeFeaturedProduct: (productId: string) =>
    set((state) => ({
      featuredProductIds: state.featuredProductIds.filter((id) => id !== productId),
    })),

  reorderFeaturedProducts: (productIds: string[]) =>
    set(() => ({
      featuredProductIds: productIds,
    })),

  validateFeaturedProducts: () =>
    set((state) => {
      const validIds = state.featuredProductIds.filter((id) => state.products.some((p) => p.id === id));
      return {
        featuredProductIds: validIds,
      };
    }),

  loadFeaturedFromProducts: () => {
    const state = get();
    const featuredProducts = state.products
      .filter((p) => p.is_featured)
      .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
    const featuredIds = featuredProducts.map((p) => p.id);
    if (featuredIds.length > 0) {
      console.log('📌 Featured products loaded from DB:', featuredIds.length);
      set({ featuredProductIds: featuredIds });
    }
  },

  // ========== ABANDONED CARTS OPERATIONS ==========

  trackAbandonedCart: (cart: AbandonedCart) => {
    set((state) => {
      const exists = state.abandonedCarts.some((c) => c.id === cart.id);
      return {
        abandonedCarts: exists
          ? state.abandonedCarts.map((c) => (c.id === cart.id ? cart : c))
          : [...state.abandonedCarts, cart],
      };
    });
    // Persister en base (fire-and-forget)
    upsertAbandonedCart({
      id:              cart.id,
      clientId:        cart.clientId,
      clientName:      cart.clientName,
      clientEmail:     cart.clientEmail,
      items:           cart.items,
      totalValue:      cart.totalValue,
      abandonedAt:     typeof cart.abandonedAt === 'string'
                         ? new Date(cart.abandonedAt).getTime()
                         : (cart.abandonedAt as Date).getTime(),
      recoveryAttempts: cart.recoveryAttempts,
      recovered:       cart.recovered,
    }).catch((err) => console.warn('⚠️ upsertAbandonedCart:', err?.message));
  },

  sendRecoveryEmail: (cartId: string, discount: number) => {
    const now = Date.now();
    set((state) => ({
      abandonedCarts: state.abandonedCarts.map((cart) =>
        cart.id === cartId
          ? {
              ...cart,
              recoveryAttempts: cart.recoveryAttempts + 1,
              lastRecoveryEmail: new Date(now),
              discountOffered: discount,
            }
          : cart
      ),
    }));
    // Persister en base (fire-and-forget)
    updateAbandonedCartInDB(cartId, {
      recovery_attempts:   (get().abandonedCarts.find((c) => c.id === cartId)?.recoveryAttempts ?? 0),
      last_recovery_email: now,
      discount_offered:    discount,
    }).catch((err) => console.warn('⚠️ updateAbandonedCartInDB (email):', err?.message));
  },

  markRecovered: (cartId: string) => {
    const now = Date.now();
    set((state) => ({
      abandonedCarts: state.abandonedCarts.map((cart) =>
        cart.id === cartId
          ? { ...cart, recovered: true, recoveryDate: new Date(now) }
          : cart
      ),
    }));
    // Persister en base (fire-and-forget)
    updateAbandonedCartInDB(cartId, {
      recovered:     true,
      recovery_date: now,
    }).catch((err) => console.warn('⚠️ updateAbandonedCartInDB (recovered):', err?.message));
  },

  getFilteredCarts: (filter: 'all' | 'pending' | 'recovered' | 'urgent') => {
    const state = get();
    switch (filter) {
      case 'pending':
        return state.abandonedCarts.filter((c) => !c.recovered);
      case 'recovered':
        return state.abandonedCarts.filter((c) => c.recovered);
      case 'urgent': {
        return state.abandonedCarts.filter((c) => {
          const abandonedDate = typeof c.abandonedAt === 'string' ? new Date(c.abandonedAt) : c.abandonedAt;
          const hoursSince = (Date.now() - abandonedDate.getTime()) / (1000 * 60 * 60);
          return !c.recovered && (hoursSince > 72 || c.recoveryAttempts >= 3);
        });
      }
      default:
        return state.abandonedCarts;
    }
  },

  // ========== ORDERS OPERATIONS ==========

  createOrder: (orderData) => {
    const now = Date.now();
    const order: Order = {
      ...orderData,
      id: `ORD-${now}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      pendingAt: now,
    };
    set((state) => ({
      orders: [...state.orders, order],
    }));
    // Persister en base (fire-and-forget)
    insertOrder({
      id:              order.id,
      reference:       order.reference,
      userId:          order.userId,
      userName:        order.userName,
      userEmail:       order.userEmail,
      items:           order.items,
      totalAmount:     order.totalAmount,
      shippingAddress: order.shippingAddress,
      status:          order.status,
      timestamp:       order.timestamp,
      pendingAt:       order.pendingAt,
      notes:           order.notes,
      promoCode:       order.promoCode,
      promoDiscount:   order.promoDiscount,
    }).catch((err) => {
      console.error('❌ Erreur sauvegarde commande Supabase:', err);
    });
    return order;
  },

  completeOrder: (orderId: string) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' } : order
      ),
    })),

  updateOrderStatus: (orderId: string, status: Order['status']) => {
    const now = Date.now();
    const tsField: Partial<Record<'confirmedAt' | 'shippedAt' | 'deliveredAt', number>> =
      status === 'confirmed' ? { confirmedAt: now }
      : status === 'shipped'   ? { shippedAt: now }
      : status === 'delivered' ? { deliveredAt: now }
      : {};
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status, ...tsField } : order
      ),
    }));
    // Persister en base (fire-and-forget)
    updateOrderStatusInDB(orderId, status, {
      confirmed_at: tsField.confirmedAt,
      shipped_at:   tsField.shippedAt,
      delivered_at: tsField.deliveredAt,
    }).catch((err) => {
      console.error('❌ Erreur mise à jour statut commande Supabase:', err);
    });
  },

  deleteOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    }));
    deleteOrderFromDB(orderId).catch((err) => {
      console.error('❌ Erreur suppression commande Supabase:', err);
    });
  },

  deductStock: (items: OrderItem[]) => {
    const state = get();

    // Check if all items have enough stock
    for (const item of items) {
      const product = state.products.find((p) => p.id === item.productId);
      if (!product || (product.stock ?? 0) < item.quantity) {
        return false;
      }
    }

    // Deduct stock locally (optimistic)
    const updatedProducts: { id: string; newStock: number }[] = [];
    set((state) => ({
      products: state.products.map((product) => {
        const item = items.find((i) => i.productId === product.id);
        if (item) {
          const newStock = Math.max(0, (product.stock ?? 0) - item.quantity);
          updatedProducts.push({ id: product.id, newStock });
          return {
            ...product,
            stock: newStock,
            monthlySales: (product.monthlySales ?? 0) + item.quantity,
          };
        }
        return product;
      }),
    }));

    // Sync each updated product stock to Supabase (fire-and-forget)
    for (const { id, newStock } of updatedProducts) {
      get().updateProductStock(id, newStock).catch((err) => {
        console.error('❌ Erreur sync stock Supabase:', id, err);
      });
    }

    return true;
  },

  getOrdersByUserId: (userId: string) => {
    return get().orders.filter((o) => o.userId === userId);
  },

  getOrderHistory: () => {
    return [...get().orders].sort((a, b) => b.timestamp - a.timestamp);
  },

  getTotalOrderValue: () => {
    return get().orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  },

  // ========== PRODUCTS OPERATIONS (SUPABASE) ==========

  addProduct: async (product) => {
    try {
      const state = get();
      const originalProducts = [...state.products];
      
      // Mettre à jour localement d'abord (optimistic update)
      set({ products: [...state.products, product] });
      console.log('📝 Produit ajouté localement:', product.name);

      // Ensuite, synchroniser avec Supabase
      const data = convertProductToRow(product);
      const result = await supabaseCreate(data as any);
      console.log('✅ Produit synchronisé avec Supabase:', product.name, result);
    } catch (error) {
      // Rollback en cas d'erreur
      const state = get();
      set({ products: state.products.filter(p => p.id !== (error as any).id) });
      console.error('❌ Erreur addProduct - Rollback effectué:', error);
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const state = get();
      const productIndex = state.products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        console.warn(`⚠️ Produit ${id} not found in store`);
        return;
      }

      // Champs autorisés dans la table Supabase
      const ALLOWED_DB_FIELDS = new Set([
        'name', 'brand', 'price', 'description', 'image_url',
        'notes_tete', 'notes_coeur', 'notes_fond', 'families',
        'stock', 'monthlysales', 'volume', 'category', 'gender', 'scent',
      ]);

      const data: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'image') {
          // Mapper image -> image_url
          data.image_url = value;
        } else if (key === 'monthlySales') {
          // Mapper monthlySales (camelCase interne) -> monthlysales (colonne DB lowercase)
          data.monthlysales = value;
        } else if (key === 'concentration') {
          // Stocker la concentration dans la colonne category (families[] reste l'autorité pour les familles)
          data.category = value;
        } else if (ALLOWED_DB_FIELDS.has(key)) {
          data[key] = value;
        }
      });

      // Sauvegarder l'état original pour rollback
      const originalProduct = { ...state.products[productIndex] };

      // Mettre à jour localement d'abord (optimistic update)
      const updatedProduct = { ...originalProduct, ...updates };
      const newProducts = [...state.products];
      newProducts[productIndex] = updatedProduct;
      set({ products: newProducts });
      console.log('📝 Produit mis à jour localement:', id);

      // Propager les changements dans tous les paniers ouverts
      useCartStore.getState().syncProductToCart(id, {
        name:     updates.name,
        price:    updates.price,
        brand:    updates.brand,
        image:    updates.image,
        scent:    updates.scent,
        category: updates.category,
        stock:    updates.stock,
      });

      // Ensuite, synchroniser avec Supabase
      const result = await supabaseUpdate(id, data);
      console.log('✅ Produit synchronisé avec Supabase:', id, result);
    } catch (error) {
      // Rollback en cas d'erreur
      const state = get();
      const productIndex = state.products.findIndex(p => p.id === id);
      if (productIndex !== -1) {
        console.log('⏮️ Rollback de la mise à jour:', id);
        // Reload from Supabase or keep original
      }
      console.error('❌ Erreur updateProduct - Rollback effectué:', error);
      throw error;
    }
  },

  updateProductStock: async (id, newStock) => {
    try {
      const state = get();
      const productIndex = state.products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        console.warn(`⚠️ Produit ${id} not found in store`);
        return;
      }

      const validatedStock = Math.max(0, newStock);
      const originalStock = state.products[productIndex].stock;

      // Mettre à jour localement d'abord (optimistic update)
      const updatedProduct = { ...state.products[productIndex], stock: validatedStock };
      const newProducts = [...state.products];
      newProducts[productIndex] = updatedProduct;
      set({ products: newProducts });
      console.log('📦 Stock mis à jour localement:', id, `${originalStock} → ${validatedStock}`);

      // Ensuite, synchroniser avec Supabase
      const result = await supabaseUpdate(id, { stock: validatedStock });
      console.log('✅ Stock synchronisé avec Supabase:', id, result);
    } catch (error) {
      // Rollback en cas d'erreur
      const state = get();
      const productIndex = state.products.findIndex(p => p.id === id);
      if (productIndex !== -1) {
        console.log('⏮️ Rollback du stock:', id);
      }
      console.error('❌ Erreur updateProductStock - Rollback effectué:', error);
      throw error;
    }
  },

  updateProductVelocity: async (id, newMonthlySales) => {
    try {
      const state = get();
      const productIndex = state.products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        console.warn(`⚠️ Produit ${id} not found in store`);
        return;
      }

      const validatedSales = Math.max(0, newMonthlySales);
      const originalSales = state.products[productIndex].monthlySales;

      // Mettre à jour localement d'abord (optimistic update)
      const updatedProduct = { ...state.products[productIndex], monthlySales: validatedSales };
      const newProducts = [...state.products];
      newProducts[productIndex] = updatedProduct;
      set({ products: newProducts });
      console.log('📊 Vélocité mise à jour localement:', id, `${originalSales} → ${validatedSales}`);

      // Ensuite, synchroniser avec Supabase
      const result = await supabaseUpdate(id, { monthlysales: validatedSales });
      console.log('✅ Vélocité synchronisée avec Supabase:', id, result);
    } catch (error) {
      // Rollback en cas d'erreur
      const state = get();
      const productIndex = state.products.findIndex(p => p.id === id);
      if (productIndex !== -1) {
        console.log('⏮️ Rollback de la vélocité:', id);
      }
      console.error('❌ Erreur updateProductVelocity - Rollback effectué:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const state = get();
      const deletedProduct = state.products.find(p => p.id === id);

      if (!deletedProduct) {
        console.warn(`⚠️ Produit ${id} not found for deletion`);
        return;
      }

      // Mettre à jour localement d'abord (optimistic update)
      set({ products: state.products.filter(p => p.id !== id) });
      console.log('🗑️ Produit supprimé localement:', id, deletedProduct.name);

      // Ensuite, synchroniser avec Supabase
      const result = await supabaseDelete(id);
      console.log('✅ Suppression synchronisée avec Supabase:', id, result);
    } catch (error) {
      // Rollback en cas d'erreur
      const state = get();
      const deletedProduct = state.products.find(p => p.id === id);
      if (!deletedProduct) {
        console.log('⏮️ Rollback de la suppression:', id);
        // Recharger le produit depuis l'état précédent
      }
      console.error('❌ Erreur deleteProduct - Rollback effectué:', error);
      throw error;
    }
  },

  resetProductsToDefaults: () => {
    console.warn('⚠️ resetProductsToDefaults est dépendante de Supabase. Impossible de réinitialiser localement.');
  },

  // ========== CALCULATED STATS ==========

  getStatistics: () => {
    const state = get();
    const carts = state.abandonedCarts;
    const total = carts.length;
    const recovered = carts.filter((c) => c.recovered).length;
    const abandoned = total - recovered;
    const totalValue = carts
      .filter((c) => !c.recovered)
      .reduce((sum, c) => sum + c.totalValue, 0);
    const averageAttempts =
      carts.length > 0 ? carts.reduce((sum, c) => sum + c.recoveryAttempts, 0) / carts.length : 0;
    const recoveryRate = total > 0 ? (recovered / total) * 100 : 0;

    return {
      total,
      recovered,
      abandoned,
      totalValue,
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      recoveryRate: Math.round(recoveryRate * 10) / 10,
    };
  },

  // ========== FILTERS & SEARCHES ==========

  filterProductsByScent: (scent) =>
    get().products.filter((p) => p.scent && p.scent.toLowerCase() === scent.toLowerCase()),

  filterProductsByCategory: (category) =>
    get().products.filter((p) => p.category && p.category.toLowerCase().includes(category.toLowerCase())),

  // ========== UTILITY FUNCTIONS ==========

  calculateProductVelocity: (productId: string) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product || product.monthlySales === 0) {
      return 0;
    }
    const velocity = product.monthlySales / 30;
    return Math.round(velocity * 100) / 100;
  },
}));

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const useAbandonedCarts = () => {
  const store = useAdminStore();
  return {
    carts: store.abandonedCarts,
    trackAbandonedCart: store.trackAbandonedCart,
    sendRecoveryEmail: store.sendRecoveryEmail,
    markRecovered: store.markRecovered,
    getStatistics: store.getStatistics,
    getFilteredCarts: store.getFilteredCarts,
  };
};

export const useAdminProducts = () => {
  const store = useAdminStore();
  return {
    products: store.products,
    addProduct: store.addProduct,
    updateProduct: store.updateProduct,
    updateProductStock: store.updateProductStock,
    updateProductVelocity: store.updateProductVelocity,
    deleteProduct: store.deleteProduct,
    resetProductsToDefaults: store.resetProductsToDefaults,
    filterByScent: store.filterProductsByScent,
    filterByCategory: store.filterProductsByCategory,
    calculateVelocity: store.calculateProductVelocity,
  };
};

export const useOrderManagement = () => {
  const store = useAdminStore();
  return {
    orders: store.orders,
    createOrder: store.createOrder,
    completeOrder: store.completeOrder,
    updateOrderStatus: store.updateOrderStatus,
    deleteOrder: store.deleteOrder,
    deductStock: store.deductStock,
    getOrdersByUserId: store.getOrdersByUserId,
    getOrderHistory: store.getOrderHistory,
    getTotalOrderValue: store.getTotalOrderValue,
  };
};

export const useFeaturedProducts = () => {
  const store = useAdminStore();
  return {
    featuredProductIds: store.featuredProductIds,
    getFeaturedProducts: store.getFeaturedProducts,
    setFeaturedProducts: store.setFeaturedProducts,
    addFeaturedProduct: store.addFeaturedProduct,
    removeFeaturedProduct: store.removeFeaturedProduct,
    reorderFeaturedProducts: store.reorderFeaturedProducts,
    validateFeaturedProducts: store.validateFeaturedProducts,
    loadFeaturedFromProducts: store.loadFeaturedFromProducts,
  };
};
