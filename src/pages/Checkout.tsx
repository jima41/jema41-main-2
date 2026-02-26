import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useOrderManagement, useAbandonedCarts, useAdminProducts } from '@/store/useAdminStore';
import { usePromoCodesStore } from '@/store/usePromoCodesStore';
import CheckoutForm from '@/components/CheckoutForm';
import { ArrowLeft, TicketPercent, ShieldCheck, CreditCard, CheckCircle2, MapPin, Edit2, Trash2, Plus, Loader2, Gift } from 'lucide-react';

interface ShippingInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

type CheckoutStep = 1 | 2;

const silkyEase = [0.25, 0.1, 0.25, 1];

// ID temporaire pour la création
const generateId = () => Math.random().toString(36).substr(2, 9);

const Checkout = () => {
  const navigate = useNavigate();
  const { user, userId } = useAuth();
  const { cartItems, promoCode, promoDiscount, applyPromoCode, clearPromoCode } = useCart();
  const { clearCart } = useCartStore();
  const { trackPageView, trackPageExit } = useAnalytics();
  const { createOrder, deductStock, orders } = useOrderManagement();
  const { trackAbandonedCart, markRecovered: markCartRecovered } = useAbandonedCarts();
  const { products } = useAdminProducts();
  const incrementUsage = usePromoCodesStore((state) => state.incrementUsage);
  const getPromoByCode = usePromoCodesStore((state) => state.getPromoByCode);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  // Mobile : affiche d'abord le récapitulatif, puis le formulaire
  const [mobileShowForm, setMobileShowForm] = useState(false);
  const hasCheckedOut = useRef(false);

  // ── Stripe ────────────────────────────────────────────────────────────────
  // Stable orderRef generated once — shared between PI metadata and createOrder
  const orderRef = useRef<string>(`RH-${Date.now().toString().slice(-6)}`);
  const paymentSubmitRef = useRef<(() => void) | null>(null);
  const [paymentReady,   setPaymentReady]   = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ID stable pour ce panier abandonné (un par user/session)
  const abandonedCartId = useRef<string>(
    userId ? `abandoned_${userId}` : `abandoned_guest_${(() => {
      const k = 'rayha_guest_session';
      let s = sessionStorage.getItem(k);
      if (!s) { s = Math.random().toString(36).slice(2); sessionStorage.setItem(k, s); }
      return s;
    })()}`
  );
  const [promoInput, setPromoInput] = useState(promoCode || '');
  const [promoError, setPromoError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // --- SYSTÈME DE CARNET D'ADRESSES ---
  // Simulation d'une adresse sauvegardée si l'utilisateur est connecté
  const [savedAddresses, setSavedAddresses] = useState<ShippingInfo[]>(
    user ? [{
      id: 'default-1',
      firstName: user.username?.split(' ')[0] || 'Jean',
      lastName: user.username?.split(' ')[1] || 'Dupont',
      email: user.email || 'client@rayha.store',
      phone: '+33 6 12 34 56 78',
      address: '42 Avenue Montaigne',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    }] : []
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.length > 0 ? savedAddresses[0].id : null
  );

  // Autocomplete adresse
  interface AddressSuggestion { label: string; name: string; city: string; postcode: string; }
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchAddressSuggestions = (query: string) => {
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (query.length < 3) { setAddressSuggestions([]); return; }
    addressDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=housenumber`);
        const data = await res.json();
        setAddressSuggestions(
          (data.features || []).map((f: any) => ({
            label: f.properties.label,
            name: f.properties.name,
            city: f.properties.city,
            postcode: f.properties.postcode,
          }))
        );
        setShowSuggestions(true);
      } catch { setAddressSuggestions([]); }
    }, 300);
  };

  const selectAddressSuggestion = (s: AddressSuggestion) => {
    setFormData(prev => ({ ...prev, address: s.name, city: s.city, postalCode: s.postcode }));
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  // Fermer suggestions au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // État du formulaire
  const [isFormOpen, setIsFormOpen] = useState(savedAddresses.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShippingInfo>({
    id: '', firstName: '', lastName: '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '', country: 'France',
  });

  useEffect(() => {
    trackPageView('/checkout', 'Checkout');
    return () => trackPageExit('/checkout');
  }, [trackPageView, trackPageExit]);

  useEffect(() => {
    if (cartItems.length === 0 && !hasCheckedOut.current) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  // Enregistre un panier abandonné après 5 secondes sur la page checkout
  useEffect(() => {
    if (cartItems.length === 0) return;
    const timer = setTimeout(() => {
      if (hasCheckedOut.current) return;
      const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
      trackAbandonedCart({
        id:               abandonedCartId.current,
        clientId:         userId ?? '',
        clientName:       user?.username ?? 'Client invité',
        clientEmail:      user?.email ?? '',
        items:            cartItems.map((i) => ({
          productId:   i.productId,
          productName: i.name,
          quantity:    i.quantity,
          price:       i.price,
        })),
        totalValue:       subtotal,
        abandonedAt:      new Date(),
        recoveryAttempts: 0,
        recovered:        false,
      });
    }, 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- GESTION DU FORMULAIRE D'ADRESSE ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && 
           formData.phone.trim() && formData.address.trim() && formData.city.trim() && formData.postalCode.trim();
  };

  const getInputClass = (fieldName: keyof Omit<ShippingInfo, 'id'>) => {
    const baseClass = "w-full bg-white/5 rounded-sm px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 ";
    if (showErrors && !formData[fieldName].trim()) {
      return baseClass + "border border-red-900/50 bg-red-900/10 focus:border-red-500 focus:bg-white/10";
    }
    return baseClass + "border border-white/10 focus:border-[#D4AF37] focus:bg-white/10";
  };

  const saveAddress = () => {
    if (!isFormValid()) {
      setShowErrors(true);
      return;
    }
    
    if (editingId) {
      setSavedAddresses(prev => prev.map(addr => addr.id === editingId ? formData : addr));
    } else {
      const newAddress = { ...formData, id: generateId() };
      setSavedAddresses(prev => [...prev, newAddress]);
      setSelectedAddressId(newAddress.id);
    }
    
    setIsFormOpen(false);
    setEditingId(null);
    setShowErrors(false);
  };

  const openNewAddressForm = () => {
    setFormData({ id: '', firstName: '', lastName: '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '', country: 'France' });
    setEditingId(null);
    setIsFormOpen(true);
    setShowErrors(false);
  };

  const editAddress = (address: ShippingInfo) => {
    setFormData(address);
    setEditingId(address.id);
    setIsFormOpen(true);
    setShowErrors(false);
  };

  const deleteAddress = (id: string) => {
    const updated = savedAddresses.filter(addr => addr.id !== id);
    setSavedAddresses(updated);
    if (selectedAddressId === id) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
    }
    if (updated.length === 0) setIsFormOpen(true);
  };

  // --- FINALISATION (appelée après succès du paiement Stripe) ---
  const finalizeOrder = (_paymentIntentId: string) => {
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) return;

    const subtotal = calculateSubtotal();
    const appliedPromo = promoCode ? getPromoByCode(promoCode) : undefined;
    const shippingCost = (subtotal >= 100 || appliedPromo?.freeShipping) ? 0 : 9.99;
    const discountAmount = promoDiscount > 0 ? (subtotal * promoDiscount) / 100 : 0;
    const total = Math.max(0, subtotal - discountAmount) + shippingCost;

    const orderItems = cartItems.map(item => ({
      productId: item.productId, productName: item.name, quantity: item.quantity, price: item.price, volume: item.volume,
    }));

    // Produit offert via code promo — ajouté à prix 0
    if (appliedPromo?.freeProductId) {
      const freeProduct = products.find(p => p.id === appliedPromo.freeProductId);
      if (freeProduct) {
        (orderItems as any[]).push({
          productId:   freeProduct.id,
          productName: `${appliedPromo.freeProductLabel} : ${freeProduct.name}`,
          quantity:    1,
          price:       0,
        });
      }
    }

    if (!deductStock(orderItems)) {
      alert('Stock insuffisant pour certains produits de votre sélection.');
      setPaymentLoading(false);
      return;
    }

    if (promoCode) incrementUsage(promoCode);

    createOrder({
      reference: orderRef.current,
      userId: user?.id || 'guest',
      userName: user?.username || `${selectedAddress.firstName} ${selectedAddress.lastName}`,
      userEmail: user?.email || selectedAddress.email,
      items: orderItems,
      totalAmount: total,
      shippingAddress: {
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        email: selectedAddress.email,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
      },
      status: 'pending',
      promoCode: promoCode || undefined,
      promoDiscount: promoDiscount > 0 ? promoDiscount : undefined,
    });

    hasCheckedOut.current = true;
    markCartRecovered(abandonedCartId.current);
    clearCart();
    navigate('/success', {
      state: { orderRef: orderRef.current, total, subtotal, shippingCost, items: cartItems, shippingInfo: selectedAddress, promoCode: promoCode || null, promoDiscount: promoDiscount > 0 ? promoDiscount : 0 },
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedAddressId && !isFormOpen) return;
      if (isFormOpen) {
        if (!isFormValid()) {
          setShowErrors(true);
          return;
        }
        saveAddress();
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      // Delegate to Stripe form — the button triggers payment confirmation
      paymentSubmitRef.current?.();
    }
  };

  // Variables pour l'affichage du récapitulatif
  const subtotal = calculateSubtotal();
  const activePromo = promoCode ? getPromoByCode(promoCode) : undefined;
  const shippingCost = (subtotal >= 100 || activePromo?.freeShipping) ? 0 : 9.99;
  const discountAmount = promoDiscount > 0 ? (subtotal * promoDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount) + shippingCost;

  const handleApplyPromo = () => {
    const promo = getPromoByCode(promoInput);
    if (!promo) return setPromoError('Code privilège invalide.');
    if (!promo.active) return setPromoError('Ce code privilège est désactivé.');
    if (promo.minAmount > 0 && subtotal < promo.minAmount) return setPromoError(`Montant minimum d'acquisition : ${promo.minAmount.toFixed(2)}€.`);
    
    if (promo.singleUse) {
      if (!user) return setPromoError('Authentifiez-vous pour utiliser ce privilège.');
      const alreadyUsed = orders?.some(
        (o) => o.userId === userId && o.promoCode?.toUpperCase() === promo.code && ['confirmed', 'shipped', 'delivered', 'completed'].includes(o.status)
      );
      if (alreadyUsed) return setPromoError('Privilège déjà exercé.');
    }
    applyPromoCode(promo.code, promo.discount);
    setPromoError('');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex flex-col selection:bg-[#D4AF37] selection:text-black">
      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto max-w-7xl px-5">
            
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors mb-10 text-[10px] tracking-[0.2em] uppercase font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Retour à la boutique
          </button>

          <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 items-start">

            {/* COLONNE GAUCHE : L'ÉCRIN — masquée sur mobile jusqu'à confirmation */}
            <div className={`w-full lg:w-[60%] bg-[#0E0E0E] rounded-2xl md:rounded-[2rem] shadow-2xl border border-[#D4AF37]/20 p-6 md:p-12 relative overflow-hidden ${mobileShowForm ? 'block' : 'hidden'} lg:block`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#D4AF37]/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 mb-12">
                <div className="h-px bg-white/10 relative overflow-hidden">
                  <motion.div
                    className="h-full bg-[#D4AF37]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / 2) * 100}%` }}
                    transition={{ duration: 0.6, ease: silkyEase }}
                  />
                </div>
                <div className="flex justify-between mt-6">
                  {['Identification', 'Règlement'].map((label, index) => {
                    const step = index + 1;
                    const isActive = step <= currentStep;
                    const isPassed = step < currentStep;
                    return (
                      <motion.div key={step} className={`flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all font-bold ${isActive ? 'text-[#D4AF37]' : 'text-white/30'}`}>
                        {isPassed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {label}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: silkyEase }}>
                    
                    {/* ÉTAPE 1 : IDENTIFICATION (CARNET D'ADRESSES) */}
                    {currentStep === 1 && (
                      <div>
                        <h2 className="font-serif text-3xl md:text-4xl mb-2 text-white">Vos Coordonnées</h2>
                        <p className="text-white/40 text-xs font-light mb-8">Où souhaitez-vous recevoir votre sillage ?</p>
                        
                        {/* LISTE DES ADRESSES SAUVEGARDÉES */}
                        {!isFormOpen && savedAddresses.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-8">
                            {savedAddresses.map((address) => (
                              <div 
                                key={address.id}
                                onClick={() => setSelectedAddressId(address.id)}
                                className={`relative p-5 rounded-md border transition-all cursor-pointer ${
                                  selectedAddressId === address.id 
                                    ? 'bg-[#D4AF37]/5 border-[#D4AF37]' 
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                                }`}
                              >
                                {selectedAddressId === address.id && (
                                  <div className="absolute top-5 right-5 text-[#D4AF37]">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="flex items-start gap-3">
                                  <MapPin className={`w-4 h-4 mt-0.5 ${selectedAddressId === address.id ? 'text-[#D4AF37]' : 'text-white/30'}`} />
                                  <div>
                                    <p className="text-white text-sm font-medium mb-1 uppercase tracking-widest">{address.firstName} {address.lastName}</p>
                                    <p className="text-white/60 text-xs leading-relaxed font-light">
                                      {address.address}<br />
                                      {address.postalCode} {address.city}, {address.country}<br />
                                      {address.phone}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                                  <button onClick={(e) => { e.stopPropagation(); editAddress(address); }} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-colors">
                                    <Edit2 className="w-3 h-3" /> Modifier
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteAddress(address.id); }} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-3 h-3" /> Supprimer
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            <button 
                              onClick={openNewAddressForm}
                              className="w-full py-4 border border-dashed border-white/20 rounded-md text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3.5 h-3.5" /> Ajouter une adresse
                            </button>
                          </motion.div>
                        )}

                        {/* FORMULAIRE D'ADRESSE */}
                        {isFormOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                              {[
                                { label: 'Prénom', name: 'firstName', type: 'text', placeholder: 'Jean' },
                                { label: 'Nom', name: 'lastName', type: 'text', placeholder: 'Dupont' },
                                { label: 'Email', name: 'email', type: 'email', placeholder: 'jean@exemple.com' },
                                { label: 'Téléphone', name: 'phone', type: 'tel', placeholder: '+33 6 00 00 00 00' },
                              ].map((field) => (
                                <div key={field.name}>
                                  <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A68A56] mb-2 font-medium">{field.label}</label>
                                  <input type={field.type} name={field.name} value={(formData as any)[field.name]} onChange={handleInputChange} placeholder={field.placeholder} className={getInputClass(field.name as keyof Omit<ShippingInfo, 'id'>)} />
                                </div>
                              ))}

                              {/* Adresse avec autocomplete */}
                              <div className="md:col-span-2 relative" ref={suggestionsRef}>
                                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A68A56] mb-2 font-medium">Adresse Postale</label>
                                <input
                                  type="text"
                                  name="address"
                                  value={formData.address}
                                  onChange={(e) => {
                                    handleInputChange(e);
                                    fetchAddressSuggestions(e.target.value);
                                  }}
                                  placeholder="N° et nom de rue"
                                  className={getInputClass('address')}
                                  autoComplete="off"
                                />
                                {showSuggestions && addressSuggestions.length > 0 && (
                                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                                    {addressSuggestions.map((s, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onMouseDown={() => selectAddressSuggestion(s)}
                                        className="w-full text-left px-4 py-3 text-xs text-white/80 hover:bg-[#D4AF37]/10 hover:text-white border-b border-white/5 last:border-0 transition-colors"
                                      >
                                        <span className="font-medium">{s.name}</span>
                                        <span className="text-white/40 ml-2">{s.postcode} {s.city}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Ville et Code Postal (auto-remplis par l'autocomplete) */}
                              <div>
                                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A68A56] mb-2 font-medium">Ville</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Paris" className={getInputClass('city')} />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A68A56] mb-2 font-medium">Code Postal</label>
                                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="75000" className={getInputClass('postalCode')} />
                              </div>

                              <div>
                                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A68A56] mb-2 font-medium">Pays</label>
                                <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3.5 text-sm text-white focus:border-[#D4AF37] focus:bg-[#0E0E0E] outline-none transition-all appearance-none cursor-pointer">
                                  <option value="France" className="bg-[#0E0E0E]">France</option>
                                  <option value="Belgique" className="bg-[#0E0E0E]">Belgique</option>
                                  <option value="Suisse" className="bg-[#0E0E0E]">Suisse</option>
                                </select>
                              </div>
                            </div>

                            {showErrors && (
                              <p className="text-red-400 text-xs text-center mb-6">Veuillez compléter les champs en surbrillance.</p>
                            )}

                            <div className="flex gap-4">
                              {savedAddresses.length > 0 && (
                                <button onClick={() => { setIsFormOpen(false); setShowErrors(false); }} className="flex-1 py-3 border border-white/20 text-white/60 text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-white/5 transition-colors">
                                  Annuler
                                </button>
                              )}
                              <button onClick={saveAddress} className="flex-1 py-3 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-[#D4AF37]/20 transition-colors font-bold">
                                {editingId ? 'Mettre à jour' : 'Enregistrer cette adresse'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* ÉTAPE 2 : PAIEMENT */}
                    {currentStep === 2 && (
                      <div>
                        <h2 className="font-serif text-3xl md:text-4xl mb-2 text-white">Règlement</h2>
                        <p className="text-white/40 text-xs font-light mb-8">Finalisez votre acquisition en toute sécurité.</p>

                        {/* Stripe card fields */}
                        <div className="mb-8">
                          <CheckoutForm
                            amountEuros={total}
                            orderRef={orderRef.current}
                            onSuccess={finalizeOrder}
                            submitRef={paymentSubmitRef}
                            onLoadingChange={setPaymentLoading}
                            onReady={setPaymentReady}
                          />
                        </div>

                        <div className="flex items-center justify-between p-6 border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-sm mb-12">
                          <span className="text-sm text-white/80 font-medium">Montant à honorer</span>
                          <span className="font-serif text-2xl text-[#D4AF37]">{total.toFixed(2)} €</span>
                        </div>

                        <div className="border-t border-white/10 pt-8 text-center">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <ShieldCheck className="w-4 h-4 text-[#A68A56]" />
                            <span className="text-[9px] uppercase tracking-widest text-[#A68A56] font-bold">Paiement 100% Crypté & Sécurisé</span>
                          </div>
                          <div className="flex items-center justify-center flex-wrap gap-2 text-white/20">
                            <CreditCard className="w-7 h-7" />
                            <div className="text-[9px] font-bold border border-white/20 px-2 py-1 rounded-sm">VISA</div>
                            <div className="text-[9px] font-bold border border-white/20 px-2 py-1 rounded-sm">MASTERCARD</div>
                            <div className="text-[9px] font-bold border border-white/20 px-2 py-1 rounded-sm"> APPLE PAY</div>
                            <div className="text-[9px] font-bold border border-white/20 px-2 py-1 rounded-sm">PAYPAL</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation (Boutons) */}
              <div className="relative z-10 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-white/10">
                <button
                  onClick={() => {
                    if (currentStep > 1) {
                      setCurrentStep(1);
                    } else {
                      // Sur mobile on revient au récapitulatif, sur desktop au panier
                      setMobileShowForm(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors disabled:opacity-0 w-full sm:w-auto text-center py-2"
                >
                  {currentStep === 2 ? 'Revenir aux coordonnées' : (
                    <>
                      <span className="lg:hidden">Retour à ma sélection</span>
                      <span className="hidden lg:inline">Retour au panier</span>
                    </>
                  )}
                </button>

                <motion.button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && !selectedAddressId && !isFormOpen) ||
                    (currentStep === 2 && (!paymentReady || paymentLoading))
                  }
                  className="w-full sm:w-auto px-10 py-4 bg-[#D4AF37] text-[#0E0E0E] text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  {currentStep === 2 && paymentLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {currentStep === 2
                    ? (paymentLoading ? 'Sécurisation du règlement...' : 'Confirmer le règlement')
                    : 'Procéder au paiement'}
                </motion.button>
              </div>
            </div>

            {/* COLONNE DROITE : RÉCAPITULATIF — visible par défaut sur mobile, toujours visible desktop */}
            <div className={`w-full lg:w-[40%] lg:sticky lg:top-24 bg-white border border-[#1a1a1a]/10 rounded-2xl md:rounded-[2rem] p-6 md:p-10 shadow-xl ${mobileShowForm ? 'hidden lg:block' : 'block'}`}>
              <h2 className="font-serif text-2xl mb-8 text-[#1a1a1a]">Votre Sélection</h2>

              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3 border-b border-[#1a1a1a]/5">
                    <div className="w-16 h-20 bg-[#0E0E0E] rounded-sm overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[20%] opacity-90" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[9px] text-[#A68A56] uppercase tracking-[0.2em] mb-1">{item.brand}</p>
                      <h3 className="font-serif text-[#1a1a1a] text-base leading-tight mb-2 pr-4">{item.name}</h3>
                      <div className="flex justify-between items-center text-[#1a1a1a]/60 text-xs font-light">
                        <span>Qté : {item.quantity}</span>
                        <span className="font-medium text-[#1a1a1a]">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-[#1a1a1a]/10 rounded-sm p-5 mb-8 bg-[#FCFBF9]">
                <div className="flex items-center gap-3 mb-3">
                  <TicketPercent className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a] font-bold">Privilège</span>
                </div>
                {promoCode ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#1a1a1a] font-serif tracking-widest">{promoCode} (-{promoDiscount}%)</span>
                    <button onClick={clearPromoCode} className="text-[10px] text-[#1a1a1a]/40 hover:text-[#1a1a1a] uppercase tracking-widest transition-colors">Retirer</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="ENTREZ VOTRE CODE"
                      className="flex-1 bg-transparent border-b border-[#1a1a1a]/20 px-0 py-2 text-sm text-[#1a1a1a] uppercase tracking-widest focus:border-[#D4AF37] outline-none transition-colors placeholder:text-[#1a1a1a]/20"
                    />
                    <button onClick={handleApplyPromo} className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold hover:text-[#1a1a1a] transition-colors">
                      Appliquer
                    </button>
                  </div>
                )}
                {promoError && <p className="text-[10px] text-red-500 mt-2 font-medium">{promoError}</p>}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-light">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#D4AF37] font-medium">
                    <span>Remise appliquée</span>
                    <span>-{discountAmount.toFixed(2)} €</span>
                  </div>
                )}
                {activePromo?.freeProductId && (() => {
                  const fp = products.find(p => p.id === activePromo.freeProductId);
                  return fp ? (
                    <div className="flex justify-between items-center text-sm text-violet-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5" />
                        {activePromo.freeProductLabel}
                      </span>
                      <span className="text-xs font-light">{fp.name}</span>
                    </div>
                  ) : null;
                })()}
                <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-light">
                  <span>Livraison & Conciergerie</span>
                  <span>{shippingCost === 0 ? 'Offert' : `${shippingCost.toFixed(2)} €`}</span>
                </div>
                
                <div className="flex justify-between items-end border-t border-[#1a1a1a]/10 pt-6 mt-2">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/50 font-bold mb-1">Total à régler</span>
                    <span className="block text-[9px] text-[#1a1a1a]/40">Taxes incluses</span>
                  </div>
                  <span className="font-serif text-3xl text-[#1a1a1a]">{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Bouton CTA mobile uniquement */}
              <motion.button
                onClick={() => {
                  setMobileShowForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="lg:hidden mt-8 w-full py-4 bg-[#D4AF37] text-[#0E0E0E] text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                <CreditCard className="w-4 h-4" />
                Passez au paiement
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