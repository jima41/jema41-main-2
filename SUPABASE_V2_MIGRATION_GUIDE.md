# 📋 Migration Supabase V2 - Persistance Utilisateur et Synchronisation en Temps Réel

## 🎯 Objectif de la Migration

Remplacer le stockage local (`localStorage`) par une base de données centrale (**Supabase**) pour:
- ✅ **Persistance des données utilisateur** (panier, favoris) entre les appareils
- ✅ **Synchronisation en temps réel** des changements d'inventaire
- ✅ **Sécurité** via Row Level Security (RLS)
- ✅ **Performance** via requêtes optimisées et abonnements en temps réel

---

## 📦 Composants Impactés

### 1. **Base de Données (Supabase)**

#### Nouvelles Tables Créées:
- `profiles` - Données utilisateur enrichies
- `cart_items` - Articles du panier (persistants par utilisateur)
- `wishlist` - Produits en favoris (persistants par utilisateur)

#### Modifications:
- Activation de Realtime sur `cart_items`, `wishlist`, `profiles`
- RLS Policies pour la sécurité (utilisateurs OWN data only)

#### Nouvelles Fonctions SQL:
- `get_user_cart()` - Récupère le panier
- `get_user_wishlist()` - Récupère les favoris
- `add_to_cart()` - Ajoute un article (ou +=1 si existe)
- `remove_from_cart()` - Supprime un article
- `clear_cart()` - Vide le panier
- `toggle_wishlist()` - Ajoute/retire des favoris

**Migration File**: [`SUPABASE_MIGRATION_V2.sql`](./SUPABASE_MIGRATION_V2.sql)

---

### 2. **Frontend - Supabase Integration** (`src/integrations/supabase/supabase.ts`)

#### Nouvelles Fonctions Exportées:

**Cart Operations:**
```typescript
// Récupérer le panier
getUserCart(userId: string): Promise<CartItemDB[]>

// Ajouter au panier
addToCart(userId, productId, productData): Promise<CartItemDB>

// Mettre à jour quantité
updateCartItemQuantity(cartItemId, quantity): Promise<CartItemDB>

// Retirer du panier
removeFromCart(cartItemId): Promise<void>

// Vider le panier
clearCart(userId): Promise<void>

// S'abonner aux changements
subscribeToCart(userId, callback, errorCallback?): Subscription
```

**Wishlist Operations:**
```typescript
// Récupérer favoris
getUserWishlist(userId: string): Promise<string[]>

// Ajouter aux favoris
addToWishlist(userId, productId): Promise<boolean>

// Retirer des favoris
removeFromWishlist(userId, productId): Promise<boolean>

// Toggle favoris
toggleWishlist(userId, productId): Promise<boolean>

// S'abonner aux changements
subscribeToWishlist(userId, callback, errorCallback?): Subscription
```

---

### 3. **Frontend - Stores Zustand** 

#### ✅ `useCartStore` - Migration Complète

**Avant** (localStorage):
```typescript
// ❌ Données sauvegardées dans le navigateur
const { addToCart } = useCartStore();
addToCart(product, userId); // Sync synchrone
```

**Après** (Supabase):
```typescript
// ✅ Données dans Supabase, synchronisation en temps réel
const { addToCart, initializeCart, setupCartRealtime } = useCartStore();

// Initialiser au login
await initializeCart(userId);
setupCartRealtime(userId);

// Ajouter au panier (async)
await addToCart(product, userId);
```

**Nouvelles Actions:**
- `initializeCart(userId)` - Charge le panier depuis Supabase
- `setupCartRealtime(userId)` - Écoute les changements en temps réel
- `teardownCartRealtime()` - Arrête l'écoute (logout)

**State Additions:**
- `isLoading: boolean` - Chargement en cours
- `error: string | null` - Message d'erreur

---

#### ✅ `useFavoritesStore` - Migration Complète

**Avant** (localStorage):
```typescript
// ❌ Données dans le navigateur
const { addFavorite, toggleFavorite } = useFavoritesStore();
addFavorite(productId); // Sync synchrone
```

**Après** (Supabase):
```typescript
// ✅ Données dans Supabase
const { addFavorite, toggleFavorite, initializeFavorites, setupFavoritesRealtime } = useFavoritesStore();

// Initialiser au login
await initializeFavorites(userId);
setupFavoritesRealtime(userId);

// Ajouter aux favoris (async)
await addFavorite(userId, productId);
```

**Nouvelles Actions:**
- `initializeFavorites(userId)` - Charge les favoris
- `setupFavoritesRealtime(userId)` - Écoute les changements
- `teardownFavoritesRealtime()` - Arrête l'écoute (logout)

---

### 4. **Frontend - Composants** 

#### 🆕 UserDataSyncInitializer Component

Nouveau composant qui orchestr l'initialisation et la synchronisation des données utilisateur.

```typescript
<UserDataSyncInitializer />
```

**Responsabilités:**
- 🔄 Détecte la connexion/déconnexion utilisateur
- 📥 Charge le panier depuis Supabase au login
- 📥 Charge les favoris depuis Supabase au login
- 🔌 Active les abonnements en temps réel
- 🧹 Nettoie les subscriptions et données au logout

**Placement dans App**: Entre `DataSyncInitializer` et le routage

---

## 🔄 Flux de Données

### Scénario 1: Utilisateur se connecte

```
1. User Logs In
   ↓
2. AuthContext detects auth.user
   ↓
3. UserDataSyncInitializer activates
   ↓
4. initializeCart(userId)
   ├─ Query Supabase: SELECT cart_items WHERE user_id = userId
   ├─ Parse results to CartItem[]
   └─ Update Zustand store
   ↓
5. setupCartRealtime(userId)
   └─ Subscribe to postgres_changes on cart_items table
   ↓
6. initializeFavorites(userId)
   ├─ Query Supabase: SELECT product_id FROM wishlist
   └─ Update Zustand store
   ↓
7. setupFavoritesRealtime(userId)
   └─ Subscribe to postgres_changes on wishlist table
   ↓
✅ User sees their cart and favorites loaded from Supabase
```

### Scénario 2: Utilisateur ajoute au panier

```
1. User clicks "Ajouter au Panier"
   ↓
2. addToCart(product, userId)
   ├─ OPTIMISTIC UPDATE: Add immediately to UI
   ├─ Call Supabase: addToCart(...)
   ├─ Supabase checks for existing item
   ├─ INSERT or UPDATE on cart_items
   ├─ Realtime listener triggers on other tabs/devices
   └─ UI syncs automatically (Zustand subscription)
   ↓
✅ Product appears in cart immediately
✅ Other tabs/devices see the change automatically
```

### Scénario 3: Admin modifie le stock

```
1. Admin changes stock in /admin/inventory
   ↓
2. UPDATE products SET stock = 0 WHERE id = 'prod-1'
   ↓
3. Realtime broadcast to all connected clients
   ↓
4. ProductGrid (admin) receives update, UI reflects immediately
   ↓
5. All other users see "ÉPUISÉ" badge on next refresh OR via realtime
   ↓
✅ All users see the same inventory information
```

---

## 📊 Changements aux Stores

### useCartStore

| Feature | Before | After |
|---------|--------|-------|
| Storage | localStorage | Supabase DB |
| Persistence | Browser only | Any device (cloud) |
| Sync Time | Instant (sync) | ~50-100ms (async) |
| Real-time Updates | ❌ No | ✅ Yes |
| Multi-device Sync | ❌ No | ✅ Yes |
| Initialization | Auto-load from localStorage | Manual call `initializeCart(userId)` |
| Actions | Sync | Async (await) |
| Loading State | None | `isLoading`, `error` |

### useFavoritesStore

| Feature | Before | After |
|---------|--------|-------|
| Storage | localStorage | Supabase DB |
| Persistence | Browser only | Any device (cloud) |
| Sync Time | Instant | ~50-100ms (async) |
| Real-time Updates | ❌ No | ✅ Yes |
| Multi-device Sync | ❌ No | ✅ Yes |
| Initialization | Auto-load from localStorage | Manual call `initializeFavorites(userId)` |
| Actions | Sync | Async (await) |
| Loading State | None | `isLoading`, `error` |

---

## 🔐 Sécurité - Row Level Security (RLS)

Toutes les tables ont des RLS Policies strictes:

### cart_items RLS:
```sql
-- Users can ONLY view/modify their OWN cart
SELECT: user_id = auth.uid()
INSERT: user_id = auth.uid()
UPDATE: user_id = auth.uid()
DELETE: user_id = auth.uid()
```

### wishlist RLS:
```sql
-- Users can ONLY view/modify their OWN favorites
SELECT: user_id = auth.uid()
INSERT: user_id = auth.uid()
UPDATE: user_id = auth.uid()
DELETE: user_id = auth.uid()
```

### products RLS:
```sql
-- Everyone can view products
SELECT: true

-- Only admins can modify
UPDATE: auth.uid() in admin_users OR role='admin'
DELETE: auth.uid() in admin_users OR role='admin'
INSERT: auth.uid() in admin_users OR role='admin'
```

---

## 📝 Checklist de Déploiement

- [ ] **Exécuter la migration SQL** sur Supabase
  ```bash
  # Via Supabase Dashboard → SQL Editor
  # Copier-coller le contenu de SUPABASE_MIGRATION_V2.sql
  ```

- [ ] **Vérifier les RLS Policies** dans Supabase Dashboard
  - [ ] Tables visible: cart_items, wishlist, profiles
  - [ ] Policies appliquées correctement

- [ ] **Tester Login/Logout**
  - [ ] ✅ Data loads from Supabase on login
  - [ ] ✅ Realtime subscriptions active
  - [ ] ✅ Cart/Favorites persist across page reload
  - [ ] ✅ Data clears on logout

- [ ] **Tester les Opérations CRUD**
  - [ ] ✅ Add to cart → appears in Supabase
  - [ ] ✅ Update quantity → syncs to Supabase
  - [ ] ✅ Remove from cart → syncs to Supabase
  - [ ] ✅ Add to favorites → appears in Supabase
  - [ ] ✅ Changes visible on other devices immediately

- [ ] **Tester Realtime**
  - [ ] ✅ Open site in 2 browser tabs
  - [ ] ✅ Add to cart in tab A → appears in tab B immediately
  - [ ] ✅ Add favorite in tab A → appears in tab B immediately

- [ ] **Tester Admin Sync**
  - [ ] ✅ Admin changes stock → All users see update
  - [ ] ✅ Admin adds product → Available immediately
  - [ ] ✅ Admin deletes product → Removed from all carts

---

## 🚫 Suppressed Features (No Longer Available)

| Feature | Reason |
|---------|--------|
| localStorage for cart | Cloud sync required |
| localStorage for favorites | Cloud sync required |
| localStorage for auth users | Supabase Auth handles sessions |
| Offline cart mode | Requires backend service |
| Local-only persistence | Not needed, cloud is faster |

---

## ✅ Nouvelles Capabilities

| Feature | Benefit |
|---------|---------|
| Multi-device cart sync | Users see same cart on phone/desktop |
| Real-time inventory | Admin and customers see updates instantly |
| Cross-browser sync | Changes visible immediately in all tabs |
| Cloud backup | No data loss if browser cleared |
| Admin control | Can manage user data if needed |
| Analytics | See what users favorite/cart most |

---

## 🐛 Troubleshooting

### "Cart not syncing"
- ✅ Check UserDataSyncInitializer is mounted
- ✅ Verify user is logged in (check auth.uid())
- ✅ Check Supabase RLS policies are set correctly
- ✅ Check browser console for errors

### "Realtime not updating"
- ✅ Check subscriptions are active (console logs)
- ✅ Verify Realtime is enabled on table in Supabase
- ✅ Check firewall/network (WSS port open)
- ✅ Retry connection after 5s (automatic)

### "Permission Denied error"
- ✅ Check user is authenticated (supabase.auth.getUser())
- ✅ Verify RLS policies attached to table
- ✅ Ensure Supabase anon key is public (not service key)

---

## 📚 Files Modified/Created

| File | Status | Changes |
|------|--------|---------|
| SUPABASE_MIGRATION_V2.sql | ✨ NEW | SQL schema, RLS, functions |
| src/integrations/supabase/supabase.ts | 📝 UPDATED | +Cart +Wishlist functions |
| src/store/useCartStore.ts | 🔄 REFACTORED | localStorage → Supabase |
| src/store/useFavoritesStore.ts | 🔄 REFACTORED | localStorage → Supabase |
| src/components/UserDataSyncInitializer.tsx | ✨ NEW | Orchestrate user data sync |
| src/App.tsx | 📝 UPDATED | Added UserDataSyncInitializer |

---

## 🎓 Learning Resources

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Zustand Store](https://github.com/pmndrs/zustand)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📞 Support

If you encounter issues:
1. Check the browser console (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Verify network requests in DevTools
4. Check that migrations were executed successfully

---

**Status**: ✅ Ready for Testing
**Version**: 2.0 - Cloud-First Architecture
**Last Updated**: 2025-02-08
