#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ibkcaxatevlfvtedeqrv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlia2NheGF0ZXZsZnZ0ZWRlcXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUxMjUyMiwiZXhwIjoyMDg2MDg4NTIyfQ.Vlp_d-7X-xke14aA2jt3LKbTyZDX4tnSKBQVTwvThIU';

console.log('\n════════════════════════════════════════════════════════════');
console.log('  🗑️  SUPPRESSION & RÉINSERTION DES PRODUITS');
console.log('════════════════════════════════════════════════════════════\n');

async function cleanAndInsertProducts() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // ========== SUPPRIMER TOUS LES PRODUITS
    console.log('🗑️  Suppression des produits existants...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .gt('id', '');
    
    if (deleteError) {
      console.log(`⚠️  Erreur de suppression: ${deleteError.message}`);
    } else {
      console.log('✅ Produits supprimés\n');
    }
    
    // ========== RÉINSÉRER TOUS LES PRODUITS
    console.log('⏳ Insertion des 21 produits...\n');
    
    const products = [
      { name: 'Éclat Doré', brand: 'Maison Rayha', price: 129.00, description: 'Un parfum enveloppant qui combine les notes sucrées de la vanille avec des touches de caramel.', families: ['Gourmand'], stock: 50, volume: '50ml', category: 'femme', scent: 'Gourmand' },
      { name: 'Rose Éternelle', brand: 'Atelier Noble', price: 145.00, description: 'Une célébration de la rose dans toute sa splendeur.', families: ['Floral'], stock: 35, volume: '50ml', category: 'femme', scent: 'Floral' },
      { name: 'Nuit Mystique', brand: 'Le Parfumeur', price: 98.00, description: 'Un parfum profond et enveloppant aux accents boisés.', families: ['Boisé'], stock: 60, volume: '100ml', category: 'homme', scent: 'Boisé' },
      { name: 'Ambre Sauvage', brand: 'Maison Rayha', price: 175.00, description: 'Une fragrance orientale mystérieuse et séductive.', families: ['Oriental','Épicé'], stock: 25, volume: '75ml', category: 'unisex', scent: 'Oriental' },
      { name: 'Oud Royal', brand: 'Collection Privée', price: 220.00, description: 'Le nec plus ultra du luxe olfactif avec un oud noble et raffiné.', families: ['Oriental'], stock: 15, volume: '50ml', category: 'unisex', scent: 'Oriental' },
      { name: 'Brise Marine', brand: 'Atelier Noble', price: 89.00, description: 'Une fragrance vivifiante et tonique qui capture l\'essence de l\'océan.', families: ['Frais/Aquatique'], stock: 70, volume: '100ml', category: 'homme', scent: 'Frais' },
      { name: 'Velours Noir', brand: 'Maison Rayha', price: 165.00, description: 'Une fragrance sensuelle et enveloppante qui capture l\'élégance et le mystère.', families: ['Oriental'], stock: 30, volume: '50ml', category: 'femme', scent: 'Oriental' },
      { name: 'Cristal Infini', brand: 'Essences Royales', price: 195.00, description: 'Une création florale cristalline qui scintille sur la peau.', families: ['Floral'], stock: 20, volume: '50ml', category: 'femme', scent: 'Floral' },
      { name: 'Symphonie Épicée', brand: 'Le Parfumeur', price: 142.00, description: 'Une composition épicée et harmonieuse qui évoque l\'exotisme.', families: ['Épicé','Boisé'], stock: 40, volume: '100ml', category: 'homme', scent: 'Épicé' },
      { name: 'Jardin Secret', brand: 'Atelier Nature', price: 135.00, description: 'Un parfum qui révèle les secrets d\'un jardin caché.', families: ['Floral'], stock: 45, volume: '75ml', category: 'femme', scent: 'Floral' },
      { name: 'Fumée d\'Encens', brand: 'Collection Rare', price: 210.00, description: 'Une fragrance mystique inspirée par l\'encens sacré.', families: ['Boisé','Épicé'], stock: 18, volume: '60ml', category: 'unisex', scent: 'Boisé' },
      { name: 'Harmonie Douce', brand: 'Maison Rayha', price: 118.00, description: 'Un parfum gourmand et harmonieux qui séduit par sa douceur.', families: ['Gourmand'], stock: 55, volume: '50ml', category: 'femme', scent: 'Gourmand' },
      { name: 'Forêt Profonde', brand: 'Atelier Noble', price: 155.00, description: 'Plongez dans les profondeurs d\'une forêt ancestrale.', families: ['Boisé'], stock: 38, volume: '100ml', category: 'homme', scent: 'Boisé' },
      { name: 'Essence Citée', brand: 'Le Parfumeur', price: 125.00, description: 'L\'essence urbaine capturée dans un flacon.', families: ['Frais/Aquatique','Épicé'], stock: 65, volume: '75ml', category: 'unisex', scent: 'Frais' },
      { name: 'Ballet Floral', brand: 'Essences Royales', price: 148.00, description: 'Un ballet de fleurs qui dansent sur la peau.', families: ['Floral'], stock: 32, volume: '50ml', category: 'femme', scent: 'Floral' },
      { name: 'Esprit Viril', brand: 'Maison Rayha', price: 152.00, description: 'Une fragrance masculine qui incarne la force et l\'assurance.', families: ['Boisé','Épicé'], stock: 42, volume: '100ml', category: 'homme', scent: 'Boisé' },
      { name: 'Plaisir Sucré', brand: 'Atelier Nature', price: 112.00, description: 'Une pause gourmande sur la peau.', families: ['Gourmand'], stock: 48, volume: '50ml', category: 'femme', scent: 'Gourmand' },
      { name: 'Mystère Bleu', brand: 'Collection Rare', price: 180.00, description: 'Le mystère de l\'océan profond capturé en fragrance.', families: ['Frais/Aquatique'], stock: 22, volume: '75ml', category: 'unisex', scent: 'Frais' },
      { name: 'Passion Orientale', brand: 'Essences Royales', price: 170.00, description: 'Une fragrance exotique et passionnée qui évoque les soirées envoûtantes.', families: ['Oriental','Épicé'], stock: 28, volume: '50ml', category: 'femme', scent: 'Oriental' },
      { name: 'Écho Minéral', brand: 'Le Parfumeur', price: 138.00, description: 'Une fragrance minérale et épicée inspirée par la géologie.', families: ['Épicé','Boisé'], stock: 50, volume: '100ml', category: 'homme', scent: 'Épicé' },
      { name: 'Aurore Douce', brand: 'Atelier Noble', price: 128.00, description: 'Capturez la douceur de l\'aurore avec des notes florales matinales.', families: ['Floral'], stock: 52, volume: '50ml', category: 'femme', scent: 'Floral' },
    ];
    
    let successCount = 0;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const { error } = await supabase
        .from('products')
        .insert({
          name: p.name,
          brand: p.brand,
          price: p.price,
          description: p.description,
          image_url: `https://images.unsplash.com/photo-${1594998629526 + i}?w=500&h=600&fit=crop`,
          families: p.families,
          stock: p.stock,
          volume: p.volume,
          category: p.category,
          scent: p.scent,
          notes_tete: [],
          notes_coeur: [],
          notes_fond: [],
        });
      
      if (!error) {
        console.log(`  ✅ ${i + 1}. ${p.name}`);
        successCount++;
      } else {
        console.log(`  ❌ ${p.name}: ${error.message}`);
      }
    }
    
    console.log(`\n════════════════════════════════════════════════════════════`);
    console.log(`✅ ${successCount}/${products.length} produits insérés avec succès!`);
    console.log(`════════════════════════════════════════════════════════════\n`);
    
    console.log('🔄 Rafraîchissez votre page (F5) pour voir les 21 produits!');
    console.log('⏳ Attendez 2-3 secondes pour la synchronisation temps réel.\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

cleanAndInsertProducts();
