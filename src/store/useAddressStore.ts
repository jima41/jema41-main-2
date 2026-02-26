import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShippingAddress {
  id: string;
  label: string;        // ex: "Domicile", "Bureau"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressStoreState {
  // Adresses indexées par userId
  addressesByUser: Record<string, ShippingAddress[]>;

  getAddresses: (userId: string) => ShippingAddress[];
  getDefaultAddress: (userId: string) => ShippingAddress | null;
  saveAddress: (userId: string, data: Omit<ShippingAddress, 'id' | 'isDefault'> & { id?: string }) => void;
  removeAddress: (userId: string, id: string) => void;
  setDefault: (userId: string, id: string) => void;
}

export const useAddressStore = create<AddressStoreState>()(
  persist(
    (set, get) => ({
      addressesByUser: {},

      getAddresses: (userId) => get().addressesByUser[userId] ?? [],

      getDefaultAddress: (userId) => {
        const list = get().addressesByUser[userId] ?? [];
        return list.find(a => a.isDefault) ?? list[0] ?? null;
      },

      saveAddress: (userId, data) => {
        set(state => {
          const current = state.addressesByUser[userId] ?? [];
          const id = data.id ?? `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const existing = current.find(a => a.id === id);

          let updated: ShippingAddress[];
          if (existing) {
            // Mise à jour d'une adresse existante
            updated = current.map(a => a.id === id ? { ...a, ...data, id } : a);
          } else {
            // Nouvelle adresse — devient la défaut si c'est la première
            const isDefault = current.length === 0;
            updated = [...current, { ...data, id, isDefault }];
          }

          return { addressesByUser: { ...state.addressesByUser, [userId]: updated } };
        });
      },

      removeAddress: (userId, id) => {
        set(state => {
          const current = state.addressesByUser[userId] ?? [];
          let updated = current.filter(a => a.id !== id);
          // Si on supprime la défaut, promouvoir la suivante
          if (updated.length > 0 && !updated.some(a => a.isDefault)) {
            updated = updated.map((a, i) => ({ ...a, isDefault: i === 0 }));
          }
          return { addressesByUser: { ...state.addressesByUser, [userId]: updated } };
        });
      },

      setDefault: (userId, id) => {
        set(state => {
          const current = state.addressesByUser[userId] ?? [];
          const updated = current.map(a => ({ ...a, isDefault: a.id === id }));
          return { addressesByUser: { ...state.addressesByUser, [userId]: updated } };
        });
      },
    }),
    { name: 'rayha-addresses' }
  )
);
