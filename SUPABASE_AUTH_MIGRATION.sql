-- ============================================================================
-- MIGRATION: Remplacement localStorage par Supabase Auth
-- ============================================================================
-- Avant:  Auth custom localStorage (IDs: "1", "1738...")
-- Après:  Supabase Auth natif (IDs: UUID depuis auth.users)
--
-- IMPORTANT: Exécuter ce SQL dans le SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: S'assurer que la table profiles existe avec les bonnes colonnes
-- ============================================================================

-- Ajouter les colonnes manquantes si nécessaire
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
    ALTER TABLE public.profiles ADD COLUMN first_name TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
    ALTER TABLE public.profiles ADD COLUMN last_name TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2: Créer le trigger pour auto-créer un profil à l'inscription
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, first_name, last_name)
  VALUES (
    NEW.id::UUID,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@rayha.com' THEN 'admin'
      ELSE 'user'
    END,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ÉTAPE 3: Fonction pour récupérer le profil utilisateur
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_profile(p_user_id TEXT)
RETURNS TABLE (
  id TEXT,
  username TEXT,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 4: Fonction pour mettre à jour le profil
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id TEXT,
  p_email TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = COALESCE(p_email, email),
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    username = COALESCE(p_username, username),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 5: Fonction admin pour lister les clients
-- ============================================================================

CREATE OR REPLACE FUNCTION get_all_clients()
RETURNS TABLE (
  id TEXT,
  username TEXT,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 6: Fonction admin pour supprimer un client
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_delete_client(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Supprimer les données associées
  DELETE FROM public.cart_items WHERE user_id = p_user_id;
  DELETE FROM public.wishlist WHERE user_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 7: Fonction pour rechercher un email par pseudo (accessible sans auth)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT p.email INTO v_email
  FROM public.profiles p
  WHERE LOWER(p.username) = LOWER(p_username)
  LIMIT 1;
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 8: Nettoyer les anciennes données localStorage (optionnel)
-- ============================================================================

-- Supprimer les profils avec des IDs non-UUID (anciennes données localStorage)
-- Décommentez si vous voulez nettoyer:
-- DELETE FROM public.profiles WHERE length(id) < 20;
-- DELETE FROM public.cart_items WHERE length(user_id) < 20;
-- DELETE FROM public.wishlist WHERE length(user_id) < 20;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Après exécution:
-- 1. Vérifier le trigger: SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
-- 2. Vérifier les colonnes: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
-- 3. Tester: INSERT INTO auth.users via l'inscription, puis vérifier que le profil est créé automatiquement

-- ============================================================================
-- NOTE IMPORTANTE: Créer le compte admin
-- ============================================================================
-- Après ce script, créez le compte admin via l'interface de l'app:
--   Email: admin@rayha.com
--   Mot de passe: berkane41
--   Username: Jema41
-- Le trigger assignera automatiquement le rôle 'admin' grâce à l'email.
--
-- OU désactivez la confirmation email dans:
--   Supabase Dashboard → Authentication → Providers → Email → Confirm email = OFF
