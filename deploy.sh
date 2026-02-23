#!/bin/bash

# Script de déploiement vers GitHub Pages
# Usage: bash deploy.sh

set -e

echo "🚀 Déploiement Rayha Store sur GitHub Pages..."
echo ""

# Vérifier que le repo est propre
if [[ -n $(git status -s) ]]; then
  echo "⚠️  Changements non commités détectés."
  echo "Commencez par commit et push vos changements:"
  echo "  git add ."
  echo "  git commit -m 'message'"
  echo "  git push origin main"
  exit 1
fi

echo "✅ Repository propre"
echo ""

# Construire le projet
echo "🔨 Construction du projet..."
npm run build
echo "✅ Build terminée"
echo ""

# Vérifier que gh-pages est installé
if ! npm list gh-pages > /dev/null 2>&1; then
  echo "📦 Installation de gh-pages..."
  npm install gh-pages --save-dev
fi

echo ""
echo "📤 Déploiement vers GitHub Pages..."
npx gh-pages -d dist

echo ""
echo "✅ Déploiement réussi!"
echo ""
echo "🌐 Votre site est accessible à:"
echo "   https://jima41.github.io/jema41/"
echo ""
echo "💡 Attendez 2-3 minutes pour que les changements soient actifs."
