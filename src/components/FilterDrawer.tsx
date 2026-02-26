import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OlfactoryFamily } from '@/lib/olfactory';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategories: string[];
  toggleCategory: (cat: string) => void;
  activeFamilies: OlfactoryFamily[];
  toggleFamily: (family: OlfactoryFamily | 'tous') => void;
  activeBrands: string[];
  toggleBrand: (brand: string) => void;
  families: (OlfactoryFamily | 'tous')[];
  brands: string[];
  onApply: () => void;
  onReset: () => void;
}

const GENRE_OPTIONS = [
  { value: 'tous', label: 'Tous' },
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'mixte', label: 'Unisex' },
];

const TagButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    className={`px-3 py-2 rounded-lg border text-xs font-medium tracking-wide transition-colors duration-200 ${
      active
        ? 'border-[#D4AF37]/60 text-[#D4AF37] bg-[#D4AF37]/8'
        : 'border-white/10 text-white/50 bg-white/[0.03] hover:border-white/25 hover:text-white/80'
    }`}
  >
    {children}
  </motion.button>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-medium">
    {children}
  </p>
);

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  activeCategories,
  toggleCategory,
  activeFamilies,
  toggleFamily,
  activeBrands,
  toggleBrand,
  families,
  brands,
  onApply,
  onReset,
}) => {
  // Compteur de filtres actifs (hors "tous")
  const activeCount = activeCategories.length + activeFamilies.length + activeBrands.length;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-[100dvh] w-full md:w-[320px] z-50 flex flex-col overflow-hidden"
            style={{
              background: 'rgba(6, 6, 6, 0.97)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.07)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38, mass: 0.9 }}
          >
            {/* Filet doré en haut */}
            <div className="h-px bg-gradient-to-l from-[#D4AF37] via-[#FCEEAC]/60 to-transparent flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-normal tracking-wide text-white">Filtres</h2>
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold bg-[#D4AF37] text-[#0E0E0E] rounded-full w-5 h-5 flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white/40" />
              </motion.button>
            </div>

            {/* Content — min-h-0 évite que flex-1 dépasse la hauteur disponible */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-7">

              {/* Genre */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}>
                <SectionTitle>Genre</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((opt) => (
                    <TagButton
                      key={opt.value}
                      active={opt.value === 'tous' ? activeCategories.length === 0 : activeCategories.includes(opt.value)}
                      onClick={() => toggleCategory(opt.value)}
                    >
                      {opt.label}
                    </TagButton>
                  ))}
                </div>
              </motion.div>

              {/* Familles Olfactives */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.13 }}>
                <SectionTitle>Familles Olfactives</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {families.map((family) => (
                    <TagButton
                      key={family}
                      active={family === 'tous' ? activeFamilies.length === 0 : activeFamilies.includes(family as OlfactoryFamily)}
                      onClick={() => toggleFamily(family)}
                    >
                      {family === 'tous' ? 'Toutes' : family}
                    </TagButton>
                  ))}
                </div>
              </motion.div>

              {/* Marque */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
                <SectionTitle>Marque</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <TagButton
                      key={brand}
                      active={brand === 'tous' ? activeBrands.length === 0 : activeBrands.includes(brand)}
                      onClick={() => toggleBrand(brand)}
                    >
                      {brand === 'tous' ? 'Toutes' : brand}
                    </TagButton>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* Actions — collées en bas, avec padding safe-area pour iOS */}
            <motion.div
              className="flex gap-3 px-6 pt-5 border-t border-white/5 flex-shrink-0"
              style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <motion.button
                onClick={() => { onApply(); onClose(); }}
                className="flex-1 h-11 rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-300"
                style={{
                  backgroundColor: '#0E0E0E',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                whileHover={{
                  borderColor: 'rgba(212,175,55,0.6)',
                  boxShadow: '0 8px 24px -4px rgba(212,175,55,0.2)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  initial={{ color: '#FFFFFF' }}
                  whileHover={{ color: '#D4AF37' }}
                  transition={{ duration: 0.3 }}
                >
                  Appliquer
                </motion.span>
              </motion.button>
              <motion.button
                onClick={() => { onReset(); onClose(); }}
                className="flex-1 h-11 rounded-lg border border-white/8 text-white/40 hover:text-white/70 hover:border-white/20 text-xs font-medium tracking-wide uppercase transition-colors duration-200"
                whileTap={{ scale: 0.98 }}
              >
                Réinitialiser
              </motion.button>
            </motion.div>

            {/* Filet doré en bas — intégré au safe-area padding */}
            <div className="h-px bg-gradient-to-l from-[#D4AF37]/40 via-[#FCEEAC]/20 to-transparent flex-shrink-0 mx-6" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;
