#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { execSync } from 'child_process';

const SUPABASE_URL = 'https://ibkcaxatevlfvtedeqrv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imbia2NheGF0ZXZsZnZ0ZWRlcXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUxMjUyMiwiZXhwIjoyMDg2MDg4NTIyfQ.Vlp_d-7X-xke14aA2jt3LKbTyZDX4tnSKBQVTwvThIU';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlia2NheGF0ZXZsZnZ0ZWRlcXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTI1MjIsImV4cCI6MjA4NjA4ODUyMn0.7s7O4VMnN66r1cJGqp8J8A-ztflzcwqy68d9czWnL6g';

console.log('\n════════════════════════════════════════════════════════════');
console.log('  🗄️  EXÉCUTION DU SCHÉMA SQL DANS SUPABASE');
console.log('════════════════════════════════════════════════════════════\n');

async function executeSql() {
  try {
    console.log('📖 Lecture du fichier SQL...');
    let sqlContent = fs.readFileSync('SUPABASE_SQL_SCHEMA.sql', 'utf8');
    
    console.log('🔗 Connexion à Supabase (avec service_role)...');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log('⏳ Exécution du script SQL...\n');
    
    // Modifier les requêtes pour les exécuter directement
    // On va utiliser postgres RPC (qui nécessite une fonction existante)
    // Sinon, on les exécute manuellement
    
    // Extraire les requêtes importantes
    const createTypePatterns = [
      /CREATE TYPE olfactory_family[^;]+;/,
      /CREATE TYPE tete_note[^;]+;/,
      /CREATE TYPE coeur_note[^;]+;/,
      /CREATE TYPE fond_note[^;]+;/,
    ];
    
    // Essayer de créer chaque type
    let allSuccess = true;
    
    for (const pattern of createTypePatterns) {
      const match = sqlContent.match(pattern);
      if (match) {
        console.log(`🔻 Tentative: ${match[0].split('\n')[0]}...`);
        // On ne peut pas exécuter du SQL brut via REST API
        // Il faut le faire manuellement
        console.log(`⏸️  À faire manuellement dans Supabase SQL Editor`);
      }
    }
    
    console.log('\n⚠️  Supabase ne permet pas l\'exécution de SQL brut via l\'API');
    console.log('Vous devez le faire manuellement (ça prend 30 secondes):\n');
    
    printManualInstructions();
    return false;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    printManualInstructions();
    return false;
  }
}

function printManualInstructions() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  📋 EXÉCUTION MANUELLE (très simple!)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('1️⃣  Ouvrez: https://app.supabase.com');
  console.log('    → Cliquez sur votre projet\n');
  
  console.log('2️⃣  Dans le menu gauche, cliquez sur "SQL Editor"\n');
  
  console.log('3️⃣  Cliquez sur le bouton "+ New Query"\n');
  
  console.log('4️⃣  Copiez TOUT le code de: SUPABASE_SQL_SCHEMA.sql');
  console.log('    (Ctrl+A + Ctrl+C)\n');
  
  console.log('5️⃣  Collez dans l\'éditeur SQL');
  console.log('    (Ctrl+V)\n');
  
  console.log('6️⃣  Cliquez sur le bouton "Run" (triangle bleu en haut à droite)\n');
  
  console.log('7️⃣  Attendez que le message "✅ Success" s\'affiche');
  console.log('    (ça devrait être bleu et dire "Success")\n');
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  C\'EST TOUT! 🎉');
  console.log('═══════════════════════════════════════════════════════════\n');
}

executeSql().then(success => {
  if (!success) {
    process.exit(1);
  }
});
