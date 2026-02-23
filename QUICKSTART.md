# ⚡ DÉMARRAGE RAPIDE SUPABASE

## 🎯 TL;DR - Juste faire fonctionner

### Commande 1️⃣ - Vérifier que tout est en place
```bash
npm run verify:setup
```

### Commande 2️⃣ - Lancer l'installation Supabase
```bash
npm run setup:supabase
```

Ça va vous poser 2 questions simples (5 minutes max):
```
? Collez votre SUPABASE_URL
> https://xxxxx.supabase.co

? Collez votre SUPABASE_PUBLISHABLE_KEY  
> eyJhbGciOiJIUzI1NiIsInR5cCI...
```

### Commande 3️⃣ - Lancer l'app
```bash
npm run dev
```

---

## 🔑 Où obtenir les clés API?

1. Allez: **https://supabase.com/dashboard**
2. Créez un project (click click click - 1 minute)
3. Allez: **Settings → API**
4. Copiez les 2 clés

**C'est tout!**

---

## ✅ Vérifier que ça marche

### Dans la console du navigateur:
```
✅ Initialisation des produits depuis Supabase...
✅ Produits chargés depuis Supabase: 21
📡 Configuration de la synchronisation en temps réel...
✅ Souscription en temps réel activée
```

### Dans l'app:
```
Allez à: http://localhost:5173 
Les produits doivent être visibles ✅
```

---

## 📚 Pour plus d'infos

- 📖 Guide complet: `SETUP_SIMPLE.md`
- 🔍 Vérification complète: `MIGRATION_SUPABASE.md`
- 📊 Schéma SQL: `SUPABASE_SQL_SCHEMA.sql`

---

## 🚨 Ça ne marche pas?

```bash
# Vérifier la config
npm run verify:setup

# Redémarrer le script setup
npm run setup:supabase

# Relancer l'app
npm run dev
```

**Basta! Vous êtes prêt! 🚀**
