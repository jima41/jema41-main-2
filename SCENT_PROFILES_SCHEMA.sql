-- =====================================================================
-- RAYHA STORE - SCENT PROFILES TABLE
-- Table pour stocker les profils olfactifs des utilisateurs
-- =====================================================================

-- Créer la table scent_profiles
CREATE TABLE IF NOT EXISTS scent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_family olfactory_family,
  secondary_family olfactory_family,
  notes_preferred TEXT[] DEFAULT '{}',
  quiz_history JSONB DEFAULT '{}',
  scent_score JSONB DEFAULT '{}', -- Pour stocker les scores par famille
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte pour s'assurer qu'une seule entrée par utilisateur
  UNIQUE(user_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_scent_profiles_user_id ON scent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scent_profiles_primary_family ON scent_profiles(primary_family);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_scent_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scent_profiles_updated_at
  BEFORE UPDATE ON scent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_scent_profiles_updated_at();

-- Politiques RLS (Row Level Security)
ALTER TABLE scent_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir/modifier leur propre profil
CREATE POLICY "Users can view their own scent profile" ON scent_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scent profile" ON scent_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scent profile" ON scent_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all scent profiles" ON scent_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.username = 'admin'
    )
  );

CREATE POLICY "Admins can update all scent profiles" ON scent_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.username = 'admin'
    )
  );