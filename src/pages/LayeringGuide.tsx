import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Wind, 
  Droplets, 
  Sparkles, 
  Plus, 
  ShoppingBag, 
  Loader2, 
  Wand2,
  Flower2, 
  Trees,   
  Coffee,  
  Flame,   
  FlameKindling, 
  Briefcase, 
  Waves    
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import bannerLayering from '@/assets/bannerlayering.webp';
import { fetchAllProducts, ProductRow } from '@/integrations/supabase/supabase';
import { useLayeringStore } from '@/store/useLayeringStore';

// ─── FAMILLES OLFACTIVES ───
const OLFACTORY_FAMILIES = [
  { label: 'Floral',         icon: <Flower2 strokeWidth={1.5} />, hint: 'Rose, jasmin, iris…' },
  { label: 'Boisé',          icon: <Trees strokeWidth={1.5} />,   hint: 'Santal, cèdre, oud…' },
  { label: 'Gourmand',       icon: <Coffee strokeWidth={1.5} />,  hint: 'Vanille, caramel…' },
  { label: 'Oriental',       icon: <Flame strokeWidth={1.5} />,   hint: 'Ambre, résines…' },
  { label: 'Épicé',          icon: <FlameKindling strokeWidth={1.5} />, hint: 'Poivre, cannelle…' },
  { label: 'Cuiré',          icon: <Briefcase strokeWidth={1.5} />, hint: 'Cuir, tabac, fumé…' },
  { label: 'Frais/Aquatique',icon: <Waves strokeWidth={1.5} />,   hint: 'Agrumes, marin…' },
];

// ─── ANIMATIONS "LUXE" ───
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

const LayeringGuide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeItem, promoCode, promoDiscount, applyPromoCode, clearPromoCode } = useCart();

  const allDuos = useLayeringStore(state => state.duos);
  const fetchDuos = useLayeringStore(state => state.fetchDuos);
  const storeDuos = allDuos.filter(d => d.isActive);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuos();
    fetchAllProducts()
      .then(setProducts)
      .catch(() => {/* silencieux */})
      .finally(() => setLoading(false));
  }, []);

  const duos = storeDuos
    .map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      customPrice: d.customPrice,
      productA: products.find(p => p.id === d.productIdA),
      productB: products.find(p => p.id === d.productIdB),
    }))
    .filter(d => d.productA && d.productB);

  const handleAddDuo = (duo: typeof duos[number]) => {
    if (!duo.productA || !duo.productB) return;

    const totalPrice = duo.customPrice ?? (duo.productA.price + duo.productB.price);

    const duoMeta = JSON.stringify({
      isDuo: true,
      nameA: duo.productA.name,
      brandA: duo.productA.brand,
      imageA: duo.productA.image_url ?? '',
      nameB: duo.productB.name,
      brandB: duo.productB.brand,
      imageB: duo.productB.image_url ?? '',
    });

    addToCart({
      id: `duo-${duo.id}-${Date.now()}`,
      productId: `duo:${duo.id}`,
      name: duo.name,
      brand: 'Duo Signature',
      price: totalPrice,
      image: duo.productA.image_url ?? undefined,
      scent: duoMeta,
      category: 'duo',
    });

    toast({
      title: 'Duo ajouté au panier',
      description: `"${duo.name}" — ${duo.productA.name} + ${duo.productB.name}`,
    });
    setIsCartOpen(true);
  };

  // ─── ACCORD PERSONNALISÉ ───
  const [familyA, setFamilyA] = useState<string | null>(null);
  const [familyB, setFamilyB] = useState<string | null>(null);

  const suggestedA = useMemo<ProductRow | null>(() => {
    if (!familyA) return null;
    return products.find(p => Array.isArray(p.families) && p.families.includes(familyA)) ?? null;
  }, [familyA, products]);

  const suggestedB = useMemo<ProductRow | null>(() => {
    if (!familyB) return null;
    return products.find(p => Array.isArray(p.families) && p.families.includes(familyB) && p.id !== suggestedA?.id) ?? null;
  }, [familyB, products, suggestedA]);

  const handleAddCustomAccord = () => {
    if (!suggestedA || !suggestedB) return;
    const totalPrice = suggestedA.price + suggestedB.price;
    const duoMeta = JSON.stringify({
      isDuo: true,
      isCustomAccord: true,
      nameA: suggestedA.name,
      brandA: suggestedA.brand,
      imageA: suggestedA.image_url ?? '',
      nameB: suggestedB.name,
      brandB: suggestedB.brand,
      imageB: suggestedB.image_url ?? '',
    });
    addToCart({
      id: `accord-perso-${Date.now()}`,
      productId: `accord-perso:${suggestedA.id}:${suggestedB.id}`,
      name: 'Accord perso.',
      brand: 'Votre accord personnalisé',
      price: totalPrice,
      image: suggestedA.image_url ?? undefined,
      scent: duoMeta,
      category: 'duo',
    });
    toast({
      title: 'Accord personnalisé ajouté',
      description: `${suggestedA.name} + ${suggestedB.name}`,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <main className="flex-1 py-8 md:py-12 lg:py-16 px-5 sm:px-6 md:px-12 lg:px-20 selection:bg-[#D4AF37] selection:text-black">
        <div className="mx-auto max-w-7xl">

          {/* ── BOUTON RETOUR ── */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors mb-8 md:mb-12 text-[10px] md:text-xs tracking-[0.15em] uppercase font-medium min-h-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </button>

          {/* ── BANNIÈRE HERO ── */}
          <motion.div
            className="relative w-full h-[180px] sm:h-[240px] md:h-[320px] rounded-xl md:rounded-2xl overflow-hidden mb-16 md:mb-24 flex items-center justify-center border border-[#EAEAEA]"
            style={{
              backgroundImage: `url(${bannerLayering})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: silkyEase }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBF9] via-transparent to-transparent" />

            <motion.div
              className="relative z-10 text-center px-4 flex flex-col items-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: silkyEase }}
            >
              <span className="text-[9px] md:text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.3em] mb-2 block font-medium">
                Savoir-Faire
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-3 text-white drop-shadow-lg">
                L'Art de Combiner
              </h1>
              <div className="h-px w-16 bg-[#D4AF37] mb-3 opacity-70" />
              <p className="text-xs md:text-sm text-white/80 max-w-md mx-auto font-light tracking-wide">
                Superposez les fragrances. Créez votre signature olfactive unique.
              </p>
            </motion.div>
          </motion.div>

          {/* ── SECTION 1 : LES 3 RÈGLES D'OR ── */}
          <motion.div
            className="mb-24 md:mb-32"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpItem} className="text-center mb-12 md:mb-16">
              <h2 className="font-serif text-2xl md:text-4xl text-[#1a1a1a] mb-4">Les 3 Règles d'Or</h2>
              <p className="text-xs md:text-sm text-[#666666] max-w-xl mx-auto font-light leading-relaxed">
                Combiner les fragrances n'est pas une science exacte, c'est une exploration. Voici les principes fondamentaux pour réussir vos accords olfactifs.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <motion.div variants={fadeUpItem} className="bg-[#0E0E0E] p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl text-center group hover:border-[#D4AF37]/30 transition-colors duration-500">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#A68A56] group-hover:text-[#D4AF37] transition-colors">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-white">Le plus intense d'abord</h3>
                <p className="text-[13px] text-white/60 leading-relaxed font-light">
                  Vaporisez toujours la fragrance la plus <strong className="text-white/90 font-medium">riche et opulente</strong> (Oud, Bois, Ambre) en premier. Elle servira de socle et de fondation à votre création.
                </p>
              </motion.div>

              <motion.div variants={fadeUpItem} className="bg-[#0E0E0E] p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl text-center group hover:border-[#D4AF37]/30 transition-colors duration-500">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#A68A56] group-hover:text-[#D4AF37] transition-colors">
                  <Wind className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-white">Le plus léger ensuite</h3>
                <p className="text-[13px] text-white/60 leading-relaxed font-light">
                  Superposez ensuite le parfum le plus <strong className="text-white/90 font-medium">frais et volatil</strong> (Floral, Agrumes). Il viendra illuminer l'ensemble comme une aura étincelante.
                </p>
              </motion.div>

              <motion.div variants={fadeUpItem} className="bg-[#0E0E0E] p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl text-center group hover:border-[#D4AF37]/30 transition-colors duration-500">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#A68A56] group-hover:text-[#D4AF37] transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-white">Laissez fusionner</h3>
                <p className="text-[13px] text-white/60 leading-relaxed font-light">
                  Vaporisez au même endroit, mais <strong className="text-[#D4AF37] font-medium">ne frottez jamais</strong>. Laissez les molécules fusionner naturellement sur votre peau pour révéler la magie de l'accord.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* ── SECTION 2 : NOS ACCORDS SIGNATURES (DUOS) ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpItem} className="text-center mb-16">
              <span className="text-[10px] text-[#A68A56] uppercase tracking-[0.3em] mb-3 block">Inspirations</span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a]">Nos Accords Signatures</h2>
              <div className="h-px w-12 bg-[#D4AF37]/50 mx-auto mt-6" />
            </motion.div>

            {loading && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            )}

            {!loading && duos.length === 0 && (
              <p className="text-center text-[#666666] text-sm py-12">
                Aucun accord disponible pour le moment. Revenez bientôt.
              </p>
            )}

            <div className="space-y-16 md:space-y-24">
              {duos.map((duo, index) => {
                const productA = duo.productA!;
                const productB = duo.productB!;
                const totalPrice = productA.price + productB.price;

                return (
                  <motion.div
                    key={duo.id}
                    variants={fadeUpItem}
                    className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-16`}
                  >
                    {/* Visuel du Duo */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center gap-4 sm:gap-6 bg-[#0E0E0E] p-8 sm:p-12 rounded-2xl border border-white/5 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none rounded-2xl" />

                      <div className="flex flex-col items-center z-10">
                        <div className="w-24 h-32 sm:w-32 sm:h-44 rounded-lg overflow-hidden border border-white/10 shadow-2xl mb-4 bg-[#1a1a1a]">
                          {productA.image_url ? (
                            <img src={productA.image_url} alt={productA.name} className="w-full h-full object-cover grayscale-[20%]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">—</div>
                          )}
                        </div>
                        <span className="text-[9px] text-[#A68A56] uppercase tracking-[0.2em] text-center">{productA.families?.[0] ?? duo.labelA}</span>
                        <span className="font-serif text-sm text-white mt-1 text-center leading-tight">{productA.name}</span>
                        <span className="text-xs text-white/40 font-light mt-0.5">{productA.price.toFixed(2)} €</span>
                      </div>

                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] z-10 border border-[#D4AF37]/30 flex-shrink-0">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <div className="flex flex-col items-center z-10">
                        <div className="w-24 h-32 sm:w-32 sm:h-44 rounded-lg overflow-hidden border border-white/10 shadow-2xl mb-4 bg-[#1a1a1a]">
                          {productB.image_url ? (
                            <img src={productB.image_url} alt={productB.name} className="w-full h-full object-cover grayscale-[20%]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">—</div>
                          )}
                        </div>
                        <span className="text-[9px] text-[#A68A56] uppercase tracking-[0.2em] text-center">{productB.families?.[0] ?? duo.labelB}</span>
                        <span className="font-serif text-sm text-white mt-1 text-center leading-tight">{productB.name}</span>
                        <span className="text-xs text-white/40 font-light mt-0.5">{productB.price.toFixed(2)} €</span>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                      <h3 className="font-serif text-2xl md:text-3xl text-[#1a1a1a] mb-4">{duo.name}</h3>
                      <p className="text-sm text-[#666666] font-light leading-relaxed mb-6 max-w-md">
                        {duo.description}
                      </p>

                      {(productA.families?.length > 0 || productB.families?.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                          {[...new Set([...(productA.families ?? []), ...(productB.families ?? [])])].map(f => (
                            <span key={f} className="text-[9px] uppercase tracking-[0.15em] text-[#A68A56] border border-[#A68A56]/30 px-2.5 py-1 rounded-full">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 mb-8">
                        <span className="text-2xl font-sans font-light text-[#1a1a1a] tracking-wide">{totalPrice.toFixed(2)} €</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A] font-bold bg-[#D4AF37] px-3 py-1.5 rounded-sm">
                          Le Duo Parfait
                        </span>
                      </div>

                      {/* BOUTON LUXE */}
                      <motion.button
                        onClick={() => handleAddDuo(duo)}
                        className="group relative overflow-hidden rounded-lg flex items-center justify-center w-full sm:w-auto min-w-[280px]"
                        style={{
                          backgroundColor: "#0E0E0E",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.4)"
                        }}
                        whileHover={{
                          borderColor: "rgba(212, 175, 55, 0.6)",
                          boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.8, ease: silkyEase }}
                      >
                        <motion.div
                          className="relative z-10 flex items-center justify-center gap-3 px-6 py-4 w-full"
                          initial={{ color: "#FFFFFF" }}
                          whileHover={{ color: "#D4AF37" }}
                          transition={{ duration: 0.6, ease: silkyEase }}
                        >
                          <span className="font-montserrat text-[11px] font-bold tracking-[0.2em] uppercase">
                            Ajouter le duo au panier
                          </span>
                          <motion.div initial={{ x: 0, opacity: 0.8 }} whileHover={{ x: 3, opacity: 1 }} transition={{ duration: 0.6, ease: silkyEase }}>
                            <ShoppingBag strokeWidth={1.5} className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── SECTION 3 : VOTRE ACCORD PERSONNALISÉ ── */}
          <motion.div
            className="mt-24 md:mt-32"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpItem} className="text-center mb-16">
              <span className="text-[10px] text-[#A68A56] uppercase tracking-[0.3em] mb-3 block">Création sur-mesure</span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a]">Votre accord personnalisé</h2>
              <div className="h-px w-12 bg-[#D4AF37]/50 mx-auto mt-6 mb-4" />
              <p className="text-xs md:text-sm text-[#666666] max-w-lg mx-auto font-light leading-relaxed">
                Choisissez deux familles olfactives et laissez-nous composer votre duo unique.
              </p>
            </motion.div>

            <motion.div variants={fadeUpItem} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
              {/* Sélecteur A - MODIFIÉ EN NOIR */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#A68A56] mb-5 font-medium flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0E0E0E] text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] font-bold">1</span>
                  Première famille
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {OLFACTORY_FAMILIES.map(f => (
                    <button
                      key={f.label}
                      onClick={() => setFamilyA(f.label)}
                      className={`group flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center transition-all duration-300 ${
                        familyA === f.label
                          ? 'bg-[#0E0E0E] border-[#D4AF37] shadow-[0_10px_30px_-5px_rgba(212,175,55,0.3)] text-[#D4AF37]'
                          : 'bg-[#0E0E0E] border-white/5 hover:border-[#D4AF37]/50 text-white/60 hover:text-white shadow-lg'
                      }`}
                    >
                      <div className={`mb-1 transition-colors ${familyA === f.label ? 'text-[#D4AF37]' : 'text-[#A68A56] group-hover:text-[#D4AF37]'}`}>
                        {f.icon}
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.12em] font-semibold leading-tight">{f.label}</span>
                      <span className={`text-[8px] leading-tight hidden sm:block ${familyA === f.label ? 'text-[#D4AF37]/70' : 'text-white/30'}`}>{f.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélecteur B - MODIFIÉ EN NOIR */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#A68A56] mb-5 font-medium flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0E0E0E] text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] font-bold">2</span>
                  Deuxième famille
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {OLFACTORY_FAMILIES.map(f => (
                    <button
                      key={f.label}
                      onClick={() => setFamilyB(f.label)}
                      className={`group flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center transition-all duration-300 ${
                        familyB === f.label
                          ? 'bg-[#0E0E0E] border-[#D4AF37] shadow-[0_10px_30px_-5px_rgba(212,175,55,0.3)] text-[#D4AF37]'
                          : 'bg-[#0E0E0E] border-white/5 hover:border-[#D4AF37]/50 text-white/60 hover:text-white shadow-lg'
                      }`}
                    >
                      <div className={`mb-1 transition-colors ${familyB === f.label ? 'text-[#D4AF37]' : 'text-[#A68A56] group-hover:text-[#D4AF37]'}`}>
                        {f.icon}
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.12em] font-semibold leading-tight">{f.label}</span>
                      <span className={`text-[8px] leading-tight hidden sm:block ${familyB === f.label ? 'text-[#D4AF37]/70' : 'text-white/30'}`}>{f.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Résultat / suggestion */}
            {familyA && familyB && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-8 sm:p-12"
              >
                <div className="text-center mb-10">
                  <Wand2 className="w-5 h-5 text-[#D4AF37] mx-auto mb-3" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#A68A56]">Notre suggestion pour vous</p>
                </div>

                {loading && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                  </div>
                )}

                {!loading && (!suggestedA || !suggestedB) && (
                  <p className="text-center text-white/40 text-sm py-4">
                    Aucun parfum disponible pour cette combinaison. Essayez d'autres familles.
                  </p>
                )}

                {!loading && suggestedA && suggestedB && (
                  <>
                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-32 sm:w-32 sm:h-44 rounded-lg overflow-hidden border border-white/10 shadow-2xl mb-4 bg-[#1a1a1a]">
                          {suggestedA.image_url ? (
                            <img src={suggestedA.image_url} alt={suggestedA.name} className="w-full h-full object-cover grayscale-[20%]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">—</div>
                          )}
                        </div>
                        <span className="text-[9px] text-[#D4AF37] uppercase tracking-[0.2em] mb-1">{familyA}</span>
                        <span className="font-serif text-sm text-white text-center leading-tight max-w-[110px]">{suggestedA.name}</span>
                        <span className="text-xs text-white/40 mt-0.5">{suggestedA.price.toFixed(2)} €</span>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                        <Plus className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-24 h-32 sm:w-32 sm:h-44 rounded-lg overflow-hidden border border-white/10 shadow-2xl mb-4 bg-[#1a1a1a]">
                          {suggestedB.image_url ? (
                            <img src={suggestedB.image_url} alt={suggestedB.name} className="w-full h-full object-cover grayscale-[20%]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">—</div>
                          )}
                        </div>
                        <span className="text-[9px] text-[#D4AF37] uppercase tracking-[0.2em] mb-1">{familyB}</span>
                        <span className="font-serif text-sm text-white text-center leading-tight max-w-[110px]">{suggestedB.name}</span>
                        <span className="text-xs text-white/40 mt-0.5">{suggestedB.price.toFixed(2)} €</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-5">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-sans font-light text-white tracking-wide">
                          {(suggestedA.price + suggestedB.price).toFixed(2)} €
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#0A0A0A] font-bold bg-[#D4AF37] px-3 py-1.5 rounded-sm">
                          Accord perso.
                        </span>
                      </div>
                      
                      {/* BOUTON LUXE MODIFIÉ EN NOIR */}
                      <motion.button
                        onClick={handleAddCustomAccord}
                        className="group relative overflow-hidden rounded-lg flex items-center justify-center w-full sm:w-auto min-w-[280px]"
                        style={{
                          backgroundColor: "#0E0E0E",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.4)"
                        }}
                        whileHover={{
                          borderColor: "rgba(212, 175, 55, 0.6)",
                          boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.8, ease: silkyEase }}
                      >
                        <motion.div
                          className="relative z-10 flex items-center justify-center gap-3 px-6 py-4 w-full"
                          initial={{ color: "#FFFFFF" }}
                          whileHover={{ color: "#D4AF37" }}
                          transition={{ duration: 0.6, ease: silkyEase }}
                        >
                          <span className="font-montserrat text-[11px] font-bold tracking-[0.2em] uppercase">
                            Ajouter mon accord au panier
                          </span>
                          <motion.div initial={{ x: 0, opacity: 0.8 }} whileHover={{ x: 3, opacity: 1 }} transition={{ duration: 0.6, ease: silkyEase }}>
                            <ShoppingBag strokeWidth={1.5} className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      </motion.button>

                    </div>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>

        </div>
      </main>

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

export default LayeringGuide;