#!/bin/bash

# 🔍 VÉRIFICATION CONFIGURATION SUPABASE

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   🔍 VÉRIFICATION SUPABASE                 ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Compteur
GOOD=0
BAD=0

# Fonction pour vérifier un fichier
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅ $2${NC}"
    ((GOOD++))
    return 0
  else
    echo -e "${RED}❌ $2${NC}"
    ((BAD++))
    return 1
  fi
}

# Fonction pour vérifier si un fichier contient du texte
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✅ $3${NC}"
    ((GOOD++))
    return 0
  else
    echo -e "${RED}❌ $3${NC}"
    ((BAD++))
    return 1
  fi
}

# ===== FICHIERS CODE =====
echo -e "${BLUE}═══ 📁 Fichiers de Code ═══${NC}"
check_file "src/integrations/supabase/supabase.ts" "Configuration Supabase"
check_file "src/store/useAdminStore.ts" "Store Zustand (Modifié)"
check_file "src/hooks/use-supabase-error.ts" "Gestion d'Erreurs Supabase"
check_file "src/components/DataSyncInitializer.tsx" "Initialisation des Données"

# ===== SQL =====
echo ""
echo -e "${BLUE}═══ 📊 Fichier SQL ═══${NC}"
check_file "SUPABASE_SQL_SCHEMA.sql" "Script Schéma SQL"
check_content "SUPABASE_SQL_SCHEMA.sql" "CREATE TYPE olfactory_family" "Énumération olfactory_family"
check_content "SUPABASE_SQL_SCHEMA.sql" "CREATE TABLE IF NOT EXISTS products" "Table products"
check_content "SUPABASE_SQL_SCHEMA.sql" "ALTER TABLE products ENABLE ROW LEVEL SECURITY" "RLS activée"

# ===== ENV FILE =====
echo ""
echo -e "${BLUE}═══ 📋 Fichier .env.local ═══${NC}"
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✅ .env.local existe${NC}"
  ((GOOD++))
  
  if grep -q "VITE_SUPABASE_URL" ".env.local"; then
    echo -e "${GREEN}✅ VITE_SUPABASE_URL configurée${NC}"
    ((GOOD++))
  else
    echo -e "${RED}❌ VITE_SUPABASE_URL manquante${NC}"
    ((BAD++))
  fi
  
  if grep -q "VITE_SUPABASE_PUBLISHABLE_KEY" ".env.local"; then
    echo -e "${GREEN}✅ VITE_SUPABASE_PUBLISHABLE_KEY configurée${NC}"
    ((GOOD++))
  else
    echo -e "${RED}❌ VITE_SUPABASE_PUBLISHABLE_KEY manquante${NC}"
    ((BAD++))
  fi
else
  echo -e "${YELLOW}⚠️  .env.local n'existe pas${NC}"
  echo -e "${YELLOW}   Exécutez: npm run setup:supabase${NC}"
  ((BAD++))
fi

# ===== DEPENDENCIES =====
echo ""
echo -e "${BLUE}═══ 📦 Dépendances ═══${NC}"
if grep -q '"zustand"' "package.json"; then
  echo -e "${GREEN}✅ zustand installé${NC}"
  ((GOOD++))
else
  echo -e "${RED}❌ zustand manquant${NC}"
  ((BAD++))
fi

if grep -q '"@supabase/supabase-js"' "package.json"; then
  echo -e "${GREEN}✅ @supabase/supabase-js installé${NC}"
  ((GOOD++))
else
  echo -e "${RED}❌ @supabase/supabase-js manquant${NC}"
  ((BAD++))
fi

# ===== RÉSUMÉ =====
echo ""
echo -e "${BLUE}═══ 📊 Résumé ═══${NC}"
TOTAL=$((GOOD + BAD))
echo "Vérifications: ${GOOD}/${TOTAL} réussies"
echo ""

if [ $BAD -eq 0 ]; then
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ TOUT EST BON! 🎉${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  echo ""
  echo "Vous pouvez maintenant:"
  echo "  1. npm run dev                (Lancer l'app)"
  echo "  2. npm run setup:supabase     (Si pas déjà fait)"
  echo ""
else
  echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
  echo -e "${YELLOW}⚠️  ATTENTION: Certains fichiers manquent${NC}"
  echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
  echo ""
  echo "Actions:"
  echo "  1. Consultez: SETUP_SIMPLE.md"
  echo "  2. Ou exécutez: npm run setup:supabase"
  echo ""
fi
