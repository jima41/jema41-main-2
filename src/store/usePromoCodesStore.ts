import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  active: boolean;
  usageCount?: number;
  createdAt: number;
}

interface PromoCodesState {
  promoCodes: PromoCode[];
  incrementUsage: (code: string) => void;
  addPromoCode: (code: string, discount: number) => { success: boolean; error?: string };
  removePromoCode: (id: string) => void;
  togglePromoCode: (id: string) => void;
  getPromoByCode: (code: string) => PromoCode | undefined;
}

const normalizeCode = (code: string) => code.trim().toUpperCase();

export const usePromoCodesStore = create<PromoCodesState>()(
  persist(
    (set, get) => ({
      promoCodes: [],
      incrementUsage: (code: string) => {
        const normalized = normalizeCode(code);
        set((state) => ({
          promoCodes: state.promoCodes.map((promo) =>
            promo.code === normalized ? { ...promo, usageCount: (promo.usageCount || 0) + 1 } : promo
          ),
        }));
      },
      addPromoCode: (code, discount) => {
        const normalized = normalizeCode(code);
        if (!normalized) {
          return { success: false, error: 'Le code promo est requis.' };
        }
        if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
          return { success: false, error: 'La remise doit etre entre 1 et 100.' };
        }

        const exists = get().promoCodes.some((promo) => promo.code === normalized);
        if (exists) {
          return { success: false, error: 'Ce code promo existe deja.' };
        }

        const newPromo: PromoCode = {
          id: `promo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          code: normalized,
          discount,
          active: true,
          createdAt: Date.now(),
        };

        set((state) => ({ promoCodes: [newPromo, ...state.promoCodes] }));
        return { success: true };
      },
      removePromoCode: (id) =>
        set((state) => ({
          promoCodes: state.promoCodes.filter((promo) => promo.id !== id),
        })),
      togglePromoCode: (id) =>
        set((state) => ({
          promoCodes: state.promoCodes.map((promo) =>
            promo.id === id ? { ...promo, active: !promo.active } : promo
          ),
        })),
      getPromoByCode: (code) => {
        const normalized = normalizeCode(code);
        return get().promoCodes.find((promo) => promo.code === normalized);
      },
    }),
    {
      name: 'promo-codes-store',
      version: 1,
    }
  )
);

export default usePromoCodesStore;
