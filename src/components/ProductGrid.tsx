import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerNosParfum from '@/assets/bannernosparfum.webp';
import ProductCard from './ProductCard';
import { useAdmin } from '@/context/AdminContext';
import { useAdminStore } from '@/store/useAdminStore';
import { useFeaturedProducts } from '@/store/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';
import {
  sectionVariants,
  staggerContainerVariants,
  staggerItemVariants,
  viewportOnce,
} from '@/lib/animations';

// Courbe très douce pour le survol et l'apparition (effet luxe)
const silkyEase = [0.25, 0.1, 0.25, 1];

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
  const navigate = useNavigate();
  const { products } = useAdmin();
  const { products: storeProducts } = useAdminStore();
  const { getFeaturedProducts, featuredProductIds } = useFeaturedProducts();
  const { toast } = useToast();
  const lastNonEmptyProductsRef = useRef<Product[]>([]);

  // Get featured products if any are selected, otherwise show all products
  const displayProducts = useMemo(() => {
    if (featuredProductIds.length > 0) {
      const featured = getFeaturedProducts();
      return featured.length > 0 ? featured : products;
    }
    return products;
  }, [featuredProductIds, getFeaturedProducts, products]);

  const stableDisplayProducts = useMemo(() => {
    if (displayProducts.length > 0) {
      return displayProducts;
    }
    return lastNonEmptyProductsRef.current;
  }, [displayProducts]);

  useEffect(() => {
    if (displayProducts.length > 0) {
      lastNonEmptyProductsRef.current = displayProducts;
    }
  }, [displayProducts]);

  const handleAddToCart = (id: string) => {
    const product = products.find(p => p.id === id);
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
      onAddToCart(product as any);
    }
  };

  return (
    <section id="notre-selection" className="py-12 md:py-16 lg:py-24 px-5 sm:px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        
        {/* ── BANNIÈRE EN-TÊTE DE SECTION (Format Panoramique) ── */}
        <motion.div
          // MODIFICATION ICI : Hauteurs affinées pour un rendu "bandeau large" sur tous les écrans
          className="relative w-full h-[150px] sm:h-[180px] md:h-[200px] lg:h-[240px] xl:h-[300px] rounded-xl md:rounded-2xl overflow-hidden mb-10 md:mb-16 flex items-center justify-center group"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {/* L'image de fond qui arrive en glissant de la droite */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            variants={{
              hidden: { x: '15%', scale: 1.15, opacity: 0 },
              visible: { 
                x: 0, 
                scale: 1, 
                opacity: 1, 
                transition: { duration: 1.4, ease: silkyEase } 
              }
            }}
          >
            <img
              src={bannerNosParfum}
              alt="Notre Collection"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay sombre pour garantir la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-700" />
            {/* Dégradé subtil en bas pour l'élégance */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </motion.div>

          {/* Le texte qui apparaît délicatement par-dessus */}
          <motion.div 
            className="relative z-10 text-center px-4 flex flex-col items-center"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { 
                y: 0, 
                opacity: 1, 
                transition: { duration: 0.8, delay: 0.4, ease: silkyEase } 
              }
            }}
          >
            <span className="text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.3em] mb-1.5 md:mb-2 block font-medium">
              Découvrez
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-1.5 md:mb-3 text-white drop-shadow-lg">
              Notre Collection
            </h2>
            <div className="h-px w-12 md:w-16 bg-[#D4AF37] mb-2 md:mb-3 opacity-70" />
            <p className="text-xs md:text-sm text-white/90 max-w-sm mx-auto font-light tracking-wide drop-shadow-md hidden sm:block">
              Des fragrances d'exception pour chaque personnalité
            </p>
          </motion.div>
        </motion.div>

        {/* Filters placeholder */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8 md:mb-12">
        </div>

        {/* Product Grid — stagger whileInView */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {stableDisplayProducts.map((product) => {
            const storeProduct = storeProducts.find(p => p.id === product.id);
            return (
              <motion.div key={product.id} variants={staggerItemVariants}>
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

        {/* View All Button - MISE À JOUR LUXE */}
        <div className="flex justify-center mt-12 md:mt-16">
          <motion.button
            onClick={() => navigate('/all-products')}
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
            transition={{ duration: 0.8, ease: silkyEase }}
          >
            <motion.div 
              className="relative z-10 flex items-center justify-center gap-3 px-6 py-3 md:py-3.5 w-full"
              initial={{ color: "#FFFFFF" }}
              whileHover={{ color: "#D4AF37" }}
              transition={{ duration: 0.6, ease: silkyEase }}
            >
              <span className="font-montserrat text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase">
                Voir tous les parfums
              </span>
              
              <motion.svg 
                width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                initial={{ x: 0, opacity: 0.8 }}
                whileHover={{ x: 4, opacity: 1 }}
                transition={{ duration: 0.6, ease: silkyEase }}
              >
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            </motion.div>
          </motion.button>
        </div>
        
      </div>
    </section>
  );
};

export default ProductGrid;