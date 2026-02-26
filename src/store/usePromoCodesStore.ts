import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from '@/integrations/supabase/supabase';

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  active: boolean;
  usageCount?: number;
  createdAt: number;
  minAmount: number;
  singleUse: boolean;
  freeShipping:      boolean;
  freeProductId:    string | null;
  freeProductLabel: string;
}

interface PromoCodesState {
  promoCodes: PromoCode[];
  initializePromoCodes: () => Promise<void>;
  incrementUsage: (code: string) => void;
  addPromoCode: (code: string, discount: number, minAmount?: number, singleUse?: boolean, freeShipping?: boolean, freeProductId?: string | null, freeProductLabel?: string) => Promise<{ success: boolean; error?: string }>;
  removePromoCode: (id: string) => Promise<void>;
  togglePromoCode: (id: string) => Promise<void>;
  getPromoByCode: (code: string) => PromoCode | undefined;
}

const normalizeCode = (code: string) => code.trim().toUpperCase();

const rowToPromo = (r: Record<string, any>): PromoCode => {
  // La colonne s'appelle discount_percent dans Supabase
  const discountValue =
    r.discount_percent ??
    r.discount ??
    r.percentage ??
    r.percent ??
    r.reduction ??
    r.value ??
    0;

  return {
    id: r.id,
    code: r.code,
    discount: Number(discountValue) || 0,
    active: r.is_active ?? r.active ?? false,
    usageCount: Number(r.usage_count ?? r.usagecount ?? 0) || 0,
    createdAt: new Date(r.created_at).getTime(),
    minAmount: Number(r.min_amount ?? 0) || 0,
    singleUse: r.single_use ?? false,
    freeShipping:     r.free_shipping ?? false,
    freeProductId:    r.free_product_id ?? null,
    freeProductLabel: r.free_product_label ?? 'Produit offert',
  };
};

export const usePromoCodesStore = create<PromoCodesState>()(
  persist(
    (set, get) => ({
      promoCodes: [],

      // Charge tous les codes depuis Supabase (appelé au démarrage)
      initializePromoCodes: async () => {
        try {
          const rows = await getAllPromoCodes();
          set({ promoCodes: rows.map(rowToPromo) });
          console.log(`🎟️ Codes promo chargés depuis Supabase: ${rows.length}`);
        } catch (error) {
          console.error('❌ Erreur initializePromoCodes:', error);
          // On garde le cache localStorage en cas d'erreur réseau
        }
      },

      incrementUsage: (code: string) => {
        const normalized = normalizeCode(code);
        const promo = get().promoCodes.find(p => p.code === normalized);
        if (!promo) return;

        const newCount = (promo.usageCount || 0) + 1;
        set(state => ({
          promoCodes: state.promoCodes.map(p =>
            p.code === normalized ? { ...p, usageCount: newCount } : p
          ),
        }));

        // Sync Supabase silencieusement
        updatePromoCode(promo.id, { usage_count: newCount }).catch((err) =>
          console.error('❌ Erreur incrementUsage Supabase:', err)
        );
      },

      addPromoCode: async (code, discount, minAmount = 0, singleUse = false, freeShipping = false, freeProductId = null, freeProductLabel = 'Produit offert') => {
        const normalized = normalizeCode(code);
        if (!normalized) {
          return { success: false, error: 'Le code promo est requis.' };
        }
        if (!freeShipping && (!Number.isFinite(discount) || discount <= 0 || discount > 100)) {
          return { success: false, error: 'La remise doit être entre 1 et 100.' };
        }
        if (get().promoCodes.some(p => p.code === normalized)) {
          return { success: false, error: 'Ce code promo existe déjà.' };
        }

        // Optimistic insert avec ID temporaire
        const tempId = `temp_${Date.now()}`;
        const tempPromo: PromoCode = {
          id: tempId,
          code: normalized,
          discount: freeShipping ? 0 : discount,
          active: true,
          usageCount: 0,
          createdAt: Date.now(),
          minAmount: minAmount ?? 0,
          singleUse: singleUse ?? false,
          freeShipping:     freeShipping ?? false,
          freeProductId:    freeProductId ?? null,
          freeProductLabel: freeProductLabel ?? 'Produit offert',
        };
        set(state => ({ promoCodes: [tempPromo, ...state.promoCodes] }));

        try {
          const created = await createPromoCode({ code: normalized, discount: freeShipping ? 0 : discount, is_active: true, min_amount: minAmount, single_use: singleUse, free_shipping: freeShipping, free_product_id: freeProductId, free_product_label: freeProductLabel });
          set(state => ({
            promoCodes: state.promoCodes.map(p =>
              p.id === tempId ? rowToPromo(created) : p
            ),
          }));
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur createPromoCode:', error);
          // Rollback
          set(state => ({ promoCodes: state.promoCodes.filter(p => p.id !== tempId) }));
          return { success: false, error: 'Erreur lors de la sauvegarde. Réessayez.' };
        }
      },

      removePromoCode: async (id) => {
        const prev = get().promoCodes;
        set(state => ({ promoCodes: state.promoCodes.filter(p => p.id !== id) }));
        try {
          if (!id.startsWith('temp_')) {
            await deletePromoCode(id);
          }
        } catch (error) {
          console.error('❌ Erreur deletePromoCode:', error);
          set({ promoCodes: prev }); // Rollback
        }
      },

      togglePromoCode: async (id) => {
        const promo = get().promoCodes.find(p => p.id === id);
        if (!promo) return;

        const newActive = !promo.active;
        set(state => ({
          promoCodes: state.promoCodes.map(p =>
            p.id === id ? { ...p, active: newActive } : p
          ),
        }));

        try {
          if (!id.startsWith('temp_')) {
            await updatePromoCode(id, { is_active: newActive });
          }
        } catch (error) {
          console.error('❌ Erreur togglePromoCode:', error);
          // Rollback
          set(state => ({
            promoCodes: state.promoCodes.map(p =>
              p.id === id ? { ...p, active: !newActive } : p
            ),
          }));
        }
      },

      getPromoByCode: (code) => {
        const normalized = normalizeCode(code);
        return get().promoCodes.find(p => p.code === normalized);
      },
    }),
    {
      name: 'promo-codes-store',
      version: 3, // Incrémenter pour forcer un rafraîchissement depuis Supabase
    }
  )
);

export default usePromoCodesStore;
