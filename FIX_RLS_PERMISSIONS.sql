-- ============================================================================
-- CORRECTIF COMPLET: RLS + ENUM → TEXT[]
-- ============================================================================

-- ===== PARTIE 1: FIX RLS PERMISSIONS =====
DROP POLICY IF EXISTS "Products: Only admins can modify" ON public.products;
DROP POLICY IF EXISTS "Products: Only admins can delete" ON public.products;
DROP POLICY IF EXISTS "Products: Only admins can insert" ON public.products;
DROP POLICY IF EXISTS "Products: Anyone can view products" ON public.products;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products: Anyone can view products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Products: Authenticated users can insert"
  ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Products: Authenticated users can update"
  ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Products: Authenticated users can delete"
  ON public.products FOR DELETE USING (auth.uid() IS NOT NULL);

-- ===== PARTIE 2: CONVERTIR ENUM[] → TEXT[] =====
-- Cela corrige l'erreur "invalid input value for enum"
-- et permet d'ajouter librement de nouvelles notes

ALTER TABLE public.products
  ALTER COLUMN notes_tete TYPE TEXT[] USING notes_tete::TEXT[],
  ALTER COLUMN notes_coeur TYPE TEXT[] USING notes_coeur::TEXT[],
  ALTER COLUMN notes_fond TYPE TEXT[] USING notes_fond::TEXT[];

-- Supprimer les anciens types enum (optionnel, nettoyage)
DROP TYPE IF EXISTS tete_note CASCADE;
DROP TYPE IF EXISTS coeur_note CASCADE;
DROP TYPE IF EXISTS fond_note CASCADE;
