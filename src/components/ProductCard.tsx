import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuth } from '@/context/AuthContext';
import type { OlfactoryFamily } from '@/lib/olfactory';
import { getTopFamilies } from '@/lib/olfactory';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  scent: string;
  notes?: string[];
  stock: number;
  onAddToCart: (id: string) => void;
  notes_tete?: string[];
  notes_coeur?: string[];
  notes_fond?: string[];
  families?: OlfactoryFamily[];
}

const VALID_FAMILIES: OlfactoryFamily[] = [
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique',
];

const ProductCard = ({
  id,
  name,
  brand,
  price,
  image,
  scent,
  notes,
  stock,
  onAddToCart,
  notes_tete,
  notes_coeur,
  notes_fond,
  families,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const isOutOfStock = stock === 0;
  const [isFaved, setIsFaved] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuth();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !image) {
      console.debug(`⚠️ ProductCard ${name} has no image`);
    }
  }, [id, name, image]);

  useEffect(() => {
    setIsFaved(isFavorite(id));
  }, [id, isFavorite]);

  const validFamilies = (families || []).filter((f) => VALID_FAMILIES.includes(f));
  const computedTopFamilies = getTopFamilies(
    notes_tete || [],
    notes_coeur || [],
    notes_fond || [],
    validFamilies,
    3,
  );

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    toggleFavorite(user.id, id);
    setIsFaved(!isFaved);
  };

  const scentLine = computedTopFamilies.length > 0
    ? computedTopFamilies.join(' · ')
    : scent;

  return (
    <motion.div
      className="group relative flex flex-col rounded-xl overflow-hidden bg-[#0E0E0E] cursor-pointer select-none"
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
      // Ombre subtile aux couleurs de la marque (Bronze/Or mat)
      whileHover={{
        y: -4,
        boxShadow: '0 20px 52px rgba(166, 138, 86, 0.4)'
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/product/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/product/${id}`);
      }}
    >
      {/* ── Image ──────────────────────────────────────────────── */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {image ? (
          <motion.img
            src={image}
            alt={name}
            width={500}
            height={625}
            className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.04] ${
              isOutOfStock ? 'grayscale' : ''
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-[#444]" strokeWidth={1} />
          </div>
        )}
        
        {/* Black fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Out of Stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <p className="font-serif text-lg text-[#D4AF37] font-light tracking-[0.3em] uppercase drop-shadow">
              ÉPUISÉ
            </p>
          </div>
        )}

        {/* ── BOUTON PANIER HYBRIDE ── */}
        {!isOutOfStock && (
          <div
            className="absolute bottom-3 right-3 md:inset-0 md:flex md:items-center md:justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(id);
              }}
              className="p-2.5 md:p-3 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors duration-300 shadow-lg"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              aria-label="Ajouter au panier"
            >
              <ShoppingBag strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
        )}

        {/* Heart — top-right */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(e);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/35 backdrop-blur-sm z-10 active:scale-95"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          aria-label="Ajouter aux favoris"
        >
          <Heart
            strokeWidth={2}
            className={`w-4 h-4 transition-all duration-300 ${
              isFaved ? 'fill-red-500 text-red-500' : 'text-white/80 hover:text-[#D4AF37]'
            }`}
          />
        </motion.button>

        {/* Stock limité badge */}
        {!isOutOfStock && stock > 0 && stock < 5 && (
          <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.2em] text-amber-400 font-medium bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
            Stock limité
          </span>
        )}
      </div>

      {/* ── Séparateur doré ────────────────────────────────────── */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(to right, transparent 0%, #C9971C 30%, #D4AF37 50%, #C9971C 70%, transparent 100%)',
          opacity: 0.55,
        }}
      />

      {/* ── Info section ───────────────────────────────────────── */}
      <div
        className="flex flex-col px-3 pt-3 pb-3 gap-2"
        style={{
          background: '#0E0E0E',
        }}
      >

        {/* Brand + Name + Price row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-medium text-[#A68A56] uppercase tracking-[0.18em] mb-0.5 truncate">
              {brand}
            </p>
            <h3 className="text-white font-medium text-xs md:text-sm leading-tight line-clamp-1">
              {name}
            </h3>
          </div>
          {/* LE PRIX : Lisible, Blanc très net, Sans-Serif, tabulaire */}
          {!isOutOfStock && (
            <span className="text-white/90 font-sans font-medium tracking-wide text-xs md:text-sm whitespace-nowrap shrink-0 pt-[1px] tabular-nums">
              {price.toFixed(2)} €
            </span>
          )}
        </div>

        {/* Scent / family line */}
        <p className="text-[10px] md:text-[11px] text-[#888888] italic leading-snug line-clamp-1">
          {scentLine}
        </p>

        {/* Separator */}
        <div className="h-px bg-[#232323]" />

        {/* CTA row */}
        {isOutOfStock ? (
          <p className="text-center text-[9px] tracking-[0.25em] uppercase font-serif text-[#D4AF37]/70 py-0.5">
            Édition épuisée
          </p>
        ) : (
          <div className="flex items-center justify-center gap-1 py-0.5">
            <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.22em] text-white/60 group-hover:text-white/90 transition-colors duration-300">
              Découvrir
            </span>
            <svg
              className="w-3 h-3 text-[#D4AF37] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;