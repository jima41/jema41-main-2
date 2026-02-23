# 🏗️ Rayha Store - Supabase V2 Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   🌐 FRONTEND (React/Vite)                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   React Components                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │ │
│  │  │ ProductCard  │  │ CartDrawer   │  │ FavoritesPage    │ │ │
│  │  │ (add to cart)│  │ (view cart)  │  │ (manage likes)   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │      🎯 UserDataSyncInitializer (NEW)                   │ │ │
│  │  │  └─ Orchestrates cart/favorites initialization         │ │ │
│  │  │  └─ Manages realtime subscriptions on auth change      │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            📦 Zustand Stores (State Management)             │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  useCartStore (REFACTORED)                           │  │ │
│  │  │  ├─ initializeCart(userId)                           │  │ │
│  │  │  ├─ addToCart(product, userId) [async]             │  │ │
│  │  │  ├─ updateQuantity(itemId, qty) [async]            │  │ │
│  │  │  ├─ setupCartRealtime(userId)                       │  │ │
│  │  │  └─ State: cartItems[], isLoading, error           │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  useFavoritesStore (REFACTORED)                      │  │ │
│  │  │  ├─ initializeFavorites(userId)                      │  │ │
│  │  │  ├─ toggleFavorite(userId, productId) [async]      │  │ │
│  │  │  ├─ setupFavoritesRealtime(userId)                  │  │ │
│  │  │  └─ State: favorites[], isLoading, error           │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  useAdminStore (EXISTING)                            │  │ │
│  │  │  ├─ Products management                              │  │ │
│  │  │  └─ Real-time product sync from DB                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │       🔌 Supabase Integration Layer (EXPANDED)              │ │
│  │                                                              │ │
│  │  Cart Operations:                                            │ │
│  │  • getUserCart(userId)                                      │ │
│  │  • addToCart(userId, productId, productData)               │ │
│  │  • updateCartItemQuantity(itemId, qty)                     │ │
│  │  • removeFromCart(itemId)                                  │ │
│  │  • clearCart(userId)                                       │ │
│  │  • subscribeToCart(userId, callback)                       │ │
│  │                                                              │ │
│  │  Wishlist Operations:                                        │ │
│  │  • getUserWishlist(userId)                                 │ │
│  │  • addToWishlist(userId, productId)                        │ │
│  │  • removeFromWishlist(userId, productId)                   │ │
│  │  • toggleWishlist(userId, productId)                       │ │
│  │  • subscribeToWishlist(userId, callback)                   │ │
│  │                                                              │ │
│  │  Existing Operations:                                        │ │
│  │  • Product management (unchanged)                           │ │
│  │  • subscribeToProducts(callback) [unchanged]                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────────────────────┬──────────────────────────────┘
                                    │
                HTTPS + WebSocket   │
                ════════════════════╪════════════════════
                                    │
┌───────────────────────────────────┴──────────────────────────────┐
│            ☁️ SUPABASE (Cloud Backend)                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔐 Authentication (Supabase Auth)                         │ │
│  │  └─ auth.users table (managed by Supabase)               │ │
│  │  └─ JWT tokens + Session management                       │ │
│  │  └─ auth.uid() available in RLS policies                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📊 Database Tables (PostgreSQL)                           │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ products                                              │  │ │
│  │  │ ├─ id, name, price, stock, image_url                │  │ │
│  │  │ ├─ RLS: SELECT = public, INSERT/UPDATE = admin      │  │ │
│  │  │ ├─ Realtime: ✅ enabled                              │  │ │
│  │  │ └─ Usage: Catalog display, inventory management     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ profiles (NEW)                                        │  │ │
│  │  │ ├─ id (FK: auth.users), email, display_name          │  │ │
│  │  │ ├─ RLS: user owns all data                           │  │ │
│  │  │ └─ Realtime: ✅ enabled                              │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ cart_items (NEW) ⭐ KEY TABLE                         │  │ │
│  │  │ ├─ id (UUID), user_id (FK), product_id (FK)         │  │ │
│  │  │ ├─ quantity, product_snapshot (name, price, img)   │  │ │
│  │  │ ├─ added_at, updated_at (timestamps)                │  │ │
│  │  │ ├─ RLS: user_id = auth.uid() (strict isolation)    │  │ │
│  │  │ ├─ Realtime: ✅ enabled (postgres_changes)         │  │ │
│  │  │ ├─ Indexes: (user_id), (product_id), (user_id, product_id) │ │
│  │  │ └─ Data Flow: Frontend ↔ DB ↔ Realtime             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ wishlist (NEW) ⭐ KEY TABLE                           │  │ │
│  │  │ ├─ id (UUID), user_id (FK), product_id (FK)         │  │ │
│  │  │ ├─ position, added_at (timestamp)                    │  │ │
│  │  │ ├─ UNIQUE(user_id, product_id)                       │  │ │
│  │  │ ├─ RLS: user_id = auth.uid() (strict isolation)    │  │ │
│  │  │ ├─ Realtime: ✅ enabled (postgres_changes)         │  │ │
│  │  │ ├─ Indexes: (user_id), (product_id)                 │  │ │
│  │  │ └─ Data Flow: Frontend ↔ DB ↔ Realtime             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ⚡ Realtime Subscriptions                                 │ │
│  │                                                              │ │
│  │  PostgreSQL LISTEN/NOTIFY:                                  │ │
│  │  └─ Broadcast changes to all connected WebSocket clients   │ │
│  │                                                              │ │
│  │  Channel subscriptions (per user):                          │ │
│  │  └─ cart_{userId} → Monitors user's cart_items             │ │
│  │  └─ wishlist_{userId} → Monitors user's wishlist           │ │
│  │  └─ products_changes → Monitors all products               │ │
│  │                                                              │ │
│  │  Event Types:                                                │ │
│  │  └─ INSERT: New item added                                 │ │
│  │  └─ UPDATE: Item modified                                  │ │
│  │  └─ DELETE: Item removed                                   │ │
│  │  └─ Recovery: Auto-reconnect after 5s if connection lost   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔧 SQL Functions (for complex operations)                 │ │
│  │                                                              │ │
│  │  get_user_cart(user_id)                                     │ │
│  │  ├─ Returns all cart items with product details            │ │
│  │  └─ Used by: Frontend initialization                        │ │
│  │                                                              │ │
│  │  get_user_wishlist(user_id)                                 │ │
│  │  ├─ Returns all favorite product IDs                       │ │
│  │  └─ Used by: Frontend initialization                        │ │
│  │                                                              │ │
│  │  add_to_cart(user_id, product_id, quantity)               │ │
│  │  ├─ Inserts new or increments existing quantity            │ │
│  │  └─ Used by: addToCart action                              │ │
│  │                                                              │ │
│  │  toggle_wishlist(user_id, product_id)                      │ │
│  │  ├─ Adds if not exists, removes if exists                  │ │
│  │  └─ Used by: toggleFavorite action                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔐 Row Level Security (RLS Policies)                       │ │
│  │                                                              │ │
│  │  cart_items RLS:                                             │ │
│  │  ├─ SELECT: WHERE user_id = auth.uid()                      │ │
│  │  ├─ INSERT: WITH CHECK (user_id = auth.uid())              │ │
│  │  ├─ UPDATE: USING AND WITH CHECK (user_id = auth.uid())   │ │
│  │  └─ DELETE: USING (user_id = auth.uid())                   │ │
│  │                                                              │ │
│  │  wishlist RLS:                                               │ │
│  │  ├─ Same as cart_items (user isolation)                    │ │
│  │                                                              │ │
│  │  products RLS:                                               │ │
│  │  ├─ SELECT: true (everyone sees products)                  │ │
│  │  ├─ INSERT/UPDATE/DELETE: auth.uid() IN admins             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: User Adds Product to Cart

```
┌─ FRONTEND ─────────────────────────────────────────────────────┐
│                                                                 │
│  1. ProductCard render                                          │
│     └─ <button onClick={addToCart}>Add to Cart</button>        │
│                                                                 │
│  2. User clicks button                                          │
│     └─ addToCart(product, userId) called                       │
│                                                                 │
│  3. OPTIMISTIC UPDATE (immediate)                              │
│     └─ setState({ cartItems: [..., newItem] })                 │
│     └─ UI updates instantly ✅                                  │
│                                                                 │
│  4. ASYNC BACKEND CALL (in parallel)                           │
│     └─ supabaseAddToCart(userId, productId, {...})            │
│                                                                 │
└─────────────────────────────────────┬──────────────────────────┘
                                      │
                    HTTPS POST to Supabase API
                                      │
┌─ SUPABASE BACKEND ─────────────────┴──────────────────────────┐
│                                                                 │
│  5. Authentication Check                                        │
│     └─ Verify JWT token, get auth.uid()                       │
│                                                                 │
│  6. SQL Function: add_to_cart()                                │
│     ├─ Check if item already in cart                           │
│     │  ├─ If YES: UPDATE quantity += 1                        │
│     │  └─ If NO: INSERT new item                              │
│     └─ RETURNING * → Response to client                       │
│                                                                 │
│  7. Realtime Broadcast                                          │
│     └─ PostgreSQL notifies all subscribers of cart_changes    │
│                                                                 │
└─────────────────────────────────────┬──────────────────────────┘
                                      │
                    WebSocket broadcast to subscribers
                                      │
┌─ FRONTEND (OTHER TABS/DEVICES) ────┴──────────────────────────┐
│                                                                 │
│  8. Realtime Subscription Callback                             │
│     └─ subscribeToCart(...) receives update                   │
│                                                                 │
│  9. Update Store                                                │
│     └─ setState({ cartItems: [...updated...] })              │
│                                                                 │
│  10. UI Re-renders                                              │
│      └─ Product appears in other tabs immediately ✅           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

RESULT:
✅ Current device: Product in cart instantly (optimistic)
✅ Same device, other tabs: Updates in ~100ms (realtime)
✅ Other devices: Updates in ~100ms (realtime)
✅ Database: Persisted for next session
```

### Example 2: Admin Modifies Product Stock

```
┌─ ADMIN PANEL ──────────────────────────────────────────────────┐
│                                                                 │
│  1. Admin loads /admin/inventory                               │
│     └─ Sees products from useAdminStore                       │
│                                                                 │
│  2. Admin clicks "Edit Stock" on Product                       │
│     └─ Opens EditStockDialog                                   │
│                                                                 │
│  3. Admin enters new stock: 0 (OUT OF STOCK)                   │
│     └─ Clicks "Save"                                            │
│                                                                 │
│  4. updateProduct(productId, { stock: 0 })                    │
│     └─ API call to Supabase                                   │
│                                                                 │
└─────────────────────────────────────┬──────────────────────────┘
                                      │
                    UPDATE products SET stock = 0
                                      │
┌─ SUPABASE ─────────────────────────┴──────────────────────────┐
│                                                                 │
│  5. Verify admin role (RLS policy check)                        │
│     └─ UPDATE allowed for admin users                          │
│                                                                 │
│  6. Update products table                                       │
│     └─ UPDATE products SET stock = 0 WHERE id = ?             │
│                                                                 │
│  7. Realtime Broadcast                                          │
│     └─ PostgreSQL notifies all subscribers of products_changes │
│                                                                 │
└─────────────────────────────────────┬──────────────────────────┘
                                      │
          WebSocket broadcast to ALL connected clients
                    ├─ Admin who made change
                    ├─ Other admins
                    └─ All regular users viewing product
                                      │
┌─ ALL CONNECTED CLIENTS ────────────┴──────────────────────────┐
│                                                                 │
│  8. subscribeToProducts() callback                             │
│     └─ Receives UPDATE event for product                      │
│                                                                 │
│  9. Update useAdminStore                                        │
│     └─ setState({ products: [...updated...] })               │
│                                                                 │
│  10. UI Re-renders                                              │
│       ├─ Admin panel: Product now shows "ÉPUISÉ" ✅           │
│       ├─ Product page: Badge "ÉPUISÉ" appears ✅              │
│       └─ All users see change within ~100ms                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

RESULT:
✅ Inventory synced across all instances
✅ No manual refresh needed
✅ All users see consistent state
```

---

## 🔐 Security Model

### Authentication Layer
```
User 1 (device A, tab 1) → JWT Token → auth.uid() = UUID_1
User 1 (device B, tab 2) → JWT Token → auth.uid() = UUID_1
User 2 (device C)        → JWT Token → auth.uid() = UUID_2
```

### Database Access Control
```sql
-- User 1 queries cart
SELECT * FROM cart_items
WHERE user_id = UUID_1  ← RLS adds this automatically

-- Result: Only User 1's cart items returned
-- User 2 cannot see User 1's items, even with same browser instance
```

### Multi-User Isolation
```
Cart table contents:
┌────┬──────────┬────────────┐
│ id │ user_id  │ product_id │
├────┼──────────┼────────────┤
│ 1  │ UUID_1   │ PROD_001   │  ← User 1 can see
│ 2  │ UUID_1   │ PROD_002   │  ← User 1 can see
│ 3  │ UUID_2   │ PROD_001   │  ← User 1 CANNOT see
│ 4  │ UUID_2   │ PROD_003   │  ← User 1 CANNOT see
└────┴──────────┴────────────┘

Query from User 1:
SELECT * FROM cart_items
Result: Rows 1, 2 only (RLS enforced automatically)
```

---

## 📈 Performance Characteristics

| Operation | Latency | Bottleneck | Notes |
|-----------|---------|-----------|-------|
| Initialize cart | ~500ms | Network + DB query | First load only |
| Add to cart | ~50-100ms | Network roundtrip + async | Optimistic ~0ms |
| Real-time update | ~50-100ms | WebSocket broadcast | Very fast |
| Refresh page | ~100-200ms | Reload + queries | Acceptable |
| Search/filter | ~50-200ms | DB query | Depends on data size |

---

## 🎯 Design Principles

1. **Optimistic Updates**: UI changes immediately, sync happens after
2. **Automatic Retry**: Failed connections retry after 5 seconds
3. **User Isolation**: RLS ensures no data leakage
4. **Real-time Sync**: All devices see same data within ~100ms
5. **Cloud-First**: No local-only data, always cloud-backed
6. **Type-Safe**: Full TypeScript support where possible

---

## ✅ Validation Checklist

Before going to production, verify:
- [ ] SQL migration executed successfully
- [ ] All 3 tables created (cart_items, wishlist, profiles)
- [ ] RLS policies attached to all tables
- [ ] Realtime enabled on cart_items, wishlist, profiles
- [ ] Frontend components compile without errors
- [ ] Login/logout flow works correctly
- [ ] Cart persists across page refreshes
- [ ] Multi-tab sync works within 100ms
- [ ] Multi-device sync works (2 browsers)
- [ ] Admin can still modify products
- [ ] No localStorage references in frontend code

---

**Status**: ✅ Architecture complete and documented  
**Version**: 2.0  
**Date**: 8 février 2025
