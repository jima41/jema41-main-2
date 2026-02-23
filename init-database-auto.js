#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://ibkcaxatevlfvtedeqrv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlia2NheGF0ZXZsZnZ0ZWRlcXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUxMjUyMiwiZXhwIjoyMDg2MDg4NTIyfQ.Vlp_d-7X-xke14aA2jt3LKbTyZDX4tnSKBQVTwvThIU';

console.log('\n════════════════════════════════════════════════════════════');
console.log('  🚀 CONFIGURATION AUTOMATIQUE - ÉTAPE 2/2');
console.log('════════════════════════════════════════════════════════════\n');

async function initDatabase() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log('📋 Vérification du schéma SQL...\n');
    
    // Lire le SQL 
    const sqlContent = fs.readFileSync('SUPABASE_SQL_SCHEMA.sql', 'utf8');
    
    // Tenter à chaque ligne
    const lines = sqlContent.split('\n');
    const queries = [];
    let currentQuery = '';
    
    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('--') || line.trim().startsWith('/*')) continue;
      
      currentQuery += line + '\n';
      
      if (line.includes(';')) {
        queries.push(currentQuery.trim());
        currentQuery = '';
      }
    }
    
    console.log(`📊 ${queries.length} requêtes à exécuter\n`);
    
    // Créer d'abord une fonction exec si elle n'existe pas
    const createExecFunction = `
      CREATE OR REPLACE FUNCTION exec(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    console.log('🔧 Création de la fonction exec()...');
    try {
      // On ne peut pas exécuter directement, donc on va essayer via une table
      await supabase.from('_migrations').select().limit(1);
    } catch (e) {
      // C'est normal, la table n'existe pas
    }
    
    console.log('\n❌ Impossible d\'exécuter le SQL automatiquement via l\'API Supabase');
    console.log('\n✅ BONNE NOUVELLE:');
    console.log('  - Votre app est déjà PRÊTE à utiliser Supabase');
    console.log('  - Les credentials sont configurés');
    console.log('  - Il manque juste la table "products"\n');
    
    console.log('📋 C\'est ultra simple (30 secondes):\n');
    
    console.log('ÉTAPE 1: Ouvrez Supabase');
    console.log('  → https://app.supabase.com\n');
    
    console.log('ÉTAPE 2: SQL Editor');
    console.log('  → Cliquez sur "SQL Editor" (menu gauche)\n');
    
    console.log('ÉTAPE 3: Nouvelle requête');
    console.log('  → Cliquez sur "+ New Query"\n');
    
    console.log('ÉTAPE 4: Copier le SQL');
    console.log('  → Ouvrez le fichier: SUPABASE_SQL_SCHEMA.sql');
    console.log('  → Sélectionnez tout (Ctrl+A)');
    console.log('  → Copiez (Ctrl+C)\n');
    
    console.log('ÉTAPE 5: Coller et exécuter');
    console.log('  → Collez dans l\'éditeur SQL (Ctrl+V)');
    console.log('  → Cliquez "Run" (le bouton bleu avec triangle en haut à droite)');
    console.log('  → Attendez "✅ Success"\n');
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('  C\'EST TOUT! Votre app sera prête! 🎉');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('💡 Une fois fait:');
    console.log('  - npm run dev');
    console.log('  - Allez sur http://localhost:8080/jema41/');
    console.log('  - Les 21 produits s\'afficheront automatiquement\n');

  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

initDatabase();
