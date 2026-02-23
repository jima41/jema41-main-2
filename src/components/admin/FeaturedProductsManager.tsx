import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Check, X, ArrowUp, ArrowDown, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminProducts } from '@/store/useAdminStore';
import { useFeaturedProducts } from '@/store/useAdminStore';
import type { Product } from '@/store/useAdminStore';

const FeaturedProductsManager = () => {
  const { products } = useAdminProducts();
  const { featuredProductIds, setFeaturedProducts, reorderFeaturedProducts } = useFeaturedProducts();
  
  const [selectedIds, setSelectedIds] = useState<string[]>(featuredProductIds);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedIds(featuredProductIds);
  }, [featuredProductIds]);

  const toggleProduct = (productId: string) => {
    setHasChanges(true);
    if (selectedIds.includes(productId)) {
      setSelectedIds(selectedIds.filter((id) => id !== productId));
    } else {
      setSelectedIds([...selectedIds, productId]);
    }
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    setHasChanges(true);
    const newOrder = [...selectedIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setSelectedIds(newOrder);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const newOrder = [...selectedIds];
      const draggedId = newOrder[draggedIndex];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedId);
      setSelectedIds(newOrder);
      setDraggedIndex(targetIndex);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setFeaturedProducts(selectedIds);
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Erreur sauvegarde featured:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedIds(featuredProductIds);
    setHasChanges(false);
  };

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => p !== undefined) as Product[];

  const unselectedProducts = products.filter((p) => !selectedIds.includes(p.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-normal mb-2 text-admin-text-primary">
          Gérer Notre Sélection
        </h1>
        <p className="text-admin-text-secondary text-sm">
          Sélectionnez les produits et réorganisez-les par glisser-déposer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SELECTED PRODUCTS - LEFT SIDE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-admin-text-primary flex items-center gap-2">
              <Check className="w-5 h-5 text-admin-gold" />
              Notre Sélection ({selectedIds.length})
            </h2>
          </div>

          <div className="glass-panel border border-admin-border/30 rounded-lg p-4 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
            {selectedProducts.length > 0 ? (
              <AnimatePresence>
                {selectedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    layoutId={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`group flex items-start gap-3 p-3 rounded-lg border border-admin-border/20 cursor-move transition-all ${
                      draggedIndex === index
                        ? 'bg-admin-gold/10 border-admin-gold/40 opacity-60'
                        : 'bg-admin-bg/40 hover:bg-admin-gold/5 hover:border-admin-gold/30'
                    }`}
                  >
                    {/* Drag Handle */}
                    <GripVertical className="w-4 h-4 text-admin-gold/50 mt-1 flex-shrink-0" />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-admin-text-primary truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-admin-text-secondary/70 truncate">
                        {product.brand} • {product.price}€
                      </div>
                    </div>

                    {/* Position Badge */}
                    <div className="text-xs font-semibold bg-admin-gold/20 text-admin-gold px-2 py-1 rounded flex-shrink-0 w-8 text-center">
                      #{index + 1}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveProduct(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-admin-gold/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Monter"
                      >
                        <ArrowUp className="w-3 h-3 text-admin-gold" />
                      </button>
                      <button
                        onClick={() => moveProduct(index, 'down')}
                        disabled={index === selectedProducts.length - 1}
                        className="p-1 rounded hover:bg-admin-gold/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Descendre"
                      >
                        <ArrowDown className="w-3 h-3 text-admin-gold" />
                      </button>
                      <button
                        onClick={() => toggleProduct(product.id)}
                        className="p-1 rounded hover:bg-red-900/30 transition-colors"
                        title="Retirer"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-admin-text-secondary/50">
                  <p className="text-sm mb-2">Aucun produit sélectionné</p>
                  <p className="text-xs">Sélectionnez des produits à droite</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AVAILABLE PRODUCTS - RIGHT SIDE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-admin-text-primary flex items-center gap-2">
              <Plus className="w-5 h-5 text-admin-text-secondary/50" />
              Produits disponibles ({unselectedProducts.length})
            </h2>
          </div>

          <div className="glass-panel border border-admin-border/30 rounded-lg p-4 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
            {unselectedProducts.length > 0 ? (
              <AnimatePresence>
                {unselectedProducts.map((product) => (
                  <motion.button
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    layoutId={`available-${product.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border border-admin-border/20 bg-admin-bg/40 hover:bg-admin-gold/10 hover:border-admin-gold/40 transition-all text-left group"
                  >
                    {/* Selection Checkbox */}
                    <div className="flex items-center justify-center w-5 h-5 rounded border border-admin-border/40 group-hover:border-admin-gold/60 flex-shrink-0 mt-0.5 bg-transparent group-hover:bg-admin-gold/5 transition-all">
                      <Check className="w-3 h-3 text-admin-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-admin-text-primary truncate group-hover:text-admin-gold transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-admin-text-secondary/70 truncate">
                        {product.brand} • {product.price}€
                      </div>
                    </div>

                    {/* Stock Info */}
                    <div className="text-xs px-2 py-1 rounded bg-admin-bg/60 text-admin-text-secondary/70 flex-shrink-0">
                      Stock: {product.stock}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-admin-text-secondary/50">
                  <p className="text-sm">Tous les produits sont sélectionnés</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-admin-border/20">
        <Button
          onClick={handleCancel}
          disabled={!hasChanges}
          variant="outline"
          className="border-admin-border/40 hover:border-admin-border/60"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-gradient-to-r from-admin-gold/20 to-admin-gold/10 hover:from-admin-gold/30 hover:to-admin-gold/20 border border-admin-gold/40 text-admin-gold hover:text-admin-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FeaturedProductsManager;
