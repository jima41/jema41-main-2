# 🔐 Système d'Authentification + Store de Panier Réactif

## Résumé des Améliorations

### 1️⃣ **Authentification Améliorée** (AuthContext.tsx)

**Nouvelles propriétés exposées:**

```typescript
interface AuthContextType {
  user: User | null;           // Objet utilisateur complet
  userId: string | null;       // ✨ ID utilisateur directement accessible
  isLoading: boolean;
  isAuthenticated: boolean;    // ✨ Flag de vérification rapide
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**Utilisation:**

```typescript
const { user, userId, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log('ID utilisateur:', userId); // ex: "1" ou "1738792341234-abc123"
}
```

---

### 2️⃣ **Store de Panier Réactif** (useCartStore.ts)

**Nouvelle implémentation avec Zustand + persist middleware**

**Avantages:**
- ✅ **Réactivité complète** : Les changements déclenchent les re-renders
- ✅ **Persistance localStorage** : Le panier survive aux rafraîchissements
- ✅ **Observateurs intégrés** : Écoutez les changements en temps réel
- ✅ **Calculs automatiques** : `cartItemsCount` et `cartTotal` mis à jour automatiquement
- ✅ **Suivi utilisateur** : Chaque item peut être lié à un `userId`

**État du Store:**

```typescript
interface CartStoreState {
  cartItems: CartItem[];        // Articles du panier
  isCartOpen: boolean;          // État du drawer
  cartItemsCount: number;       // Nombre total d'articles
  cartTotal: number;            // Total en €
  
  // Actions
  addToCart(product, userId?);
  updateQuantity(id, quantity);
  removeItem(id);
  clearCart();
  setIsCartOpen(open);
  
  // Observers
  getCartItems();               // Récupérer les articles
  watchCartChanges(callback);   // Écouter les changements
}
```

---

### 3️⃣ **Système d'Observation du Panier**

**Méthode 1 : Hook classique**

```typescript
const { cartItems, cartItemsCount, addToCart } = useCartStore();
// Le composant se re-rend à chaque changement
```

**Méthode 2 : Observation réactive**

```typescript
useEffect(() => {
  // S'abonner aux changements
  const unsubscribe = useCartStore.subscribe(
    (state) => state.cartItems,
    (items) => {
      console.log('Panier changé:', items);
      // Envoyer au backend, analytics, etc.
    }
  );

  return () => unsubscribe(); // Nettoyage
}, []);
```

**Méthode 3 : Fonction helper**

```typescript
const { watchCartChanges } = useCartStore();

useEffect(() => {
  const unsubscribe = watchCartChanges((items) => {
    console.log('Items changés:', items);
  });

  return () => unsubscribe();
}, []);
```

---

### 4️⃣ **Backward Compatibility**

CartContext.tsx a été modifié pour utiliser Zustand en arrière-plan :

```typescript
// Ancien code - TOUJOURS FONCTIONNEL
import { useCart } from '@/context/CartContext';

const { cartItems, cartItemsCount, addToCart } = useCart();
// Utilise maintenant le store Zustand internationalement
```

---

## 📊 Architecture Globale

```
App
├── AuthProvider (AuthContext)
│   └── Expose: user, userId, isAuthenticated
│
└── CartProvider (wrapper du store Zustand)
    └── useCartStore (Zustand avec persist)
        ├── State: cartItems, isCartOpen, totals
        ├── Actions: add, update, remove, clear
        └── Observers: watchCartChanges()
```

---

## 💡 Cas d'Utilisation Pratiques

### Synchroniser le panier avec un utilisateur

```typescript
export const CartSync = () => {
  const { userId } = useAuth();
  
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe(
      (state) => state.cartItems,
      async (items) => {
        // Sauvegarder sur le backend
        await fetch(`/api/users/${userId}/cart`, {
          method: 'PUT',
          body: JSON.stringify({ items }),
        });
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return null;
};
```

### Tracker les analytics

```typescript
useEffect(() => {
  const unsubscribe = watchCartChanges((items) => {
    // Event: utilisateur a ajouté un article
    trackEvent('cart_changed', {
      userId,
      itemCount: items.length,
      total: calculateTotal(items),
    });
  });

  return () => unsubscribe();
}, []);
```

---

## 🔧 Configuration

**localStorage keys:**
- Auth: `currentUser` (utilisateur connecté)
- Cart: `cart-store` (panier persistent)
- Admin: `admin-store` (produits + CRM)

---

## ✅ Installation & Migration

### ✨ Nouveau
- ✅ useCartStore.ts créé avec Zustand
- ✅ AuthContext.tsx amélioré avec userId
- ✅ CartContext.tsx adapté pour compatibilité

### Aucune action requise pour le code existant
Tous les composants utilisant `useCart()` continuent de fonctionner sans modification.

---

## 📚 Fichiers de Référence

- [AuthContext.tsx](./src/context/AuthContext.tsx)
- [useCartStore.ts](./src/store/useCartStore.ts)
- [CartContext.tsx](./src/context/CartContext.tsx)
- [AUTHENTICATION_CART_USAGE.md](./AUTHENTICATION_CART_USAGE.md) - Exemples détaillés
