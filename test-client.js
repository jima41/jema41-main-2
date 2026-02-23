#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ibkcaxatevlfvtedeqrv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlia2NheGF0ZXZsZnZ0ZWRlcXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTI1MjIsImV4cCI6MjA4NjA4ODUyMn0.7s7O4VMnN66r1cJGqp8J8A-ztflzcwqy68d9czWnL6g';

console.log('\n════════════════════════════════════════════════════════════');
console.log('  🔍 TEST CLIENT SUPABASE (MÊME CREDENTIALS QUE L\'APP)');
console.log('════════════════════════════════════════════════════════════\n');

async function testClient() {
  try {
    console.log('🔧 Création du client Supabase (comme dans l\'app)...');
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log(`   Key: ${ANON_KEY.substring(0, 20)}...`);
    
    const supabase = createClient(SUPABASE_URL, ANON_KEY);
    
    console.log('\n🔗 Appel fetch des produits...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('\n❌ ERREUR SUPABASE:');
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      return false;
    }
    
    if (!data) {
      console.error('\n❌ Pas de données reçues du tout!');
      return false;
    }
    
    console.log(`\n✅ SUCCÈS! ${data.length} produits reçus`);
    console.log('\n📦 Premiers produits:');
    data.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.brand}) - ${p.price}€`);
    });
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  ✅ LE CLIENT FONCTIONNE CORRECTEMENT!');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log('⚠️  Si les produits ne s\'affichent PAS dans l\'app:');
    console.log('   1. Vérifiez que Vite a rechargé les variables d\'env');
    console.log('   2. Rechargez la page (Ctrl+F5)');
    console.log('   3. Vérifiez la console du navigateur (F12)\n');
    
    return true;

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('\nStack:', error.stack);
    return false;
  }
}

testClient();
