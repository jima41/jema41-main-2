#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://ibkcaxatevlfvtedeqrv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlia2NheGF0ZXZsZnZ0ZWRlcXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUxMjUyMiwiZXhwIjoyMDg2MDg4NTIyfQ.Vlp_d-7X-xke14aA2jt3LKbTyZDX4tnSKBQVTwvThIU';

console.log('\n════════════════════════════════════════════════════════════');
console.log('  🗄️  EXÉCUTION DU SCHÉMA SQL DANS SUPABASE');
console.log('════════════════════════════════════════════════════════════\n');

async function executeSql() {
  try {
    console.log('📖 Lecture du fichier SQL...');
    const sqlContent = fs.readFileSync('SUPABASE_SQL_SCHEMA.sql', 'utf8');
    
    console.log('🔗 Connexion à Supabase (avec service_role)...');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log('⏳ Exécution du script SQL...\n');
    
    // Diviser le SQL en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('/*'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (!query || query.length < 5) continue;
      
      try {
        // Utiliser rpc pour exécuter du SQL personnalisé
        const result = await supabase.rpc('exec', { sql: query });
        
        if (result.error) {
          // Si c'est une erreur "existe déjà", ce n'est pas grave
          if (result.error.message.includes('already exists') || 
              result.error.message.includes('CREATE TYPE') ||
              result.error.message.includes('duplicate')) {
            console.log(`  ℹ️  Étape ${i + 1}: Type/Table trouvée (déjà créée)`);
          } else {
            console.log(`  ⚠️  Étape ${i + 1}: ${result.error.message || result.error}`);
          }
          errorCount++;
        } else {
          console.log(`  ✅ Étape ${i + 1}: Succès`);
          successCount++;
        }
      } catch (error) {
        // La fonction exec n'existe peut-être pas, ou c'est une erreur de syntaxe
        if (error.message && error.message.includes('Unknown')) {
          console.log(`  ℹ️  Étape ${i + 1}: À exécuter manuellement`);
        } else {
          console.log(`  ⚠️  Étape ${i + 1}: ${error.message || error}`);
        }
        errorCount++;
      }
    }

    console.log(`\n📊 Résumé: ${successCount} réussies, ${errorCount} à vérifier`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Vous devez vérifier manuellement:');
      console.log('1. Aller à: https://app.supabase.com → Votre projet');
      console.log('2. Cliquer sur "Table Editor"');
      console.log('3. Vérifier que la table "products" existe\n');
    } else {
      console.log('\n✅ Toutes les requêtes SQL ont été exécutées!\n');
    }

    return true;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n⚠️  Vous devez exécuter le SQL manuellement:');
    console.log('1. Aller à: https://app.supabase.com → Votre projet');
    console.log('2. Cliquer sur "SQL Editor"');
    console.log('3. Cliquer sur "New Query"');
    console.log('4. Copier-coller le contenu de: SUPABASE_SQL_SCHEMA.sql');
    console.log('5. Cliquer "Run"\n');
    return false;
  }
}

executeSql().then(success => {
  if (success) {
    console.log('✅ Opération complétée!\n');
    process.exit(0);
  } else {
    console.log('❌ Exécution manuelle requise.\n');
    process.exit(1);
  }
});
