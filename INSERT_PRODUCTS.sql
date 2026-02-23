-- =====================================================================
-- INSERTION DES 21 PARFUMS RAYHA STORE
-- =====================================================================

INSERT INTO products (name, brand, price, description, image_url, families, stock, monthlySales, volume, category, scent) VALUES

-- 1. Éclat Doré
('Éclat Doré', 'Maison Rayha', 129.00, 'Un parfum enveloppant qui combine les notes sucrées de la vanille avec des touches de caramel. Éclat Doré est une fragrance intemporelle qui vous séduira à chaque port.', 'https://images.unsplash.com/photo-1594998629526-0d4e7d785400?w=400&h=500&fit=crop', ARRAY['Gourmand']::olfactory_family[], 50, 85, '50ml', 'femme', 'Gourmand'),

-- 2. Rose Éternelle
('Rose Éternelle', 'Atelier Noble', 145.00, 'Une célébration de la rose dans toute sa splendeur. Rose Éternelle capture l''essence délicate de la fleur la plus noble, rehaussée par des notes de jasmin et de pivoine.', 'https://images.unsplash.com/photo-1588405748855-01141f64d5c1?w=400&h=500&fit=crop', ARRAY['Floral']::olfactory_family[], 35, 72, '50ml', 'femme', 'Floral'),

-- 3. Nuit Mystique
('Nuit Mystique', 'Le Parfumeur', 98.00, 'Un parfum profond et enveloppant aux accents boisés. Nuit Mystique révèle une personnalité complexe avec ses notes de cèdre, de vetiver et de cuir.', 'https://images.unsplash.com/photo-1556821552-5ff63b1ce257?w=400&h=500&fit=crop', ARRAY['Boisé']::olfactory_family[], 60, 68, '100ml', 'homme', 'Boisé'),

-- 4. Ambre Sauvage
('Ambre Sauvage', 'Maison Rayha', 175.00, 'Une fragrance orientale mystérieuse et séductive. Ambre Sauvage allie l''ambre chaud aux épices exotiques pour créer une sillage envoûtant.', 'https://images.unsplash.com/photo-1583394838336-acd977660ba7?w=400&h=500&fit=crop', ARRAY['Oriental','Épicé']::olfactory_family[], 25, 55, '75ml', 'unisex', 'Oriental'),

-- 5. Oud Royal
('Oud Royal', 'Collection Privée', 220.00, 'Le nec plus ultra du luxe olfactif. Oud Royal est une création exclusive avec un oud noble et raffiné, sublimé par des accords ambrés et floraux.', 'https://images.unsplash.com/photo-1571975797133-57b5e6b0c2fd?w=400&h=500&fit=crop', ARRAY['Oriental']::olfactory_family[], 15, 42, '50ml', 'unisex', 'Oriental'),

-- 6. Brise Marine
('Brise Marine', 'Atelier Noble', 89.00, 'Une fragrance vivifiante et tonique qui capture l''essence de l''océan. Brise Marine offre un sillage frais et aérien, parfait pour tous les jours.', 'https://images.unsplash.com/photo-1629198688000-71f06b44f3bb?w=400&h=500&fit=crop', ARRAY['Frais/Aquatique']::olfactory_family[], 70, 95, '100ml', 'homme', 'Frais'),

-- 7. Velours Noir
('Velours Noir', 'Maison Rayha', 165.00, 'Une fragrance sensuelle et enveloppante qui capture l''élégance et le mystère. Velours Noir offre une expérience sensorielle riche avec ses notes chaudes et complexes.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop', ARRAY['Oriental']::olfactory_family[], 30, 60, '50ml', 'femme', 'Oriental'),

-- 8. Cristal Infini
('Cristal Infini', 'Essences Royales', 195.00, 'Une création florale cristalline qui scintille sur la peau. Cristal Infini combine la délicatesse de l''or blanc avec des notes florales sublimes pour un sillage éternel.', 'https://images.unsplash.com/photo-1577720643272-265f434884f2?w=400&h=500&fit=crop', ARRAY['Floral']::olfactory_family[], 20, 50, '50ml', 'femme', 'Floral'),

-- 9. Symphonie Épicée
('Symphonie Épicée', 'Le Parfumeur', 142.00, 'Une composition épicée et harmonieuse qui évoque l''exotisme. Symphonie Épicée joue une mélodie boisée rehaussée par des notes de girofle et de cannelle.', 'https://images.unsplash.com/photo-1615634260667-3eedffd80dfd?w=400&h=500&fit=crop', ARRAY['Épicé','Boisé']::olfactory_family[], 40, 58, '100ml', 'homme', 'Épicé'),

-- 10. Jardin Secret
('Jardin Secret', 'Atelier Nature', 135.00, 'Un parfum qui révèle les secrets d''un jardin caché. Jardin Secret enveloppe la peau avec des notes florales délicates et des touches herbacées apaisantes.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=500&fit=crop', ARRAY['Floral']::olfactory_family[], 45, 70, '75ml', 'femme', 'Floral'),

-- 11. Fumée d'Encens
('Fumée d''Encens', 'Collection Rare', 210.00, 'Une fragrance mystique inspirée par l''encens sacré. Fumée d''Encens combine des notes boisées profondes avec des accords spicés pour une présence captivante.', 'https://images.unsplash.com/photo-1516533900298-be2b5a1997e6?w=400&h=500&fit=crop', ARRAY['Boisé','Épicé']::olfactory_family[], 18, 45, '60ml', 'unisex', 'Boisé'),

-- 12. Harmonie Douce
('Harmonie Douce', 'Maison Rayha', 118.00, 'Un parfum gourmand et harmonieux qui séduit par sa douceur. Harmonie Douce offre un équilibre parfait entre sucre et finesse pour une journée ensoleillée.', 'https://images.unsplash.com/photo-1624525267537-b88a08aaff2f?w=400&h=500&fit=crop', ARRAY['Gourmand']::olfactory_family[], 55, 80, '50ml', 'femme', 'Gourmand'),

-- 13. Forêt Profonde
('Forêt Profonde', 'Atelier Noble', 155.00, 'Plongez dans les profondeurs d''une forêt ancestrale. Forêt Profonde révèle des notes boisées massives avec une touche de mystère et d''aventure.', 'https://images.unsplash.com/photo-1606375259368-e0db5814acc7?w=400&h=500&fit=crop', ARRAY['Boisé']::olfactory_family[], 38, 65, '100ml', 'homme', 'Boisé'),

-- 14. Essence Citée
('Essence Citée', 'Le Parfumeur', 125.00, 'L''essence urbaine capturée dans un flacon. Essence Citée offre une fraîcheur dynamique avec des notes toniques et aériennes, parfaite pour les esprits modernes.', 'https://images.unsplash.com/photo-1585286307256-6a6fb00c9bef?w=400&h=500&fit=crop', ARRAY['Frais/Aquatique','Épicé']::olfactory_family[], 65, 88, '75ml', 'unisex', 'Frais'),

-- 15. Ballet Floral
('Ballet Floral', 'Essences Royales', 148.00, 'Un ballet de fleurs qui dansent sur la peau. Ballet Floral est une symphonie florale élégante et poétique qui se déploie progressivement.', 'https://images.unsplash.com/photo-1597318972826-2c6f63fa5a11?w=400&h=500&fit=crop', ARRAY['Floral']::olfactory_family[], 32, 62, '50ml', 'femme', 'Floral'),

-- 16. Esprit Viril
('Esprit Viril', 'Maison Rayha', 152.00, 'Une fragrance masculine qui incarne la force et l''assurance. Esprit Viril allie des notes boisées nobles avec une touche de pouvoir épicé.', 'https://images.unsplash.com/photo-1589394915889-c3f1a8ee8b89?w=400&h=500&fit=crop', ARRAY['Boisé','Épicé']::olfactory_family[], 42, 70, '100ml', 'homme', 'Boisé'),

-- 17. Plaisir Sucré
('Plaisir Sucré', 'Atelier Nature', 112.00, 'Une pause gourmande sur la peau. Plaisir Sucré célèbre les délices sucrés avec une note de caramel, amande et vanille pour un sillage réconfortant.', 'https://images.unsplash.com/photo-1610601505213-11fdbce56b23?w=400&h=500&fit=crop', ARRAY['Gourmand']::olfactory_family[], 48, 75, '50ml', 'femme', 'Gourmand'),

-- 18. Mystère Bleu
('Mystère Bleu', 'Collection Rare', 180.00, 'Le mystère de l''océan profond capturé en fragrance. Mystère Bleu offre une fraîcheur cristalline avec des notes aqueuses et une profondeur captivante.', 'https://images.unsplash.com/photo-1617638925703-92ef742852ec?w=400&h=500&fit=crop', ARRAY['Frais/Aquatique']::olfactory_family[], 22, 52, '75ml', 'unisex', 'Frais'),

-- 19. Passion Orientale
('Passion Orientale', 'Essences Royales', 170.00, 'Une fragrance exotique et passionnée qui évoque les soirées envoûtantes. Passion Orientale séduira avec ses notes ambrées chaudes et épicées.', 'https://images.unsplash.com/photo-1606375259370-f9b0ab91afbb?w=400&h=500&fit=crop', ARRAY['Oriental','Épicé']::olfactory_family[], 28, 58, '50ml', 'femme', 'Oriental'),

-- 20. Écho Minéral
('Écho Minéral', 'Le Parfumeur', 138.00, 'Une fragrance minérale et épicée inspirée par la géologie. Écho Minéral révèle des notes de pierre humide et de poivre pour une présence puissante.', 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=500&fit=crop', ARRAY['Épicé','Boisé']::olfactory_family[], 50, 66, '100ml', 'homme', 'Épicé'),

-- 21. Aurore Douce
('Aurore Douce', 'Atelier Noble', 128.00, 'Capturez la douceur de l''aurore. Aurore Douce est une fragrance légère et gracieuse avec des notes florales matinales et une touche de miel.', 'https://images.unsplash.com/photo-1618530589390-a6a17e1ebb34?w=400&h=500&fit=crop', ARRAY['Floral']::olfactory_family[], 52, 82, '50ml', 'femme', 'Floral');
