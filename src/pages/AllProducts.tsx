import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { upsertUserScentProfile } from '@/integrations/supabase/supabase';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import FilterDrawer from '@/components/FilterDrawer';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useAdminStore } from '@/store/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import type { OlfactoryFamily } from '@/lib/olfactory';
import bannerImage from '@/assets/image_2.webp';

// All olfactory families from the dictionary
const ALL_FAMILIES: OlfactoryFamily[] = [
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique',
];

// Courbe très douce pour les animations "luxe"
const silkyEase = [0.25, 0.1, 0.25, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: silkyEase } }
};

const AllProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    cartItems,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    applyPromoCode,
    clearPromoCode,
  } = useCart();
  
  const { trackPageView: adminTrackPageView, products: allProducts } = useAdmin();
  const { trackPageView, trackPageExit } = useAnalytics();
  const { products: storeProducts } = useAdminStore();
  const { toast } = useToast();
  
  // Get family from query params
  const familyFromUrl = searchParams.get('family');
  
  // Multi-select : tableaux vides = "tous" (aucun filtre actif)
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeFamilies, setActiveFamilies] = useState<OlfactoryFamily[]>(
    familyFromUrl ? [familyFromUrl as OlfactoryFamily] : []
  );
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { user } = useAuth();

  const ACTIVE_FAMILY_KEY = 'rayha_active_family';

  // Load persisted family on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_FAMILY_KEY);
      if (stored && activeFamilies.length === 0) {
        setActiveFamilies([stored as OlfactoryFamily]);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist on change and sync to Supabase for authenticated users
  useEffect(() => {
    try {
      if (activeFamilies.length > 0) {
        localStorage.setItem(ACTIVE_FAMILY_KEY, activeFamilies[0]);
      }
    } catch { /* ignore */ }

    if (user?.id && activeFamilies.length > 0) {
      upsertUserScentProfile(user.id, { primary_family: activeFamilies[0] }).catch((err) => {
        console.error('❌ Erreur sauvegarde primary_family:', err);
      });
    }
  }, [activeFamilies, user?.id]);

  // Helpers toggle
  const toggleCategory = (val: string) => {
    if (val === 'tous') { setActiveCategories([]); return; }
    setActiveCategories(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };
  const toggleFamily = (val: OlfactoryFamily | 'tous') => {
    if (val === 'tous') { setActiveFamilies([]); return; }
    setActiveFamilies(prev =>
      prev.includes(val as OlfactoryFamily)
        ? prev.filter(v => v !== val)
        : [...prev, val as OlfactoryFamily]
    );
  };
  const toggleBrand = (val: string) => {
    if (val === 'tous') { setActiveBrands([]); return; }
    setActiveBrands(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track page view
  useEffect(() => {
    adminTrackPageView('/all-products');
    trackPageView('/all-products', 'Tous les produits');
    return () => trackPageExit('/all-products');
  }, []);

  // Get unique values for filters
  const categories = ['tous', ...new Set(allProducts.map(p => p.category))];
  const families: (OlfactoryFamily | 'tous')[] = ['tous', ...ALL_FAMILIES];
  const brands = ['tous', ...new Set(allProducts.map(p => p.brand))];

  // Filter products (tableaux vides = pas de filtre = tout afficher)
  const filteredProducts = allProducts.filter(product => {
    const categoryMatch = activeCategories.length === 0 || activeCategories.includes(product.gender ?? '');
    const storeProduct = storeProducts.find(p => p.id === product.id);
    const familyMatch = activeFamilies.length === 0 ||
      activeFamilies.some(f => storeProduct?.families?.includes(f));
    const brandMatch = activeBrands.length === 0 || activeBrands.includes(product.brand);
    return categoryMatch && familyMatch && brandMatch;
  });

  const handleAddToCart = (id: string) => {
    const product = allProducts.find(p => p.id === id);
    const storeProduct = storeProducts.find(p => p.id === id);
    
    if (product) {
      const stock = storeProduct?.stock ?? 0;
      if (stock === 0) {
        toast({
          title: 'Rupture de stock',
          description: `${product.name} est actuellement indisponible.`,
          variant: 'destructive',
        });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ...productData } = product;
      addToCart(productData as any);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      
      <main className="flex-1 py-6 md:py-8 lg:py-12 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          
          {/* Breadcrumb / Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors mb-4 md:mb-6 text-[10px] md:text-xs tracking-[0.15em] uppercase font-medium min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l'accueil
          </button>

          {/* ── BANNIÈRE EN-TÊTE DE PAGE (Éditorial & Luxe) ── */}
          <motion.div
            className="relative w-full h-[160px] sm:h-[200px] md:h-[280px] lg:h-[320px] rounded-xl md:rounded-2xl overflow-hidden mb-8 md:mb-12 flex items-center justify-center"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: silkyEase }}
          >
            <img
              src={bannerImage}
              alt="Bibliothèque de parfums"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <motion.div
              className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span variants={fadeUpItem} className="text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.25em] mb-1.5 md:mb-2 block font-medium">
                La Collection
              </motion.span>
              <motion.h1 variants={fadeUpItem} className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-1.5 md:mb-3 text-white drop-shadow-lg">
                Tous nos Parfums
              </motion.h1>
              <motion.div variants={fadeUpItem} className="h-px w-12 md:w-16 bg-[#D4AF37] mb-2 md:mb-3 opacity-70" />
              <motion.p variants={fadeUpItem} className="text-xs md:text-sm text-white/80 max-w-lg mx-auto font-light tracking-wide hidden sm:block">
                Découvrez notre sélection complète de fragrances d'exception, soigneusement imaginées pour toutes vos émotions.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Filters Toggle Button & Results Count */}
          <div className="mb-6 md:mb-10 flex items-center justify-between gap-3">
            {/* BOUTON FILTRE LUXE */}
            <motion.button
              onClick={() => setIsFiltersOpen(true)}
              className="group relative overflow-hidden rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "#0E0E0E",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.3)"
              }}
              whileHover={{
                borderColor: "rgba(212, 175, 55, 0.6)",
                boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
              }}
              whileTap={{ scale: 0.98, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: silkyEase }}
            >
              <motion.div
                className="relative z-10 flex items-center gap-2 px-5 py-3"
                initial={{ color: "#FFFFFF" }}
                whileHover={{ color: "#D4AF37" }}
                transition={{ duration: 0.4, ease: silkyEase }}
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Filter className="w-3.5 h-3.5" />
                </motion.div>
                <span className="font-montserrat text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
                  Filtres
                </span>
              </motion.div>
            </motion.button>
            
            {/* Results Count - Right side */}
            <motion.div 
              className="text-xs text-[#1a1a1a]/60 uppercase tracking-widest font-medium whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {filteredProducts.length} Résultat{filteredProducts.length !== 1 ? 's' : ''}
            </motion.div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-16 md:mb-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {filteredProducts.map((product, index) => {
                const storeProduct = storeProducts.find(p => p.id === product.id);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.4 + (index * 0.05), // L'apparition commence après la bannière
                      type: 'spring',
                      stiffness: 200,
                      damping: 30,
                    }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      brand={product.brand}
                      price={product.price}
                      image={product.image}
                      scent={product.scent}
                      notes={product.notes}
                      stock={storeProduct?.stock ?? 0}
                      notes_tete={storeProduct?.notes_tete}
                      notes_coeur={storeProduct?.notes_coeur}
                      notes_fond={storeProduct?.notes_fond}
                      families={storeProduct?.families}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12 md:py-16 lg:py-20 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-[#1a1a1a]/60 italic font-light mb-4 md:mb-6">
                Aucun parfum ne correspond à vos critères actuels.
              </p>
              <button
                onClick={() => {
                  setActiveCategories([]);
                  setActiveFamilies([]);
                  setActiveBrands([]);
                }}
                className="text-xs text-[#A68A56] hover:text-[#D4AF37] uppercase tracking-widest font-medium transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        activeCategories={activeCategories}
        toggleCategory={toggleCategory}
        activeFamilies={activeFamilies}
        toggleFamily={toggleFamily}
        activeBrands={activeBrands}
        toggleBrand={toggleBrand}
        families={families}
        brands={brands}
        onApply={() => {}}
        onReset={() => {
          setActiveCategories([]);
          setActiveFamilies([]);
          setActiveBrands([]);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        promoCode={promoCode}
        promoDiscount={promoDiscount}
        onApplyPromo={applyPromoCode}
        onClearPromo={clearPromoCode}
      />
    </div>
  );
};

export default AllProducts;