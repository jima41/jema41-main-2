import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Droplets } from 'lucide-react';
import { useAdminStore, type Product } from '@/store/useAdminStore';
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
  },
  {
    id: 4,
    question: "Quel sillage souhaitez-vous laisser ?",
    options: [
      { label: "Une aura de mystère", value: "mystery" },
      { label: "Une élégance intemporelle", value: "elegance" },
      { label: "Un caractère audacieux", value: "boldness" },
      { label: "Une douceur magnétique", value: "softness" }
    ]
  }
];

// Easing extrêmement doux pour le luxe
const silkyEase = [0.25, 0.1, 0.25, 1];

// ============================================================================
// ANIMATIONS & SUB-COMPONENTS
// ============================================================================

const SprayBurst = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="absolute w-[200%] h-[200%] bg-gradient-radial from-white/10 via-[#D4AF37]/5 to-transparent blur-[100px]"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.2, 1.5], opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </motion.div>
  );
};

const FillingBottle = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg viewBox="0 0 100 160" width="70" height="112" overflow="visible" className="drop-shadow-2xl mb-8">
        <defs>
          <clipPath id="luxeBottleClip">
            <path d="M25 60 h50 v85 c0 2.76 -2.24 5 -5 5 h-40 c-2.76 0 -5 -2.24 -5 -5 v-85 z" />
          </clipPath>
          <linearGradient id="goldLiquid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A68A56" />
            <stop offset="50%" stopColor="#FCEEAC" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>

        <rect x="35" y="10" width="30" height="35" rx="1" fill="#0E0E0E" stroke="#222" strokeWidth="1" />
        <rect x="42" y="45" width="16" height="10" fill="#D4AF37" />
        
        <path
          d="M20 60 h60 v85 c0 5.52 -4.48 10 -10 10 h-40 c-5.52 0 -10 -4.48 -10 -10 v-85 z"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />

        <motion.rect
          x={25}
          width={50}
          rx={2}
          fill="url(#goldLiquid)"
          clipPath="url(#luxeBottleClip)"
          initial={{ y: 150, height: 0 }}
          animate={{ y: 70, height: 80 }}
          transition={{ duration: 2.2, ease: silkyEase }}
          onAnimationComplete={() => setTimeout(onComplete, 600)}
          className="opacity-80"
        />
        
        <motion.rect 
          x="28" y="65" width="4" height="70" fill="#ffffff" rx="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0.05] }}
          transition={{ delay: 1.5, duration: 1 }}
        />
      </svg>

      <motion.p
        className="font-serif text-[10px] text-[#A68A56] uppercase tracking-[0.4em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5, 1] }}
        transition={{ duration: 2.6, ease: "easeInOut" }}
      >
        L'alchimie opère
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
  
  const [perfectMatch, setPerfectMatch] = useState<Product | null>(null);
  
  const { products, isInitialized, initializeProducts } = useAdminStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) initializeProducts();
  }, [isInitialized, initializeProducts]);

  const handleStart = () => {
    setIsSpraying(true);
    setTimeout(() => {
        setStep('quiz');
        setTimeout(() => setIsSpraying(false), 800);
    }, 400);
  };

  const handleRestart = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setPerfectMatch(null);
  };

  const calculateRecommendation = (finalAnswers: Record<number, string>) => {
    const matter = finalAnswers[3];
    const aura = finalAnswers[4];
    
    let primaryFamily: OlfactoryFamily | null = null;
    let secondaryFamily: OlfactoryFamily | null = null;

    if (matter === 'floral') primaryFamily = 'Floral';
    else if (matter === 'woody') primaryFamily = 'Boisé';
    else if (matter === 'spicy') primaryFamily = 'Épicé';
    else if (matter === 'gourmand') primaryFamily = 'Gourmand'; 

    if (aura === 'mystery') secondaryFamily = 'Oriental';
    else if (aura === 'elegance') secondaryFamily = 'Chypré';
    else if (aura === 'boldness') secondaryFamily = 'Cuir';
    else if (aura === 'softness') secondaryFamily = 'Musc';

    let matching = products.filter(p => primaryFamily && p.families?.includes(primaryFamily));
    const refined = matching.filter(p => secondaryFamily && p.families?.includes(secondaryFamily));
    if (refined.length > 0) matching = refined;

    if (matching.length === 0 && primaryFamily) {
        matching = products.filter(p => p.scent && p.scent.toLowerCase().includes(primaryFamily!.toLowerCase()));
    }
    if (matching.length === 0 && finalAnswers[2] === 'morning') {
        matching = products.filter(p => p.families?.includes('Frais/Aquatique'));
    }
    if (matching.length === 0) matching = products; 

    const shuffled = [...matching].sort(() => 0.5 - Math.random());
    setPerfectMatch(shuffled[0] || null);
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestionIndex].id]: value };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        calculateRecommendation(newAnswers);
        setStep('loading');
    }
  };

  const handleAddToCart = () => {
    if (perfectMatch) {
      if (perfectMatch.stock === 0) {
        toast.error('Création actuellement indisponible');
        return;
      }
      addToCart({
        id: perfectMatch.id,
        name: perfectMatch.name,
        brand: perfectMatch.brand,
        price: perfectMatch.price,
        image: perfectMatch.image || perfectMatch.image_url || '',
        scent: perfectMatch.scent,
        category: perfectMatch.category || 'mixte'
      });
      toast.success('Ajouté à votre sélection');
    }
  };

  const romanNumerals = ['I', 'II', 'III', 'IV'];

  return (
    <div className="w-full flex justify-center px-4 md:px-6 my-12 md:my-16 selection:bg-[#D4AF37] selection:text-black">
      {/* Conteneur de taille fixe unifiée : h-[500px] partout pour un rendu massif, sans scroll */}
      <div className="relative w-full max-w-4xl bg-[#050505] min-h-[500px] md:h-[500px] rounded-sm overflow-hidden border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        
        <AnimatePresence mode="wait">
            
            {/* --- STEP 1: INTRO --- */}
            {step === 'intro' && (
                <motion.div
                    key="intro"
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.8, ease: silkyEase }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 space-y-4 md:space-y-6 flex flex-col items-center max-w-lg mx-auto">
                        <span className="text-[10px] font-bold tracking-[0.35em] text-[#A68A56] uppercase block">
                            Rituel de Signature
                        </span>
                        
                        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white font-normal leading-tight">
                            Trouvez votre signature olfactive
                        </h2>
                        
                        <div className="h-px w-12 bg-[#D4AF37]/50 mx-auto" />

                        <p className="text-xs md:text-sm text-white/40 font-light tracking-wide leading-relaxed">
                            Confiez-nous vos sens. À travers quatre questions essentielles, notre algorithme olfactif isolera le sillage destinée à devenir votre signature.
                        </p>

                        <button
                            onClick={handleStart}
                            className="mt-6 relative overflow-hidden group px-10 py-4 border border-white/20 text-white text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-500 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        >
                            <span className="relative z-10">Initier le rituel</span>
                            <div className="absolute inset-0 w-full h-full bg-[#D4AF37]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* --- STEP 2: QUIZ --- */}
            {step === 'quiz' && (
                <motion.div
                    key="quiz"
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: silkyEase }}
                >
                     <div className="w-full max-w-2xl relative z-10">
                        <div className="text-center mb-8 md:mb-10">
                            <span className="font-serif text-[#D4AF37] text-sm tracking-[0.2em]">
                                {romanNumerals[currentQuestionIndex]} <span className="text-white/20 mx-2">/</span> {romanNumerals[QUESTIONS.length - 1]}
                            </span>
                        </div>
                        
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, ease: silkyEase }}
                            className="w-full"
                          >
                            <h3 className="font-serif text-2xl md:text-3xl text-white mb-6 md:mb-8 text-center leading-tight">
                              {QUESTIONS[currentQuestionIndex].question}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 p-px rounded-sm overflow-hidden">
                              {QUESTIONS[currentQuestionIndex].options.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleAnswer(option.value)}
                                  className="group bg-[#050505] p-4 md:p-6 min-h-[52px] text-center transition-all duration-500 hover:bg-[#D4AF37]/5 active:bg-[#D4AF37]/10 flex items-center justify-center"
                                >
                                  <span className="block text-sm text-white/50 group-hover:text-white font-serif tracking-[0.1em] transition-colors duration-500">
                                    {option.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                     </div>
                </motion.div>
            )}

            {/* --- STEP 3: LOADING --- */}
            {step === 'loading' && (
                <motion.div
                    key="loading"
                    className="absolute inset-0 flex items-center justify-center bg-[#050505]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <FillingBottle onComplete={() => setStep('results')} />
                </motion.div>
            )}

            {/* --- STEP 4: RESULT --- */}
            {step === 'results' && perfectMatch && (
                <motion.div
                    key="results"
                    className="absolute inset-0 flex flex-col md:flex-row bg-[#0E0E0E]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: silkyEase }}
                >
                    {/* Moitié Gauche : Image - Toujours 38% sur mobile pour assurer la fluidité du texte */}
                    <div className="w-full h-[38%] md:w-1/2 md:h-full relative overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
                        
                        <img 
                            src={perfectMatch.image || perfectMatch.image_url} 
                            alt={perfectMatch.name}
                            className="w-full h-full object-cover grayscale-[15%] transform hover:scale-105 transition-transform duration-[10s] ease-out"
                        />
                        
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-l from-[#0E0E0E]/60 via-transparent to-transparent z-20 pointer-events-none" />
                    </div>

                    {/* Moitié Droite : Informations - Aucun scroll */}
                    <div className="w-full h-[62%] md:w-1/2 md:h-full flex flex-col justify-center p-5 md:p-12 relative z-30 bg-[#0E0E0E] overflow-hidden">
                        <div className="max-w-md my-auto w-full flex flex-col h-full">
                            <span className="text-[9px] text-[#A68A56] tracking-[0.4em] uppercase mb-1.5 md:mb-3 block font-bold mt-1 md:mt-0">
                                Votre Signature Olfactive
                            </span>
                            
                            <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl text-white mb-1 md:mb-2 leading-tight">
                                {perfectMatch.name}
                            </h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3 md:mb-6">
                                Par {perfectMatch.brand}
                            </p>

                            <div className="h-px w-12 bg-white/10 mb-3 md:mb-6" />

                            <div className="space-y-3 md:space-y-4 mb-4 md:mb-8 flex-grow">
                                <p className="font-serif text-sm text-white/80 leading-relaxed line-clamp-2 md:line-clamp-3">
                                    {perfectMatch.scent}
                                </p>
                                
                                {perfectMatch.families && perfectMatch.families.length > 0 && (
                                    <div className="pt-1">
                                        <p className="text-[8px] uppercase tracking-widest text-[#D4AF37] mb-1">Famille Olfactive</p>
                                        <p className="text-xs text-white/60 font-light">{perfectMatch.families.join(' • ')}</p>
                                    </div>
                                )}

                                <div className="pt-1 flex flex-row flex-wrap gap-x-5 gap-y-2">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-[#D4AF37] mb-1">Prix</p>
                                        <p className="text-xs text-white/60 font-light">{perfectMatch.price.toFixed(2)} €</p>
                                    </div>
                                    {perfectMatch.volume && (
                                        <div>
                                            <p className="text-[8px] uppercase tracking-widest text-[#D4AF37] mb-1">Contenance</p>
                                            <p className="text-xs text-white/60 font-light">{perfectMatch.volume}</p>
                                        </div>
                                    )}
                                    {perfectMatch.category && (
                                        <div>
                                            <p className="text-[8px] uppercase tracking-widest text-[#D4AF37] mb-1">Type</p>
                                            <p className="text-xs text-white/60 font-light">{perfectMatch.category}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Conteneur des Boutons */}
                            <div className="flex flex-col gap-2 md:gap-3 w-full mt-auto">
                                {/* Ligne 1 : Acquérir + (Découvrir sur mobile) + Refaire */}
                                <div className="flex flex-row items-center gap-2 md:gap-3 w-full">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-[1.2] md:flex-1 py-3.5 md:py-4 bg-[#D4AF37] text-[#050505] text-[8px] md:text-[10px] font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-1.5 md:gap-2 px-1"
                                    >
                                        <Droplets className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">Acquérir <span className="hidden md:inline">({perfectMatch.price}€)</span></span>
                                    </button>
                                    
                                    {/* Bouton Découvrir - MOBILE SEULEMENT */}
                                    <button
                                        onClick={() => navigate(`/product/${perfectMatch.id}`)}
                                        className="flex-1 md:hidden py-3.5 bg-white/10 text-white text-[8px] font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-white/20 transition-colors flex items-center justify-center truncate px-1"
                                    >
                                        Découvrir
                                    </button>

                                    <button
                                        onClick={handleRestart}
                                        className="px-3.5 py-3.5 md:px-4 md:py-4 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase rounded-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                                        title="Refaire le diagnostic"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span className="hidden md:inline">Refaire</span>
                                    </button>
                                </div>

                                {/* Ligne 2 : Bouton Découvrir - DESKTOP SEULEMENT */}
                                <button
                                    onClick={() => navigate(`/product/${perfectMatch.id}`)}
                                    className="hidden md:flex w-full py-4 border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors items-center justify-center gap-2"
                                >
                                    Découvrir la création en détail
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}

        </AnimatePresence>

        {isSpraying && <SprayBurst onComplete={() => {}} />}
      </div>
    </div>
  );
};

export default DiagnosticRitual;