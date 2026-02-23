import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore, type Product } from '@/store/useAdminStore';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { OlfactoryFamily } from '@/lib/olfactory';

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

type Step = 'intro' | 'quiz' | 'loading' | 'results';

const QUESTIONS = [
  {
    id: 1,
    question: "Quelle intensité recherchez-vous ?",
    options: [
      { label: "Légère & Aérienne", value: "light" },
      { label: "Présente & Équilibrée", value: "moderate" },
      { label: "Intense & Signée", value: "intense" },
      { label: "Majestueuse & Rare", value: "royal" }
    ]
  },
  {
    id: 2,
    question: "Quel moment vous inspire le plus ?",
    options: [
      { label: "L'Aube Fraîche", value: "morning" },
      { label: "Le Zénith Solaire", value: "noon" },
      { label: "Le Crépuscule Doré", value: "evening" },
      { label: "La Nuit Profonde", value: "night" }
    ]
  },
  {
    id: 3,
    question: "Quelle matière vous touche le plus ?",
    options: [
      { label: "Fleurs Blanches", value: "floral" },
      { label: "Bois Précieux", value: "woody" },
      { label: "Épices Chaudes", value: "spicy" },
      { label: "Vanille & Ambre", value: "gourmand" }
    ]
  }
];

// ============================================================================
// ANIMATIONS & SUB-COMPONENTS
// ============================================================================

// Motion variants for quiz transitions (diffusion olfactive)
const questionVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.1 }
  },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: { duration: 0.4, ease: 'easeInOut' } }
};

const optionVariant = {
  initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, filter: 'blur(6px)', transition: { duration: 0.3 } }
};

const SprayBurst = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      {/* Subtle Mist Flash */}
      <motion.div
        className="absolute w-full h-full bg-white/10 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {/* Fine Golden Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#D4AF37]"
          style={{ width: Math.random() * 2 + 'px', height: Math.random() * 2 + 'px' }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ 
            x: (Math.random() - 0.5) * 600, 
            y: (Math.random() - 0.5) * 400,
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
};

const FillingBottle = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-7">

      {/* ── Flacon SVG ───────────────────────────────────── */}
      <svg viewBox="0 0 60 130" width="54" height="116" overflow="visible">
        <defs>
          <clipPath id="flacon-clip">
            {/* Forme du corps du flacon uniquement */}
            <path d="M 23 27 Q 8 33 8 46 L 8 118 Q 8 126 16 126 L 44 126 Q 52 126 52 118 L 52 46 Q 52 33 37 27 Z" />
          </clipPath>
        </defs>

        {/* Liquide blanc — monte du bas */}
        <motion.rect
          x="8" width="44"
          fill="rgba(255, 255, 255, 0.78)"
          clipPath="url(#flacon-clip)"
          initial={{ y: 126, height: 0 }}
          animate={{ y: 48, height: 78 }}
          transition={{ duration: 2.0, ease: [0.25, 0.46, 0.45, 0.94] }}
          onAnimationComplete={() => setTimeout(onComplete, 500)}
        />

        {/* Reflet vertical — apparaît quand le flacon est rempli */}
        <motion.line
          x1="17" y1="55" x2="17" y2="112"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.18] }}
          transition={{ delay: 1.85, duration: 0.9 }}
        />

        {/* Contour corps */}
        <path
          d="M 23 27 Q 8 33 8 46 L 8 118 Q 8 126 16 126 L 44 126 Q 52 126 52 118 L 52 46 Q 52 33 37 27 Z"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.85"
        />
        {/* Col */}
        <rect x="24" y="10" width="12" height="18" fill="none" stroke="#D4AF37" strokeWidth="0.85" />
        {/* Bouchon */}
        <rect x="19" y="1" width="22" height="10" rx="1.5" fill="none" stroke="#D4AF37" strokeWidth="0.85" />
        {/* Fine ligne dorée de séparation col/corps */}
        <line x1="18" y1="27" x2="42" y2="27" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" />
      </svg>

      {/* Texte */}
      <motion.p
        className="font-serif text-[11px] text-white/40 italic tracking-[0.22em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.75, 0.45, 0.75] }}
        transition={{ duration: 2.6, ease: "easeInOut" }}
      >
        Création de votre accord...
      </motion.p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DiagnosticRitual = () => {
  const [step, setStep] = useState<Step>('intro');
  const [isSpraying, setIsSpraying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  
  const { products, isInitialized, initializeProducts } = useAdminStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      initializeProducts();
    }
  }, [isInitialized, initializeProducts]);

  const handleStart = () => {
    setIsSpraying(true);
    setTimeout(() => {
        setStep('quiz');
        setTimeout(() => setIsSpraying(false), 600); 
    }, 200);
  };

  const handleRestart = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRecommendations([]);
  };

  const calculateRecommendations = (finalAnswers: Record<number, string>) => {
    // Logic based on Q3 (Matter) mainly
    const matter = finalAnswers[3];
    let family: OlfactoryFamily | null = null;

    if (matter === 'floral') family = 'Floral';
    else if (matter === 'woody') family = 'Boisé';
    else if (matter === 'spicy') family = 'Épicé';
    else if (matter === 'gourmand') family = 'Gourmand'; // Could also map to Oriental

    // Fallback or refinement based on Q2 (Moment)
    // if Q2 is 'morning' -> maybe 'Frais/Aquatique' or lighter floral?
    // if Q2 is 'night' -> Oriental / Intense
    
    if (finalAnswers[2] === 'morning' && matter === 'floral') {
        // Maybe check if we have enough products, otherwise stick to floral
    }

    let matching = products.filter(p => 
        family && p.families && p.families.includes(family)
    );

    if (matching.length === 0 && family) {
        matching = products.filter(p => p.scent && p.scent.toLowerCase().includes(family!.toLowerCase()));
    }
    
    // If we still have no matches (or family was null), try to map from Q1/Q2
    if (matching.length === 0) {
        // Fallback random or specific logic
        // E.g. "morning" -> Frais
        if (finalAnswers[2] === 'morning') {
             matching = products.filter(p => p.families && p.families.includes('Frais/Aquatique'));
        }
    }
    
    // Fallback if absolutely nothing found
    if (matching.length === 0) {
        matching = products; 
    }

    // Select 3 random
    const shuffled = [...matching].sort(() => 0.5 - Math.random());
    setRecommendations(shuffled.slice(0, 3));
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestionIndex].id]: value };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        calculateRecommendations(newAnswers);
        setStep('loading');
    }
  };

  const handleAddToCart = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      if (product.stock === 0) {
        toast.error('Ce produit est actuellement en rupture de stock');
        return;
      }
      addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image || product.image_url || '',
        scent: product.scent,
        category: product.category || 'mixte'
      });
      toast.success('Ajouté au panier');
    }
  };

  const containerHeight = step === 'results' ? 'h-[600px]' : (step === 'intro' ? 'min-h-[160px]' : 'min-h-[380px]');

  return (
    <div className="w-full flex justify-center px-4 md:px-0 my-12 animate-fade-up">
       <motion.div
        className={`relative w-full max-w-5xl bg-[#0a0a0a] rounded-sm overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 ease-[0.22, 1, 0.36, 1] ${containerHeight}`}
        layout
      >
        <AnimatePresence mode="wait">
            
            {/* --- STEP 1: INTRO (Bandeau Luxe) --- */}
            {step === 'intro' && (
                <motion.div
                    key="intro"
                    className="flex flex-col md:flex-row items-center justify-between px-8 py-10 md:py-8 gap-6 md:gap-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                        <span className="text-[10px] font-medium tracking-[0.25em] text-amber-200/60 uppercase">
                            Diagnostic Olfactif Haute Couture
                        </span>
                        
                        <h2 className="font-serif text-2xl md:text-3xl text-[#F5F5F0] font-light leading-tight">
                            Trouvez votre signature
                        </h2>
                        
                        <p className="text-xs text-neutral-500 font-light tracking-wide max-w-md">
                            Une expérience immersive pour révéler le parfum qui capture votre essence.
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <Button
                            onClick={handleStart}
                            className="bg-transparent border border-amber-200/30 text-amber-100 hover:bg-amber-900/10 hover:border-amber-200/60 hover:text-[#D4AF37] px-8 py-6 h-auto rounded-sm font-sans text-xs font-medium tracking-[0.15em] uppercase transition-all duration-500 ease-out group"
                        >
                            Commencer l'expérience
                            <span className="ml-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500">→</span>
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* --- STEP 2: QUIZ --- */}
            {step === 'quiz' && (
                <motion.div
                    key="quiz"
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 bg-[#0a0a0a]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                     <div className="w-full max-w-2xl">
                        <div className="flex justify-center mb-8">
                            <span className="text-[10px] text-neutral-600 tracking-[0.2em] uppercase font-light">
                                Question {currentQuestionIndex + 1} <span className="text-neutral-800 mx-2">/</span> {QUESTIONS.length}
                            </span>
                        </div>
                        
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentQuestionIndex}
                            variants={questionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="mb-10"
                          >
                            <h3 className="font-serif text-xl md:text-2xl text-[#F5F5F0] mb-6 text-center font-light">
                              {QUESTIONS[currentQuestionIndex].question}
                            </h3>

                            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" initial="initial" animate="animate" exit="exit">
                              {QUESTIONS[currentQuestionIndex].options.map((option) => (
                                <motion.button
                                  key={option.value}
                                  onClick={() => handleAnswer(option.value)}
                                  variants={optionVariant}
                                  className="p-5 rounded-sm border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-900/30 text-left transition-all duration-300 group active:scale-[0.99]"
                                >
                                  <span className="flex justify-between items-center w-full">
                                    <span className="block text-xs md:text-sm text-neutral-400 group-hover:text-amber-100/90 font-light tracking-wide transition-colors">
                                      {option.label}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#D4AF37] transition-colors duration-500" />
                                  </span>
                                </motion.button>
                              ))}
                            </motion.div>
                          </motion.div>
                        </AnimatePresence>
                     </div>
                </motion.div>
            )}

            {/* --- STEP 3: LOADING --- */}
            {step === 'loading' && (
                <motion.div
                    key="loading"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <FillingBottle onComplete={() => setStep('results')} />
                </motion.div>
            )}

            {/* --- STEP 4: RESULTS --- */}
            {step === 'results' && (
                <motion.div
                    key="results"
                    className="absolute inset-0 flex flex-col items-center justify-center p-5 md:p-7 bg-[#0a0a0a] overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-center mb-4">
                        <span className="text-[9px] text-amber-200/50 tracking-[0.25em] uppercase mb-2 block">
                            Votre signature olfactive
                        </span>
                        <h2 className="font-serif text-lg md:text-xl text-[#F5F5F0] mb-1.5 font-light">
                            Sélection Exclusive
                        </h2>
                        <p className="font-sans text-[10px] text-neutral-500 max-w-sm mx-auto font-light leading-relaxed tracking-wide">
                            Basé sur vos préférences pour {answers[3] === 'floral' ? 'les fleurs blanches' : answers[3] === 'woody' ? 'les bois précieux' : answers[3] === 'spicy' ? 'les épices' : 'la vanille'}.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-[660px] mx-auto mb-4">
                        {recommendations.map((product, index) => (
                             <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                             >
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    brand={product.brand}
                                    price={product.price}
                                    image={product.image || product.image_url || ''}
                                    scent={product.scent}
                                    stock={product.stock}
                                    notes={product.notes}
                                    notes_tete={product.notes_tete}
                                    notes_coeur={product.notes_coeur}
                                    notes_fond={product.notes_fond}
                                    families={product.families}
                                    onAddToCart={handleAddToCart}
                                />
                             </motion.div>
                        ))}
                        {recommendations.length === 0 && (
                             <div className="col-span-3 text-center text-neutral-500 text-sm">
                                 Aucun résultat trouvé pour cette combinaison.
                             </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            onClick={handleRestart}
                            variant="outline"
                            className="border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 px-5 py-2.5 h-auto rounded-sm bg-transparent text-[10px] tracking-widest uppercase"
                        >
                            <RotateCcw className="w-3 h-3 mr-2" />
                            Recommencer
                        </Button>
                    </div>
                </motion.div>
            )}

        </AnimatePresence>

        {isSpraying && <SprayBurst onComplete={() => {}} />}
      </motion.div>
    </div>
  );
};

export default DiagnosticRitual;
