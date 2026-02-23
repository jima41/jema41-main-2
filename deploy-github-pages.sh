#!/bin/bash
set -e

echo "🚀 Démarrage du déploiement sur GitHub Pages..."
echo ""

# Se placer dans le répertoire du projet
cd /workspaces/jema41

# 1. Ajouter tous les changements
echo "📦 Ajout des fichiers..."
git add -A

# 2. Créer un commit
echo "💾 Création du commit..."
git commit -m "feat: mise à jour complète - ajout codes promo, notes olfactives dynamiques, classement produits, analytics enrichie, et UI améliorée" || echo "Rien à committer"

# 3. Pousser vers GitHub
echo "🌐 Push vers GitHub..."
git push origin main

echo ""
echo "✅ Les modifications ont été poussées vers GitHub main"
echo ""
echo "⏳ GitHub Actions va maintenant:"
echo "   1. Construire le projet"
echo "   2. Publier sur GitHub Pages"
echo ""
echo "🔗 Votre site sera bientôt disponible sur:"
echo "   https://jima41.github.io/jema41/"
echo ""
echo "🌍 Vérifiez le déploiement dans: https://github.com/jima41/jema41/actions"
