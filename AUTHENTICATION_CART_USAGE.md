/**
 * GUIDE D'UTILISATION : AUTHENTIFICATION + STORE DE PANIER RÉACTIF
 * 
 * Ce fichier démontre comment utiliser le système d'authentification amélioré
 * et le store de panier réactif avec Zustand.
 */

// ============================================================================
// 1. OBTENIR L'ID UTILISATEUR DEPUIS AUTHCONTEXT
// ============================================================================

import { useAuth } from '@/context/AuthContext';

export const UserProfileExample = () => {
  const { user, userId, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Chargement...</div>;

  if (!isAuthenticated) {
    return <div>Pas connecté</div>;
  }

  return (
    <div>
      {/* Accès à l'ID utilisateur */}
      <p>ID Utilisateur: {userId}</p>
      
      {/* Accès aux infos complètes */}
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
      <p>Rôle: {user?.role}</p>
    </div>
  );
};

// ============================================================================
// 2. UTILISER LE STORE DE PANIER RÉACTIF
// ============================================================================

import { useCartStore } from '@/store/useCartStore';

// Option 1 : Hook classique (backward compatible)
export const CartExample1 = () => {
  const { cartItems, cartItemsCount, cartTotal, addToCart, removeItem } = useCartStore();

  return (
    <div>
      <p>Panier: {cartItemsCount} articles</p>
      <p>Total: {cartTotal.toFixed(2)}€</p>
    </div>
  );
};

// Option 2 : Avec userId pour tracker l'utilisateur
export const CartExample2 = () => {
  const { userId } = useAuth();
  const { addToCart } = useCartStore();

  const handleAddWithUser = (productData) => {
    // Ajouter au panier avec l'ID utilisateur
    addToCart(productData, userId || undefined);
  };

  return <button onClick={() => handleAddWithUser({})}>Ajouter avec User ID</button>;
};

// ============================================================================
// 3. ÉCOUTER LES CHANGEMENTS DU PANIER
// ============================================================================

import { useEffect, useState } from 'react';
import type { CartItem } from '@/store/useCartStore';

export const CartObserverExample = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { watchCartChanges } = useCartStore();

  useEffect(() => {
    // S'abonner aux changements du panier
    const unsubscribe = watchCartChanges((updatedItems) => {
      console.log('Panier mis à jour:', updatedItems);
      setItems(updatedItems);
    });

    // Nettoyage
    return () => {
      unsubscribe();
    };
  }, [watchCartChanges]);

  return (
    <div>
      <h3>Observer Panier</h3>
      <p>Articles: {items.length}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name} x{item.quantity}</li>
        ))}
      </ul>
    </div>
  );
};

// ============================================================================
// 4. EXEMPLE COMPLET : PANIER UTILISATEUR SYNCHRONISÉ
// ============================================================================

export const CompleteCartExample = () => {
  const { user, userId, isAuthenticated } = useAuth();
  const { cartItems, cartItemsCount, cartTotal, addToCart, removeItem, clearCart } = useCartStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Observer pour tracker les changements
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const unsubscribe = useCartStore.subscribe(
      (state) => state.cartItems,
      (items) => {
        console.log(`Panier de ${userId} mis à jour:`, items);
        setCartItems(items);

        // Ici, vous pourriez envoyer les données à un backend
        // par exemple: updateUserCart(userId, items);
      }
    );

    return () => unsubscribe();
  }, [userId, isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter pour voir votre panier</div>;
  }

  return (
    <div>
      <h2>Panier de {user?.username}</h2>
      <p>Articles: {cartItemsCount}</p>
      <p>Total: {cartTotal.toFixed(2)}€</p>
      
      {cartItems.length === 0 ? (
        <p>Votre panier est vide</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id}>
              <span>{item.name} - {item.quantity}x {item.price}€</span>
              <button onClick={() => removeItem(item.id)}>Supprimer</button>
            </div>
          ))}
          <button onClick={() => clearCart()}>Vider le panier</button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. SYNCHRONISATION AVEC BACKEND (EXEMPLE)
// ============================================================================

export const CartSyncExample = () => {
  const { userId } = useAuth();

  useEffect(() => {
    // Écouter les changements du panier
    const unsubscribe = useCartStore.subscribe(
      (state) => state.cartItems,
      async (items) => {
        // Envoyer les changements au backend
        try {
          const response = await fetch(`/api/users/${userId}/cart`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          });

          if (response.ok) {
            console.log('Panier synchronisé avec le backend');
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation:', error);
        }
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return null;
};

export default {
  UserProfileExample,
  CartExample1,
  CartExample2,
  CartObserverExample,
  CompleteCartExample,
  CartSyncExample,
};
