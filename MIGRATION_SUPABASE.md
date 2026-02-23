# 🚚 Migration Supabase - Guide Complet

## ✅ Ce qui a été complété

### **Task 1: Configuration Supabase** ✓
- ✅ Fichier `src/integrations/supabase/supabase.ts` créé
- ✅ Configuration client Supabase optimisée
- ✅ Fonctions CRUD pour les produits
- ✅ Souscription en temps réel (Realtime)
- ✅ Gestion d'erreurs personnalisée

### **Task 2: Migration du Store Zustand** ✓
- ✅ `useAdminStore.ts` complètement réécrit
- ✅ `initializeProducts()` pour charger depuis Supabase
- ✅ `setupRealtimeSync()` pour synchronisation temps réel
- ✅ Opérations asynchrones: `addProduct`, `updateProduct`, `deleteProduct`
- ✅ Remplacement du LocalStorage par Supabase

### **Task 3: Mise à Jour de la Galerie Client** ✓
- ✅ `AllProducts.tsx` connecté au store Zustand
- ✅ Écoute automatique des changements en temps réel
- ✅ Rafraîchissement instantané des prix et stocks

### **Task 4: Script SQL** ✓
- ✅ Fichier `SUPABASE_SQL_SCHEMA.sql` généré
- ✅ Table `products` avec tous les champs nécessaires
- ✅ Enums pour notes olfactives
- ✅ Politiques de sécurité (RLS)
- ✅ Triggers pour audit

### **Task 5: Gestion Erreurs & Sécurité** ✓
- ✅ Hook `use-supabase-error.ts` pour gestion des erreurs
- ✅ Intégration des toasts pour notifications
- ✅ `ProductSlideOver.tsx` mise à jour avec gestion async
- ✅ Authentification avec Supabase Auth
- ✅ RLS (Row Level Security) configurée

---

## 🚀 Prochaines Étapes

### 1️⃣ Créer la Base de Données dans Supabase

1. Accédez à [https://supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Dans l'éditeur SQL, copiez-collez le contenu de **`SUPABASE_SQL_SCHEMA.sql`**
4. Exécutez le script

### 2️⃣ Obtenir les Clés API

1. Dans Supabase, allez à **Settings > API**
2. Copiez:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `Anon Public key` → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3️⃣ Configurer les Variables d'Environnement

Créez ou mettez à jour le fichier `.env.local`:

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ Importer les Produits (Optionnel)

Si vous avez des produits existants, vous pouvez les importer:

```typescript
// Dans la console Supabase SQL:
INSERT INTO products (name, brand, price, description, image_url, stock, monthlySales, volume, category, scent) VALUES
('Éclat Doré', 'Maison Rayha', 129.00, '...', 'url_image.jpg', 45, 85, '50ml', 'femme', 'Gourmand'),
...
```

### 5️⃣ Tester l'Application

1. Démarrez l'app: `npm run dev`
2. Vérifiez que les produits se chargent depuis Supabase
3. Testez dans l'Admin:
   - ✅ Ajouter un produit
   - ✅ Modifier un produit
   - ✅ Supprimer un produit
   - ✅ Vérifier les changements en temps réel

---

## 📊 Architecture de Synchronisation

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx                               │
│                 DataSyncInitializer                      │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
  ┌──────────┐        ┌─────────────┐
  │  Store   │◄──────►│  Supabase   │
  │ Zustand  │        │  Realtime   │
  └──────────┘        └─────────────┘
        │
        │ Émet les changements
        │
   ┌────┴─────────────┐
   │                  │
   ▼                  ▼
AllProducts      Admin Panel
(Lecture)       (Lecture/Écriture)
```

---

## 🔒 Sécurité

### Politiques RLS Implémentées

```sql
-- Lecture: Tout le monde
SELECT * FROM products WHERE true;

-- Écriture: Seulement les admins
INSERT/UPDATE/DELETE only for users with role = 'admin'
```

### Authentification Admin

L'app utilise le contexte `AuthContext` pour vérifier les droits admin.
Seuls les utilisateurs avec `role: 'admin'` peuvent modifier les produits.

---

## 📝 Fichiers Créés/Modifiés

### Créés:
- ✅ `src/integrations/supabase/supabase.ts` - Configuration Supabase
- ✅ `src/hooks/use-supabase-error.ts` - Gestion d'erreurs
- ✅ `SUPABASE_SQL_SCHEMA.sql` - Script de création de table

### Modifiés:
- ✅ `src/store/useAdminStore.ts` - Intégration Supabase
- ✅ `src/components/DataSyncInitializer.tsx` - Initialisation des données
- ✅ `src/components/admin/ProductSlideOver.tsx` - Gestion async

---

## 🐛 Dépannage

### Les produits ne se chargent pas?
1. Vérifiez les clés API dans `.env.local`
2. Vérifiez que la table `products` existe dans Supabase
3. Vérifiez la console pour les messages d'erreur

### Les changements ne se synchronisent pas?
1. Vérifiez que la souscription Realtime est active
2. Rafraîchissez la page (F5)
3. Vérifiez les logs console

### Erreur d'authentification?
1. Vérifiez que vous êtes connecté comme admin
2. Vérifiez que `role: 'admin'` est configuré dans les métadonnées de l'utilisateur

---

## 📞 Support

Pour des questions sur Supabase:
- [Documentation Supabase](https://supabase.com/docs)
- [Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Dernière mise à jour:** 8 février 2026
**Statut:** ✅ Migration complète
