/**
 * Configuration Supabase pour Rayha Store
 * Dédiée à la gestion des produits et synchronisation en temps réel
 * 
 * Utilise les variables d'environnement:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_PUBLISHABLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ============================================================================
// CONFIGURATION CLIENT SUPABASE
// ============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔧 Configuration Supabase:');
console.log('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅ Présente' : '❌ MANQUANTE!');
console.log('   VITE_SUPABASE_PUBLISHABLE_KEY:', SUPABASE_ANON_KEY ? '✅ Présente' : '❌ MANQUANTE!');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ VARIABLES MANQUANTES! Vérifiez que .env.local existe et que Vite a redémarré.');
  console.error('   Fichier attendu: .env.local');
  console.error('   Contenu attendu:');
  console.error('     VITE_SUPABASE_URL=https://ibkcaxatevlfvtedeqrv.supabase.co');
  console.error('     VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...');
}

export const supabase = createClient<Database>(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ============================================================================
// TYPES POUR LES PRODUITS
// ============================================================================

export interface ProductRow {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string | null;
  image_url: string | null;
  notes_tete: string[];
  notes_coeur: string[];
  notes_fond: string[];
  families: string[];
  stock: number;
  monthlysales: number;
  volume: string | null;
  category: string | null;
  gender: string | null;
  scent: string | null;
  is_featured: boolean;
  featured_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  brand: string;
  price: number;
  description?: string;
  image_url?: string;
  notes_tete?: string[];
  notes_coeur?: string[];
  notes_fond?: string[];
  families?: string[];
  stock?: number;
  monthlysales?: number;
  volume?: string;
  category?: string;
  gender?: string;
  scent?: string;
  is_featured?: boolean;
  featured_order?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

// ============================================================================
// ERREURS PERSONNALISÉES
// ============================================================================

export class SupabaseError extends Error {
  constructor(
    public statusCode: number | null,
    public originalError: Error | null,
    message: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }

  static fromError(error: any, context: string): SupabaseError {
    const message = error?.message || `Erreur Supabase: ${context}`;
    const statusCode = error?.status || null;
    return new SupabaseError(statusCode, error, message);
  }
}

// ============================================================================
// FONCTIONS POUR LES PRODUITS
// ============================================================================

/**
 * Récupère tous les produits de la base de données
 */
export async function fetchAllProducts(): Promise<ProductRow[]> {
  try {
    console.log('🔗 Appel à Supabase pour récupérer tous les produits...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw SupabaseError.fromError(error, 'fetchAllProducts');
    }

    console.log(`✅ ${data?.length || 0} produits reçus de la base`);
    return (data || []) as ProductRow[];
  } catch (error) {
    console.error('❌ Erreur fetchAllProducts:', error);
    throw SupabaseError.fromError(error, 'fetchAllProducts');
  }
}

/**
 * Récupère un produit par ID
 */
export async function fetchProductById(id: string): Promise<ProductRow | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') {
      // Produit non trouvé
      return null;
    }

    if (error) {
      throw SupabaseError.fromError(error, `fetchProductById: ${id}`);
    }

    return (data || null) as ProductRow | null;
  } catch (error) {
    throw SupabaseError.fromError(error, `fetchProductById: ${id}`);
  }
}

/**
 * Crée un nouveau produit
 */
export async function createProduct(product: CreateProductInput): Promise<ProductRow> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, 'createProduct');
    }

    return (data || {}) as ProductRow;
  } catch (error) {
    throw SupabaseError.fromError(error, 'createProduct');
  }
}

/**
 * Met à jour un produit existant
 */
export async function updateProduct(
  id: string,
  updates: Partial<CreateProductInput>
): Promise<ProductRow> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, `updateProduct: ${id}`);
    }

    return (data || {}) as ProductRow;
  } catch (error) {
    throw SupabaseError.fromError(error, `updateProduct: ${id}`);
  }
}

/**
 * Met à jour le stock d'un produit
 */
export async function updateProductStock(id: string, newStock: number): Promise<ProductRow> {
  return updateProduct(id, { stock: newStock });
}

/**
 * Met à jour les ventes mensuelles d'un produit
 */
export async function updateProductMonthlySales(
  id: string,
  newMonthlySales: number
): Promise<ProductRow> {
  return updateProduct(id, { monthlysales: newMonthlySales });
}

/**
 * Met à jour le statut featured d'un produit
 */
export async function updateFeaturedStatus(
  id: string,
  is_featured: boolean,
  featured_order: number = 0
): Promise<ProductRow> {
  return updateProduct(id, { is_featured, featured_order } as any);
}

/**
 * Met à jour le statut featured de plusieurs produits en batch
 */
export async function batchUpdateFeatured(
  updates: Array<{ id: string; is_featured: boolean; featured_order: number }>
): Promise<void> {
  try {
    // D'abord, remettre tous les produits à false
    const { error: resetError } = await supabase
      .from('products')
      .update({ is_featured: false, featured_order: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // update all
    
    if (resetError) {
      console.warn('⚠️ Could not reset all featured flags:', resetError.message);
    }

    // Puis mettre à jour chaque produit sélectionné
    for (const update of updates) {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: update.is_featured, featured_order: update.featured_order })
        .eq('id', update.id);
      
      if (error) {
        console.error(`❌ Failed to update featured status for ${update.id}:`, error.message);
      }
    }
    
    console.log(`✅ Batch featured update: ${updates.length} produits mis à jour`);
  } catch (error) {
    throw SupabaseError.fromError(error, 'batchUpdateFeatured');
  }
}

/**
 * Récupère les produits featured triés par order
 */
export async function fetchFeaturedProducts(): Promise<ProductRow[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .order('featured_order', { ascending: true });

    if (error) {
      throw SupabaseError.fromError(error, 'fetchFeaturedProducts');
    }

    return (data || []) as ProductRow[];
  } catch (error) {
    throw SupabaseError.fromError(error, 'fetchFeaturedProducts');
  }
}

/**
 * Supprime un produit
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw SupabaseError.fromError(error, `deleteProduct: ${id}`);
    }
  } catch (error) {
    throw SupabaseError.fromError(error, `deleteProduct: ${id}`);
  }
}

/**
 * Souscrit aux changements en temps réel des produits
 */
export function subscribeToProducts(
  callback: (payload: any) => void,
  errorCallback?: (error: Error) => void
) {
  // Retourne un wrapper avec gestion de reconnexion (exponentielle)
  let channel: any = null;
  let disposed = false;
  let retryCount = 0;
  const maxRetries = 5;
  const baseDelay = 2000; // ms
  let reconnectTimer: any = null;

  const createChannel = () => {
    if (disposed) return;
    channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload: any) => {
          // forward payload
          callback(payload);
        }
      )
      .subscribe((status: string, err: any) => {
        if (disposed) return;
        if (status === 'SUBSCRIBED') {
          retryCount = 0;
          console.log('✅ Souscription en temps réel activée');
        } else if (status === 'CLOSED') {
          console.warn('❌ Souscription fermée, tentative de reconnexion...');
          // essayer de reconnecter avec backoff
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount);
            retryCount += 1;
            reconnectTimer = setTimeout(() => {
              createChannel();
            }, delay);
          } else {
            const errObj = new Error('Souscription Supabase fermée (trop de tentatives)');
            console.error('❌ Souscription définitivement fermée');
            if (errorCallback) errorCallback(errObj);
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur de canal:', err);
          if (errorCallback) {
            errorCallback(new Error(`Erreur de canal: ${err}`));
          }
        }
      });
  };

  createChannel();

  return {
    unsubscribe: () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        if (channel && typeof channel.unsubscribe === 'function') channel.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    },
  };
}

// ============================================================================
// CART OPERATIONS - PANIER PERSISTANT
// ============================================================================

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_price: number;
  product_image: string | null;
  product_scent: string | null;
  product_category: string | null;
  quantity: number;
  added_at: string;
  updated_at: string;
}

/**
 * Récupère le panier complet d'un utilisateur depuis Supabase
 */
export async function getUserCart(userId: string): Promise<CartItemDB[]> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération du panier:', error);
      throw error;
    }

    console.log(`📦 Panier chargé: ${data?.length || 0} articles`);
    return data || [];
  } catch (error) {
    console.error('❌ Erreur getUserCart:', error);
    return [];
  }
}

/**
 * Ajoute un produit au panier (ou augmente la quantité si déjà présent)
 */
export async function addToCart(
  userId: string,
  productId: string,
  product: {
    name: string;
    brand: string;
    price: number;
    image?: string;
    scent?: string;
    category?: string;
  },
  quantity: number = 1
): Promise<CartItemDB | null> {
  try {
    // Vérifier si l'item existe déjà
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (!checkError && existingItem) {
      // Augmenter la quantité
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      console.log(`🆙 Quantité augmentée: ${product.name}`);
      return data as CartItemDB;
    } else {
      // Créer un nouvel item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          product_name: product.name,
          product_brand: product.brand,
          product_price: product.price,
          product_image: product.image || null,
          product_scent: product.scent || null,
          product_category: product.category || null,
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`🛒 Article ajouté au panier: ${product.name}`);
      return data as CartItemDB;
    }
  } catch (error) {
    console.error('❌ Erreur addToCart:', error);
    throw error;
  }
}

/**
 * Mets à jour la quantité d'un article du panier
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItemDB | null> {
  try {
    if (quantity <= 0) {
      // Supprimer l'article si quantité <= 0
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      console.log('🗑️ Article supprimé du panier (quantité 0)');
      return null;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    console.log(`🔄 Quantité mise à jour`);
    return data as CartItemDB;
  } catch (error) {
    console.error('❌ Erreur updateCartItemQuantity:', error);
    throw error;
  }
}

/**
 * Supprime un article du panier
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    console.log('🗑️ Article supprimé du panier');
  } catch (error) {
    console.error('❌ Erreur removeFromCart:', error);
    throw error;
  }
}

/**
 * Met à jour les données produit dans tous les paniers contenant ce produit.
 * Appelé automatiquement quand un produit est modifié dans l'admin.
 */
export async function updateCartItemsByProductId(
  productId: string,
  updates: {
    product_name?:     string;
    product_price?:    number;
    product_brand?:    string;
    product_image?:    string | null;
    product_scent?:    string | null;
    product_category?: string | null;
  }
): Promise<void> {
  try {
    if (Object.keys(updates).length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('cart_items')
      .update(updates)
      .eq('product_id', productId);
    if (error) throw error;
  } catch (error) {
    console.error('❌ Erreur updateCartItemsByProductId:', error);
  }
}

/**
 * Supprime ce produit de tous les paniers (ex : stock tombé à 0).
 */
export async function removeCartItemsByProductId(productId: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('cart_items')
      .delete()
      .eq('product_id', productId);
    if (error) throw error;
  } catch (error) {
    console.error('❌ Erreur removeCartItemsByProductId:', error);
  }
}

/**
 * Vide complètement le panier d'un utilisateur
 */
export async function clearCart(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    console.log('🗑️ Panier vidé');
  } catch (error) {
    console.error('❌ Erreur clearCart:', error);
    throw error;
  }
}

/**
 * S'abonne aux changements du panier en temps réel
 */
export function subscribeToCart(
  userId: string,
  callback: (payload: any) => void,
  errorCallback?: (error: Error) => void
) {
  const subscription = supabase
    .channel(`cart_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🛒 Changement du panier détecté:', payload);
        callback(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Souscription panier en temps réel activée');
      } else if (status === 'CLOSED') {
        console.error('❌ Souscription panier fermée');
        if (errorCallback) {
          errorCallback(new Error('Souscription panier fermée'));
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de canal panier:', err);
        if (errorCallback) {
          errorCallback(new Error(`Erreur de canal panier: ${err}`));
        }
      }
    });

  return subscription;
}

// ============================================================================
// WISHLIST OPERATIONS - FAVORIS PERSISTANTS
// ============================================================================

export interface WishlistItemDB {
  id: string;
  user_id: string;
  product_id: string;
  position: number | null;
  added_at: string;
  updated_at: string;
  // Données du produit (en jointure)
  product_name?: string;
  product_price?: number;
  product_image?: string;
}

/**
 * Récupère les favoris d'un utilisateur
 */
export async function getUserWishlist(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    const productIds = data?.map((item: any) => item.product_id) || [];
    console.log(`❤️ Favoris chargés: ${productIds.length} produits`);
    return productIds;
  } catch (error) {
    console.error('❌ Erreur getUserWishlist:', error);
    return [];
  }
}

/**
 * Ajoute un produit aux favoris (ou le retire s'il y est déjà)
 */
export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    // Vérifier si le produit est déjà en favoris
    const { data: existingItem, error: checkError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (!checkError && existingItem) {
      // Supprimer des favoris
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', existingItem.id);

      if (error) throw error;
      console.log('🤍 Produit retiré des favoris');
      return false; // Indique qu'il a été retiré
    } else {
      // Ajouter aux favoris
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          product_id: productId,
        });

      if (error) throw error;
      console.log('❤️ Produit ajouté aux favoris');
      return true; // Indique qu'il a été ajouté
    }
  } catch (error) {
    console.error('❌ Erreur toggleWishlist:', error);
    throw error;
  }
}

/**
 * Ajoute un produit aux favoris
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        product_id: productId,
      });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - déjà en favoris
        console.log('ℹ️ Produit déjà en favoris');
        return false;
      }
      throw error;
    }

    console.log('❤️ Produit ajouté aux favoris');
    return true;
  } catch (error) {
    console.error('❌ Erreur addToWishlist:', error);
    throw error;
  }
}

/**
 * Retire un produit des favoris
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    console.log('🤍 Produit retiré des favoris');
    return true;
  } catch (error) {
    console.error('❌ Erreur removeFromWishlist:', error);
    throw error;
  }
}

/**
 * S'abonne aux changements des favoris en temps réel
 */
export function subscribeToWishlist(
  userId: string,
  callback: (payload: any) => void,
  errorCallback?: (error: Error) => void
) {
  const subscription = supabase
    .channel(`wishlist_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wishlist',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('❤️ Changement des favoris détecté:', payload);
        callback(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Souscription favoris en temps réel activée');
      } else if (status === 'CLOSED') {
        console.error('❌ Souscription favoris fermée');
        if (errorCallback) {
          errorCallback(new Error('Souscription favoris fermée'));
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de canal favoris:', err);
        if (errorCallback) {
          errorCallback(new Error(`Erreur de canal favoris: ${err}`));
        }
      }
    });

  return subscription;
}

/**
 * Vérifie la connexion à Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// SCENT PROFILES OPERATIONS - PROFILS OLFACTIFS
// ============================================================================

export interface ScentProfile {
  id: string;
  user_id: string;
  primary_family: string | null;
  secondary_family: string | null;
  notes_preferred: string[] | null;
  quiz_history: any;
  scent_score: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateScentProfileInput {
  user_id: string;
  primary_family?: string;
  secondary_family?: string;
  notes_preferred?: string[];
  quiz_history?: any;
  scent_score?: any;
}

export interface UpdateScentProfileInput extends Partial<CreateScentProfileInput> {
  id: string;
}

/**
 * Récupère le profil olfactif d'un utilisateur
 */
export async function getUserScentProfile(userId: string): Promise<ScentProfile | null> {
  try {
    const { data, error } = await supabase
      .from('scent_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') {
      // Profil non trouvé
      return null;
    }

    if (error) {
      throw SupabaseError.fromError(error, `getUserScentProfile: ${userId}`);
    }

    return (data || null) as ScentProfile;
  } catch (error) {
    console.error('❌ Erreur getUserScentProfile:', error);
    throw SupabaseError.fromError(error, `getUserScentProfile: ${userId}`);
  }
}

/**
 * Crée un nouveau profil olfactif
 */
export async function createScentProfile(profile: CreateScentProfileInput): Promise<ScentProfile> {
  try {
    const { data, error } = await supabase
      .from('scent_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, 'createScentProfile');
    }

    console.log('🌸 Profil olfactif créé');
    return (data || {}) as ScentProfile;
  } catch (error) {
    throw SupabaseError.fromError(error, 'createScentProfile');
  }
}

/**
 * Met à jour un profil olfactif existant
 */
export async function updateScentProfile(
  id: string,
  updates: Partial<CreateScentProfileInput>
): Promise<ScentProfile> {
  try {
    const { data, error } = await supabase
      .from('scent_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, `updateScentProfile: ${id}`);
    }

    console.log('🔄 Profil olfactif mis à jour');
    return (data || {}) as ScentProfile;
  } catch (error) {
    throw SupabaseError.fromError(error, `updateScentProfile: ${id}`);
  }
}

/**
 * Met à jour ou crée le profil olfactif d'un utilisateur
 */
export async function upsertUserScentProfile(
  userId: string,
  profileData: Partial<CreateScentProfileInput>
): Promise<ScentProfile> {
  try {
    // Vérifier si un profil existe déjà
    const existingProfile = await getUserScentProfile(userId);

    if (existingProfile) {
      // Mettre à jour
      return await updateScentProfile(existingProfile.id, {
        ...profileData,
        user_id: userId
      });
    } else {
      // Créer
      return await createScentProfile({
        user_id: userId,
        ...profileData
      });
    }
  } catch (error) {
    throw SupabaseError.fromError(error, `upsertUserScentProfile: ${userId}`);
  }
}

/**
 * Récupère tous les profils olfactifs (admin seulement)
 */
export async function getAllScentProfiles(): Promise<ScentProfile[]> {
  try {
    const { data, error } = await supabase
      .from('scent_profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw SupabaseError.fromError(error, 'getAllScentProfiles');
    }

    return (data || []) as ScentProfile[];
  } catch (error) {
    throw SupabaseError.fromError(error, 'getAllScentProfiles');
  }
}

// ============================================================================
// GESTION DU STOCKAGE D'IMAGES
// ============================================================================

// ============================================================================
// OLFACTORY NOTES (globales)
// ============================================================================

export interface OlfactoryNoteRow {
  id: string;
  label: string;
  pyramid: 'tete' | 'coeur' | 'fond';
  family?: string | null;
  created_at: string | null;
}

export async function getAllOlfactoryNotes(): Promise<OlfactoryNoteRow[]> {
  try {
    const { data, error } = await supabase
      .from('olfactory_notes')
      .select('*')
      .order('label', { ascending: true });

    if (error) {
      throw SupabaseError.fromError(error, 'getAllOlfactoryNotes');
    }

    return (data || []) as OlfactoryNoteRow[];
  } catch (error) {
    console.error('❌ Erreur getAllOlfactoryNotes:', error);
    throw SupabaseError.fromError(error, 'getAllOlfactoryNotes');
  }
}

export async function createOlfactoryNote(note: { label: string; pyramid: 'tete' | 'coeur' | 'fond'; family?: string | null; }): Promise<OlfactoryNoteRow> {
  try {
    const { data, error } = await supabase
      .from('olfactory_notes')
      .insert([{ label: note.label, pyramid: note.pyramid, family: note.family }])
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, 'createOlfactoryNote');
    }

    return (data || {}) as OlfactoryNoteRow;
  } catch (error) {
    console.error('❌ Erreur createOlfactoryNote:', error);
    throw SupabaseError.fromError(error, 'createOlfactoryNote');
  }
}

export async function updateOlfactoryNote(id: string, updates: { label?: string; pyramid?: 'tete' | 'coeur' | 'fond'; family?: string | null; }): Promise<OlfactoryNoteRow> {
  try {
    const { data, error } = await supabase
      .from('olfactory_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw SupabaseError.fromError(error, 'updateOlfactoryNote');
    }

    return (data || {}) as OlfactoryNoteRow;
  } catch (error) {
    console.error('❌ Erreur updateOlfactoryNote:', error);
    throw SupabaseError.fromError(error, 'updateOlfactoryNote');
  }
}

export async function deleteOlfactoryNote(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('olfactory_notes')
      .delete()
      .eq('id', id);

    if (error) {
      throw SupabaseError.fromError(error, 'deleteOlfactoryNote');
    }
  } catch (error) {
    console.error('❌ Erreur deleteOlfactoryNote:', error);
    throw SupabaseError.fromError(error, 'deleteOlfactoryNote');
  }
}

// ============================================================================
// PROMO CODES — CRUD Supabase
// ============================================================================

export interface PromoCodeRow {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  min_amount: number;
  single_use: boolean;
  free_shipping:      boolean;
  free_product_id:    string | null;
  free_product_label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const promoCodesTable = () => (supabase as any).from('promo_codes');

export async function getAllPromoCodes(): Promise<PromoCodeRow[]> {
  try {
    const { data, error } = await promoCodesTable()
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw SupabaseError.fromError(error, 'getAllPromoCodes');
    return (data || []) as PromoCodeRow[];
  } catch (error) {
    console.error('❌ Erreur getAllPromoCodes:', error);
    throw SupabaseError.fromError(error, 'getAllPromoCodes');
  }
}

export async function createPromoCode(promo: {
  code: string;
  discount: number;
  is_active?: boolean;
  min_amount?: number;
  single_use?: boolean;
  free_shipping?: boolean;
  free_product_id?:    string | null;
  free_product_label?: string;
}): Promise<PromoCodeRow> {
  try {
    const { data, error } = await promoCodesTable()
      .insert([{
        code: promo.code,
        discount_percent:  promo.discount,
        is_active:         promo.is_active ?? true,
        min_amount:        promo.min_amount ?? 0,
        single_use:        promo.single_use ?? false,
        free_shipping:     promo.free_shipping ?? false,
        free_product_id:   promo.free_product_id ?? null,
        free_product_label: promo.free_product_label ?? 'Produit offert',
      }])
      .select()
      .single();

    if (error) throw SupabaseError.fromError(error, 'createPromoCode');
    return data as PromoCodeRow;
  } catch (error) {
    console.error('❌ Erreur createPromoCode:', error);
    throw SupabaseError.fromError(error, 'createPromoCode');
  }
}

export async function updatePromoCode(
  id: string,
  updates: { is_active?: boolean; usage_count?: number }
): Promise<PromoCodeRow> {
  try {
    const { data, error } = await promoCodesTable()
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw SupabaseError.fromError(error, 'updatePromoCode');
    return data as PromoCodeRow;
  } catch (error) {
    console.error('❌ Erreur updatePromoCode:', error);
    throw SupabaseError.fromError(error, 'updatePromoCode');
  }
}

export async function deletePromoCode(id: string): Promise<void> {
  try {
    const { error } = await promoCodesTable()
      .delete()
      .eq('id', id);

    if (error) throw SupabaseError.fromError(error, 'deletePromoCode');
  } catch (error) {
    console.error('❌ Erreur deletePromoCode:', error);
    throw SupabaseError.fromError(error, 'deletePromoCode');
  }
}

/**
 * Upload une image vers Supabase Storage
 * @param file Le fichier image à uploader
 * @param bucket Le nom du bucket (défaut: 'product-images')
 * @param folder Le dossier dans le bucket (défaut: 'products')
 * @returns L'URL publique de l'image uploadée
 */
export async function uploadProductImage(
  file: File,
  bucket: string = 'product-images',
  folder: string = 'products'
): Promise<string> {
  try {
    // Compresser l'image si nécessaire
    const compressedFile = await compressImage(file, 1); // Max 1MB

    // Vérifier si le bucket existe
    console.log('🔍 Vérification du bucket:', bucket);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la vérification des buckets:', listError);
      throw new Error(`Erreur de configuration Supabase Storage: ${listError.message}`);
    }

    const bucketExists = buckets?.some(b => b.name === bucket);
    if (!bucketExists) {
      console.log(`📦 Le bucket '${bucket}' n'existe pas, tentative de création...`);
      try {
        await createStorageBucket(bucket, true);
        console.log(`✅ Bucket '${bucket}' créé automatiquement`);
      } catch (createError) {
        console.error('❌ Impossible de créer le bucket:', createError);
        throw new Error(`Le bucket '${bucket}' n'existe pas et ne peut pas être créé automatiquement. Veuillez le créer manuellement dans Supabase Dashboard > Storage.`);
      }
    }

    // Générer un nom de fichier unique
    const fileExt = compressedFile.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${folder}/produit-${timestamp}-${randomId}.${fileExt}`;

    console.log('📤 Upload image:', fileName, `(${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`);

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur upload Supabase Storage:', error);
      
      // Messages d'erreur plus spécifiques
      if (error.message.includes('Bucket not found')) {
        throw new Error(`Le bucket '${bucket}' n'existe pas. Créez-le dans Supabase Dashboard > Storage.`);
      } else if (error.message.includes('Unauthorized')) {
        throw new Error('Accès non autorisé au stockage. Vérifiez les politiques RLS.');
      } else if (error.message.includes('Payload too large')) {
        throw new Error('Fichier trop volumineux.');
      }
      
      throw SupabaseError.fromError(error, 'uploadProductImage');
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Impossible de récupérer l\'URL publique de l\'image');
    }

    console.log('✅ Image uploadée:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de l\'image:', error);
    throw error; // Re-throw pour que le composant puisse gérer l'erreur
  }
}

/**
 * Supprime une image de Supabase Storage
 * @param imageUrl L'URL de l'image à supprimer
 * @param bucket Le nom du bucket (défaut: 'product-images')
 */
export async function deleteProductImage(
  imageUrl: string,
  bucket: string = 'product-images'
): Promise<void> {
  try {
    // Extraire le nom du fichier depuis l'URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.slice(-2).join('/'); // Récupère "products/filename.ext"

    console.log('🗑️ Suppression image:', fileName);

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('❌ Erreur suppression Supabase Storage:', error);
      throw SupabaseError.fromError(error, 'deleteProductImage');
    }

    console.log('✅ Image supprimée:', fileName);

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'image:', error);
    throw SupabaseError.fromError(error, 'deleteProductImage');
  }
}

/**
 * Vérifie si une URL est une URL Supabase Storage
 * @param url L'URL à vérifier
 * @returns true si c'est une URL Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase') && url.includes('storage');
}

/**
 * Compresse une image si elle dépasse 1MB
 * @param file Le fichier image à compresser
 * @param maxSizeMB Taille maximale en MB (défaut: 1)
 * @returns Le fichier compressé ou l'original si déjà petit
 */
export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size <= maxSizeBytes) {
    return file; // Pas besoin de compression
  }

  console.log(`🗜️ Compression de l'image (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions (max 1920px de largeur)
      const maxWidth = 1920;
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Dessiner et compresser
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          console.log(`✅ Image compressée: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(compressedFile);
        } else {
          resolve(file); // En cas d'erreur, retourner l'original
        }
      }, file.type, 0.8); // Qualité 80%
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Crée un bucket Supabase Storage s'il n'existe pas
 * @param bucketName Le nom du bucket à créer
 * @param isPublic Si le bucket doit être public (défaut: true)
 */
export async function createStorageBucket(bucketName: string, isPublic: boolean = true): Promise<void> {
  try {
    console.log(`🏗️ Création du bucket '${bucketName}'...`);
    
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      // Si le bucket existe déjà, ce n'est pas une erreur
      if (error.message.includes('already exists') || error.message.includes('Bucket already exists')) {
        console.log(`✅ Le bucket '${bucketName}' existe déjà`);
        return;
      }
      console.error('❌ Erreur création bucket:', error);
      throw SupabaseError.fromError(error, 'createStorageBucket');
    }

    console.log(`✅ Bucket '${bucketName}' créé avec succès`);
  } catch (error) {
    console.error('❌ Erreur lors de la création du bucket:', error);
    throw error;
  }
}

// ============================================================================
// ORDERS — CRUD Supabase
// ============================================================================

export interface OrderRow {
  id: string;
  reference: string | null;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  items: any;
  total_amount: number;
  shipping_address: any | null;
  status: string;
  timestamp: number;
  pending_at: number | null;
  confirmed_at: number | null;
  shipped_at: number | null;
  delivered_at: number | null;
  notes: string | null;
  promo_code: string | null;
  promo_discount: number | null;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ordersTable = () => (supabase as any).from('orders');

export async function fetchAllOrders(): Promise<OrderRow[]> {
  try {
    const { data, error } = await ordersTable()
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw SupabaseError.fromError(error, 'fetchAllOrders');
    return (data || []) as OrderRow[];
  } catch (error) {
    console.error('❌ Erreur fetchAllOrders:', error);
    throw SupabaseError.fromError(error, 'fetchAllOrders');
  }
}

export async function insertOrder(order: {
  id: string;
  reference?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  items: any[];
  totalAmount: number;
  shippingAddress?: any;
  status: string;
  timestamp: number;
  pendingAt?: number;
  notes?: string;
  promoCode?: string;
  promoDiscount?: number;
}): Promise<OrderRow> {
  try {
    const { data, error } = await ordersTable()
      .insert([{
        id: order.id,
        reference: order.reference ?? null,
        user_id: order.userId ?? null,
        user_name: order.userName ?? null,
        user_email: order.userEmail ?? null,
        items: order.items,
        total_amount: order.totalAmount,
        shipping_address: order.shippingAddress ?? null,
        status: order.status,
        timestamp: order.timestamp,
        pending_at: order.pendingAt ?? null,
        notes: order.notes ?? null,
        promo_code: order.promoCode ?? null,
        promo_discount: order.promoDiscount ?? null,
      }])
      .select()
      .single();

    if (error) throw SupabaseError.fromError(error, 'insertOrder');
    console.log('✅ Commande enregistrée en base:', order.id);
    return data as OrderRow;
  } catch (error) {
    console.error('❌ Erreur insertOrder:', error);
    throw SupabaseError.fromError(error, 'insertOrder');
  }
}

export async function updateOrderStatusInDB(
  orderId: string,
  status: string,
  timestamps: { confirmed_at?: number; shipped_at?: number; delivered_at?: number }
): Promise<void> {
  try {
    const updates: any = { status };
    if (timestamps.confirmed_at) updates.confirmed_at = timestamps.confirmed_at;
    if (timestamps.shipped_at)   updates.shipped_at   = timestamps.shipped_at;
    if (timestamps.delivered_at) updates.delivered_at = timestamps.delivered_at;

    const { error } = await ordersTable().update(updates).eq('id', orderId);
    if (error) throw SupabaseError.fromError(error, `updateOrderStatusInDB: ${orderId}`);
    console.log('✅ Statut commande mis à jour en base:', orderId, '→', status);
  } catch (error) {
    console.error('❌ Erreur updateOrderStatusInDB:', error);
    throw SupabaseError.fromError(error, `updateOrderStatusInDB: ${orderId}`);
  }
}

export async function deleteOrderFromDB(orderId: string): Promise<void> {
  try {
    const { error } = await ordersTable().delete().eq('id', orderId);
    if (error) throw SupabaseError.fromError(error, `deleteOrderFromDB: ${orderId}`);
    console.log('✅ Commande supprimée de la base:', orderId);
  } catch (error) {
    console.error('❌ Erreur deleteOrderFromDB:', error);
    throw SupabaseError.fromError(error, `deleteOrderFromDB: ${orderId}`);
  }
}

// ============================================================================
// ABANDONED CARTS — CRUD Supabase
// ============================================================================

export interface AbandonedCartRow {
  id: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  items: any;
  total_value: number;
  abandoned_at: number;
  recovery_attempts: number;
  last_recovery_email: number | null;
  recovered: boolean;
  recovery_date: number | null;
  discount_offered: number | null;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const abandonedCartsTable = () => (supabase as any).from('abandoned_carts');

export async function fetchAllAbandonedCarts(): Promise<AbandonedCartRow[]> {
  try {
    const { data, error } = await abandonedCartsTable()
      .select('*')
      .order('abandoned_at', { ascending: false });

    if (error) throw SupabaseError.fromError(error, 'fetchAllAbandonedCarts');
    return (data || []) as AbandonedCartRow[];
  } catch (error) {
    console.error('❌ Erreur fetchAllAbandonedCarts:', error);
    throw SupabaseError.fromError(error, 'fetchAllAbandonedCarts');
  }
}

export async function upsertAbandonedCart(cart: {
  id: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  items: any[];
  totalValue: number;
  abandonedAt: number;
  recoveryAttempts?: number;
  lastRecoveryEmail?: number;
  recovered?: boolean;
  recoveryDate?: number;
  discountOffered?: number;
}): Promise<void> {
  try {
    const { error } = await abandonedCartsTable().upsert(
      [{
        id:                   cart.id,
        client_id:            cart.clientId            ?? null,
        client_name:          cart.clientName          ?? null,
        client_email:         cart.clientEmail         ?? null,
        items:                cart.items,
        total_value:          cart.totalValue,
        abandoned_at:         cart.abandonedAt,
        recovery_attempts:    cart.recoveryAttempts    ?? 0,
        last_recovery_email:  cart.lastRecoveryEmail   ?? null,
        recovered:            cart.recovered           ?? false,
        recovery_date:        cart.recoveryDate        ?? null,
        discount_offered:     cart.discountOffered     ?? null,
      }],
      { onConflict: 'id' }
    );
    if (error) throw SupabaseError.fromError(error, 'upsertAbandonedCart');
  } catch (error) {
    console.error('❌ Erreur upsertAbandonedCart:', error);
    throw SupabaseError.fromError(error, 'upsertAbandonedCart');
  }
}

export async function updateAbandonedCartInDB(
  cartId: string,
  updates: {
    recovery_attempts?:   number;
    last_recovery_email?: number;
    discount_offered?:    number;
    recovered?:           boolean;
    recovery_date?:       number;
  }
): Promise<void> {
  try {
    const { error } = await abandonedCartsTable()
      .update(updates)
      .eq('id', cartId);
    if (error) throw SupabaseError.fromError(error, 'updateAbandonedCartInDB');
  } catch (error) {
    console.error('❌ Erreur updateAbandonedCartInDB:', error);
    throw SupabaseError.fromError(error, 'updateAbandonedCartInDB');
  }
}

// ============================================================================
// EXPORT DU CLIENT
// ============================================================================

export default supabase;
