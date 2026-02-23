import perfume1 from '@/assets/perfume-1.jpg';
import perfume2 from '@/assets/perfume-2.jpg';
import perfume3 from '@/assets/perfume-3.jpg';
import perfume4 from '@/assets/perfume-4.jpg';
import perfume5 from '@/assets/perfume-5.jpg';
import perfume6 from '@/assets/perfume-6.jpg';
import perfume7 from '@/assets/perfume-7.jpg';
import perfume8 from '@/assets/perfume-8.jpg';
import perfume9 from '@/assets/perfume-9.jpg';
import perfume10 from '@/assets/perfume-10.jpg';
import perfume11 from '@/assets/perfume-11.jpg';
import perfume12 from '@/assets/perfume-12.jpg';
import perfume13 from '@/assets/perfume-13.jpg';
import perfume14 from '@/assets/perfume-14.jpg';
import perfume15 from '@/assets/perfume-15.jpg';
import perfume16 from '@/assets/perfume-16.jpg';
import perfume17 from '@/assets/perfume-17.jpg';
import perfume18 from '@/assets/perfume-18.jpg';
import perfume19 from '@/assets/perfume-19.jpg';
import perfume20 from '@/assets/perfume-20.jpg';
import perfume21 from '@/assets/perfume-21.jpg';

export type ProductGender = 'homme' | 'femme' | 'mixte';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  scent: string;
  category: string;
  gender?: ProductGender;
  description?: string;
  notes?: string[];
  volume?: string;
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Éclat Doré',
    brand: 'Maison Rayha',
    price: 129.00,
    image: perfume1,
    scent: 'Gourmand',
    category: 'femme',
    description: 'Un parfum enveloppant qui combine les notes sucrées de la vanille avec des touches de caramel. Éclat Doré est une fragrance intemporelle qui vous séduira à chaque port.',
    notes: ['Vanille', 'Caramel', 'Amande', 'Musc'],
    volume: '50ml',
  },
  {
    id: '2',
    name: 'Rose Éternelle',
    brand: 'Atelier Noble',
    price: 145.00,
    image: perfume2,
    scent: 'Floral',
    category: 'femme',
    description: 'Une célébration de la rose dans toute sa splendeur. Rose Éternelle capture l\'essence délicate de la fleur la plus noble, rehaussée par des notes de jasmin et de pivoine.',
    notes: ['Rose', 'Jasmin', 'Pivoine', 'Bois de santal'],
    volume: '50ml',
  },
  {
    id: '3',
    name: 'Nuit Mystique',
    brand: 'Le Parfumeur',
    price: 98.00,
    image: perfume3,
    scent: 'Boisé',
    category: 'homme',
    description: 'Un parfum profond et enveloppant aux accents boisés. Nuit Mystique révèle une personnalité complexe avec ses notes de cèdre, de vetiver et de cuir.',
    notes: ['Cèdre', 'Vetiver', 'Cuir', 'Musc'],
    volume: '100ml',
  },
  {
    id: '4',
    name: 'Ambre Sauvage',
    brand: 'Maison Rayha',
    price: 175.00,
    image: perfume4,
    scent: 'Oriental',
    category: 'unisex',
    description: 'Une fragrance orientale mystérieuse et séductive. Ambre Sauvage allie l\'ambre chaud aux épices exotiques pour créer une sillage envoûtant.',
    notes: ['Ambre', 'Épices', 'Oud', 'Bois d\'agarwood'],
    volume: '75ml',
  },
  {
    id: '5',
    name: 'Oud Royal',
    brand: 'Collection Privée',
    price: 220.00,
    image: perfume5,
    scent: 'Oriental',
    category: 'unisex',
    description: 'Le nec plus ultra du luxe olfactif. Oud Royal est une création exclusive avec un oud noble et raffiné, sublimé par des accords ambrés et floraux.',
    notes: ['Oud premium', 'Rose', 'Ambre', 'Safran'],
    volume: '50ml',
  },
  {
    id: '6',
    name: 'Brise Marine',
    brand: 'Atelier Noble',
    price: 89.00,
    image: perfume6,
    scent: 'Frais',
    category: 'homme',
    description: 'Une fragrance vivifiante et tonique qui capture l\'essence de l\'océan. Brise Marine offre un sillage frais et aérien, parfait pour tous les jours.',
    notes: ['Citron', 'Sel marin', 'Algues', 'Cédrat'],
    volume: '100ml',
  },
  {
    id: '7',
    name: 'Velours Noir',
    brand: 'Maison Rayha',
    price: 165.00,
    image: perfume7,
    scent: 'Oriental',
    category: 'femme',
    description: 'Une fragrance sensuelle et enveloppante qui capture l\'élégance et le mystère. Velours Noir offre une expérience sensorielle riche avec ses notes chaudes et complexes.',
    notes: ['Ambre', 'Vanille noire', 'Oud', 'Musc'],
    volume: '50ml',
  },
  {
    id: '8',
    name: 'Cristal Infini',
    brand: 'Essences Royales',
    price: 195.00,
    image: perfume8,
    scent: 'Floral',
    category: 'femme',
    description: 'Une création florale cristalline qui scintille sur la peau. Cristal Infini combine la délicatesse de l\'or blanc avec des notes florales sublimes pour un sillage éternel.',
    notes: ['Bergamote', 'Fleur de lotus', 'Muguet', 'Bois de santal'],
    volume: '50ml',
  },
  {
    id: '9',
    name: 'Symphonie Épicée',
    brand: 'Le Parfumeur',
    price: 142.00,
    image: perfume9,
    scent: 'Épicé',
    category: 'homme',
    description: 'Une composition épicée et harmonieuse qui évoque l\'exotisme. Symphonie Épicée joue une mélodie boisée rehaussée par des notes de girofle et de cannelle.',
    notes: ['Girofle', 'Cannelle', 'Cardamome', 'Bois de cèdre'],
    volume: '100ml',
  },
  {
    id: '10',
    name: 'Jardin Secret',
    brand: 'Atelier Nature',
    price: 135.00,
    image: perfume10,
    scent: 'Floral',
    category: 'femme',
    description: 'Un parfum qui révèle les secrets d\'un jardin caché. Jardin Secret enveloppe la peau avec des notes florales délicates et des touches herbacées apaisantes.',
    notes: ['Violette', 'Freesia', 'Feuille verte', 'Musk blanc'],
    volume: '75ml',
  },
  {
    id: '11',
    name: 'Fumée d\'Encens',
    brand: 'Collection Rare',
    price: 210.00,
    image: perfume11,
    scent: 'Boisé',
    category: 'unisex',
    description: 'Une fragrance mystique inspirée par l\'encens sacré. Fumée d\'Encens combine des notes boisées profondes avec des accords spicés pour une présence captivante.',
    notes: ['Encens', 'Cèdre', 'Poivre noir', 'Ambre'],
    volume: '60ml',
  },
  {
    id: '12',
    name: 'Harmonie Douce',
    brand: 'Maison Rayha',
    price: 118.00,
    image: perfume12,
    scent: 'Gourmand',
    category: 'femme',
    description: 'Un parfum gourmand et harmonieux qui séduit par sa douceur. Harmonie Douce offre un équilibre parfait entre sucre et finesse pour une journée ensoleillée.',
    notes: ['Miel', 'Noix de coco', 'Fleur d\'oranger', 'Tonka'],
    volume: '50ml',
  },
  {
    id: '13',
    name: 'Forêt Profonde',
    brand: 'Atelier Noble',
    price: 155.00,
    image: perfume13,
    scent: 'Boisé',
    category: 'homme',
    description: 'Plongez dans les profondeurs d\'une forêt anciennes. Forêt Profonde révèle des notes boisées massives avec une touche de mystère et d\'aventure.',
    notes: ['Bois de pin', 'Vetiver', 'Tabac', 'Terre mouillée'],
    volume: '100ml',
  },
  {
    id: '14',
    name: 'Essence Citée',
    brand: 'Le Parfumeur',
    price: 125.00,
    image: perfume14,
    scent: 'Frais/Aquatique',
    category: 'unisex',
    description: 'L\'essence urbaine capturée dans un flacon. Essence Citée offre une fraîcheur dynamique avec des notes toniques et aériennes, parfaite pour les esprits modernes.',
    notes: ['Citron', 'Gingembre', 'Petit grain', 'Musc minéral'],
    volume: '75ml',
  },
  {
    id: '15',
    name: 'Ballet Floral',
    brand: 'Essences Royales',
    price: 148.00,
    image: perfume15,
    scent: 'Floral',
    category: 'femme',
    description: 'Un ballet de fleurs qui dansent sur la peau. Ballet Floral est une symphonie florale élégante et poétique qui se déploie progressivement.',
    notes: ['Pivoine', 'Rose', 'Lilas', 'Bois blanc'],
    volume: '50ml',
  },
  {
    id: '16',
    name: 'Esprit Viril',
    brand: 'Maison Rayha',
    price: 152.00,
    image: perfume16,
    scent: 'Boisé',
    category: 'homme',
    description: 'Une fragrance masculine qui incarne la force et l\'assurance. Esprit Viril allie des notes boisées nobles avec une touche de pouvoir épicé.',
    notes: ['Bois de santal', 'Épices chaudes', 'Cuir', 'Ambre gris'],
    volume: '100ml',
  },
  {
    id: '17',
    name: 'Plaisir Sucré',
    brand: 'Atelier Nature',
    price: 112.00,
    image: perfume17,
    scent: 'Gourmand',
    category: 'femme',
    description: 'Une pause gourmande sur la peau. Plaisir Sucré célèbre les délices sucrés avec une note de caramel, amande et vanille pour un sillage réconfortant.',
    notes: ['Caramel', 'Amande', 'Vanille crémeuse', 'Musc doux'],
    volume: '50ml',
  },
  {
    id: '18',
    name: 'Mystère Bleu',
    brand: 'Collection Rare',
    price: 180.00,
    image: perfume18,
    scent: 'Frais/Aquatique',
    category: 'unisex',
    description: 'Le mystère de l\'océan profond capturé en fragrance. Mystère Bleu offre une fraîcheur cristalline avec des notes aqueuses et une profondeur captivante.',
    notes: ['Accord aquatique', 'Sauge bleue', 'Ambre gris', 'Cédrat'],
    volume: '75ml',
  },
  {
    id: '19',
    name: 'Passion Orientale',
    brand: 'Essences Royales',
    price: 170.00,
    image: perfume19,
    scent: 'Oriental',
    category: 'femme',
    description: 'Une fragrance exotique et passionnée qui évoque les soirées envoûtantes. Passion Orientale séduira avec ses notes ambrées chaudes et épicées.',
    notes: ['Oud lointain', 'Rose veloutée', 'Safran', 'Vanille orientale'],
    volume: '50ml',
  },
  {
    id: '20',
    name: 'Écho Minéral',
    brand: 'Le Parfumeur',
    price: 138.00,
    image: perfume20,
    scent: 'Épicé',
    category: 'homme',
    description: 'Une fragrance minérale et épicée inspirée par la géologie. Écho Minéral révèle des notes de pierre humide et de poivre pour une présence puissante.',
    notes: ['Pierre ponce', 'Poivre blanc', 'Cumin', 'Cèdre'],
    volume: '100ml',
  },
  {
    id: '21',
    name: 'Aurore Douce',
    brand: 'Atelier Noble',
    price: 128.00,
    image: perfume21,
    scent: 'Floral',
    category: 'femme',
    description: 'Capturez la douceur de l\'aurore. Aurore Douce est une fragrance légère et gracieuse avec des notes florales matinales et une touche de miel.',
    notes: ['Jasmin blanc', 'Lily of the valley', 'Miel doré', 'Bois blanc'],
    volume: '50ml',
  },
];
