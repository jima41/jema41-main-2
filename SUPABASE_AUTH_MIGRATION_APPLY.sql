-- FINAL: Trigger + function + backfill pour créer automatiquement les profils
-- Utilisation : collez ce fichier dans Supabase -> SQL Editor et exécutez.

-- 1) Fonction trigger (SECURITY DEFINER, cast UUID)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, first_name, last_name, created_at, updated_at)
  VALUES (
    NEW.id::UUID,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'admin@rayha.com' THEN 'admin' ELSE 'user' END,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) (Re)créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Backfill : créer profils manquants pour tous les users existants
INSERT INTO public.profiles (id, username, email, role, first_name, last_name, created_at, updated_at)
SELECT
  id::UUID,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1))::text,
  email,
  CASE WHEN email = 'admin@rayha.com' THEN 'admin' ELSE 'user' END,
  COALESCE(raw_user_meta_data->>'first_name', '')::text,
  COALESCE(raw_user_meta_data->>'last_name', '')::text,
  NOW(),
  NOW()
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id::text = a.id::text);

-- 4) Vérifications rapides (copier/coller si besoin)
-- SELECT trigger_name, event_manipulation FROM information_schema.triggers WHERE event_object_schema = 'auth' AND event_object_table = 'users';
-- SELECT id, username, email, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 20;
-- SELECT a.id, a.email FROM auth.users a LEFT JOIN public.profiles p ON a.id::text = p.id::text WHERE p.id IS NULL LIMIT 50;
