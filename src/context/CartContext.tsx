import { createContext, useContext, ReactNode } from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';

// Re-export types for backward compatibility
export type { CartItem };

interface CartContextType {
  cartItems: CartItem[];
  cartItemsCount: number;
  isCartOpen: boolean;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  setIsCartOpen: (open: boolean) => void;
  promoCode: string | null;
  promoDiscount: number;
  setPromoCode: (code: string, discount: number) => void;
  clearPromoCode: () => void;
  applyPromoCode: (code: string, discount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart: addToCartStore,
    addToCartGuest,
    updateQuantity: updateQuantityStore,
    updateQuantityGuest,
    removeItem: removeItemStore,
    removeItemGuest,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
  } = useCartStore();

  const { user } = useAuth();

  const isGuest = !user?.id;

  // Wrapper pour addToCart : guest = localStorage, auth = Supabase
  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    const productData = {
      productId: (product as any).productId || (product as any).id || '',
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image || (product as any).image_url,
      scent: (product as any).scent,
      category: (product as any).category,
    };

    if (isGuest) {
      addToCartGuest(productData);
    } else {
      addToCartStore(productData, user!.id);
    }
  };

  // Wrapper pour updateQuantity : guest vs auth
  const updateQuantity = (id: string, quantity: number) => {
    if (isGuest || id.startsWith('guest_')) {
      updateQuantityGuest(id, quantity);
    } else {
      updateQuantityStore(id, quantity);
    }
  };

  // Wrapper pour removeItem : guest vs auth
  const removeItem = (id: string) => {
    if (isGuest || id.startsWith('guest_')) {
      removeItemGuest(id);
    } else {
      removeItemStore(id);
    }
  };

  // Alias pour les composants qui utilisent applyPromoCode
  const applyPromoCode = (code: string, discount: number) => {
    setPromoCode(code, discount);
  };

  const value = {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
    applyPromoCode,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook backward compatible qui utilise le store Zustand
// Supporte le mode invité (guest cart) ET le mode authentifié
export const useCart = () => {
  const {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart: addToCartStore,
    addToCartGuest,
    updateQuantity: updateQuantityStore,
    updateQuantityGuest,
    removeItem: removeItemStore,
    removeItemGuest,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
  } = useCartStore();

  const { user } = useAuth();

  const isGuest = !user?.id;

  // Wrapper pour addToCart : guest = localStorage, auth = Supabase
  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    const productData = {
      productId: (product as any).productId || (product as any).id || '',
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image || (product as any).image_url,
      scent: (product as any).scent,
      category: (product as any).category,
    };

    if (isGuest) {
      addToCartGuest(productData);
    } else {
      addToCartStore(productData, user!.id);
    }
  };

  // Wrapper pour updateQuantity : guest vs auth
  const updateQuantity = (id: string, quantity: number) => {
    if (isGuest || id.startsWith('guest_')) {
      updateQuantityGuest(id, quantity);
    } else {
      updateQuantityStore(id, quantity);
    }
  };

  // Wrapper pour removeItem : guest vs auth
  const removeItem = (id: string) => {
    if (isGuest || id.startsWith('guest_')) {
      removeItemGuest(id);
    } else {
      removeItemStore(id);
    }
  };

  // Alias pour les composants qui utilisent applyPromoCode
  const applyPromoCode = (code: string, discount: number) => {
    setPromoCode(code, discount);
  };

  return {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
    applyPromoCode,
  };
};
