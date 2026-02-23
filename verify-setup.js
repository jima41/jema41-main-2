#!/usr/bin/env node

/**
 * 🔍 Vérificateur de Configuration Supabase
 * Vérifie que tout est correctement configuré
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}═══ ${msg} ═══${colors.reset}`),
};

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function fileContains(filePath, text) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(text);
}

function checkEnvFile() {
  log.section('📋 Fichier .env.local');
  
  if (!fileExists('.env.local')) {
    log.error('.env.local n\'existe pas');
    log.info('Exécutez: npm run setup:supabase');
    return false;
  }

  log.success('.env.local existe');

  const env = fs.readFileSync('.env.local', 'utf8');
  const hasUrl = env.includes('VITE_SUPABASE_URL=');
  const hasKey = env.includes('VITE_SUPABASE_PUBLISHABLE_KEY=');

  if (hasUrl) {
    log.success('VITE_SUPABASE_URL configurée');
  } else {
    log.error('VITE_SUPABASE_URL manquante');
  }

  if (hasKey) {
    log.success('VITE_SUPABASE_PUBLISHABLE_KEY configurée');
  } else {
    log.error('VITE_SUPABASE_PUBLISHABLE_KEY manquante');
  }

  return hasUrl && hasKey;
}

function checkCodeFiles() {
  log.section('📁 Fichiers de Code');

  const files = [
    {
      path: 'src/integrations/supabase/supabase.ts',
      name: 'Configuration Supabase',
      must: true,
    },
    {
      path: 'src/store/useAdminStore.ts',
      name: 'Store Zustand Modifié',
      must: true,
    },
    {
      path: 'src/hooks/use-supabase-error.ts',
      name: 'Gestion d\'Erreurs Supabase',
      must: true,
    },
    {
      path: 'src/components/DataSyncInitializer.tsx',
      name: 'Initialisation des Données',
      must: true,
    },
  ];

  let allGood = true;

  for (const file of files) {
    if (fileExists(file.path)) {
      log.success(`${file.name}`);
    } else {
      const msg = `${file.name} manquant`;
      if (file.must) {
        log.error(msg);
        allGood = false;
      } else {
        log.warning(msg);
      }
    }
  }

  return allGood;
}

function checkSqlFile() {
  log.section('📊 Fichier SQL');

  if (!fileExists('SUPABASE_SQL_SCHEMA.sql')) {
    log.error('SUPABASE_SQL_SCHEMA.sql manquant');
    return false;
  }

  log.success('SUPABASE_SQL_SCHEMA.sql existe');

  const sql = fs.readFileSync('SUPABASE_SQL_SCHEMA.sql', 'utf8');

  const checks = [
    ['CREATE TYPE olfactory_family', 'Énumération olfactory_family'],
    ['CREATE TABLE IF NOT EXISTS products', 'Table products'],
    ['CREATE POLICY', 'Politiques RLS'],
    ['ALTER TABLE products ENABLE ROW LEVEL SECURITY', 'Row Level Security activée'],
  ];

  let allGood = true;
  for (const [text, name] of checks) {
    if (sql.includes(text)) {
      log.success(name);
    } else {
      log.error(name);
      allGood = false;
    }
  }

  return allGood;
}

function checkPackageJson() {
  log.section('📦 Package.json');

  if (!fileExists('package.json')) {
    log.error('package.json manquant');
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Vérifier les dépendances essentielles
  const deps = [
    'zustand',
    '@supabase/supabase-js',
    'react',
    'react-router-dom',
  ];

  let allGood = true;
  for (const dep of deps) {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      log.success(`${dep} installé`);
    } else {
      log.error(`${dep} manquant`);
      allGood = false;
    }
  }

  return allGood;
}

function main() {
  console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║   🔍 VÉRIFICATION CONFIGURATION SUPABASE    ║${colors.reset}
${colors.bright}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}
  `);

  const results = {
    env: checkEnvFile(),
    code: checkCodeFiles(),
    sql: checkSqlFile(),
    pkg: checkPackageJson(),
  };

  // Résumé
  log.section('📊 Résumé');

  const allGood = Object.values(results).every((r) => r);

  if (allGood) {
    console.log(`
${colors.green}${colors.bright}✅ TOUT EST BON! 🎉${colors.reset}

Vous pouvez maintenant:
  ${colors.blue}1. Exécuter le script setup: ${colors.bright}npm run setup:supabase${colors.reset}
  ${colors.blue}2. Ou lancer l'app directement: ${colors.bright}npm run dev${colors.reset}
    `);
  } else {
    console.log(`
${colors.yellow}⚠️  ATTENTION: Certains fichiers sont manquants${colors.reset}

Actions recommandées:
  ${colors.blue}1. Assurez-vous que la migration Supabase est complète${colors.reset}
  ${colors.blue}2. Vérifiez: ${colors.bright}MIGRATION_SUPABASE.md${colors.reset}
  ${colors.blue}3. Ou exécutez: ${colors.bright}npm run setup:supabase${colors.reset}
    `);
  }

  console.log(`
${colors.gray}Pour plus d'aide: Consultez SETUP_SIMPLE.md${colors.reset}
  `);
}

main();
