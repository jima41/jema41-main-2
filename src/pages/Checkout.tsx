import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// Header rendered globally in App.tsx
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useOrderManagement } from '@/store/useAdminStore';
import { usePromoCodesStore } from '@/store/usePromoCodesStore';
import { ArrowLeft, TicketPercent } from 'lucide-react';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

type CheckoutStep = 1 | 2 | 3;

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartItemsCount, setIsCartOpen, promoCode, promoDiscount, applyPromoCode, clearPromoCode } = useCart();
  const { trackPageView, trackPageExit } = useAnalytics();
  const { createOrder, deductStock } = useOrderManagement();
  const incrementUsage = usePromoCodesStore((state) => state.incrementUsage);
  const getPromoByCode = usePromoCodesStore((state) => state.getPromoByCode);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [promoInput, setPromoInput] = useState(promoCode || '');
  const [promoError, setPromoError] = useState('');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });

  // Track page view
  useEffect(() => {
    trackPageView('/checkout', 'Checkout');
    return () => trackPageExit('/checkout');
  }, [trackPageView, trackPageExit]);

  // Pre-fill email from user if logged in
  useEffect(() => {
    if (user?.email && !shippingInfo.email) {
      setShippingInfo(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const isStep1Valid = () => {
    return shippingInfo.firstName.trim() && 
           shippingInfo.lastName.trim() && 
           shippingInfo.email.trim() && 
           shippingInfo.phone.trim() && 
           shippingInfo.address.trim() && 
           shippingInfo.city.trim() && 
           shippingInfo.postalCode.trim();
  };

  const handleCheckout = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const discountAmount = promoDiscount > 0 ? (subtotal * promoDiscount) / 100 : 0;
    const total = Math.max(0, subtotal - discountAmount) + shippingCost;

    // Convert cart items to order items
    const orderItems = cartItems.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      volume: item.volume,
    }));

    // Deduct stock
    const stockOk = deductStock(orderItems);
    if (!stockOk) {
      alert('Stock insuffisant pour certains produits');
      return;
    }

    // Increment promo usage
    if (promoCode) {
      incrementUsage(promoCode);
    }

    // Create order
    const order = createOrder({
      userId: user?.id || 'guest',
      userName: user?.username || `${shippingInfo.firstName} ${shippingInfo.lastName}`,
      userEmail: user?.email || shippingInfo.email,
      items: orderItems,
      totalAmount: total,
      shippingAddress: {
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
      },
      status: 'completed',
      promoCode: promoCode || undefined,
      promoDiscount: promoDiscount > 0 ? promoDiscount : undefined,
    });

    // Navigate to success
    navigate('/success');
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as CheckoutStep);
      window.scrollTo(0, 0);
    } else if (currentStep === 3) {
      handleCheckout();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as CheckoutStep);
      window.scrollTo(0, 0);
    }
  };

  const subtotal = calculateSubtotal();
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const discountAmount = promoDiscount > 0 ? (subtotal * promoDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount) + shippingCost;

  const handleApplyPromo = () => {
    const promo = getPromoByCode(promoInput);
    if (!promo) {
      setPromoError('Code promo invalide.');
      return;
    }
    if (!promo.active) {
      setPromoError('Ce code promo est desactive.');
      return;
    }
    applyPromoCode(promo.code, promo.discount);
    setPromoError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 py-8 md:py-16 lg:py-24">
        <div className="container mx-auto max-w-4xl px-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 md:gap-2 text-foreground/70 hover:text-foreground transition-colors mb-6 md:mb-8 text-xs tracking-[0.15em] uppercase font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Retour</span>
              <span className="md:hidden">Retour</span>
            </button>

          {/* Progress Bar */}
          <div className="mb-8 md:mb-12 lg:mb-16">
            <div className="h-px bg-border/40 relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FCEEAC] to-[#D4AF37]"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-6">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`text-xs font-medium uppercase tracking-widest transition-all ${
                    step <= currentStep ? 'text-[#D4AF37]' : 'text-foreground/40'
                  }`}
                  animate={{ opacity: step <= currentStep ? 1 : 0.5 }}
                >
                  {step === 1 ? 'Livraison' : step === 2 ? 'Récapitulatif' : 'Paiement'}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="mx-auto">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-2xl p-4 md:p-8 lg:p-12 border border-border/30"
            >
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl mb-6 md:mb-8">Informations de Livraison</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                        placeholder="Jean"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                        placeholder="Dupont"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                        placeholder="jean@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                        placeholder="123 Rue de la Parfumerie"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                        placeholder="Paris"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                        placeholder="75001"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2">
                        Pays
                      </label>
                      <select
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 backdrop-blur-sm text-base md:text-sm min-h-12 md:min-h-10 transition-all outline-none"
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Luxembourg">Luxembourg</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Order Summary */}
              {currentStep === 2 && (
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl mb-6 md:mb-8">Récapitulatif de Commande</h2>

                  <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 max-h-96 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-card/50 border border-border/30">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 md:w-16 h-14 md:h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs text-foreground/70 uppercase tracking-[0.1em] mb-0.5 md:mb-1">
                            {item.brand}
                          </p>
                          <h3 className="font-serif font-normal text-sm md:text-base line-clamp-2">{item.name}</h3>
                          <div className="flex justify-between items-end mt-1.5 md:mt-2 gap-2">
                            <span className="text-[10px] md:text-xs text-foreground/70 flex-shrink-0">
                              Qté: <span className="font-medium">{item.quantity}</span>
                            </span>
                            <span className="font-serif font-light text-xs md:text-sm flex-shrink-0">
                              {(item.price * item.quantity).toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info Summary */}
                  <div className="p-3 md:p-4 rounded-lg bg-secondary/30 border border-border/30 mb-6 md:mb-8">
                    <h3 className="font-serif font-normal mb-2 md:mb-3 text-xs md:text-sm">Livraison à :</h3>
                    <p className="text-[10px] md:text-xs text-foreground/80 space-y-0.5 md:space-y-1">
                      <div>{shippingInfo.firstName} {shippingInfo.lastName}</div>
                      <div>{shippingInfo.address}</div>
                      <div>{shippingInfo.postalCode} {shippingInfo.city}</div>
                      <div>{shippingInfo.phone}</div>
                    </p>
                  </div>

                  {/* Promo Code */}
                  <div className="p-3 md:p-4 rounded-lg bg-secondary/20 border border-border/30 mb-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <TicketPercent className="w-3 md:w-4 h-3 md:h-4 text-foreground/60 flex-shrink-0" />
                      <span className="text-xs uppercase tracking-widest text-foreground/70">Code promo</span>
                    </div>
                    {promoCode ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs md:text-sm text-emerald-400 uppercase tracking-widest truncate">
                          {promoCode} (-{promoDiscount}%)
                        </span>
                        <button
                          type="button"
                          onClick={clearPromoCode}
                          className="text-xs text-foreground/60 hover:text-foreground transition-colors flex-shrink-0 min-h-10 px-2"
                        >
                          Retirer
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(event) => setPromoInput(event.target.value)}
                          placeholder="CODEPROMO"
                          className="flex-1 px-3 py-2.5 md:py-2 rounded-md border border-border/40 bg-background/40 text-base md:text-xs uppercase tracking-widest min-h-12 md:min-h-10 transition-all outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-3 py-2.5 md:py-2 text-xs uppercase tracking-widest border border-border/50 rounded-md hover:border-border hover:bg-secondary/30 transition-colors min-h-12 md:min-h-10 font-medium whitespace-nowrap"
                        >
                          Appliquer
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-xs text-red-400 mt-2">{promoError}</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t border-border/30 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Sous-total</span>
                      <span className="font-serif font-light">{subtotal.toFixed(2)}€</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Remise ({promoCode})</span>
                        <span className="text-emerald-400">-{discountAmount.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">
                        Livraison {shippingCost === 0 && '(gratuite)'}
                      </span>
                      <span className="font-serif font-light">{shippingCost.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-lg border-t border-border/30 pt-3">
                      <span className="font-serif">Total</span>
                      <span className="font-serif text-2xl font-light text-[#D4AF37]">
                        {total.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment (Placeholder) */}
              {currentStep === 3 && (
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl mb-6 md:mb-8">Paiement</h2>
                  <div className="space-y-4 md:space-y-6">
                    <div className="p-4 md:p-8 rounded-lg border-2 border-dashed border-border/40 text-center">
                      <p className="text-foreground/70 mb-4">
                        Intégration Stripe en cours...
                      </p>
                      <p className="text-xs text-foreground/50 uppercase tracking-widest">
                        Zone de paiement sécurisée
                      </p>
                    </div>
                    <div className="p-3 md:p-4 rounded-lg bg-secondary/30 border border-border/30">
                      <p className="text-xs md:text-sm text-foreground/80">
                        <strong>Montant à payer :</strong>{' '}
                        <span className="font-serif font-light text-base md:text-lg text-[#D4AF37]">
                          {total.toFixed(2)}€
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between sm:items-center gap-3 md:gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border/20">
              <motion.button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="px-4 md:px-6 py-3 md:py-2 rounded-lg border border-border/40 text-xs md:text-sm font-medium text-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed hover:border-border/80 hover:text-foreground transition-all min-h-12 md:min-h-10 w-full sm:w-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Précédent
              </motion.button>

              <div className="text-[10px] md:text-xs text-foreground/60 uppercase tracking-widest text-center sm:text-right">
                Étape {currentStep} / 3
              </div>

              <motion.button
                onClick={handleNextStep}
                disabled={currentStep === 1 && !isStep1Valid()}
                className="px-4 md:px-6 py-3 md:py-2 rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-[#FCEEAC]/10 text-xs md:text-sm font-medium text-foreground hover:border-[#D4AF37] hover:bg-gradient-to-r hover:from-[#D4AF37]/20 hover:to-[#FCEEAC]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-12 md:min-h-10 w-full sm:w-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentStep === 3 ? 'Passer à la caisse' : 'Suivant'}
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
