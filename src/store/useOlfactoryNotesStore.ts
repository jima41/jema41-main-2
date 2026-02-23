import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAllOlfactoryNotes,
  createOlfactoryNote,
  updateOlfactoryNote,
  deleteOlfactoryNote,
} from '@/integrations/supabase/supabase';

export interface OlfactoryNote {
  id: string;
  label: string;
  pyramid: 'tete' | 'coeur' | 'fond';
  family?: string; // Famille olfactive associée (Floral, Boisé, etc.)
  createdAt: string;
}

interface OlfactoryNotesState {
  notes: OlfactoryNote[];
  initializeNotes: () => Promise<void>;
  addNote: (label: string, pyramid: 'tete' | 'coeur' | 'fond', family?: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<OlfactoryNote, 'label' | 'pyramid' | 'family'>>) => Promise<void>;
  getNotesByPyramid: (pyramid: 'tete' | 'coeur' | 'fond') => OlfactoryNote[];
  getNoteById: (id: string) => OlfactoryNote | undefined;
  getNoteByLabel: (label: string, pyramid: 'tete' | 'coeur' | 'fond') => OlfactoryNote | undefined;
  importDefaults: () => void;
}

// Notes par défaut issues du dictionnaire olfactif existant
const DEFAULT_NOTES: Omit<OlfactoryNote, 'id' | 'createdAt'>[] = [
  // TÊTE
  { label: 'Citron', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Bergamote', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Mandarine', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Pamplemousse', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Orange sanguine', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Lime', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Yuzu', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Verveine', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Citronnelle', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Poivre rose', pyramid: 'tete', family: 'Épicé' },
  { label: 'Menthe poivrée', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Lavande', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Néroli', pyramid: 'tete', family: 'Floral' },
  { label: 'Pomme verte', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Noix de coco', pyramid: 'tete', family: 'Gourmand' },
  { label: 'Pêche', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Framboise', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Cassis', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Aldéhydes', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Accord marin', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Rhubarbe', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Baies de genièvre', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Petit grain', pyramid: 'tete', family: 'Frais/Aquatique' },
  { label: 'Gingembre', pyramid: 'tete', family: 'Épicé' },
  { label: 'Cardamome', pyramid: 'tete', family: 'Épicé' },

  // CŒUR
  { label: 'Rose de Mai', pyramid: 'coeur', family: 'Floral' },
  { label: 'Rose Damascena', pyramid: 'coeur', family: 'Floral' },
  { label: 'Jasmin Sambac', pyramid: 'coeur', family: 'Floral' },
  { label: "Jasmin d'Espagne", pyramid: 'coeur', family: 'Floral' },
  { label: 'Iris de Toscane', pyramid: 'coeur', family: 'Floral' },
  { label: 'Tubéreuse', pyramid: 'coeur', family: 'Floral' },
  { label: "Fleur d'oranger", pyramid: 'coeur', family: 'Floral' },
  { label: 'Ylang-Ylang', pyramid: 'coeur', family: 'Floral' },
  { label: 'Géranium', pyramid: 'coeur', family: 'Floral' },
  { label: 'Magnolia', pyramid: 'coeur', family: 'Floral' },
  { label: 'Pivoine', pyramid: 'coeur', family: 'Floral' },
  { label: 'Gardénia', pyramid: 'coeur', family: 'Floral' },
  { label: 'Freesia', pyramid: 'coeur', family: 'Floral' },
  { label: 'Violette', pyramid: 'coeur', family: 'Floral' },
  { label: 'Cannelle', pyramid: 'coeur', family: 'Épicé' },
  { label: 'Muscade', pyramid: 'coeur', family: 'Épicé' },
  { label: 'Clou de girofle', pyramid: 'coeur', family: 'Épicé' },
  { label: 'Safran', pyramid: 'coeur', family: 'Épicé' },
  { label: 'Sauge sclarée', pyramid: 'coeur', family: 'Frais/Aquatique' },
  { label: 'Romarin', pyramid: 'coeur', family: 'Frais/Aquatique' },
  { label: 'Thé Vert', pyramid: 'coeur', family: 'Frais/Aquatique' },
  { label: 'Cyclamen', pyramid: 'coeur', family: 'Floral' },
  { label: 'Rose', pyramid: 'coeur', family: 'Floral' },
  { label: 'Jasmin', pyramid: 'coeur', family: 'Floral' },
  { label: 'Fleur de lys', pyramid: 'coeur', family: 'Floral' },
  { label: 'Muguet', pyramid: 'coeur', family: 'Floral' },
  { label: 'Cèdre', pyramid: 'coeur', family: 'Boisé' },
  { label: 'Vetiver', pyramid: 'coeur', family: 'Boisé' },
  { label: 'Bois de santal', pyramid: 'coeur', family: 'Boisé' },
  { label: 'Cuir', pyramid: 'coeur', family: 'Cuiré' },
  { label: 'Tabac', pyramid: 'coeur', family: 'Cuiré' },
  { label: 'Vanille', pyramid: 'coeur', family: 'Gourmand' },
  { label: 'Tonka', pyramid: 'coeur', family: 'Gourmand' },

  // FOND
  { label: 'Bois de Santal', pyramid: 'fond', family: 'Boisé' },
  { label: "Cèdre de l'Atlas", pyramid: 'fond', family: 'Boisé' },
  { label: 'Cèdre de Virginie', pyramid: 'fond', family: 'Boisé' },
  { label: 'Patchouli', pyramid: 'fond', family: 'Boisé' },
  { label: 'Vétiver de Haïti', pyramid: 'fond', family: 'Boisé' },
  { label: "Oud (Bois d'Agar)", pyramid: 'fond', family: 'Oriental' },
  { label: 'Musc blanc', pyramid: 'fond', family: 'Oriental' },
  { label: 'Ambre gris', pyramid: 'fond', family: 'Oriental' },
  { label: 'Ambre jaune', pyramid: 'fond', family: 'Oriental' },
  { label: 'Vanille Bourbon', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Gousse de Vanille', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Fève Tonka', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Benjoin', pyramid: 'fond', family: 'Oriental' },
  { label: 'Mousse de chêne', pyramid: 'fond', family: 'Boisé' },
  { label: 'Cuir', pyramid: 'fond', family: 'Cuiré' },
  { label: 'Daim', pyramid: 'fond', family: 'Cuiré' },
  { label: 'Tabac blond', pyramid: 'fond', family: 'Cuiré' },
  { label: 'Encens', pyramid: 'fond', family: 'Oriental' },
  { label: 'Myrrhe', pyramid: 'fond', family: 'Oriental' },
  { label: 'Caramel', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Chocolat noir', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Café', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Praliné', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Miel', pyramid: 'fond', family: 'Gourmand' },
  { label: 'Ciste Labdanum', pyramid: 'fond', family: 'Oriental' },
  { label: 'Musc', pyramid: 'fond', family: 'Oriental' },
  { label: 'Ambre', pyramid: 'fond', family: 'Oriental' },
  { label: 'Oud', pyramid: 'fond', family: 'Oriental' },
];

const generateId = (prefix = 'note') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

const serverRowToNote = (r: { id: string; label: string; pyramid: 'tete' | 'coeur' | 'fond'; family?: string | null; created_at?: string | null; }): OlfactoryNote => ({
  id: r.id,
  label: r.label,
  pyramid: r.pyramid,
  family: r.family || undefined,
  createdAt: r.created_at || new Date().toISOString(),
});

export const useOlfactoryNotesStore = create<OlfactoryNotesState>()(
  persist(
    (set, get) => ({
      notes: DEFAULT_NOTES.map((n, i) => ({
        ...n,
        id: `default-${n.pyramid}-${i}`,
        createdAt: new Date().toISOString(),
      })),

      initializeNotes: async () => {
        try {
          const rows = await getAllOlfactoryNotes();
          if (rows && rows.length > 0) {
            const mapped = rows.map(serverRowToNote);
            set({ notes: mapped });
            console.log(`🌿 Notes olfactives chargées depuis Supabase: ${mapped.length}`);
          } else {
            console.log('🌿 Aucune note serveur trouvée — utilisation des valeurs par défaut');
          }
        } catch (error) {
          console.error('❌ Erreur initializeNotes:', error);
        }
      },

      addNote: async (label, pyramid, family) => {
        const existing = get().notes.find(
          n => n.label.toLowerCase() === label.toLowerCase() && n.pyramid === pyramid
        );
        if (existing) return; // Pas de doublon

        // Optimistic insert with temp id
        const tempId = generateId('temp');
        const newNote: OlfactoryNote = {
          id: tempId,
          label,
          pyramid,
          family,
          createdAt: new Date().toISOString(),
        };

        set(state => ({ notes: [...state.notes, newNote] }));

        try {
          const created = await createOlfactoryNote({ label, pyramid, family: family || null });
          set(state => ({
            notes: state.notes.map(n => n.id === tempId ? serverRowToNote(created) : n),
          }));
        } catch (error) {
          console.error('❌ Erreur createOlfactoryNote:', error);
          // rollback
          set(state => ({ notes: state.notes.filter(n => n.id !== tempId) }));
        }
      },

      removeNote: async (id) => {
        const prev = get().notes;
        set(state => ({ notes: state.notes.filter(n => n.id !== id) }));
        try {
          // If id is a temp/local id (starts with default- or temp-) skip server delete
          if (!id.startsWith('default-') && !id.startsWith('temp')) {
            await deleteOlfactoryNote(id);
          }
        } catch (error) {
          console.error('❌ Erreur deleteOlfactoryNote:', error);
          // rollback
          set({ notes: prev });
        }
      },

      updateNote: async (id, updates) => {
        const prev = get().notes;
        set(state => ({
          notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n),
        }));

        try {
          if (!id.startsWith('default-') && !id.startsWith('temp')) {
            await updateOlfactoryNote(id, updates as any);
          }
        } catch (error) {
          console.error('❌ Erreur updateOlfactoryNote:', error);
          set({ notes: prev });
        }
      },

      getNotesByPyramid: (pyramid) => {
        return get().notes.filter(n => n.pyramid === pyramid);
      },

      getNoteById: (id) => {
        return get().notes.find(n => n.id === id);
      },

      getNoteByLabel: (label, pyramid) => {
        return get().notes.find(
          n => n.label.toLowerCase() === label.toLowerCase() && n.pyramid === pyramid
        );
      },

      importDefaults: () => {
        const current = get().notes;
        const newNotes = [...current];

        for (const def of DEFAULT_NOTES) {
          const exists = current.some(
            n => n.label.toLowerCase() === def.label.toLowerCase() && n.pyramid === def.pyramid
          );
          if (!exists) {
            newNotes.push({
              ...def,
              id: generateId(),
              createdAt: new Date().toISOString(),
            });
          }
        }

        set({ notes: newNotes });
      },
    }),
    {
      name: 'olfactory-notes-store',
    }
  )
);

// Familles olfactives disponibles
export const OLFACTORY_FAMILIES = [
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique',
] as const;

export type OlfactoryFamilyType = typeof OLFACTORY_FAMILIES[number];

// Labels pour l'affichage des niveaux de pyramide
export const PYRAMID_LABELS: Record<'tete' | 'coeur' | 'fond', string> = {
  tete: 'Notes de Tête',
  coeur: 'Notes de Cœur',
  fond: 'Notes de Fond',
};

export const PYRAMID_DESCRIPTIONS: Record<'tete' | 'coeur' | 'fond', string> = {
  tete: 'Première impression, volatilité élevée (5-30 min)',
  coeur: 'Signature du parfum, volatilité moyenne (2-4h)',
  fond: 'Sillage et profondeur, volatilité basse (4-24h)',
};
