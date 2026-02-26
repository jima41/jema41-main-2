import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, ChevronUp, ChevronDown, X, Search, Layers, Package,
} from 'lucide-react';
import { useLayeringStore } from '@/store/useLayeringStore';
import { fetchAllProducts, ProductRow } from '@/integrations/supabase/supabase';
import { useToast } from '@/hooks/use-toast';

// ─── PRODUCT PICKER MODAL ────────────────────────────────────────────────────

interface ProductPickerProps {
  products: ProductRow[];
  selectedId: string;
  excludeId?: string;
  onSelect: (product: ProductRow) => void;
  onClose: () => void;
}

const ProductPicker = ({ products, selectedId, excludeId, onSelect, onClose }: ProductPickerProps) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = products.filter((p) => {
    if (p.id === excludeId) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.families?.some((f) => f.toLowerCase().includes(q))
    );
  });

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="bg-[#0D0D0D] border border-[#C4A97D]/25 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-4 h-4 text-[#C4A97D] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Nom, marque ou famille olfactive…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none"
          />
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Count */}
        <div className="px-4 py-2 border-b border-white/5">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            {filtered.length} parfum{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center text-white/25 text-sm py-10">Aucun parfum trouvé</p>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => { onSelect(product); onClose(); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150 ${
                  product.id === selectedId
                    ? 'bg-[#C4A97D]/15 border border-[#C4A97D]/35'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Image */}
                <div className="w-11 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white/15" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{product.name}</p>
                  <p className="text-xs text-white/40 truncate">{product.brand}</p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {product.families?.slice(0, 3).map((f) => (
                      <span key={f} className="text-[9px] uppercase tracking-wide text-[#C4A97D] border border-[#C4A97D]/25 px-1.5 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <span className="text-sm font-light text-white/50 flex-shrink-0 ml-2">
                  {product.price.toFixed(2)} €
                </span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── PRODUCT SLOT ─────────────────────────────────────────────────────────────

interface ProductSlotProps {
  label: string;
  sublabel: string;
  product: ProductRow | undefined;
  onChangePicker: () => void;
}

const ProductSlot = ({ label, sublabel, product, onChangePicker }: ProductSlotProps) => (
  <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3 min-w-0">
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] text-[#C4A97D] font-semibold">{label}</p>
      <p className="text-[9px] text-white/25 mt-0.5">{sublabel}</p>
    </div>

    {product ? (
      <div className="flex items-start gap-3">
        <div className="w-10 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-3 h-3 text-white/15" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white leading-snug truncate">{product.name}</p>
          <p className="text-[10px] text-white/35 truncate">{product.brand}</p>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {product.families?.slice(0, 2).map((f) => (
              <span key={f} className="text-[8px] uppercase text-[#C4A97D] border border-[#C4A97D]/20 px-1 py-0.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-1">{product.price.toFixed(2)} €</p>
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-white/20 py-3">
        <Package className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs italic">Non sélectionné</span>
      </div>
    )}

    <button
      onClick={onChangePicker}
      className="mt-auto text-[10px] uppercase tracking-[0.15em] text-[#C4A97D] hover:text-[#D4AF37] border border-[#C4A97D]/20 hover:border-[#C4A97D]/50 rounded-lg py-1.5 px-3 text-center transition-all duration-200"
    >
      {product ? 'Changer' : 'Sélectionner'}
    </button>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const LayeringManager = () => {
  const { duos: rawDuos, loading: loadingDuos, fetchDuos, addDuo, updateDuo, removeDuo, moveDuo } = useLayeringStore();
  const duos = Array.isArray(rawDuos) ? rawDuos : [];
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [picker, setPicker] = useState<{ duoId: string; side: 'A' | 'B' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDuos();
    fetchAllProducts()
      .then(setProducts)
      .catch((err) => console.error('LayeringManager: fetchAllProducts error:', err))
      .finally(() => setLoadingProducts(false));
  }, []);

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const handleAddDuo = async () => {
    try {
      await addDuo({
        name: 'Nouvel Accord',
        description: "Décrivez l'harmonie olfactive de cet accord signature...",
        productIdA: '',
        productIdB: '',
        isActive: false,
        order: duos.length,
      });
      toast({ title: 'Accord créé', description: "Configurez les deux parfums puis activez l'accord." });
    } catch {
      toast({ title: 'Erreur', description: "Impossible de créer l'accord.", variant: 'destructive' });
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await removeDuo(id);
        setConfirmDelete(null);
        toast({ title: 'Accord supprimé' });
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de supprimer.', variant: 'destructive' });
      }
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000);
    }
  };

  const handlePickerSelect = (product: ProductRow) => {
    if (!picker) return;
    updateDuo(picker.duoId, picker.side === 'A' ? { productIdA: product.id } : { productIdB: product.id });
    toast({ title: 'Parfum sélectionné', description: product.name });
  };

  const openPickerDuo = picker ? duos.find((d) => d.id === picker.duoId) : null;
  const excludeId = picker
    ? (picker.side === 'A' ? openPickerDuo?.productIdB : openPickerDuo?.productIdA)
    : undefined;

  const activeCount = duos.filter((d) => d.isActive).length;
  const completeCount = duos.filter((d) => d.productIdA && d.productIdB).length;

  return (
    <>
      <div className="space-y-6">

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Accords total', value: duos.length, color: 'text-admin-text-primary' },
            { label: 'Accords actifs', value: activeCount, color: 'text-emerald-400' },
            { label: 'Complétés', value: completeCount, color: 'text-[#C4A97D]' },
            { label: 'Parfums dispo', value: loadingProducts ? '…' : products.length, color: 'text-admin-text-primary' },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-xl p-4 border border-admin-border">
              <p className="text-[10px] uppercase tracking-[0.15em] text-admin-text-secondary/60 mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold font-montserrat ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── ACTIONS BAR ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-admin-text-secondary/50">
            Les accords <span className="text-emerald-400">actifs</span> et <span className="text-[#C4A97D]">complets</span> sont visibles sur la page publique.
          </p>
          <button
            onClick={handleAddDuo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-admin-gold/10 hover:bg-admin-gold/20 border border-admin-gold/30 hover:border-admin-gold/60 text-admin-gold text-sm font-medium transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter un accord
          </button>
        </div>

        {/* ── LOADING STATE ── */}
        {loadingDuos && duos.length === 0 && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-gold" />
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loadingDuos && duos.length === 0 && (
          <div className="glass-panel border border-admin-border rounded-2xl p-16 text-center">
            <Layers className="w-12 h-12 text-admin-text-secondary/20 mx-auto mb-4" />
            <p className="text-admin-text-secondary font-light mb-1">Aucun accord configuré</p>
            <p className="text-admin-text-secondary/40 text-sm">
              Cliquez sur "Ajouter un accord" pour créer votre premier duo.
            </p>
          </div>
        )}

        {/* ── DUO CARDS ── */}
        <AnimatePresence mode="popLayout">
          {duos.map((duo, index) => {
            const productA = getProduct(duo.productIdA);
            const productB = getProduct(duo.productIdB);
            const isComplete = !!productA && !!productB;
            const isDeleting = confirmDelete === duo.id;

            return (
              <motion.div
                key={duo.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className={`glass-panel rounded-2xl overflow-hidden border transition-colors duration-300 ${
                  isDeleting ? 'border-red-500/40' : 'border-admin-border'
                }`}
              >
                {/* ── Card Header ── */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-admin-border bg-white/[0.015]">
                  {/* Position badge */}
                  <span className="text-[10px] font-bold text-admin-text-secondary/30 w-5 flex-shrink-0">
                    #{index + 1}
                  </span>

                  {/* Active toggle */}
                  <button
                    onClick={() => updateDuo(duo.id, { isActive: !duo.isActive })}
                    title={duo.isActive ? 'Actif — cliquer pour désactiver' : 'Inactif — cliquer pour activer'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold border transition-all duration-200 ${
                      duo.isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-admin-text-secondary/40 hover:text-admin-text-secondary/70'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${duo.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                    {duo.isActive ? 'Actif' : 'Inactif'}
                  </button>

                  {/* Incomplet warning */}
                  {!isComplete && (
                    <span className="text-[9px] uppercase tracking-[0.15em] text-amber-400/60 border border-amber-400/20 px-2 py-0.5 rounded-full">
                      Incomplet
                    </span>
                  )}

                  {/* Duo name preview (collapsed info) */}
                  <span className="ml-2 text-sm text-admin-text-secondary/50 truncate hidden sm:block flex-1 min-w-0">
                    {duo.name}
                  </span>

                  {/* Actions */}
                  <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveDuo(duo.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-admin-text-secondary/40 hover:text-admin-text-primary hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Monter"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDuo(duo.id, 'down')}
                      disabled={index === duos.length - 1}
                      className="p-1.5 rounded-lg text-admin-text-secondary/40 hover:text-admin-text-primary hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Descendre"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(duo.id)}
                      title={isDeleting ? 'Cliquer à nouveau pour confirmer la suppression' : 'Supprimer'}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        isDeleting
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'text-admin-text-secondary/30 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-5 space-y-5">

                  {/* Name & Description row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/50 font-medium block mb-2">
                        Nom de l'accord
                      </label>
                      <input
                        type="text"
                        value={duo.name}
                        onChange={(e) => updateDuo(duo.id, { name: e.target.value })}
                        placeholder="Ex : L'Ombre & La Lumière"
                        className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-2.5 text-sm text-admin-text-primary placeholder:text-admin-text-secondary/25 focus:outline-none focus:border-admin-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/50 font-medium block mb-2">
                        Description affichée sur la page
                      </label>
                      <textarea
                        value={duo.description}
                        onChange={(e) => updateDuo(duo.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Décrivez l'accord et son harmonie olfactive..."
                        className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-2.5 text-sm text-admin-text-primary placeholder:text-admin-text-secondary/25 focus:outline-none focus:border-admin-gold/50 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Prix personnalisé */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1 max-w-xs">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/50 font-medium block mb-2">
                        Prix du duo (optionnel)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={duo.customPrice ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDuo(duo.id, { customPrice: val === '' ? undefined : parseFloat(val) });
                          }}
                          placeholder={isComplete ? `${(productA!.price + productB!.price).toFixed(2)} (auto)` : 'Laissez vide = somme des 2'}
                          className="w-full bg-white/5 border border-admin-border rounded-xl pl-4 pr-10 py-2.5 text-sm text-admin-text-primary placeholder:text-admin-text-secondary/25 focus:outline-none focus:border-admin-gold/50 transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-secondary/40 text-sm">€</span>
                      </div>
                      <p className="text-[10px] text-admin-text-secondary/40 mt-1.5">
                        {duo.customPrice
                          ? `Prix affiché : ${duo.customPrice.toFixed(2)} €`
                          : isComplete
                          ? `Prix automatique : ${(productA!.price + productB!.price).toFixed(2)} €`
                          : 'Sélectionnez les deux parfums pour voir le prix auto'}
                      </p>
                    </div>
                    {duo.customPrice !== undefined && (
                      <button
                        onClick={() => updateDuo(duo.id, { customPrice: undefined })}
                        className="mb-6 text-[10px] uppercase tracking-[0.1em] text-admin-text-secondary/40 hover:text-red-400 transition-colors"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  {/* Product pickers */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/50 font-medium block mb-3">
                      Composition du Duo
                    </label>
                    <div className="flex items-start gap-3">
                      <ProductSlot
                        label="Parfum A"
                        sublabel="Note intense / Fond"
                        product={productA}
                        onChangePicker={() => setPicker({ duoId: duo.id, side: 'A' })}
                      />
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mt-10 gap-1">
                        <div className="w-7 h-7 rounded-full bg-[#C4A97D]/10 border border-[#C4A97D]/25 flex items-center justify-center text-[#C4A97D]">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <ProductSlot
                        label="Parfum B"
                        sublabel="Note légère / Tête"
                        product={productB}
                        onChangePicker={() => setPicker({ duoId: duo.id, side: 'B' })}
                      />
                    </div>
                  </div>

                  {/* Total price */}
                  {isComplete && (
                    <div className="flex items-center justify-between pt-3 border-t border-admin-border">
                      <div className="flex items-center gap-4 text-xs text-admin-text-secondary/50">
                        <span>
                          {productA!.name}
                          <span className="text-[#C4A97D]/60 ml-1">({productA!.price.toFixed(2)} €)</span>
                        </span>
                        <span>+</span>
                        <span>
                          {productB!.name}
                          <span className="text-[#C4A97D]/60 ml-1">({productB!.price.toFixed(2)} €)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-admin-text-secondary/40">Total</span>
                        <span className="text-admin-gold font-bold font-montserrat text-base">
                          {(productA!.price + productB!.price).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Auto-save info ── */}
        {duos.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-admin-gold/[0.04] border border-admin-gold/10">
            <Layers className="w-4 h-4 text-admin-gold/50 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-admin-text-secondary/50 leading-relaxed">
              Les modifications sont{' '}
              <strong className="text-admin-gold/70">sauvegardées automatiquement</strong> dans Supabase et visibles sur le site en temps réel.
              Seuls les accords <strong className="text-emerald-400/70">actifs</strong> et{' '}
              <strong className="text-[#C4A97D]/70">complets</strong> (avec 2 parfums) sont visibles sur la page publique.
            </p>
          </div>
        )}
      </div>

      {/* ── Product Picker Modal ── */}
      <AnimatePresence>
        {picker && (
          <ProductPicker
            products={products}
            selectedId={
              picker.side === 'A'
                ? (duos.find((d) => d.id === picker.duoId)?.productIdA ?? '')
                : (duos.find((d) => d.id === picker.duoId)?.productIdB ?? '')
            }
            excludeId={excludeId}
            onSelect={handlePickerSelect}
            onClose={() => setPicker(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LayeringManager;
