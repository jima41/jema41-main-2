import { useMemo, useState } from 'react';
import { Plus, Power, Trash2, ShoppingCart, UserCheck, Truck, Gift } from 'lucide-react';
import { usePromoCodesStore } from '@/store/usePromoCodesStore';
import { useOrderManagement, useAdminProducts } from '@/store/useAdminStore';

const PromoCodesManager = () => {
  const promoCodes    = usePromoCodesStore((state) => state.promoCodes);
  const addPromoCode  = usePromoCodesStore((state) => state.addPromoCode);
  const removePromoCode = usePromoCodesStore((state) => state.removePromoCode);
  const togglePromoCode = usePromoCodesStore((state) => state.togglePromoCode);

  // Produits disponibles (inclut automatiquement les futurs produits créés)
  const { products } = useAdminProducts();

  const [code,             setCode]             = useState('');
  const [discount,         setDiscount]         = useState(10);
  const [minAmount,        setMinAmount]        = useState(0);
  const [singleUse,        setSingleUse]        = useState(false);
  const [freeShipping,     setFreeShipping]     = useState(false);
  const [freeProductId,    setFreeProductId]    = useState<string>('');
  const [freeProductLabel, setFreeProductLabel] = useState('Produit offert');
  const [error,            setError]            = useState('');

  const sortedCodes = useMemo(
    () => [...promoCodes].sort((a, b) => b.createdAt - a.createdAt),
    [promoCodes]
  );

  const { orders } = useOrderManagement();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await addPromoCode(
      code, discount, minAmount, singleUse, freeShipping,
      freeProductId || null,
      freeProductLabel || 'Produit offert'
    );
    if (!result.success) {
      setError(result.error || "Impossible d'ajouter le code promo.");
      return;
    }
    setCode(''); setDiscount(10); setMinAmount(0);
    setSingleUse(false); setFreeShipping(false);
    setFreeProductId(''); setFreeProductLabel('Produit offert');
    setError('');
  };

  // Nom du produit offert pour l'affichage dans la liste
  const getProductName = (id: string | null) => {
    if (!id) return null;
    return products.find(p => p.id === id)?.name ?? id;
  };

  return (
    <div className="glass-panel border border-admin-border rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          Codes promo
        </h2>
        <p className="text-sm text-admin-text-secondary mt-1">
          Ajoutez ou désactivez des codes promo disponibles pour le panier.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Row 1 : code + remise + bouton */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CODEPROMO"
            className="w-full px-4 py-2.5 rounded-xl border border-admin-border bg-white/5 text-sm text-admin-text-primary uppercase tracking-widest focus:border-admin-gold/50 outline-none transition-colors"
          />
          <div className="relative">
            <input
              type="number" min={1} max={100} value={discount}
              disabled={freeShipping}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-xl border border-admin-border bg-white/5 text-sm text-admin-text-primary pr-8 focus:border-admin-gold/50 outline-none transition-colors ${freeShipping ? 'opacity-30 cursor-not-allowed' : ''}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-admin-text-secondary pointer-events-none">%</span>
          </div>
          <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-admin-gold/10 hover:bg-admin-gold/20 border border-admin-gold/30 hover:border-admin-gold/60 text-admin-gold text-sm font-medium transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Row 2 : panier min + usage unique + frais de port */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-admin-text-secondary flex-shrink-0" />
            <label className="text-xs text-admin-text-secondary whitespace-nowrap">Panier min. (€)</label>
            <input
              type="number" min={0} step={0.01} value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              placeholder="0 = pas de minimum"
              className="flex-1 px-4 py-2.5 rounded-xl border border-admin-border bg-white/5 text-sm text-admin-text-primary focus:border-admin-gold/50 outline-none transition-colors"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 rounded-xl border border-admin-border bg-white/5 hover:bg-white/10 transition-colors">
            <input type="checkbox" checked={singleUse} onChange={(e) => setSingleUse(e.target.checked)} className="w-4 h-4 accent-[#D4AF37] cursor-pointer" />
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-admin-text-secondary" />
              <span className="text-xs text-admin-text-secondary">Usage unique par utilisateur</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 rounded-xl border border-admin-border bg-white/5 hover:bg-white/10 transition-colors">
            <input type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} className="w-4 h-4 accent-[#D4AF37] cursor-pointer" />
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-admin-text-secondary" />
              <span className="text-xs text-admin-text-secondary">Frais de port offerts</span>
            </div>
          </label>
        </div>

        {/* Row 3 : produit offert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Sélecteur de produit — se met à jour automatiquement avec les nouveaux produits */}
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-admin-text-secondary flex-shrink-0" />
            <select
              value={freeProductId}
              onChange={(e) => setFreeProductId(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-admin-border bg-[#1a1a1a] text-sm text-admin-text-primary focus:border-admin-gold/50 outline-none transition-colors cursor-pointer"
            >
              <option value="">Aucun produit offert</option>
              {products
                .filter(p => p.stock > 0)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.brand} ({p.price.toFixed(2)}€)
                  </option>
                ))
              }
            </select>
          </div>

          {/* Label personnalisable (visible seulement si un produit est sélectionné) */}
          {freeProductId && (
            <input
              type="text"
              value={freeProductLabel}
              onChange={(e) => setFreeProductLabel(e.target.value)}
              placeholder="Produit offert"
              className="w-full px-4 py-2.5 rounded-xl border border-admin-border bg-white/5 text-sm text-admin-text-primary focus:border-admin-gold/50 outline-none transition-colors"
            />
          )}
        </div>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-3">
        {sortedCodes.length === 0 ? (
          <div className="text-sm text-admin-text-secondary">Aucun code promo pour le moment.</div>
        ) : (
          sortedCodes.map((promo) => (
            <div
              key={promo.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/[0.02] border border-admin-border/30 rounded-xl px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-admin-text-primary uppercase tracking-widest">
                  {promo.code}
                </span>

                {/* Remise % ou "port offert" */}
                {promo.freeShipping ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
                    <Truck className="w-3 h-3" />Port offert
                  </span>
                ) : promo.discount > 0 ? (
                  <span className="text-xs text-admin-text-secondary">-{promo.discount}%</span>
                ) : null}

                {/* Produit offert */}
                {promo.freeProductId && (
                  <span className="inline-flex items-center gap-1 text-xs text-violet-400 border border-violet-500/30 rounded-full px-2 py-0.5">
                    <Gift className="w-3 h-3" />
                    {promo.freeProductLabel} — {getProductName(promo.freeProductId)}
                  </span>
                )}

                {promo.minAmount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">
                    <ShoppingCart className="w-3 h-3" />
                    Min. {promo.minAmount.toFixed(2)}€
                  </span>
                )}
                {promo.singleUse && (
                  <span className="inline-flex items-center gap-1 text-xs text-sky-400 border border-sky-500/30 rounded-full px-2 py-0.5">
                    <UserCheck className="w-3 h-3" />1×/utilisateur
                  </span>
                )}
                <span className="text-xs text-admin-text-secondary ml-1">
                  Utilisé: {orders ? orders.filter(o => o.promoCode && o.promoCode.toUpperCase() === promo.code && ['confirmed','shipped','delivered'].includes(o.status)).length : 0} fois
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border ${promo.active ? 'border-emerald-500/40 text-emerald-300' : 'border-admin-border text-admin-text-secondary'}`}>
                  {promo.active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => togglePromoCode(promo.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text-secondary text-xs font-medium transition-all">
                  <Power className="w-3.5 h-3.5" />
                  {promo.active ? 'Désactiver' : 'Activer'}
                </button>
                <button type="button" onClick={() => removePromoCode(promo.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromoCodesManager;
