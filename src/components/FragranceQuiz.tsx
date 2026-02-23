import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { upsertUserScentProfile } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminStore, type Product } from '@/store/useAdminStore';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { OlfactoryFamily } from '@/lib/olfactory';

interface QuizOption {
  id: OlfactoryFamily;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  gradient: string;
}

const quizOptions: QuizOption[] = [
  {
    id: 'Gourmand',
    title: 'Gourmand',
    description: 'Notes sucrées, vanillées et addictives',
    imageSrc: 'http://www.image-heberg.fr/files/17704237253410028282.png',
    imageAlt: 'Flacon de parfum avec vanille et caramel',
    gradient: 'from-amber-100 to-orange-100',
  },
  {
    id: 'Frais/Aquatique',
    title: 'Frais',
    description: 'Notes aquatiques, citronnées et légères',
    imageSrc: 'https://www.image-heberg.fr/files/thumbs/17703938173332812077.png',
    imageAlt: 'Flacon de parfum avec citron et eau',
    gradient: 'from-cyan-100 to-blue-100',
  },
  {
    id: 'Épicé',
    title: 'Épicé',
    description: 'Notes chaudes, intenses et envoutantes',
    imageSrc: 'http://www.image-heberg.fr/files/17704237922198395105.png',
    imageAlt: 'Épices chaudes autour d\'un flacon de parfum',
    gradient: 'from-red-100 to-rose-100',
  },
  {
    id: 'Boisé',
    title: 'Boisé',
    description: 'Notes terreuses, profondes et élégantes',
    imageSrc: 'http://www.image-heberg.fr/files/17704237022363089774.png',
    imageAlt: 'Flacon de parfum posé sur du bois',
    gradient: 'from-emerald-100 to-green-100',
  },
  {
    id: 'Floral',
    title: 'Floral',
    description: 'Notes florales, délicates et romantiques',
    imageSrc: 'http://www.image-heberg.fr/files/17704237022363089774.png',
    imageAlt: 'Flacon de parfum entouré de fleurs',
    gradient: 'from-pink-100 to-fuchsia-100',
  },
  {
    id: 'Oriental',
    title: 'Oriental',
    description: 'Notes ambrées, sensuelles et mystérieuses',
    imageSrc: 'http://www.image-heberg.fr/files/17704237922198395105.png',
    imageAlt: 'Flacon de parfum aux notes orientales',
    gradient: 'from-yellow-100 to-amber-100',
  },
  {
    id: 'Cuiré',
    title: 'Cuiré',
    description: 'Notes de cuir, fumées et caractérielles',
    imageSrc: 'http://www.image-heberg.fr/files/17704237022363089774.png',
    imageAlt: 'Flacon de parfum aux accents cuirés',
    gradient: 'from-stone-100 to-zinc-100',
  },
];

const FragranceQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, isInitialized, initializeProducts } = useAdminStore();
  const { addToCart } = useCart();
  
  const [selectedFamily, setSelectedFamily] = useState<OlfactoryFamily | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Ensure products are loaded
  useEffect(() => {
    if (!isInitialized) {
      initializeProducts();
    }
  }, [isInitialized, initializeProducts]);

  const handleSelect = (id: OlfactoryFamily) => {
    setSelectedFamily(id);
  };

  const handleDiscover = async () => {
    if (!selectedFamily) return;

    setIsSaving(true);

    // Save profile if user is logged in
    if (user) {
      try {
        await upsertUserScentProfile(user.id, {
          primary_family: selectedFamily,
          quiz_history: [{
            timestamp: new Date().toISOString(),
            selected_family: selectedFamily,
            quiz_type: 'olfactory_family'
          }],
          scent_score: {
            [selectedFamily]: 100
          }
        });
        toast.success('Votre profil olfactif a été sauvegardé !');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du profil olfactif:', error);
      }
    }

    // Filter products logic
    let matching = products.filter(p => 
      p.families && p.families.includes(selectedFamily)
    );

    // If no products found with strict matching, try loose matching on scent string
    if (matching.length === 0) {
      matching = products.filter(p => 
        p.scent && p.scent.toLowerCase().includes(selectedFamily.toLowerCase())
      );
    }
    
    // Fallback for Frais/Aquatique
    if (matching.length === 0 && selectedFamily === 'Frais/Aquatique') {
         matching = products.filter(p => 
            (p.families && p.families.includes('Frais/Aquatique')) ||
            (p.scent && (p.scent.toLowerCase().includes('frais') || p.scent.toLowerCase().includes('aquatique')))
         );
    }

    // Shuffle and pick 3
    const shuffled = [...matching].sort(() => 0.5 - Math.random());
    setRecommendations(shuffled.slice(0, 3));

    setIsSaving(false);
    setShowResults(true);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setShowResults(false);
    setSelectedFamily(null);
    setRecommendations([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const selectedOption = quizOptions.find(opt => opt.id === selectedFamily);

  return (
    <section className="py-16 md:py-24 bg-secondary/30 min-h-[600px] transition-all duration-500">
      <div className="container mx-auto px-4">
        
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="quiz-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne/30 text-foreground text-xs font-medium mb-4 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Quiz Olfactif
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4">Trouvez votre Fragrance Parfaite</h2>
                <p className="text-sm text-foreground/70 max-w-md mx-auto">
                  Sélectionnez votre famille olfactive préférée et découvrez les parfums faits pour vous
                </p>
              </div>

              {/* Quiz Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-5 max-w-6xl mx-auto mb-12">
                {quizOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`
                      group relative p-4 md:p-6 rounded-2xl transition-all duration-300 overflow-hidden text-left
                      ${selectedFamily === option.id 
                        ? 'glass shadow-lg scale-[1.02] ring-1 ring-primary/20' 
                        : 'bg-card hover:bg-card/80 border border-border/50 hover:border-border'
                      }
                    `}
                  >
                    {/* Image de fond */}
                    {option.imageSrc && (
                      <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg bg-secondary/20">
                         <img 
                          src={option.imageSrc} 
                          alt={option.imageAlt}
                          loading="lazy"
                          width={300}
                          height={300}
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            selectedFamily === option.id ? 'scale-110' : 'group-hover:scale-105'
                          }`}
                        />
                      </div>
                    )}

                    {/* Selection indicator */}
                    {selectedFamily === option.id && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full animate-pulse z-20 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    )}
                    
                    <div className="relative z-10">
                      <h3 className={`font-semibold mb-1 text-sm md:text-base ${selectedFamily === option.id ? 'text-primary' : 'text-foreground'}`}>
                        {option.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <button
                  onClick={handleDiscover}
                  disabled={!selectedFamily || isSaving}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-primary/20 hover:border-primary/60 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all text-foreground font-serif text-lg font-light tracking-[0.1em] uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/5"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyse en cours...
                    </span>
                  ) : (
                    <>
                      Découvrir ma sélection
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {/* Result Header */}
              <div className="text-center mb-16 relative">
                 {/* Background decoration */}
                 <div className={`absolute inset-0 opacity-10 blur-3xl rounded-full bg-gradient-to-r ${selectedOption?.gradient || 'from-gray-100 to-gray-200'} -z-10 transform scale-150`}></div>
                 
                 <div className="inline-block mb-4 p-3 rounded-full bg-background/50 backdrop-blur-sm shadow-sm">
                    <Sparkles className="w-6 h-6 text-primary" />
                 </div>
                 
                 <h2 className="font-serif text-3xl md:text-5xl font-normal mb-6">
                   Votre signature : <span className="text-primary italic">{selectedFamily}</span>
                 </h2>
                 
                 <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                   {selectedOption?.description}. Voici notre sélection exclusive, choisie spécialement pour s'accorder avec votre préférence olfactive.
                 </p>
              </div>

              {/* Recommendations Grid */}
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
                  {recommendations.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.3 }}
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
                </div>
              ) : (
                <div className="text-center py-12 bg-card/50 rounded-2xl mb-12">
                  <p className="text-muted-foreground">
                    Nous n'avons pas trouvé de recommandation exacte pour le moment, mais notre collection regorge de trésors.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                <Button
                  onClick={() => navigate(`/products?family=${selectedFamily}`)}
                  variant="default"
                  className="w-full sm:w-auto min-w-[200px] h-12 text-base tracking-wide"
                >
                  Voir toute la collection {selectedFamily}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full sm:w-auto min-w-[200px] h-12 text-base tracking-wide"
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Refaire le test
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FragranceQuiz;
