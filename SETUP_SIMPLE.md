# 🚀 SETUP SUPABASE - ULTRA SIMPLE

## ⏱️ Temps total: **5 minutes**

---

## 📋 ÉTAPE 1: Lancer le Script (1 minute)

```bash
# Dans le terminal:
node setup-supabase.js
```

Le script va vous poser des questions simples. Répondez juste avec les informations qu'on va chercher.

---

## 🔑 ÉTAPE 2: Obtenir les Clés API (2 minutes)

### A. Créer un Compte Supabase

```
1. Ouvrez: https://supabase.com/dashboard
2. Cliquez: "Start your project"
3. Email + Mot de passe (simple)
4. Confirmez par email (vérifier spam!)
```

### B. Créer un Projet

```
Cliquez: "New Project"
  └─ Name: "Rayha Store"
  └─ Password: (mémoriser)
  └─ Region: Europe (ou votre région)
  └─ Cliquez: "Create new project"
  
⏳ Attendez 1 minute...
✅ Prêt!
```

### C. Récupérer les 2 Clés

```
Dans Supabase:
  1. Allez à: Settings (⚙️ en bas à gauche)
  2. Cliquez: "API"
  3. Vous verrez:

     ┌────────────────────────────────────┐
     │ Project URL                        │
     │ https://xxxxx.supabase.co          │ ← COPIER
     └────────────────────────────────────┘

     ┌────────────────────────────────────┐
     │ Anon Public key                    │
     │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX... │ ← COPIER
     └────────────────────────────────────┘
```

---

## 🔧 ÉTAPE 3: Exécuter le Script Setup (2 minutes)

```bash
# Terminal:
node setup-supabase.js

# Répondre aux questions:
? Collez votre SUPABASE_URL (https://xxx.supabase.co)
> https://xxxxx.supabase.co

? Collez votre SUPABASE_PUBLISHABLE_KEY (eyJhbG...)
> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Le fichier `.env.local` sera créé automatiquement!

---

## 📊 ÉTAPE 4: Créer la Table (2 minutes)

Le script vous donnera un fichier SQL.

### A. Aller dans Supabase SQL Editor

```
Supabase → Votre Projet
  └─ Cliquez: "SQL Editor" (gauche)
     └─ Cliquez: "New Query"
```

### B. Copier le Script SQL

```
1. Ouvrez le fichier: SUPABASE_SQL_SCHEMA.sql
2. Sélectionnez TOUT (Ctrl+A)
3. Copiez (Ctrl+C)
```

### C. Exécuter dans Supabase

```
1. Collez dans l'éditeur SQL
2. Cliquez: "Run" (bleu, en bas à droite)
3. Attendez... ⏳
4. Vous verrez: ✅ Success
```

---

## ✅ ÉTAPE 5: Vérifier que ça Marche

```bash
# Démarrez l'app:
npm run dev

# Dans la console, vous devez voir:
✅ Initialisation des produits depuis Supabase...
✅ Produits chargés depuis Supabase: 21
📡 Configuration de la synchronisation en temps réel...
✅ Souscription en temps réel activée
```

🎉 **C'EST BON!**

---

## 📱 Tester dans l'Admin

```
1. Ouvrez: http://localhost:5173/#/admin
2. Login: Jema41 / (votre mot de passe)
3. Allez à: "Stock Management"
4. Essayez: Ajouter un produit
5. Changez de page → La liste se met à jour
```

---

## 💾 Importer les Produits (Optionnel)

Si vous voulez les 21 produits existants:

```
1. Ouvrez: SUPABASE_SQL_SCHEMA.sql
2. Allez à la fin du fichier
3. Cherchez: /* INSERT INTO products... */
4. Sélectionnez TOUT ce qui est entre /* et */
5. Décommentez (enlever les /* et */)
6. Exécutez dans Supabase SQL Editor
```

---

## ❓ Ça ne Marche Pas?

### Les produits ne se chargent pas
```
✓ Vérifier: .env.local existe?
✓ Vérifier: Les clés API sont correctes?
✓ Vérifier: La table products existe dans Supabase?
✓ Essayer: Rafraîchir la page (F5)
```

### Erreur "Connection refused"
```
✓ Vérifier: VITE_SUPABASE_URL commence par "https://"
✓ Vérifier: Pas d'espace avant/après les clés
✓ Vérifier: Projet Supabase est bien créé
```

### Erreur "Anon not authorized"
```
✓ Attendre quelques secondes (RLS peut prendre du temps)
✓ Rafraîchir (F5) ou redémarrer (Ctrl+C + npm run dev)
```

---

## 🎓 Récapitulatif

| Étape | Quoi | Temps |
|-------|------|-------|
| 1 | Créer compte Supabase | 2 min |
| 2 | Copier les 2 clés API | 1 min |
| 3 | Exécuter setup-supabase.js | 1 min |
| 4 | Exécuter SQL dans Supabase | 1 min |
| 5 | npm run dev et vérifier | 1 min |
| **TOTAL** | | **6 min** |

---

## 🚀 C'est Fait!

Votre application est maintenant:
- ✅ Connectée à Supabase
- ✅ Synchronisée en temps réel
- ✅ Prête pour la production
- ✅ Sécurisée (RLS activée)

**Bon développement! 🎉**
