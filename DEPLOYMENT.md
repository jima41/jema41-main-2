# 🚀 Déploiement sur GitHub Pages

## URL de votre site

Votre site sera accessible à l'adresse suivante:

### URL par défaut (GitHub Pages)
**https://jima41.github.io/jema41/**

Vous pouvez partager ce lien avec vos amis!

---

## 📋 Étapes pour déployer

### 1️⃣ Prérequis
- Avoir un compte GitHub
- Avoir Git installé localement
- Avoir vos changements commités

### 2️⃣ Première configuration

#### Option A: Configuration Automatique (Recommandée)
Le déploiement s'effectue **automatiquement** quand vous poussez vers la branche `main`:

```bash
git push origin main
```

Le workflow GitHub Actions va:
1. ✅ Construire le projet
2. ✅ Publier sur GitHub Pages
3. ✅ Rendre accessible en ~2-3 minutes

#### Option B: Déploiement Manuel
Si vous préférez déployer manuellement:

```bash
# 1. Construire le projet
npm run build

# 2. Installer gh-pages (si pas déjà installé)
npm install gh-pages --save-dev

# 3. Ajouter le script dans package.json:
# "deploy": "npm run build && gh-pages -d dist"

# 4. Déployer
npm run deploy
```

### 3️⃣ Vérifier le déploiement

1. Allez sur votre repository GitHub
2. Allez dans **Settings** → **Pages**
3. Vous devriez voir: "Your site is live at https://jima41.github.io/jema41/"

---

## 🔧 Configuration du domaine personnalisé (Optionnel)

Si vous avez un domaine personnalisé (ex: rayha-store.com):

1. **Acheter un domaine** chez un registraire (Namecheap, GoDaddy, etc.)

2. **Ajouter les DNS records**:
   - Type: `A`
   - Name: `@`
   - Value: 
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **Configurer sur GitHub**:
   - Settings → Pages → Custom domain
   - Entrer: `rayha-store.com`

---

## 📱 Partager votre site

### Avec des amis sans GitHub
Envoyez simplement le lien:
```
https://jima41.github.io/jema41/
```

### Créer un lien court (Optionnel)
Vous pouvez utiliser un service de raccourcisseur de lien:
- bit.ly
- tinyurl.com
- short.link

Exemple: `https://bit.ly/rayha-store`

---

## ⚠️ Troubleshooting

### Le site ne s'affiche pas
1. Vérifiez que la branche `gh-pages` existe
2. Vérifiez les GitHub Actions (Settings → Actions)
3. Attendez 2-3 minutes après le push

### Les chemins sont cassés
- ✅ Cela est déjà configuré avec `base: "/jema41/"` dans `vite.config.ts`

### Erreur de build
Vérifiez:
```bash
npm run build
```

Si erreur, corrigez-la localement puis poussez à nouveau.

---

## 📊 Tous les statuts

| Statut | Lien |
|--------|------|
| **Site public** | https://jima41.github.io/jema41/ |
| **Repository** | https://github.com/jima41/jema41 |
| **Pages Settings** | https://github.com/jima41/jema41/settings/pages |
| **Actions** | https://github.com/jima41/jema41/actions |

---

## 💡 Conseils

✅ **Après chaque modification**:
```bash
git add .
git commit -m "Mise à jour du site"
git push origin main
```

Le site se mettra à jour automatiquement en 2-3 minutes!

✅ **Vérifier que tout fonctionne**:
- Ouvrez https://jima41.github.io/jema41/
- Testez les fonctionnalités
- Signalez les bugs sur GitHub Issues

---

**Bon déploiement! 🎉**
