-- =====================================================================
-- RAYHA STORE - SUPABASE DATABASE SCHEMA
-- Script de création de la table products
-- Copier-coller ce code dans l'éditeur SQL de Supabase
-- =====================================================================

-- Créer l'enum pour les familles olfactives
CREATE TYPE olfactory_family AS ENUM (
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique'
);

-- Créer l'enum pour les notes de tête
CREATE TYPE tete_note AS ENUM (
  'Bergamote',
  'Citron',
  'Orange',
  'Pamplemousse',
  'Cédrat',
  'Mandarine',
  'Citron vert',
  'Petit grain',
  'Neroli',
  'Gingembre',
  'Poivre blanc',
  'Cardamome',
  'Girofle'
);

-- Créer l'enum pour les notes de cœur
CREATE TYPE coeur_note AS ENUM (
  'Rose',
  'Jasmin',
  'Fleur de lys',
  'Pivoine',
  'Freesia',
  'Violette',
  'Muguet',
  'Géranium',
  'Cèdre',
  'Vetiver',
  'Bois de santal',
  'Cuir',
  'Tabac',
  'Vanille',
  'Tonka',
  'Safran'
);

-- Créer l'enum pour les notes de fond
CREATE TYPE fond_note AS ENUM (
  'Musc',
  'Ambre',
  'Ambre gris',
  'Oud',
  'Bois d''agarwood',
  'Vanille noire',
  'Tonka poudré',
  'Bois blanc',
  'Anis',
  'Vetiver profond',
  'Cèdre sec',
  'Terre mouillée',
  'Incense'
);

-- Table principale des produits
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations de base
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  
  -- Images (URLs)
  image_url TEXT,
  
  -- Notes olfactives (stockées en tant que JSON arrays)
  notes_tete tete_note[] DEFAULT '{}',
  notes_coeur coeur_note[] DEFAULT '{}',
  notes_fond fond_note[] DEFAULT '{}',
  
  -- Familles olfactives
  families olfactory_family[] DEFAULT '{}',
  
  -- Informations d'inventaire
  stock INTEGER NOT NULL DEFAULT 0,
  monthlySales INTEGER NOT NULL DEFAULT 0,
  
  -- Métadonnées
  volume VARCHAR(50),
  category VARCHAR(50),
  scent TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_families ON products USING GIN(families);
CREATE INDEX idx_products_updated_at ON products(updated_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- =====================================================================
-- POLITIQUES DE SÉCURITÉ (Row Level Security)
-- =====================================================================

-- Activer RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut LIRE les produits
CREATE POLICY "Produits lisibles par tous" ON products
  FOR SELECT
  USING (true);

-- Politique: Les utilisateurs authentifiés peuvent INSÉRER
CREATE POLICY "Utilisateurs auth peuvent insérer" ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Politique: Les utilisateurs authentifiés peuvent MODIFIER
CREATE POLICY "Utilisateurs auth peuvent modifier" ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Politique: Les utilisateurs authentifiés peuvent SUPPRIMER
CREATE POLICY "Utilisateurs auth peuvent supprimer" ON products
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================================
-- Insertion des données initiales (optionnel)
-- Décommenter et exécuter après avoir configuré les authentifications
-- =====================================================================

/*
INSERT INTO products (name, brand, price, description, image_url, notes_tete, notes_coeur, notes_fond, families, stock, monthlySales, volume, category, scent) VALUES
('Éclat Doré', 'Maison Rayha', 129.00, 'Un parfum enveloppant qui combine les notes sucrées de la vanille avec des touches de caramel.', 'https://example.com/perfume1.jpg', ARRAY['Citron']::tete_note[], ARRAY['Vanille']::coeur_note[], ARRAY['Musc']::fond_note[], ARRAY['Gourmand']::olfactory_family[], 45, 85, '50ml', 'femme', 'Gourmand'),
('Rose Éternelle', 'Atelier Noble', 145.00, 'Une célébration de la rose dans toute sa splendeur.', 'https://example.com/perfume2.jpg', ARRAY['Bergamote']::tete_note[], ARRAY['Rose', 'Jasmin']::coeur_note[], ARRAY['Musc']::fond_note[], ARRAY['Floral']::olfactory_family[], 28, 62, '50ml', 'femme', 'Floral'),
('Nuit Mystique', 'Le Parfumeur', 98.00, 'Un parfum profond et enveloppant aux accents boisés.', 'https://example.com/perfume3.jpg', ARRAY['Poivre blanc']::tete_note[], ARRAY['Cèdre', 'Vetiver']::coeur_note[], ARRAY['Terre mouillée']::fond_note[], ARRAY['Boisé']::olfactory_family[], 120, 43, '100ml', 'homme', 'Boisé');
*/
