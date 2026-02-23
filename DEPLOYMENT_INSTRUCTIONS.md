# 🚀 INSTRUCTIONS DE DÉPLOIEMENT - GitHub Pages

## 📋 Résumé des modifications effectuées

Votre projet a été mis à jour avec les modifications suivantes :

### ✨ Nouvelles fonctionnalités :
- **Codes Promo Dynamiques** : Gestion des codes promo avec réductions personnalisables
- **Notes Olfactives Gérées** : Bibliothèque dynamique de notes olfactives (Tête, Cœur, Fond)
- **Quiz Sillage** : Nouveau composant SillageQuiz pour une expérience utilisateur améliorée
- **Classement Produits** : Vue "Ranking" avec score global des produits dans l'analytics
- **Abandoned Insights** : Analyse intelligente des paniers abandonnés
- **Suivi Add-to-Cart** : Comptage en temps réel des ajouts au panier

### 📝 Fichiers modifiés : 37+
### 🆕 Fichiers créés : 10+

---

## 🎯 Pour déployer sur GitHub Pages

### Option 1 : Déploiement Automatique (Recommandé)

GitHub Actions va déployer automatiquement quand vous pushez vers `main`.

```bash
# Depuis le répertoire du projet:
cd /workspaces/jema41

# Ajouter tous les changements
git add -A

# Créer un commit
git commit -m "feat: mise à jour complète - ajout codes promo, notes olfactives dynamiques, classement produits, analytics enrichie, et UI améliorée"

# Pousser vers GitHub
git push origin main
```

**Ensuite** :
1. Le workflow GitHub Actions se déclenche automatiquement
2. Le projet se compile
3. Le site est publié sur GitHub Pages en 2-3 minutes
4. 🌐 Accessible sur: **https://jima41.github.io/jema41/**

---

### Option 2 : Déploiement Manuel via gh-pages

```bash
cd /workspaces/jema41

# Vérifier que gh-pages est installé
npm install gh-pages --save-dev

# Builder et déployer directement
npm run build && npm run deploy
```

**Résultat** :
- Les fichiers du dossier `dist/` sont poussés sur la branche `gh-pages`
- Le site est immédiatement disponible

---

## ✅ Vérifications après déploiement

1. **Vérifier que GitHub Pages est activé** :
   - Aller sur : https://github.com/jima41/jema41/settings/pages
   - Source doit être : "Deploy from branch" → `gh-pages`

2. **Vérifier le build** :
   - GitHub Actions : https://github.com/jima41/jema41/actions
   - Chercher le dernier workflow "Build and Deploy" 
   - Le badge doit être ✅ (vert)

3. **Tester le site** :
   - 🔗 https://jima41.github.io/jema41/
   - Vérifier que vous voyez les nouvelles fonctionnalités

---

## 📦 Commits à faire

```bash
cd /workspaces/jema41

# Tous les changements doivent être commitées
git add -A
git status  # Pour voir ce qui sera committé

# Commit avec message explicite
git commit -m "feat: mise à jour complète - ajout codes promo, notes olfactives dynamiques, classement produits, analytics enrichie, et UI améliorée"

# Push
git push origin main
```

---

## 🔍 Fichiers clés de déploiement

- `package.json` : Scripts de build (`build`, `deploy`)
- `.github/workflows/` : Configuration de GitHub Actions (si applicable)
- `vite.config.ts` : Configuration Vite avec base publique
- `dist/` : Dossier généré avec les fichiers compilés

---

## 💡 Troubleshooting

**Le site n'apparaît pas ?**
1. Attendre 2-3 minutes après le push
2. Vider le cache du navigateur (Ctrl+F5 ou Cmd+Shift+R)
3. Vérifier que GitHub Pages est activé dans les paramètres du repo

**Erreur de build ?**
1. Vérifier les logs dans GitHub Actions
2. Lancer `npm run build` localement pour voir l'erreur
3. Corriger et re-pusher

**Chemins relatifs cassés ?**
1. Vérifier la configuration dans `vite.config.ts`
2. La base doit être `/jema41/` pour GitHub Pages

---

## ⏭ Prochaines étapes

Une fois le déploiement réussi :

1. ✅ Les codes promo sont gérables dans l'admin
2. ✅ Les notes olfactives sont éditable dans l'admin
3. ✅ Le quiz Sillage guide les utilisateurs
4. ✅ L'analytics affiche le classement des produits
5. ✅ Les insights sur les paniers abandonnés sont disponibles

---

**🎉 Votre site est maintenant prêt pour la production !**

Besoin d'aide ? Vérifiez les logs de déploiement ou consultez la documentation Vite : https://vitejs.dev/guide/static-deploy.html
