import { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePromoCodesStore } from '@/store/usePromoCodesStore';
import { useCartStore, type CartItem } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import { useOrderManagement } from '@/store/useAdminStore';

export type { CartItem };

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const FREE_SHIPPING_THRESHOLD = 100;

const CartDrawer = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartDrawerProps) => {
  const navigate = useNavigate();
  const { user, userId } = useAuth();
  const { orders } = useOrderManagement();
  
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  
  const promoCodes = usePromoCodesStore((state) => state.promoCodes);
  const promoCode = useCartStore((state) => state.promoCode);
  const promoDiscount = useCartStore((state) => state.promoDiscount);
  const setPromoCode = useCartStore((state) => state.setPromoCode);
  const clearPromoCode = useCartStore((state) => state.clearPromoCode);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const safeDiscount = Number.isFinite(promoDiscount) ? promoDiscount : 0;
  const discountAmount = promoCode && safeDiscount > 0 ? (subtotal * safeDiscount) / 100 : 0;
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (!promoCode) return;
    const matched = promoCodes.find((promo) => promo.active && promo.code === promoCode);
    if (!matched) {
      clearPromoCode();
      setPromoError("Ce privilège n'est plus actif.");
      return;
    }
    if (matched.minAmount > 0 && subtotal < matched.minAmount) {
      clearPromoCode();
      setPromoError(`Montant minimum d'acquisition : ${matched.minAmount.toFixed(2)}€.`);
      return;
    }
    if (matched.discount !== promoDiscount) {
      setPromoCode(matched.code, matched.discount);
    }
  }, [promoCode, promoDiscount, promoCodes, subtotal, clearPromoCode, setPromoCode]);

  const normalizeCode = (value: string) => value.trim().toUpperCase();

  const handleApplyPromo = () => {
    const normalized = normalizeCode(promoInput);
    if (!normalized) {
      setPromoError('Veuillez entrer un code.');
      return;
    }

    const matched = promoCodes.find((promo) => promo.active && promo.code === normalized);

    if (!matched) {
      setPromoError('Code privilège invalide.');
      return;
    }

    if (matched.minAmount > 0 && subtotal < matched.minAmount) {
      setPromoError(`Montant minimum d'acquisition : ${matched.minAmount.toFixed(2)}€.`);
      return;
    }

    if (matched.singleUse) {
      if (!user) {
        setPromoError('Veuillez vous authentifier pour utiliser ce code.');
        return;
      }
      const alreadyUsed = orders?.some(
        (o) =>
          o.userId === userId &&
          o.promoCode?.toUpperCase() === normalized &&
          ['confirmed', 'shipped', 'delivered', 'completed'].includes(o.status)
      );
      if (alreadyUsed) {
        setPromoError('Vous avez déjà exercé ce privilège.');
        return;
      }
    }

    setPromoCode(matched.code, matched.discount);
    setPromoInput('');
    setPromoError('');
  };

  const handleClearPromo = () => {
    clearPromoCode();
    setPromoError('');
  };

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fond sombre flouté */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Tiroir du panier (Adapté Mobile & Desktop) */}
      <div className="fixed z-50 right-0 top-0 h-full w-[90vw] max-w-md bg-[#0E0E0E] text-white flex flex-col shadow-2xl border-l border-white/10 slide-in-right">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/10 sticky top-0 z-10 bg-[#0E0E0E]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-lg md:text-xl text-white">Votre Sélection</h2>
            <span className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
              ({items.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barre de Livraison Gratuite */}
        <div className="px-5 md:px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          {remainingForFreeShipping > 0 ? (
            <>
              <p className="text-[10px] md:text-xs text-white/60 mb-3 uppercase tracking-widest text-center">
                Plus que <span className="text-[#D4AF37] font-bold">{remainingForFreeShipping.toFixed(2)}€</span> pour la livraison offerte
              </p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D4AF37] transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-[10px] md:text-xs font-bold text-[#D4AF37] flex items-center justify-center gap-2 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Livraison gracieusement offerte
            </p>
          )}
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <ShoppingBag className="w-12 h-12 mb-4 text-[#D4AF37]" />
              <p className="font-serif text-lg text-white mb-2">Votre panier est vide</p>
              <p className="text-xs text-white/60 font-light">Découvrez nos collections pour créer votre sillage.</p>
            </div>
          ) : (
            items.map((item) => {
              const isDuo = item.productId?.startsWith('duo:') || item.productId?.startsWith('accord-perso:');
              let duoMeta: any = null;
              if (isDuo && item.scent) {
                try { duoMeta = JSON.parse(item.scent); } catch { /* ignore */ }
              }

              return (
              <div key={item.id} className="p-4 rounded-lg bg-white/[0.03] border border-white/5 relative group">
                {isDuo && duoMeta ? (
                  /* ── AFFICHAGE DUO (LAYERING) ── */
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#A68A56] font-bold">
                          {duoMeta?.isCustomAccord ? 'Accord Personnel' : 'Accord Signature'}
                        </span>
                        <h3 className="font-serif text-base text-white mt-1">{item.name}</h3>
                      </div>
                      <button onClick={() => onRemoveItem(item.id)} className="p-2 -mt-2 -mr-2 text-white/30 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-3">
                      {[ { name: duoMeta.nameA, brand: duoMeta.brandA, image: duoMeta.imageA }, { name: duoMeta.nameB, brand: duoMeta.brandB, image: duoMeta.imageB } ].map((p, i) => (
                        <div key={i} className="flex-1 flex items-center gap-3 bg-[#0E0E0E] p-2 rounded-md border border-white/5">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-sm grayscale-[20%]" />
                          ) : (
                            <div className="w-10 h-12 bg-white/5 rounded-sm" />
                          )}
                          <div className="min-w-0">
                            <p className="text-[8px] text-white/40 uppercase tracking-widest truncate">{p.brand}</p>
                            <p className="text-xs text-white/80 font-serif truncate">{p.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3 border border-white/10 rounded-sm">
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-2 text-white/50 hover:text-white transition-colors" disabled={item.quantity <= 1}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-2 text-white/50 hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-serif text-[#D4AF37]">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  </div>
                ) : (
                  /* ── AFFICHAGE NORMAL ── */
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-sm grayscale-[20%]" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] text-[#A68A56] uppercase tracking-[0.2em] mb-1">{item.brand}</p>
                          <h3 className="font-serif text-white text-base leading-tight pr-2">{item.name}</h3>
                          {item.volume && <p className="text-[10px] text-white/40 mt-1">{item.volume}</p>}
                        </div>
                        <button onClick={() => onRemoveItem(item.id)} className="p-2 -mt-2 -mr-2 text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 border border-white/10 rounded-sm">
                          <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-2 text-white/50 hover:text-white transition-colors" disabled={item.quantity <= 1}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-2 text-white/50 hover:text-white transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-serif text-[#D4AF37]">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>

        {/* Pied de page (Totaux & Code Promo) */}
        {items.length > 0 && (
          <div className="p-5 md:p-6 border-t border-white/10 bg-[#0E0E0E] sticky bottom-0 space-y-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Zone Code Promo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-sm border border-white/5">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Privilège</span>
              </div>
              {promoCode ? (
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">{promoCode}</span>
                  <button onClick={handleClearPromo} className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest">Retirer</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="CODE PROMO"
                    className="w-full sm:w-28 bg-transparent border-b border-white/20 px-1 py-1 text-[11px] text-white uppercase tracking-widest placeholder:text-white/20 focus:border-[#D4AF37] outline-none transition-colors"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="text-[10px] text-[#D4AF37] hover:text-white font-bold uppercase tracking-widest transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              )}
            </div>
            {promoError && <p className="text-[10px] text-red-400 mt-1">{promoError}</p>}

            {/* Totaux */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/60 font-light">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              {promoCode && (
                <div className="flex justify-between text-xs text-[#D4AF37] font-light">
                  <span>Remise appliquée</span>
                  <span>-{discountAmount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between items-end border-t border-white/10 pt-3 mt-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Total</span>
                <span className="font-serif text-2xl text-white">{totalAfterDiscount.toFixed(2)} €</span>
              </div>
            </div>

            {/* Bouton Caisse */}
            <motion.button
              onClick={handleCheckout}
              className="w-full py-4 bg-[#D4AF37] text-[#0E0E0E] text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm flex items-center justify-center gap-2 hover:bg-white transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <Check className="w-4 h-4" />
              Finaliser la commande
            </motion.button>
            
            <p className="text-[9px] text-center text-white/30 uppercase tracking-[0.2em]">
              Paiement crypté • Retours offerts sous 14 jours
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;