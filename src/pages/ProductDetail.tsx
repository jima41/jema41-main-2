import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Heart, ChevronLeft, ChevronRight, Minus, Plus, ChevronDown, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SimpleOlfactoryDisplay from '@/components/SimpleOlfactoryDisplay';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAdminStore } from '@/store/useAdminStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProductTracking } from '@/hooks/use-page-tracking';
import { getTopFamilies } from '@/lib/olfactory';
import { renderSimpleMarkdown } from '@/lib/markdown';
import type { Product } from '@/lib/products';

// Courbe très douce pour le survol du bouton luxe
const silkyEase = [0.25, 0.1, 0.25, 1];

// ─── COMPOSANT ACCORDÉON (Version Claire) ───
const AccordionItem = ({ title, id, isOpen, onToggle, children }: { title: string, id: string, isOpen: boolean, onToggle: (id: string) => void, children: React.ReactNode }) => {
  return (
    <div className="border-b border-[#EAEAEA]">
      <button
        onClick={() => onToggle(id)}
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-[11px] md:text-xs uppercase tracking-[0.2em] font-medium text-[#1a1a1a]/80 group-hover:text-[#D4AF37] transition-colors duration-300">
          {title}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          <ChevronDown className="w-4 h-4 text-[#1a1a1a]/40 group-hover:text-[#D4AF37] transition-colors duration-300" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 pt-1 text-sm text-[#666666] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ───
const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  
  const { trackPageView, products } = useAdmin();
  const { products: storeProducts } = useAdminStore();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuth();
  
  const [isFav, setIsFav] = useState(false);
  const [productName, setProductName] = useState('Produit');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('sm');
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchCurrent, setTouchCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const [openAccordions, setOpenAccordions] = useState<string[]>(['notes']);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getVisibleCount = () => {
    if (screenSize === 'sm') return 2;
    if (screenSize === 'md') return 3;
    return 5;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setScreenSize('lg');
      else if (window.innerWidth >= 768) setScreenSize('md');
      else setScreenSize('sm');
      setCarouselIndex(0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchCurrent(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchCurrent(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const distance = touchStart - touchCurrent;
    const threshold = 20; 
    const maxSwipe = 100; 
    if (Math.abs(distance) < threshold) return;
    if (distance > threshold) {
      const swipeStrength = Math.min(Math.abs(distance) / maxSwipe, 1);
      const itemsToMove = Math.ceil(swipeStrength * 2);
      setCarouselIndex(Math.min(recommendedProducts.length - getVisibleCount() + 1, carouselIndex + itemsToMove));
    }
    if (distance < -threshold) {
      const swipeStrength = Math.min(Math.abs(distance) / maxSwipe, 1);
      const itemsToMove = Math.ceil(swipeStrength * 2);
      setCarouselIndex(Math.max(0, carouselIndex - itemsToMove));
    }
  };

  useProductTracking(id || '', productName);

  useEffect(() => {
    if (id && storeProducts.length > 0) {
      const foundProduct = storeProducts.find(p => p.id === id);
      if (foundProduct) setProductName(foundProduct.name);
    }
  }, [id, storeProducts]);

  useEffect(() => {
    if (id) setIsFav(isFavorite(id));
  }, [id, isFavorite]);

  useEffect(() => {
    if (products.length > 0 && id) {
      const otherProducts = products.filter(p => p.id !== id);
      const shuffled = [...otherProducts].sort(() => Math.random() - 0.5);
      let recommended = [...shuffled];
      while (recommended.length < 12 && shuffled.length > 0) {
        recommended = [...recommended, ...shuffled].slice(0, 12);
      }
      setRecommendedProducts(recommended.slice(0, 12));
    }
  }, [id, products]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (id) trackPageView(`/product/${id}`);
  }, [id, trackPageView]);

  const product = products.find(p => p.id === id);
  const storeProduct = storeProducts.find(p => p.id === id);
  const stock = storeProduct?.stock ?? 0;
  const price = product?.price || 0;
  const isOutOfStock = stock === 0;

  const concentrationRaw = storeProduct?.concentration || product?.concentration || 'EDP';
  const topFamilies = getTopFamilies(
    storeProduct?.notes_tete || product?.notes_tete || [], 
    storeProduct?.notes_coeur || product?.notes_coeur || [], 
    storeProduct?.notes_fond || product?.notes_fond || [], 
    storeProduct?.families || product?.families || [], 3
  );
  
  const CONCENTRATION_LABELS: Record<string, string> = {
    EX: 'Extrait de Parfum',
    EDP: 'Eau de Parfum',
    EDT: 'Eau de Toilette',
  };
  const concentrationLabel = CONCENTRATION_LABELS[concentrationRaw] || 'Eau de Parfum';

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-[#1a1a1a]">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-normal mb-4">Produit introuvable</h1>
            <Button onClick={() => navigate('/')} className="bg-[#1a1a1a] text-white hover:bg-[#D4AF37]">
              Retour à l'accueil
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (stock === 0) {
      toast({
        title: 'Rupture de stock',
        description: `${product.name} est actuellement indisponible.`,
        variant: 'destructive',
      });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { description, notes, volume, ...productData } = product;
    addToCart(productData as any, quantity);
    setQuantity(1);
    toast({
      title: 'Ajouté au panier',
      description: `${quantity}x ${product.name}`,
    });
  };

  const handleToggleFavorite = () => {
    if (id && user?.id) {
      toggleFavorite(user.id, id);
      setIsFav(!isFav);
      toast({
        title: isFav ? 'Retiré de vos coups de cœur' : 'Ajouté à vos coups de cœur',
        description: product.name,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-[#1a1a1a]">

      <main className="flex-1 py-8 md:py-12 lg:py-16 pb-28 md:pb-0">
        <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
          
          <button
            onClick={() => navigate('/all-products')}
            className="inline-flex items-center gap-2 md:gap-3 text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors mb-6 md:mb-8 min-h-10 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm tracking-wider uppercase font-medium">Retour à la collection</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-16 lg:mb-24 items-start">
            
            {/* ─── Colonne Gauche (Image Fixe - Réduite sur Mobile) ──────────────── */}
            <div className="lg:sticky lg:top-24 flex justify-center lg:block">
              <div 
                // MODIFICATION ICI : w-[80%] et max-w-[320px] sur mobile, puis pleine largeur sur md/lg
                className="aspect-[4/5] w-[80%] max-w-[320px] md:max-w-none md:w-full rounded-xl md:rounded-2xl bg-white overflow-hidden relative group"
                style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover ${
                    stock === 0 ? 'grayscale backdrop-blur-sm' : ''
                  }`}
                />
                
                {stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <p className="font-serif text-2xl text-[#D4AF37] font-light tracking-[0.3em] uppercase drop-shadow-lg">
                      ÉPUISÉ
                    </p>
                  </div>
                )}
                
                <motion.button
                  onClick={handleToggleFavorite}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md transition-all duration-300 z-10 flex items-center justify-center border border-white/30 hover:border-[#D4AF37]/50 shadow-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    strokeWidth={1.5}
                    className={`w-5 h-5 transition-all duration-300 ${
                      isFav ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#1a1a1a]/70 hover:text-[#D4AF37]'
                    }`}
                  />
                </motion.button>
              </div>
            </div>

            {/* ─── Colonne Droite (Informations) ──────────────── */}
            <div className="flex flex-col justify-start">
              
              <div className="mb-6 md:mb-8 text-center md:text-left pt-2 md:pt-0">
                <p className="text-[10px] md:text-xs font-medium text-[#A68A56] uppercase tracking-[0.2em] mb-2">
                  {product.brand}
                </p>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-tight mb-3 text-[#1a1a1a]">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-5">
                  <span className="text-[10px] text-[#1a1a1a]/60 uppercase tracking-widest border border-[#1a1a1a]/10 px-2 py-1 rounded-sm">
                    {concentrationLabel}
                  </span>
                  {topFamilies && topFamilies.length > 0 && (
                    <span className="text-[10px] text-[#A68A56] uppercase tracking-widest italic">
                      {topFamilies.join(' · ')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center md:items-start gap-1">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl lg:text-3xl font-sans font-medium tracking-wide text-[#1a1a1a] tabular-nums">
                      {price.toFixed(2)} €
                    </span>
                    {!isOutOfStock && stock > 0 && stock < 5 && (
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#0E0E0E] font-bold bg-[#A68A56] px-2.5 py-1 rounded-sm">
                        Stock limité
                      </span>
                    )}
                  </div>
                  {(product.volume || storeProduct?.volume) && (
                    <span className="text-sm text-[#1a1a1a]/40 italic font-light">
                      {storeProduct?.volume || product.volume}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent mb-8" />

              {/* ── BLOC D'ACHAT DESKTOP ── */}
              <div className="hidden md:block bg-white border border-[#EAEAEA] rounded-xl p-5 mb-10 shadow-sm">
                {stock === 0 ? (
                  <button disabled className="w-full min-h-[50px] border border-[#EAEAEA] rounded-lg text-[#1a1a1a]/40 text-sm font-medium tracking-widest uppercase cursor-not-allowed">
                    Rupture de stock
                  </button>
                ) : (
                  <div className="flex flex-row gap-4">
                    <div className="flex items-center min-h-[50px] bg-[#F9F9F9] border border-[#EAEAEA] rounded-lg overflow-hidden flex-shrink-0">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-12 h-full flex items-center justify-center text-[#1a1a1a]/60 hover:text-[#D4AF37] hover:bg-[#1a1a1a]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                      <span className="w-10 flex items-center justify-center text-sm font-medium text-[#1a1a1a] select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                        disabled={quantity >= stock}
                        className="w-12 h-full flex items-center justify-center text-[#1a1a1a]/60 hover:text-[#D4AF37] hover:bg-[#1a1a1a]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* BOUTON D'AJOUT LUXE */}
                    <motion.button
                      onClick={handleAddToCart}
                      className="group relative flex-1 overflow-hidden rounded-lg flex items-center justify-center min-h-[50px]"
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
                        className="relative z-10 flex items-center justify-center gap-3 px-4 py-3 w-full"
                        initial={{ color: "#FFFFFF" }}
                        whileHover={{ color: "#D4AF37" }}
                        transition={{ duration: 0.6, ease: silkyEase }}
                      >
                        <span className="font-montserrat text-xs font-bold tracking-[0.2em] uppercase">
                          Ajouter au panier
                        </span>
                        
                        <motion.div 
                          initial={{ x: 0, opacity: 0.8 }}
                          whileHover={{ x: 4, opacity: 1 }}
                          transition={{ duration: 0.6, ease: silkyEase }}
                        >
                          <ShoppingBag strokeWidth={1.5} className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* ── L'HISTOIRE DE LA FRAGRANCE (Toujours visible) ── */}
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]/80 mb-4">
                  L'Histoire de la fragrance
                </h3>
                <div 
                  className="prose prose-sm max-w-none text-[#666666] leading-relaxed mx-auto md:mx-0"
                  dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(product.description || '') }}
                />
              </div>

              {/* ── ACCORDÉONS MULTIPLES ── */}
              <div className="w-full flex flex-col border-t border-[#EAEAEA]">

                {(storeProduct?.notes_tete || storeProduct?.notes_coeur || storeProduct?.notes_fond) && (
                  <AccordionItem 
                    title="Notes Olfactives" 
                    id="notes"
                    isOpen={openAccordions.includes('notes')} 
                    onToggle={toggleAccordion}
                  >
                    <SimpleOlfactoryDisplay
                      notes_tete={storeProduct.notes_tete || []}
                      notes_coeur={storeProduct.notes_coeur || []}
                      notes_fond={storeProduct.notes_fond || []}
                      families={storeProduct.families || []}
                    />
                  </AccordionItem>
                )}

                <AccordionItem 
                  title="Détails du Produit" 
                  id="details"
                  isOpen={openAccordions.includes('details')} 
                  onToggle={toggleAccordion}
                >
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    {product.volume && (
                      <div>
                        <span className="block text-[10px] text-[#1a1a1a]/50 uppercase tracking-[0.2em] mb-1">Contenance</span>
                        <span className="text-sm text-[#1a1a1a] font-medium">{product.volume}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-[10px] text-[#1a1a1a]/50 uppercase tracking-[0.2em] mb-1">Genre</span>
                      <span className="text-sm text-[#1a1a1a] font-medium capitalize">
                        {storeProduct?.gender || product.category || 'Mixte'}
                      </span>
                    </div>
                  </div>
                </AccordionItem>

                <AccordionItem
                  title="Livraison & Retours"
                  id="livraison"
                  isOpen={openAccordions.includes('livraison')}
                  onToggle={toggleAccordion}
                >
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      <span className="text-sm">Livraison offerte dès 100€ d'achat.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      <span className="text-sm">Expédition soignée sous 24 à 48h.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      <span className="text-sm">Retours gratuits sous 30 jours si le flacon est scellé.</span>
                    </li>
                  </ul>
                </AccordionItem>
              </div>

              {/* ── NOS GUIDES (Accordéon) ── */}
              <div className="border-t border-[#EAEAEA] mt-0">
                <AccordionItem
                  title="Nos Guides"
                  id="guides"
                  isOpen={openAccordions.includes('guides')}
                  onToggle={toggleAccordion}
                >
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => navigate('/art-de-se-parfumer')}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg border border-[#EAEAEA] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-[#A68A56]" />
                        <span className="text-sm text-[#1a1a1a]/70 group-hover:text-[#1a1a1a] transition-colors">L'Art de se Parfumer</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1a1a1a]/30 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-200" />
                    </button>
                    <button
                      onClick={() => navigate('/art-du-layering')}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg border border-[#EAEAEA] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="w-4 h-4 text-[#A68A56]" />
                        <span className="text-sm text-[#1a1a1a]/70 group-hover:text-[#1a1a1a] transition-colors">L'Art de Combiner</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1a1a1a]/30 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-200" />
                    </button>
                  </div>
                </AccordionItem>
              </div>

            </div>
          </div>

          {/* ── CARROUSEL (Cartes Sombres) ── */}
          <div className="border-t border-[#EAEAEA] pt-12 md:pt-16">
            <h2 className="font-serif text-2xl md:text-3xl font-normal leading-snug mb-8 text-[#1a1a1a] text-center md:text-left">
              Vous aimeriez aussi...
            </h2>
            
            {recommendedProducts.length > 0 ? (
              <div
                className="relative group"
                onMouseEnter={() => setIsCarouselHovered(true)}
                onMouseLeave={() => setIsCarouselHovered(false)}
              >
                <div
                  className="overflow-x-auto scrollbar-hide select-none -mx-4 md:mx-0 px-4 md:px-0"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <motion.div
                    className="flex gap-4 md:gap-5"
                    animate={{ x: `${-carouselIndex * (100 / getVisibleCount())}%` }}
                    transition={{ type: 'spring', stiffness: 150, damping: 35, mass: 1.2 }}
                  >
                    {recommendedProducts.map((relatedProduct) => {
                      const relatedStoreProduct = storeProducts.find(p => p.id === relatedProduct.id);
                      const relatedStock = relatedStoreProduct?.stock ?? 0;
                      const isRelatedFaved = isFavorite(relatedProduct.id);

                      return (
                      <div
                        key={relatedProduct.id}
                        className="flex-none w-[55%] sm:w-1/3 md:w-1/4 lg:w-1/5"
                      >
                        <motion.div
                          // ── CARTE EN MODE SOMBRE (Cohérence avec le reste du site) ──
                          className="group relative flex flex-col rounded-xl overflow-hidden bg-[#0E0E0E] cursor-pointer select-none"
                          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                          whileHover={{ y: -4, boxShadow: '0 20px 52px rgba(166, 138, 86, 0.4)' }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => navigate(`/product/${relatedProduct.id}`)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="relative aspect-[4/5] overflow-hidden">
                            <img
                              src={relatedProduct.image}
                              alt={relatedProduct.name}
                              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${relatedStock === 0 ? 'grayscale' : ''}`}
                              loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                            
                            {relatedStock === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                                <p className="font-serif text-sm md:text-lg text-[#D4AF37] font-light tracking-[0.3em] uppercase drop-shadow">
                                  ÉPUISÉ
                                </p>
                              </div>
                            )}

                            {relatedStock > 0 && (
                              <div
                                className="absolute bottom-3 right-3 md:inset-0 md:flex md:items-center md:justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    const { description, notes, volume, ...productData } = relatedProduct;
                                    addToCart(productData as any, 1);
                                    toast({ title: 'Ajouté au panier', description: relatedProduct.name });
                                  }}
                                  className="p-2.5 md:p-3 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors shadow-lg"
                                  whileHover={{ scale: 1.1, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <ShoppingBag strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5" />
                                </motion.button>
                              </div>
                            )}

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (user?.id) toggleFavorite(user.id, relatedProduct.id);
                              }}
                              className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/35 backdrop-blur-sm z-10"
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.88 }}
                            >
                              <Heart
                                strokeWidth={2}
                                className={`w-3.5 h-3.5 transition-colors ${isRelatedFaved ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/80 hover:text-[#D4AF37]'}`}
                              />
                            </motion.button>
                            
                            {relatedStock > 0 && relatedStock < 5 && (
                              <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.2em] text-[#0E0E0E] font-bold bg-[#A68A56] px-2 py-0.5 rounded-sm z-10">
                                Stock limité
                              </span>
                            )}
                          </div>

                          <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent 0%, #C9971C 30%, #D4AF37 50%, #C9971C 70%, transparent 100%)', opacity: 0.55 }} />

                          <div className="flex flex-col px-3 py-3 gap-2 bg-[#0E0E0E]">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[9px] font-medium text-[#A68A56] uppercase tracking-[0.18em] mb-0.5 truncate">{relatedProduct.brand}</p>
                                <h3 className="text-white font-medium text-xs md:text-sm leading-tight line-clamp-1">{relatedProduct.name}</h3>
                              </div>
                              {relatedStock > 0 && (
                                <span className="text-white/90 font-sans font-medium tracking-wide text-xs tabular-nums pt-[1px]">
                                  {relatedProduct.price.toFixed(2)} €
                                </span>
                              )}
                            </div>
                            
                            {relatedProduct.scent && (
                              <p className="text-[10px] md:text-[11px] text-[#888888] italic leading-snug line-clamp-1">
                                {relatedProduct.scent}
                              </p>
                            )}

                            <div className="h-px bg-[#232323]" />

                            {relatedStock === 0 ? (
                              <p className="text-center text-[9px] tracking-[0.25em] uppercase font-serif text-[#D4AF37]/70 py-0.5">Épuisé</p>
                            ) : (
                              <div className="flex items-center justify-center gap-1 py-0.5 mt-1">
                                <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.22em] text-white/60 group-hover:text-white/90 transition-colors">Découvrir</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                    })}
                  </motion.div>
                </div>

                {/* Navigation Arrows */}
                {recommendedProducts.length > getVisibleCount() && (
                  <>
                    <motion.button
                      onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                      disabled={carouselIndex === 0}
                      animate={{ opacity: isCarouselHovered ? 1 : 0 }}
                      className="hidden md:flex fixed top-1/2 -translate-y-1/2 text-[#1a1a1a]/70 hover:text-[#D4AF37] disabled:opacity-0 hover:scale-110 z-40 bg-[#F9F9F9] border border-[#EAEAEA] p-2 rounded-full shadow-sm"
                      style={{ left: '2rem', pointerEvents: isCarouselHovered ? 'auto' : 'none' }}
                    >
                      <ChevronLeft strokeWidth={1.5} className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      onClick={() => setCarouselIndex(Math.min(recommendedProducts.length - getVisibleCount() + 1, carouselIndex + 1))}
                      disabled={carouselIndex >= recommendedProducts.length - getVisibleCount() + 1}
                      animate={{ opacity: isCarouselHovered ? 1 : 0 }}
                      className="hidden md:flex fixed top-1/2 -translate-y-1/2 text-[#1a1a1a]/70 hover:text-[#D4AF37] disabled:opacity-0 hover:scale-110 z-40 bg-[#F9F9F9] border border-[#EAEAEA] p-2 rounded-full shadow-sm"
                      style={{ right: '2rem', pointerEvents: isCarouselHovered ? 'auto' : 'none' }}
                    >
                      <ChevronRight strokeWidth={1.5} className="w-6 h-6" />
                    </motion.button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-[#666666] italic text-center md:text-left">Aucune recommandation pour le moment.</p>
            )}
          </div>
        </div>
      </main>

      {/* ── BARRE D'ACHAT FIXE (MOBILE UNIQUEMENT) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FCFBF9]/95 backdrop-blur-xl border-t border-[#EAEAEA] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex gap-3 items-center" style={{boxShadow:'0 -4px 20px rgba(0,0,0,0.05)'}}>
        {stock === 0 ? (
          <button disabled className="flex-1 min-h-[48px] border border-[#EAEAEA] rounded-lg text-[#1a1a1a]/40 text-[10px] uppercase tracking-widest font-medium cursor-not-allowed">
            Rupture de stock
          </button>
        ) : (
          <>
            <div className="flex items-center min-h-[48px] bg-[#F9F9F9] border border-[#EAEAEA] rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-full flex items-center justify-center text-[#1a1a1a]/60 disabled:opacity-30"
              >
                <Minus strokeWidth={1.5} className="w-4 h-4" />
              </button>
              <span className="w-8 flex items-center justify-center text-xs font-medium text-[#1a1a1a]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                disabled={quantity >= stock}
                className="w-10 h-full flex items-center justify-center text-[#1a1a1a]/60 disabled:opacity-30"
              >
                <Plus strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
            
            {/* BOUTON D'AJOUT LUXE MOBILE */}
            <motion.button
              onClick={handleAddToCart}
              className="group relative flex-1 overflow-hidden rounded-lg flex items-center justify-center min-h-[48px]"
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
                className="relative z-10 flex items-center justify-center gap-2 px-3 w-full"
                initial={{ color: "#FFFFFF" }}
                whileHover={{ color: "#D4AF37" }}
                transition={{ duration: 0.6, ease: silkyEase }}
              >
                <span className="font-montserrat text-[10px] font-bold tracking-[0.2em] uppercase">
                  Ajouter
                </span>
                
                <motion.div 
                  initial={{ x: 0, opacity: 0.8 }}
                  whileHover={{ x: 3, opacity: 1 }}
                  transition={{ duration: 0.6, ease: silkyEase }}
                >
                  <ShoppingBag strokeWidth={1.5} className="w-3.5 h-3.5" />
                </motion.div>
              </motion.div>
            </motion.button>
          </>
        )}
      </div>

      <Footer />

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

export default ProductDetail;