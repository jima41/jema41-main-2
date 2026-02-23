#!/usr/bin/env node

/**
 * 🚀 RAYHA STORE - SUPABASE SETUP WIZARD
 * 
 * Script d'installation automatisé pour configurer Supabase
 * Pas besoin de notion - tout est automatisé!
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${colors.blue}? ${prompt}${colors.reset}\n> `, resolve);
  });
}

async function main() {
  log('\n════════════════════════════════════════════════════════════', 'blue');
  log('    🌸 RAYHA STORE - SUPABASE SETUP WIZARD', 'bright');
  log('════════════════════════════════════════════════════════════\n', 'blue');

  log('Ce script va configurer Supabase pour votre application.', 'yellow');
  log('Aucune notion requise - suivez juste les instructions!\n', 'yellow');

  // ============================================================================
  // STEP 1: Vérifier que les fichiers existent
  // ============================================================================
  log('📋 ÉTAPE 1: Vérification des fichiers...', 'bright');

  const requiredFiles = [
    'src/integrations/supabase/supabase.ts',
    'src/store/useAdminStore.ts',
    'SUPABASE_SQL_SCHEMA.sql',
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - MANQUANT!`, 'red');
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    log('\n⚠️  Fichiers manquants! Assurez-vous que la migration est complète.', 'red');
    process.exit(1);
  }

  log('\n✅ Tous les fichiers sont présents!\n', 'green');

  // ============================================================================
  // STEP 2: Obtenir les clés API
  // ============================================================================
  log('🔑 ÉTAPE 2: Configuration des clés API', 'bright');
  log(`
Vous devez créer un projet Supabase et obtenir 2 clés simples:

  1. Allez sur: https://supabase.com/dashboard
  2. Créez un nouveau projet (moins d'1 minute)
  3. Allez à Settings → API
  4. Copiez les 2 clés ci-dessous

`, 'yellow');

  const supabaseUrl = await question('Collez votre SUPABASE_URL (https://xxx.supabase.co)');
  const supabaseKey = await question('Collez votre SUPABASE_PUBLISHABLE_KEY (eyJhbG...)');

  if (!supabaseUrl || !supabaseKey) {
    log('\n❌ Les clés API sont requises!', 'red');
    process.exit(1);
  }

  log('\n✅ Clés reçues!\n', 'green');

  // ============================================================================
  // STEP 3: Créer le .env.local
  // ============================================================================
  log('⚙️  ÉTAPE 3: Création du fichier .env.local...', 'bright');

  const envContent = `# =====================================================
# SUPABASE CONFIGURATION
# Ne PAS committer ce fichier!
# =====================================================

VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${supabaseKey}

# ✅ Fichier créé le: ${new Date().toLocaleString('fr-FR')}
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    log('  ✅ .env.local créé avec succès', 'green');
  } catch (error) {
    log(`  ❌ Erreur: ${error.message}`, 'red');
    process.exit(1);
  }

  // ============================================================================
  // STEP 4: Tester la connexion
  // ============================================================================
  log('\n🔗 ÉTAPE 4: Test de connexion à Supabase...', 'bright');

  try {
    const testClient = createClient(supabaseUrl, supabaseKey);
    
    // Test simple
    const { error } = await testClient.from('products').select('count()', { count: 'exact' }).limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = table not found, c'est normal au début
      throw error;
    }

    log('  ✅ Connexion à Supabase réussie!', 'green');
  } catch (error) {
    log(`  ⚠️  Attention: ${error.message || error}`, 'yellow');
    log('  → Assurez-vous que votre projet Supabase est créé', 'yellow');
  }

  // ============================================================================
  // STEP 5: Instructions SQL
  // ============================================================================
  log('\n📊 ÉTAPE 5: Créer la table produits dans Supabase', 'bright');
  log(`
IMPORTANT: Vous devez exécuter le script SQL dans Supabase:

  1. Allez à: https://app.supabase.com → Votre projet
  2. Cliquez sur "SQL Editor"
  3. Cliquez sur "New Query"
  4. Copiez TOUT le contenu du fichier: SUPABASE_SQL_SCHEMA.sql
  5. Collez dans l'éditeur SQL
  6. Cliquez sur "Run"
  7. Attendez que ce soit bleu ✅

Vous pouvez copier le fichier SQL ici:
  📁 SUPABASE_SQL_SCHEMA.sql
`, 'yellow');

  const sqlDone = await question('Avez-vous exécuté le script SQL dans Supabase? (oui/non)');
  
  if (sqlDone.toLowerCase() !== 'oui' && sqlDone.toLowerCase() !== 'yes' && sqlDone.toLowerCase() !== 'y') {
    log('\n⏸️  Vous pouvez l\'exécuter plus tard. Continuez avec: npm run dev', 'yellow');
  } else {
    log('\n✅ Parfait! La table est créée!\n', 'green');
  }

  // ============================================================================
  // STEP 6: Importer les produits (optionnel)
  // ============================================================================
  log('📦 ÉTAPE 6: Importer les 21 produits existants (optionnel)', 'bright');
  log(`
Voulez-vous importer automatiquement les 21 produits existants?
(Cela vous fera gagner du temps)
`, 'yellow');

  const importProducts = await question('Importer les produits? (oui/non)');
  
  if (importProducts.toLowerCase() === 'oui' || importProducts.toLowerCase() === 'yes' || importProducts.toLowerCase() === 'y') {
    log('\n⏳ Génération du script d\'import...', 'bright');
    
    // Charger les produits par défaut
    try {
      // Créer un script SQL directement sans charger les produits
      
      const importSQL = fs.readFileSync('SUPABASE_SQL_SCHEMA.sql', 'utf8');
      const insertSection = importSQL.match(/\/\*([\s\S]*?)\*\//)[1];
      
      if (insertSection && insertSection.includes('INSERT')) {
        log('\n📋 Script d\'import prêt! Exécutez dans Supabase SQL Editor:', 'yellow');
        log('\n------- DÉBUT DU SCRIPT -------\n', 'yellow');
        log(insertSection, 'blue');
        log('\n------- FIN DU SCRIPT -------\n', 'yellow');
        
        log('Colllez ce script dans SQL Editor et exécutez-le', 'yellow');
      }
    } catch (error) {
      log(`  ℹ️  Allez dans SUPABASE_SQL_SCHEMA.sql et décommentez la section INSERT`, 'yellow');
    }
  }

  // ============================================================================
  // FINAL: Résumé
  // ============================================================================
  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ✅ CONFIGURATION COMPLÈTE!', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');

  log('Prochaines étapes:', 'bright');
  log('  1. ✅ .env.local créé avec vos clés API', 'green');
  log('  2. ⏳ Exécutez le script SQL dans Supabase (si pas fait)', 'yellow');
  log('  3. 🚀 Démarrez l\'app: npm run dev', 'blue');
  log('  4. 🧪 Testez dans le panneau Admin\n', 'blue');

  log('En cas de problème:', 'bright');
  log('  📖 Consultez: MIGRATION_SUPABASE.md', 'yellow');
  log('  🔧 Fichier config: .env.local', 'yellow');
  log('  📋 Schéma SQL: SUPABASE_SQL_SCHEMA.sql\n', 'yellow');

  log('Bon développement avec Supabase! 🎉\n', 'green');

  rl.close();
}

// Run
main().catch((error) => {
  log(`\n❌ Erreur: ${error.message}`, 'red');
  process.exit(1);
});
