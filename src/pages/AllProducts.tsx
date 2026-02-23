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
import { useMediaQuery } from '@/hooks/use-media-query';
import type { Product } from '@/lib/products';
import type { OlfactoryFamily } from '@/lib/olfactory';

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

const AllProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    cartItems,
    cartItemsCount,
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
  const { trackPageView, trackPageExit, trackClick } = useAnalytics();
  const { products: storeProducts } = useAdminStore();
  const { toast } = useToast();
  
  // Get family from query params
  const familyFromUrl = searchParams.get('family');
  
  const [activeCategory, setActiveCategory] = useState('tous');
  const [activeFamily, setActiveFamily] = useState<OlfactoryFamily | 'tous'>(familyFromUrl ? (familyFromUrl as OlfactoryFamily) : 'tous');
  const [activeBrand, setActiveBrand] = useState('tous');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { user } = useAuth();

  // Persist the selected family locally and for logged-in users
  const ACTIVE_FAMILY_KEY = 'rayha_active_family';

  // Load persisted family on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_FAMILY_KEY);
      if (stored && activeFamily === 'tous') {
        setActiveFamily(stored as OlfactoryFamily);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist on change and sync to Supabase for authenticated users
  useEffect(() => {
    try {
      if (activeFamily) {
        localStorage.setItem(ACTIVE_FAMILY_KEY, activeFamily);
      }
    } catch {
      // ignore
    }

    if (user?.id && activeFamily && activeFamily !== 'tous') {
      // Fire-and-forget: store user's primary family in scent_profiles
      upsertUserScentProfile(user.id, { primary_family: activeFamily }).catch((err) => {
        console.error('❌ Erreur sauvegarde primary_family:', err);
      });
    }
  }, [activeFamily, user?.id]);

  // Scroll to top when component mounts (only once)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track page view on mount (only once)
  useEffect(() => {
    adminTrackPageView('/all-products');
    trackPageView('/all-products', 'Tous les produits');
    return () => trackPageExit('/all-products');
  }, []);

  // Get unique values for filters
  const categories = ['tous', ...new Set(allProducts.map(p => p.category))];
  
  // All families from the olfactory dictionary
  const families: (OlfactoryFamily | 'tous')[] = ['tous', ...ALL_FAMILIES];
  
  const brands = ['tous', ...new Set(allProducts.map(p => p.brand))];

  // Filter products
  const filteredProducts = allProducts.filter(product => {
    const categoryMatch = activeCategory === 'tous' || product.category === activeCategory;
    const storeProduct = storeProducts.find(p => p.id === product.id);
    const familyMatch = activeFamily === 'tous' || (storeProduct?.families && storeProduct.families.includes(activeFamily));
    const brandMatch = activeBrand === 'tous' || product.brand === activeBrand;
    return categoryMatch && familyMatch && brandMatch;
  });

  const handleAddToCart = (id: string) => {
    const product = allProducts.find(p => p.id === id);
    const storeProduct = storeProducts.find(p => p.id === id);
    
    if (product) {
      // Check stock
      const stock = storeProduct?.stock ?? 0;
      if (stock === 0) {
        toast({
          title: 'Rupture de stock',
          description: `${product.name} est actuellement indisponible.`,
          variant: 'destructive',
        });
        return;
      }
      
      const { ...productData } = product;
      addToCart(productData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 py-6 md:py-8 lg:py-12 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb / Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4 md:mb-6 text-xs md:text-xs tracking-[0.15em] uppercase font-medium min-h-10 px-2"
          >
            <span>←</span>
            Retour à l'accueil
          </button>

          {/* Page Header - Editorial */}
          <div className="mb-6 md:mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight sm:leading-snug md:leading-relaxed mb-3 md:mb-4 text-foreground">
              Tous nos Parfums
            </h1>
            <p className="text-xs md:text-sm text-foreground/70 leading-relaxed md:leading-loose max-w-full md:max-w-[70%] lg:max-w-[80%]">
              Découvrez notre collection complète de parfums d'exception, soigneusement sélectionnés pour tous les goûts et toutes les occasions.
            </p>
          </div>

          {/* Filters Toggle Button & Results Count */}
          <div className="mb-4 md:mb-6 flex items-center justify-between gap-3">
            <motion.button
              onClick={() => setIsFiltersOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 md:py-1.5 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all min-h-10 md:min-h-9 text-xs md:text-xs font-medium"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 15 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Filter className="w-4 h-4" />
              </motion.div>
              <motion.span 
                className="text-xs font-medium white space-nowrap"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Filtres
              </motion.span>
            </motion.button>
            
            {/* Results Count - Right side */}
            <motion.div 
              className="text-xs text-muted-foreground whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
            </motion.div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredProducts.map((product, index) => {
                const storeProduct = storeProducts.find(p => p.id === product.id);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 200,
                      damping: 30,
                      duration: 0.4
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
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">Aucun parfum ne correspond à vos critères de filtrage.</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeFamily={activeFamily}
        setActiveFamily={setActiveFamily}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
        categories={categories}
        families={families}
        brands={brands}
        onApply={() => {}}
        onReset={() => {
          setActiveCategory('tous');
          setActiveFamily('tous');
          setActiveBrand('tous');
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
