import { useEffect, lazy, Suspense } from 'react';
import Hero from '@/components/Hero';
const SillageQuiz = lazy(() => import('@/components/SillageQuiz'));
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import Reassurance from '@/components/Reassurance';
import SavoirFaireBanners from '@/components/SavoirFaireBanners';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import type { Product } from '@/lib/products';

const Index = () => {
  const {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    applyPromoCode,
    clearPromoCode,
  } = useCart();
  const { trackPageView: adminTrackPageView } = useAdmin();
  const { trackPageView, trackPageExit, trackClick } = useAnalytics();

  useEffect(() => {
    adminTrackPageView('/');
    trackPageView('/', 'Accueil');
    return () => trackPageExit('/');
  }, []);

  const handleAddToCart = (product: Product) => {
    const { quantity, ...productData } = product as any;
    addToCart(productData);
  };

  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />

<Suspense fallback={<div className="py-12 text-center">Chargement...</div>}>
          <SillageQuiz />
        </Suspense>

        <ProductGrid onAddToCart={handleAddToCart} />
        <SavoirFaireBanners />
        <Reassurance />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        promoCode={promoCode}
        promoDiscount={promoDiscount}
        onApplyPromo={applyPromoCode}
        onClearPromo={clearPromoCode}
      />
    </div>
  );
};

export default Index;
