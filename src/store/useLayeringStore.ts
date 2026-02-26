import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/supabase';

export interface LayeringDuoConfig {
  id: string;
  name: string;
  description: string;
  productIdA: string;
  productIdB: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  customPrice?: number;
}

// ─── Mapping DB ↔ TypeScript ──────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): LayeringDuoConfig {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    productIdA: row.product_id_a as string,
    productIdB: row.product_id_b as string,
    isActive: row.is_active as boolean,
    order: row.sort_order as number,
    customPrice: row.custom_price != null ? (row.custom_price as number) : undefined,
    createdAt: row.created_at as string,
  };
}

function toRow(duo: Partial<LayeringDuoConfig>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (duo.name !== undefined) row.name = duo.name;
  if (duo.description !== undefined) row.description = duo.description;
  if (duo.productIdA !== undefined) row.product_id_a = duo.productIdA;
  if (duo.productIdB !== undefined) row.product_id_b = duo.productIdB;
  if (duo.isActive !== undefined) row.is_active = duo.isActive;
  if (duo.order !== undefined) row.sort_order = duo.order;
  if ('customPrice' in duo) row.custom_price = duo.customPrice ?? null;
  return row;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface LayeringState {
  duos: LayeringDuoConfig[];
  loading: boolean;
  fetchDuos: () => Promise<void>;
  addDuo: (duo: Omit<LayeringDuoConfig, 'id' | 'createdAt'>) => Promise<void>;
  updateDuo: (id: string, updates: Partial<Omit<LayeringDuoConfig, 'id' | 'createdAt'>>) => Promise<void>;
  removeDuo: (id: string) => Promise<void>;
  moveDuo: (id: string, direction: 'up' | 'down') => Promise<void>;
}

export const useLayeringStore = create<LayeringState>((set, get) => ({
  duos: [],
  loading: false,

  fetchDuos: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('layering_duos')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      set({ duos: (data ?? []).map(fromRow) });
    } catch (err) {
      console.error('fetchDuos error:', err);
    } finally {
      set({ loading: false });
    }
  },

  addDuo: async (duo) => {
    const { data, error } = await supabase
      .from('layering_duos')
      .insert({
        name: duo.name,
        description: duo.description,
        product_id_a: duo.productIdA,
        product_id_b: duo.productIdB,
        is_active: duo.isActive,
        sort_order: duo.order,
        custom_price: duo.customPrice ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    set((s) => ({ duos: [...s.duos, fromRow(data)] }));
  },

  updateDuo: async (id, updates) => {
    // Optimistic update
    set((s) => ({
      duos: s.duos.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
    const { error } = await supabase
      .from('layering_duos')
      .update(toRow(updates))
      .eq('id', id);
    if (error) {
      console.error('updateDuo error:', error);
      get().fetchDuos();
    }
  },

  removeDuo: async (id) => {
    // Optimistic update
    set((s) => ({ duos: s.duos.filter((d) => d.id !== id) }));
    const { error } = await supabase
      .from('layering_duos')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('removeDuo error:', error);
      get().fetchDuos();
    }
  },

  moveDuo: async (id, direction) => {
    const duos = [...get().duos];
    const idx = duos.findIndex((d) => d.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= duos.length) return;

    // Swap
    [duos[idx], duos[newIdx]] = [duos[newIdx], duos[idx]];
    const updatedA = { ...duos[idx], order: idx };
    const updatedB = { ...duos[newIdx], order: newIdx };
    duos[idx] = updatedA;
    duos[newIdx] = updatedB;

    // Optimistic update
    set({ duos });

    // Sync both rows
    await Promise.all([
      supabase.from('layering_duos').update({ sort_order: idx }).eq('id', updatedA.id),
      supabase.from('layering_duos').update({ sort_order: newIdx }).eq('id', updatedB.id),
    ]);
  },
}));
