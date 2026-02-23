import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Persistence tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('persists promo code to localStorage and restores after reload', async () => {
    const mod = await import('@/store/useCartStore');
    const useCartStore = mod.default;

    // Set promo and ensure localStorage was written
    useCartStore.getState().setPromoCode('PROMO10', 10);
    const raw = localStorage.getItem('rayha_guest_promo');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed).toEqual({ code: 'PROMO10', discount: 10 });

    // Simulate reload: re-import module and initialize guest cart
    vi.resetModules();
    const mod2 = await import('@/store/useCartStore');
    const useCartStore2 = mod2.default;
    // initializeGuestCart will load promo from localStorage
    useCartStore2.getState().initializeGuestCart();

    expect(useCartStore2.getState().promoCode).toBe('PROMO10');
    expect(useCartStore2.getState().promoDiscount).toBe(10);
  });

  it('loads olfactory notes from Supabase and creates new note (mocked)', async () => {
    // Mock supabase integration prior to importing the store
    vi.mock('@/integrations/supabase/supabase', () => ({
      getAllOlfactoryNotes: async () => [
        { id: 'srv-1', label: 'NoteServ', pyramid: 'tete', family: 'Floral', created_at: new Date().toISOString() },
      ],
      createOlfactoryNote: async (note: any) => ({ id: 'srv-created', ...note, created_at: new Date().toISOString() }),
      updateOlfactoryNote: async (id: string, updates: any) => ({ id, ...updates, created_at: new Date().toISOString() }),
      deleteOlfactoryNote: async (id: string) => ({}),
    }));

    const { useOlfactoryNotesStore } = await import('@/store/useOlfactoryNotesStore');

    // initialize should load mocked server notes
    await useOlfactoryNotesStore.getState().initializeNotes();
    const notes = useOlfactoryNotesStore.getState().notes;
    expect(notes.some(n => n.id === 'srv-1' && n.label === 'NoteServ')).toBe(true);

    // Add a new note and ensure it is replaced by server id after creation
    await useOlfactoryNotesStore.getState().addNote('NewTest', 'coeur', 'Floral');
    const hasCreated = useOlfactoryNotesStore.getState().notes.some(n => n.id === 'srv-created' && n.label === 'NewTest');
    expect(hasCreated).toBe(true);
  });
});
