import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { OlfactoryFamily } from '@/lib/olfactory';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeFamily: OlfactoryFamily | 'tous';
  setActiveFamily: (family: OlfactoryFamily | 'tous') => void;
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
  categories: string[];
  families: (OlfactoryFamily | 'tous')[];
  brands: string[];
  onApply: () => void;
  onReset: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  activeFamily,
  setActiveFamily,
  activeBrand,
  setActiveBrand,
  categories,
  families,
  brands,
  onApply,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-label="Close filters"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full md:w-[350px] bg-background backdrop-blur-md border-l border-border/40 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/20 flex-shrink-0">
          <h2 className="text-xl font-semibold text-foreground">Filtres</h2>
          <button
            onClick={onClose}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 space-y-8 p-6 overflow-y-auto pb-24">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-foreground/80">
              Genre
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => setActiveCategory(cat)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
                      activeCategory === cat 
                        ? 'border-foreground/60 text-foreground bg-secondary/30' 
                        : 'border-border/40 text-foreground/70 hover:border-border/80'
                    }`}
                  >
                    {cat === 'tous' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Family Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-foreground/80">
              Familles Olfactives
            </h3>
            <div className="flex flex-wrap gap-2">
              {families.map((family, index) => (
                <motion.div
                  key={family}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => setActiveFamily(family)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
                      activeFamily === family 
                        ? 'border-foreground/60 text-foreground bg-secondary/30' 
                        : 'border-border/40 text-foreground/70 hover:border-border/80'
                    }`}
                  >
                    {family === 'tous' ? 'Tous' : family}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Brand Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-foreground/80">
              Marque
            </h3>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand, index) => (
                <motion.div
                  key={brand}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => setActiveBrand(brand)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
                      activeBrand === brand 
                        ? 'border-foreground/60 text-foreground bg-secondary/30' 
                        : 'border-border/40 text-foreground/70 hover:border-border/80'
                    }`}
                  >
                    {brand === 'tous' ? 'Tous' : brand}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="sticky bottom-0 flex gap-3 p-6 border-t border-border/10 bg-background backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.button
            onClick={() => {
              onApply();
              onClose();
            }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex-1 h-12 border border-foreground/40 hover:border-foreground/70 text-foreground text-xs font-medium rounded transition-all"
          >
            Appliquer
          </motion.button>
          <motion.button
            onClick={() => {
              onReset();
              onClose();
            }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex-1 h-12 border border-border/20 hover:border-border/60 text-foreground/70 hover:text-foreground text-xs font-medium rounded transition-all"
          >
            Réinitialiser
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default FilterDrawer;
