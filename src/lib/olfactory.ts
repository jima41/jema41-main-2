/**
 * DICTIONNAIRE OLFACTIF EXHAUSTIF
 * Classification complète des notes olfactives pour pyramide olfactive
 */

export const OLFACTORY_DICTIONARY = {
  // NOTES DE TÊTE (Légèreté & Éclat) - Volatilité élevée
  tete: {
    citron: 'Citron',
    bergamote: 'Bergamote',
    mandarine: 'Mandarine',
    pamplemousse: 'Pamplemousse',
    orange_sanguine: 'Orange sanguine',
    lime: 'Lime (Citron vert)',
    yuzu: 'Yuzu',
    verveine: 'Verveine',
    citronnelle: 'Citronnelle',
    baies_genievre: 'Baies de genièvre',
    poivre_rose: 'Poivre rose',
    menthe_poivree: 'Menthe poivrée',
    lavande: 'Lavande',
    neroli: 'Néroli',
    pomme_verte: 'Pomme verte',
    noix_coco: 'Noix de coco',
    peche: 'Pêche',
    framboise: 'Framboise',
    melon: 'Melon',
    cassis: 'Cassis',
    aldehydes: 'Aldéhydes',
    accord_marin: 'Accord marin',
    calone: 'Calone',
    rhubarbe: 'Rhubarbe',
  },

  // NOTES DE CŒUR (Signature & Corps) - Volatilité moyenne
  coeur: {
    rose_mai: 'Rose de Mai',
    rose_damascena: 'Rose Damascena',
    jasmin_sambac: 'Jasmin Sambac',
    jasmin_espagne: 'Jasmin d\'Espagne',
    iris_toscane: 'Iris de Toscane',
    tuberose: 'Tubéreuse',
    fleur_oranger: 'Fleur d\'oranger',
    ylang_ylang: 'Ylang-Ylang',
    geranium: 'Géranium',
    magnolia: 'Magnolia',
    pivoine: 'Pivoine',
    gardenia: 'Gardénia',
    freesia: 'Freesia',
    violette: 'Violette',
    cannelle: 'Cannelle',
    muscade: 'Muscade',
    cardamome: 'Cardamome',
    clou_girofle: 'Clou de girofle',
    safran: 'Safran',
    gingembre: 'Gingembre',
    sauge_sclaree: 'Sauge sclarée',
    romarin: 'Romarin',
    thym: 'Thym',
    the_vert: 'Thé Vert',
    cyclamen: 'Cyclamen',
  },

  // NOTES DE FOND (Sillage & Profondeur) - Volatilité faible
  fond: {
    bois_santal: 'Bois de Santal',
    cedre_atlas: 'Cèdre de l\'Atlas',
    cedre_virginie: 'Cèdre de Virginie',
    patchouli: 'Patchouli',
    vetiver_haiti: 'Vétiver de Haïti',
    oud: 'Oud (Bois d\'Agar)',
    musc_blanc: 'Musc blanc',
    ambre_gris: 'Ambre gris',
    ambre_jaune: 'Ambre jaune',
    vanille_bourbon: 'Vanille Bourbon',
    gousse_vanille: 'Gousse de Vanille',
    feve_tonka: 'Fève Tonka',
    benjoin: 'Benjoin',
    mousse_chene: 'Mousse de chêne',
    cuir: 'Cuir',
    daim: 'Daim (Suede)',
    tabac_blond: 'Tabac blond',
    encens: 'Encens',
    myrrhe: 'Myrrhe',
    caramel: 'Caramel',
    chocolat_noir: 'Chocolat noir',
    cafe: 'Café',
    praline: 'Praliné',
    miel: 'Miel',
    ciste_labdanum: 'Ciste Labdanum',
    castorium_synthetique: 'Castoréum (synthétique)',
    civette_synthetique: 'Civette (synthétique)',
  },
} as const;

// Types pour les clés du dictionnaire
export type TeteNote = keyof typeof OLFACTORY_DICTIONARY.tete;
export type CoeurNote = keyof typeof OLFACTORY_DICTIONARY.coeur;
export type FondNote = keyof typeof OLFACTORY_DICTIONARY.fond;

// Familles olfactives
export type OlfactoryFamily = 
  | 'Floral'
  | 'Boisé'
  | 'Gourmand'
  | 'Oriental'
  | 'Épicé'
  | 'Cuiré'
  | 'Frais/Aquatique';

/**
 * ALGORITHME DE CLASSIFICATION AUTOMATIQUE
 * Analyse les notes pour déterminer la famille olfactive
 * Fonctionne avec les clés internes ET les labels textuels
 * Priorité : Fond > Cœur > Tête
 */
export const classifyPerfume = (
  notes_tete: string[] = [],
  notes_coeur: string[] = [],
  notes_fond: string[] = []
): OlfactoryFamily[] => {
  const families: Set<OlfactoryFamily> = new Set();

  // Combiner toutes les notes avec priorité Fond > Cœur > Tête
  // Normalise en minuscules pour correspondre avec les clés et les labels
  const allNotes = [...notes_fond, ...notes_coeur, ...notes_tete].map(n => n.toLowerCase());

  // Floral
  const floralKeywords = [
    'rose', 'jasmin', 'iris', 'tuberose', 'tubéreuse', 'pivoine', 'magnolia', 'freesia',
    'rose_mai', 'rose_damascena', 'jasmin_sambac', 'jasmin_espagne', 'iris_toscane',
    'fleur d\'oranger', 'ylang', 'géranium', 'geranium', 'gardénia', 'gardenia',
    'violette', 'cyclamen', 'muguet', 'fleur de lys', 'néroli', 'neroli',
  ];
  if (allNotes.some(n => floralKeywords.some(k => n.includes(k)))) {
    families.add('Floral');
  }

  // Boisé
  const boiseKeywords = [
    'santal', 'cèdre', 'cedre', 'vétiver', 'vetiver', 'oud', 'patchouli', 'mousse de chêne',
    'bois_santal', 'cedre_atlas', 'cedre_virginie', 'vetiver_haiti', 'mousse_chene',
    'bois de santal', 'bois',
  ];
  if (allNotes.some(n => boiseKeywords.some(k => n.includes(k)))) {
    families.add('Boisé');
  }

  // Gourmand
  const gourmandKeywords = [
    'vanille', 'caramel', 'chocolat', 'praliné', 'praline', 'miel', 'fève tonka', 'feve_tonka',
    'vanille_bourbon', 'gousse_vanille', 'chocolat_noir', 'café', 'cafe', 'noix de coco', 'tonka',
  ];
  if (allNotes.some(n => gourmandKeywords.some(k => n.includes(k)))) {
    families.add('Gourmand');
  }

  // Oriental/Ambré
  const orientalKeywords = [
    'ambre', 'encens', 'myrrhe', 'benjoin', 'musc', 'ciste', 'labdanum',
    'ambre_gris', 'ambre_jaune', 'musc_blanc', 'ciste_labdanum',
  ];
  if (allNotes.some(n => orientalKeywords.some(k => n.includes(k)))) {
    families.add('Oriental');
  }

  // Épicé
  const epiceKeywords = [
    'poivre', 'cannelle', 'cardamome', 'safran', 'girofle', 'muscade', 'gingembre',
    'poivre_rose', 'clou_girofle',
  ];
  if (allNotes.some(n => epiceKeywords.some(k => n.includes(k)))) {
    families.add('Épicé');
  }

  // Cuiré
  const cuireKeywords = [
    'cuir', 'daim', 'tabac', 'suede',
    'tabac_blond', 'castorium', 'civette',
  ];
  if (allNotes.some(n => cuireKeywords.some(k => n.includes(k)))) {
    families.add('Cuiré');
  }

  // Frais/Aquatique
  const fraisKeywords = [
    'marin', 'calone', 'menthe', 'aldéhyde', 'aldehyde', 'pomme verte',
    'accord_marin', 'menthe_poivree', 'aldehydes', 'pomme_verte',
    'citron', 'bergamote', 'mandarine', 'pamplemousse', 'lime', 'yuzu',
    'verveine', 'citronnelle', 'lavande', 'rhubarbe',
  ];
  if (allNotes.some(n => fraisKeywords.some(k => n.includes(k)))) {
    families.add('Frais/Aquatique');
  }

  // Si aucune famille détectée, retourner "Floral" par défaut
  return families.size > 0 ? Array.from(families) : ['Floral'];
};

/**
 * Utilitaires pour récupérer les libellés
 */
export const getNoteLabel = (
  noteKey: string,
  pyramid: 'tete' | 'coeur' | 'fond'
): string => {
  const dict = OLFACTORY_DICTIONARY[pyramid] as Record<string, string>;
  return dict[noteKey] || noteKey;
};

export const getAllNotesFlat = () => {
  return {
    tete: Object.entries(OLFACTORY_DICTIONARY.tete).map(([key, label]) => ({ key, label })),
    coeur: Object.entries(OLFACTORY_DICTIONARY.coeur).map(([key, label]) => ({ key, label })),
    fond: Object.entries(OLFACTORY_DICTIONARY.fond).map(([key, label]) => ({ key, label })),
  };
};

// Get note IDs (keys) as arrays for iteration
export const getTeteNoteIds = (): TeteNote[] =>
  Object.keys(OLFACTORY_DICTIONARY.tete) as TeteNote[];

export const getCoeurNoteIds = (): CoeurNote[] =>
  Object.keys(OLFACTORY_DICTIONARY.coeur) as CoeurNote[];

export const getFondNoteIds = (): FondNote[] =>
  Object.keys(OLFACTORY_DICTIONARY.fond) as FondNote[];

// ============================================================================
// SCORING : MEILLEURE FAMILLE UNIQUE
// ============================================================================

interface FamilyRule {
  family: OlfactoryFamily;
  keywords: string[];
}

const FAMILY_RULES: FamilyRule[] = [
  {
    family: 'Floral',
    keywords: [
      'rose', 'jasmin', 'iris', 'tuberose', 'tubéreuse', 'pivoine', 'magnolia', 'freesia',
      'fleur d\'oranger', 'ylang', 'géranium', 'geranium', 'gardénia', 'gardenia',
      'violette', 'cyclamen', 'muguet', 'fleur de lys', 'néroli', 'neroli',
    ],
  },
  {
    family: 'Boisé',
    keywords: [
      'santal', 'cèdre', 'cedre', 'vétiver', 'vetiver', 'oud', 'patchouli',
      'mousse de chêne', 'mousse_chene', 'bois',
    ],
  },
  {
    family: 'Gourmand',
    keywords: [
      'vanille', 'caramel', 'chocolat', 'praliné', 'praline', 'miel',
      'fève tonka', 'tonka', 'café', 'cafe', 'noix de coco',
    ],
  },
  {
    family: 'Oriental',
    keywords: [
      'ambre', 'encens', 'myrrhe', 'benjoin', 'musc', 'ciste', 'labdanum',
    ],
  },
  {
    family: 'Épicé',
    keywords: [
      'poivre', 'cannelle', 'cardamome', 'safran', 'girofle', 'muscade', 'gingembre',
    ],
  },
  {
    family: 'Cuiré',
    keywords: [
      'cuir', 'daim', 'tabac', 'suede', 'castorium', 'civette',
    ],
  },
  {
    family: 'Frais/Aquatique',
    keywords: [
      'marin', 'calone', 'menthe', 'aldéhyde', 'aldehyde', 'pomme verte',
      'citron', 'bergamote', 'mandarine', 'pamplemousse', 'lime', 'yuzu',
      'verveine', 'citronnelle', 'lavande', 'rhubarbe',
    ],
  },
];

/**
 * Retourne la famille olfactive unique la plus représentative des notes du produit.
 * Pondération : note de Fond = 3, Cœur = 2, Tête = 1.
 * En cas d'égalité, l'ordre de FAMILY_RULES sert de tiebreaker.
 */
export const getBestFamily = (
  notes_tete: string[] = [],
  notes_coeur: string[] = [],
  notes_fond: string[] = [],
  existingFamilies: OlfactoryFamily[] = [],
): OlfactoryFamily | null => {
  // Si le produit n'a qu'une seule famille déclarée, la retourner directement
  const validExisting = existingFamilies.filter(f =>
    (FAMILY_RULES.map(r => r.family) as string[]).includes(f)
  );
  if (validExisting.length === 1) return validExisting[0];

  // Notes pondérées : (label normalisé, poids)
  const weighted: { label: string; weight: number }[] = [
    ...notes_fond.map(n => ({ label: n.toLowerCase(), weight: 3 })),
    ...notes_coeur.map(n => ({ label: n.toLowerCase(), weight: 2 })),
    ...notes_tete.map(n => ({ label: n.toLowerCase(), weight: 1 })),
  ];

  if (weighted.length === 0 && validExisting.length > 0) return validExisting[0];
  if (weighted.length === 0) return null;

  // Calcul de score pour chaque famille
  const scores = FAMILY_RULES.map(rule => {
    let score = 0;
    for (const { label, weight } of weighted) {
      if (rule.keywords.some(k => label.includes(k))) {
        score += weight;
      }
    }
    // Bonus léger si la famille figure dans `existingFamilies`
    if (validExisting.includes(rule.family)) score += 0.5;
    return { family: rule.family, score };
  });

  // Trier par score décroissant (l'ordre initial sert de tiebreaker stable)
  scores.sort((a, b) => b.score - a.score);

  return scores[0].score > 0 ? scores[0].family : (validExisting[0] || null);
};

/**
 * Retourne les familles triées par score décroissant (maxItems optionnel)
 */
export const getTopFamilies = (
  notes_tete: string[] = [],
  notes_coeur: string[] = [],
  notes_fond: string[] = [],
  existingFamilies: OlfactoryFamily[] = [],
  maxItems: number = 3,
): OlfactoryFamily[] => {
  const validExisting = existingFamilies.filter(f =>
    (FAMILY_RULES.map(r => r.family) as string[]).includes(f)
  );

  const weighted: { label: string; weight: number }[] = [
    ...notes_fond.map(n => ({ label: n.toLowerCase(), weight: 3 })),
    ...notes_coeur.map(n => ({ label: n.toLowerCase(), weight: 2 })),
    ...notes_tete.map(n => ({ label: n.toLowerCase(), weight: 1 })),
  ];

  // If no notes, return existingFamilies (limited)
  if (weighted.length === 0) return validExisting.slice(0, maxItems);

  const scores = FAMILY_RULES.map(rule => {
    let score = 0;
    for (const { label, weight } of weighted) {
      if (rule.keywords.some(k => label.includes(k))) score += weight;
    }
    if (validExisting.includes(rule.family)) score += 0.5;
    return { family: rule.family, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const result = scores.filter(s => s.score > 0).map(s => s.family);
  // Fallback to validExisting or Floral
  if (result.length === 0) return (validExisting.length ? validExisting : ['Floral']).slice(0, maxItems);
  return result.slice(0, maxItems);
};

