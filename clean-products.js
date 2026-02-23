#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ibkcaxatevlfvtedeqrv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlia2NheGF0ZXZsZnZ0ZWRlcXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUxMjUyMiwiZXhwIjoyMDg2MDg4NTIyfQ.Vlp_d-7X-xke14aA2jt3LKbTyZDX4tnSKBQVTwvThIU';

console.log('\n════════════════════════════════════════════════════════════');
console.log('  🗑️  NETTOYAGE - SUPPRESSION DE TOUS LES PRODUITS');
console.log('════════════════════════════════════════════════════════════\n');

async function cleanDatabase() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Récupérer tous les produits
    console.log('📊 Récupération de tous les produits...');
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('id');
    
    if (fetchError) {
      console.error('❌ Erreur:', fetchError.message);
      return;
    }
    
    console.log(`📦 Total: ${allProducts.length} produits trouvés\n`);
    console.log('🗑️  Suppression en cours...');
    
    // Supprimer par lot de 10
    let deleted = 0;
    for (let i = 0; i < allProducts.length; i += 10) {
      const batch = allProducts.slice(i, i + 10);
      const ids = batch.map(p => p.id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);
      
      if (!error) {
        deleted += batch.length;
      }
    }
    
    console.log(`\n✅ ${deleted} produits supprimés!`);
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  Maintenant, insérez les 21 produits avec: node reset-products.js');
    console.log('════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

cleanDatabase();
