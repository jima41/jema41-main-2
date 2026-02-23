import { useMemo, useState } from 'react';
import { Plus, Power, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePromoCodesStore } from '@/store/usePromoCodesStore';
import { useOrderManagement } from '@/hooks/use-order-management';

const PromoCodesManager = () => {
  const promoCodes = usePromoCodesStore((state) => state.promoCodes);
  const addPromoCode = usePromoCodesStore((state) => state.addPromoCode);
  const removePromoCode = usePromoCodesStore((state) => state.removePromoCode);
  const togglePromoCode = usePromoCodesStore((state) => state.togglePromoCode);

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(10);
  const [error, setError] = useState('');

  const sortedCodes = useMemo(
    () => [...promoCodes].sort((a, b) => b.createdAt - a.createdAt),
    [promoCodes]
  );

  // Orders (to compute promo usage)
  const { orders } = useOrderManagement();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = addPromoCode(code, discount);
    if (!result.success) {
      setError(result.error || "Impossible d'ajouter le code promo.");
      return;
    }

    setCode('');
    setDiscount(10);
    setError('');
  };

  return (
    <div className="glass-panel border border-admin-border rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-xl font-montserrat font-bold tracking-tighter text-admin-text-primary">
          Codes promo
        </h2>
        <p className="text-sm text-admin-text-secondary">
          Ajoutez ou desactivez des codes promo disponibles pour le panier.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-3">
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="CODEPROMO"
          className="w-full px-3 py-2 rounded-md border border-admin-border bg-admin-bg/40 text-sm uppercase tracking-widest"
        />
        <input
          type="number"
          min={1}
          max={100}
          value={discount}
          onChange={(event) => setDiscount(Number(event.target.value))}
          className="w-full px-3 py-2 rounded-md border border-admin-border bg-admin-bg/40 text-sm"
        />
        <Button type="submit" className="gap-2" variant="luxury">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-3">
        {sortedCodes.length === 0 ? (
          <div className="text-sm text-admin-text-secondary">
            Aucun code promo pour le moment.
          </div>
        ) : (
          sortedCodes.map((promo) => (
            <div
              key={promo.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-admin-bg/40 border border-admin-border/40 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-admin-text-primary uppercase tracking-widest">
                  {promo.code}
                </span>
                <span className="text-xs text-admin-text-secondary">
                  -{promo.discount}%
                </span>
                {/* Usage count */}
                <span className="text-xs text-admin-text-secondary ml-2">
                  Utilisé: {orders ? orders.filter(o => o.promoCode && o.promoCode.toUpperCase() === promo.code && ['confirmed','shipped','delivered'].includes(o.status)).length : 0} fois
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    promo.active
                      ? 'border-emerald-500/40 text-emerald-300'
                      : 'border-admin-border text-admin-text-secondary'
                  }`}
                >
                  {promo.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => togglePromoCode(promo.id)}
                >
                  <Power className="w-4 h-4" />
                  {promo.active ? 'Desactiver' : 'Activer'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  onClick={() => removePromoCode(promo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromoCodesManager;
