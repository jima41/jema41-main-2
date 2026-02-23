import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import { useOrderManagement } from '@/store/useAdminStore';
import type { CartItem } from '@/store/useCartStore';

// Removed Header import
const Success = () => {
  const navigate = useNavigate();
  const { cartItems, cartItemsCount, setIsCartOpen } = useCart();
  const { clearCart } = useCartStore();
  const { user } = useAuth();
  const { createOrder, deductStock } = useOrderManagement();
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);

  // Generate order number
  const orderNumber = `RH${new Date().getTime().toString().slice(-8).toUpperCase()}`;

  useEffect(() => {
    window.scrollTo(0, 0);
    // Store order items before clearing cart
    if (cartItems.length > 0) {
      setOrderItems(cartItems);
      
      // Create order with stock deduction
      const orderItems_mapped = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        volume: item.volume,
      }));

      // Deduct stock
      const hasStockAvailable = deductStock(orderItems_mapped);
      
      if (hasStockAvailable) {
        // Create order in admin store
        createOrder({
          userId: user?.id,
          userName: user?.username,
          userEmail: user?.email,
          items: orderItems_mapped,
          totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          status: 'completed',
        });
      } else {
        console.warn('Not enough stock for one or more items');
      }

      clearCart();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 py-10 md:py-24 flex items-center justify-center">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              className="mb-8 md:mb-12 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#FCEEAC]/20 border border-[#D4AF37]/40"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Check className="w-12 h-12 text-[#D4AF37]" strokeWidth={2} />
              </motion.div>
            </motion.div>

            {/* Main Message */}
            <h1 className="font-serif text-4xl md:text-5xl mb-6">
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#FCEEAC] to-[#A68A56] bg-clip-text text-transparent">
                Merci pour votre confiance
              </span>
            </h1>

            <p className="text-lg text-foreground/80 mb-2 font-light leading-relaxed">
              Votre parfum est en préparation.
            </p>

            <p className="text-sm text-foreground/60 mb-12 uppercase tracking-widest">
              Un email de confirmation vous a été envoyé.
            </p>

            {/* Order Number */}
            <div className="p-8 rounded-lg glass border border-border/30 mb-10 max-w-sm mx-auto">
              <p className="text-xs text-foreground/70 uppercase tracking-widest mb-2">
                Numéro de commande
              </p>
              <p className="font-serif text-3xl font-light text-[#D4AF37] tracking-wider">
                {orderNumber}
              </p>
            </div>

            {/* Order Details */}
            <div className="p-8 rounded-lg bg-secondary/30 border border-border/30 mb-12">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-foreground/60 text-xs uppercase tracking-widest mb-2">
                    Articles
                  </p>
                  <p className="font-serif font-normal text-2xl">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-foreground/60 text-xs uppercase tracking-widest mb-2">
                    Montant
                  </p>
                  <p className="font-serif font-light text-3xl text-[#D4AF37]">
                    {(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)).toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-6 mb-14">
              <h3 className="font-serif text-lg">Les prochaines étapes :</h3>
              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex gap-4">
                  <span className="text-[#D4AF37] font-serif font-light text-lg">1</span>
                  <p className="text-sm text-foreground/80">
                    Vérification et préparation de votre commande (2-4h)
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#D4AF37] font-serif font-light text-lg">2</span>
                  <p className="text-sm text-foreground/80">
                    Expédition de votre parfum sous 24h
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#D4AF37] font-serif font-light text-lg">3</span>
                  <p className="text-sm text-foreground/80">
                    Livraison en 2-4 jours ouvrés en France métropolitaine
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                onClick={() => navigate('/')}
                className="px-8 py-3 min-h-[48px] rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 text-sm font-medium text-foreground transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continuer vos achats
              </motion.button>

              <motion.button
                onClick={() => navigate('/all-products')}
                className="px-8 py-3 min-h-[48px] rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-[#FCEEAC]/10 hover:border-[#D4AF37] hover:bg-gradient-to-r hover:from-[#D4AF37]/20 hover:to-[#FCEEAC]/20 text-sm font-medium text-foreground transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Découvrir d'autres parfums
              </motion.button>
            </div>

            {/* Support Info */}
            <p className="text-xs text-foreground/50 uppercase tracking-widest">
              Besoin d'aide ? Contactez-nous à{' '}
              <a href="mailto:support@rayhastore.com" className="text-[#D4AF37] hover:underline">
                support@rayhastore.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Success;
