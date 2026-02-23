-- ============================================================================
-- MIGRATION SUPABASE V2 - Persistance Utilisateur et Synchronisation Publique
-- ============================================================================
-- 
-- Objectif:
-- 1. Créer un système de persistance pour les données utilisateur (panier, favoris)
-- 2. Mettre à jour la structure de la base de données
-- 3. Implémenter les RLS policies pour la sécurité
-- 4. Préparer la synchronisation en temps réel
--
-- ============================================================================

-- ============================================================================
-- 1. TABLE PROFILES - Informations Utilisateur Enrichies
-- ============================================================================

-- S'assurez que auth.users existe (créé automatiquement par Supabase)
-- Ces champs serviront à enrichir les informations utilisateur au-delà d'auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Informations de livraison
  shipping_address JSONB,
  billing_address JSONB,
  
  -- Préférences
  preferred_scent_families TEXT[],
  favorite_notes TEXT[],
  
  -- Statistiques
  total_purchases DECIMAL(10, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMPTZ
) WITH (oids = false);

-- Index pour les recherches rapides
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- ============================================================================
-- 2. TABLE CART_ITEMS - Panier Persistant par Utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Snapshot du produit au moment de l'ajout au panier
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT,
  product_scent TEXT,
  product_category TEXT,
  
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  
  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) WITH (oids = false);

-- Indexes
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX idx_cart_items_user_product ON public.cart_items(user_id, product_id);

-- ============================================================================
-- 3. TABLE WISHLIST - Favoris/Likes Persistants par Utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Position d'ajout
  position INTEGER,
  
  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Contrainte d'unicité: un produit ne peut être en favoris qu'une fois par utilisateur
  UNIQUE(user_id, product_id)
) WITH (oids = false);

-- Indexes
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON public.wishlist(product_id);

-- ============================================================================
-- 4. ENABLE REALTIME SUBSCRIPTIONS
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items, public.wishlist, public.profiles;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) - POLICES DE SÉCURITÉ
-- ============================================================================

-- ========== PROFILES ============= 
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir tous les profils publics
CREATE POLICY "Profiles: Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Les utilisateurs ne peuvent modifier que leur propre profil
CREATE POLICY "Profiles: Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs ne peuvent insérer que leur propre profil
CREATE POLICY "Profiles: Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========== CART_ITEMS ========== 
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que LEUR panier
CREATE POLICY "Cart items: Users can view own cart"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent modifier que LEUR panier
CREATE POLICY "Cart items: Users can update own cart"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs ne peuvent insérer que DANS leur panier
CREATE POLICY "Cart items: Users can insert own cart"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs ne peuvent supprimer que DE leur panier
CREATE POLICY "Cart items: Users can delete own cart"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========== WISHLIST ========== 
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que LEURS favoris
CREATE POLICY "Wishlist: Users can view own wishlist"
  ON public.wishlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent modifier que LEURS favoris
CREATE POLICY "Wishlist: Users can update own wishlist"
  ON public.wishlist
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs ne peuvent insérer que DANS leurs favoris
CREATE POLICY "Wishlist: Users can insert own wishlist"
  ON public.wishlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs ne peuvent supprimer que DE leurs favoris
CREATE POLICY "Wishlist: Users can delete own wishlist"
  ON public.wishlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========== PRODUCTS ========== 
-- Vérifier que les produits RLS existent et sont correctement configurés
-- Les visiteurs (non authentifiés) devraient pouvoir lire les produits
-- Mais seulement les admins peuvent modifier

-- Si la table products n'a pas encore RLS:
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Lecture publique (visiteurs)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products: Anyone can view products' AND tablename = 'products') THEN
    CREATE POLICY "Products: Anyone can view products"
      ON public.products
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Modification par admins seulement (vérifier la colonne admin_id ou similaire)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products: Only admins can modify' AND tablename = 'products') THEN
    CREATE POLICY "Products: Only admins can modify"
      ON public.products
      FOR UPDATE
      USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products: Only admins can delete' AND tablename = 'products') THEN
    CREATE POLICY "Products: Only admins can delete"
      ON public.products
      FOR DELETE
      USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products: Only admins can insert' AND tablename = 'products') THEN
    CREATE POLICY "Products: Only admins can insert"
      ON public.products
      FOR INSERT
      WITH CHECK (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
      );
  END IF;
END $$;

-- ============================================================================
-- 6. FONCTIONS - Helpers pour les Opérations Courantes
-- ============================================================================

-- Fonction: Obtenir le panier d'un utilisateur avec détails produits
CREATE OR REPLACE FUNCTION get_user_cart(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  quantity INTEGER,
  product_name TEXT,
  product_brand TEXT,
  product_price DECIMAL,
  product_image TEXT,
  added_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.product_id,
    ci.quantity,
    ci.product_name,
    ci.product_brand,
    ci.product_price,
    ci.product_image,
    ci.added_at
  FROM public.cart_items ci
  WHERE ci.user_id = p_user_id
  ORDER BY ci.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Obtenir les favoris d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_wishlist(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  product_name TEXT,
  product_price DECIMAL,
  product_image TEXT,
  added_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.product_id,
    p.name,
    p.price,
    p.image_url,
    w.added_at
  FROM public.wishlist w
  LEFT JOIN public.products p ON w.product_id = p.id
  WHERE w.user_id = p_user_id
  ORDER BY w.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Ajouter un article au panier (ou incrémenter la quantité)
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_cart_item_id UUID;
  v_product RECORD;
BEGIN
  -- Vérifier que le produit existe
  SELECT id, name, brand, price, image_url, scent, category
  INTO v_product
  FROM public.products
  WHERE id = p_product_id;
  
  IF v_product IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', p_product_id;
  END IF;
  
  -- Vérifier s'il existe déjà un item
  SELECT id INTO v_cart_item_id
  FROM public.cart_items
  WHERE user_id = p_user_id AND product_id = p_product_id
  LIMIT 1;
  
  IF v_cart_item_id IS NOT NULL THEN
    -- Incrémenter la quantité
    UPDATE public.cart_items
    SET quantity = quantity + p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_cart_item_id;
    RETURN v_cart_item_id;
  ELSE
    -- Créer un nouvel item
    INSERT INTO public.cart_items (
      user_id, product_id, quantity,
      product_name, product_brand, product_price, product_image, product_scent, product_category
    )
    VALUES (
      p_user_id, p_product_id, p_quantity,
      v_product.name, v_product.brand, v_product.price, v_product.image_url, v_product.scent, v_product.category
    )
    RETURNING id INTO v_cart_item_id;
    RETURN v_cart_item_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Supprimer un article du panier
CREATE OR REPLACE FUNCTION remove_from_cart(p_user_id UUID, p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.cart_items
  WHERE user_id = p_user_id AND product_id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Vider le panier d'un utilisateur
CREATE OR REPLACE FUNCTION clear_cart(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.cart_items WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Ajouter/retirer un produit des favoris
CREATE OR REPLACE FUNCTION toggle_wishlist(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Vérifier s'il existe déjà
  SELECT EXISTS(
    SELECT 1 FROM public.wishlist
    WHERE user_id = p_user_id AND product_id = p_product_id
  ) INTO v_exists;
  
  IF v_exists THEN
    -- Supprimer
    DELETE FROM public.wishlist
    WHERE user_id = p_user_id AND product_id = p_product_id;
    RETURN FALSE; -- Supprimé
  ELSE
    -- Ajouter
    INSERT INTO public.wishlist (user_id, product_id)
    VALUES (p_user_id, p_product_id);
    RETURN TRUE; -- Ajouté
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. MIGRATIONS EXISTANTES - S'assurer que les tables existent
-- ============================================================================

-- Cette migration suppose que la table 'products' existe déjà
-- Si ce n'est pas le cas, décommenter la création ci-dessous

/*
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  notes_tete TEXT[],
  notes_coeur TEXT[],
  notes_fond TEXT[],
  families TEXT[],
  stock INTEGER DEFAULT 0,
  monthlySales INTEGER DEFAULT 0,
  volume TEXT,
  category TEXT,
  scent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) WITH (oids = false);
*/

-- ============================================================================
-- NOTES IMPORTANTES:
-- ============================================================================
--
-- 1. Les RLS policies supposent que:
--    - Les utilisateurs sont authentifiés via Supabase Auth
--    - auth.uid() retourne l'UUID de l'utilisateur actuel
--
-- 2. Pour les admins:
--    - Utiliser raw_user_meta_data->>'role' = 'admin' dans auth.users
--    - Ou créer une table  'admins' avec les IDs d'admins
--
-- 3. La persistence du localStorage est maintenant:
--    - NO LONGER NEEDED pour le panier
--    - NO LONGER NEEDED pour les favoris
--    - Les données seront toujours à jour depuis Supabase
--
-- 4. À faire côté Frontend:
--    - Supprimer les appels localStorage
--    - Utiliser Supabase pour fetch/update cart et wishlist
--    - Implémenter les listeners en temps réel
--
-- ============================================================================
