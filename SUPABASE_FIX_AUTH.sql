-- ============================================================================
-- FIX: Compatibilité avec le système d'authentification custom (localStorage)
-- ============================================================================
-- Problème: user_id est UUID REFERENCES auth.users(id), mais l'app utilise
--           un auth localStorage avec des IDs comme "1", "1738..."
--           → FK échoue, RLS bloque (auth.uid() = NULL)
-- Solution: user_id TEXT (sans FK), RLS permissive
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: SUPPRIMER TOUTES LES POLICIES (avant de modifier les colonnes)
-- ============================================================================

-- Cart items policies
DROP POLICY IF EXISTS "Cart items: Users can view own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Cart items: Users can update own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Cart items: Users can insert own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Cart items: Users can delete own cart" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_select" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete" ON public.cart_items;

-- Wishlist policies
DROP POLICY IF EXISTS "Wishlist: Users can view own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Wishlist: Users can update own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Wishlist: Users can insert own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Wishlist: Users can delete own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "wishlist_select" ON public.wishlist;
DROP POLICY IF EXISTS "wishlist_insert" ON public.wishlist;
DROP POLICY IF EXISTS "wishlist_update" ON public.wishlist;
DROP POLICY IF EXISTS "wishlist_delete" ON public.wishlist;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles: Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

-- ============================================================================
-- ÉTAPE 2: SUPPRIMER TOUTES LES FK CONSTRAINTS
-- ============================================================================

ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE public.wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;
ALTER TABLE public.wishlist DROP CONSTRAINT IF EXISTS wishlist_product_id_fkey;

-- Supprimer TOUTES les contraintes de profiles (PK + FK dynamiquement)
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint 
    WHERE conrelid = 'public.profiles'::regclass
  ) LOOP
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ' CASCADE';
  END LOOP;
END $$;

-- ============================================================================
-- ÉTAPE 3: CHANGER LES TYPES DE COLONNES (UUID → TEXT)
-- ============================================================================

ALTER TABLE public.cart_items ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.cart_items ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;
ALTER TABLE public.wishlist ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.wishlist ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- ============================================================================
-- ÉTAPE 4: RECRÉER LES POLICIES PERMISSIVES
-- ============================================================================

-- Cart items
CREATE POLICY "cart_items_select" ON public.cart_items FOR SELECT USING (true);
CREATE POLICY "cart_items_insert" ON public.cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "cart_items_update" ON public.cart_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "cart_items_delete" ON public.cart_items FOR DELETE USING (true);

-- Wishlist
CREATE POLICY "wishlist_select" ON public.wishlist FOR SELECT USING (true);
CREATE POLICY "wishlist_insert" ON public.wishlist FOR INSERT WITH CHECK (true);
CREATE POLICY "wishlist_update" ON public.wishlist FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "wishlist_delete" ON public.wishlist FOR DELETE USING (true);

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. RECRÉER LES FONCTIONS SQL avec TEXT au lieu de UUID
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_cart(p_user_id TEXT)
RETURNS TABLE (
  id UUID,
  product_id TEXT,
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

CREATE OR REPLACE FUNCTION get_user_wishlist(p_user_id TEXT)
RETURNS TABLE (
  id UUID,
  product_id TEXT,
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
  LEFT JOIN public.products p ON w.product_id = p.id::TEXT
  WHERE w.user_id = p_user_id
  ORDER BY w.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id TEXT,
  p_product_id TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_cart_item_id UUID;
  v_product RECORD;
BEGIN
  SELECT id, name, brand, price, image_url, scent, category
  INTO v_product
  FROM public.products
  WHERE id::TEXT = p_product_id;
  
  IF v_product IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', p_product_id;
  END IF;
  
  SELECT ci.id INTO v_cart_item_id
  FROM public.cart_items ci
  WHERE ci.user_id = p_user_id AND ci.product_id = p_product_id
  LIMIT 1;
  
  IF v_cart_item_id IS NOT NULL THEN
    UPDATE public.cart_items
    SET quantity = quantity + p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_cart_item_id;
    RETURN v_cart_item_id;
  ELSE
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

CREATE OR REPLACE FUNCTION remove_from_cart(p_user_id TEXT, p_product_id TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.cart_items
  WHERE user_id = p_user_id AND product_id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clear_cart(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.cart_items WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_wishlist(p_user_id TEXT, p_product_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.wishlist
    WHERE user_id = p_user_id AND product_id = p_product_id
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM public.wishlist
    WHERE user_id = p_user_id AND product_id = p_product_id;
    RETURN FALSE;
  ELSE
    INSERT INTO public.wishlist (user_id, product_id)
    VALUES (p_user_id, p_product_id);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Après exécution, vérifier:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('cart_items', 'wishlist') AND column_name IN ('user_id', 'product_id');
-- Résultat attendu: tous en "text"
