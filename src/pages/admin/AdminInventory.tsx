import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductTable, StockItem } from '@/components/admin/ProductTable';
import MobileProductCard from '@/components/admin/MobileProductCard';
import { ProductSlideOver } from '@/components/admin/ProductSlideOver';
import { useStockInventory } from '@/hooks/use-stock-inventory';
import { useAdminStore } from '@/store/useAdminStore';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, TrendingUp, Package, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminInventory = () => {
  try {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stockItems, updateStockLevel, updateVelocity, deleteProduct } = useStockInventory();
    const { resetProductsToDefaults, products } = useAdminStore();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [slideOverMode, setSlideOverMode] = useState<'add' | 'edit'>('add');

  // Vérification d'accès admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin' || user.username.trim().toLowerCase() !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSave = (id: string, stock: number, velocity: number) => {
    updateStockLevel(id, stock);
    updateVelocity(id, velocity);
  };

  const handleAddProduct = () => {
    setSlideOverMode('add');
    setSelectedItem(null);
    setIsSlideOverOpen(true);
  };

  const handleEditProduct = (item: StockItem | any) => {
    // Find the complete StockItem from stockItems if we only have partial data
    const completeItem = stockItems.find(s => s.id === item.id) || item;

    // Convert StockItem to Product format for editing
    const productToEdit: any = {
      id: completeItem.id,
      name: completeItem.name,
      brand: completeItem.brand || '',
      price: completeItem.price,
      image: completeItem.image,
      stock: completeItem.currentStock,
      monthlySales: completeItem.weeklyVelocity * 4.3, // Convert weekly to monthly
      description: completeItem.description || '',
      volume: completeItem.volume || '50ml',
      gender: completeItem.gender || 'mixte',
      notes_tete: completeItem.notes_tete || [],
      notes_coeur: completeItem.notes_coeur || [],
      notes_fond: completeItem.notes_fond || [],
      concentration: completeItem.concentration || 'EDP',
      olfactory_family: completeItem.olfactory_family || 'floral',
      accords: completeItem.accords || [],
      longevity: completeItem.longevity || 6,
      sillage: completeItem.sillage || 3,
      season: completeItem.season || 'all',
      time_of_day: completeItem.time_of_day || 'day',
      age_group: completeItem.age_group || 'adult',
      occasion: completeItem.occasion || 'everyday',
      mood: completeItem.mood || 'elegant',
      weather: completeItem.weather || 'temperate',
      complementary_notes: completeItem.complementary_notes || [],
      created_at: completeItem.created_at,
      updated_at: completeItem.updated_at
    };

    setSelectedItem(completeItem);
    setSlideOverMode('edit');
    setIsSlideOverOpen(true);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Êtes-vous sûr? Cela réinitialiserait tous les stocks à leurs valeurs par défaut.')) {
      resetProductsToDefaults();
    }
  };

  // Calculate summary stats
  const totalStock = stockItems.reduce((sum, item) => sum + item.currentStock, 0);
  const criticalItems = stockItems.filter((item) => {
    const daysUntilStockout = item.currentStock / (item.weeklyVelocity || 1) * 7;
    return daysUntilStockout < 7;
  }).length;
  const lowItems = stockItems.filter((item) => {
    const daysUntilStockout = item.currentStock / (item.weeklyVelocity || 1) * 7;
    return daysUntilStockout >= 7 && daysUntilStockout < 14;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
            Gestion Inventaire
          </h1>
          <p className="text-admin-text-secondary mt-2">
            Monitoring des stocks et vélocité des ventes
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAddProduct}
            className="bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 font-semibold h-fit"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un Parfum
          </Button>
          <Button
            onClick={handleResetToDefaults}
            variant="outline"
            className="border-admin-border text-admin-text-secondary hover:text-amber-400 hover:border-amber-400/50 h-fit"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser Défauts
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Stock Card */}
        <div className="glass-panel border border-admin-border rounded-lg p-6 hover:shadow-glass-gold transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-admin-text-secondary uppercase tracking-wide mb-2">
                Stock Total
              </p>
              <p className="text-3xl font-bold text-admin-text-primary font-montserrat">
                {totalStock}
              </p>
              <p className="text-xs text-admin-text-secondary mt-2">
                {stockItems.length} produits
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Critical Stock Card */}
        <div className="glass-panel border border-admin-border rounded-lg p-6 hover:shadow-glass-gold transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-admin-text-secondary uppercase tracking-wide mb-2">
                Stock Critique
              </p>
              <p className="text-3xl font-bold text-red-400 font-montserrat">
                {criticalItems}
              </p>
              <p className="text-xs text-admin-text-secondary mt-2">
                &lt; 7 jours de stock
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="glass-panel border border-admin-border rounded-lg p-6 hover:shadow-glass-gold transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-admin-text-secondary uppercase tracking-wide mb-2">
                Stock Faible
              </p>
              <p className="text-3xl font-bold text-amber-400 font-montserrat">
                {lowItems}
              </p>
              <p className="text-xs text-admin-text-secondary mt-2">
                7-14 jours de stock
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Table / Cards */}
      {isMobile ? (
        <div className="space-y-2">
          {stockItems.map((item) => (
            <MobileProductCard
              key={item.id}
              item={{
                id: item.id,
                name: item.name,
                brand: item.brand,
                price: item.price,
                currentStock: item.currentStock,
                weeklyVelocity: item.weeklyVelocity,
                lastUpdated: item.lastUpdated,
              }}
              onEdit={handleEditProduct}
              onDelete={deleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-admin-border overflow-hidden">
          <ProductTable
            items={stockItems}
            onEdit={handleEditProduct}
            onDelete={deleteProduct}
          />
        </div>
      )}

      {/* Product Slide Over */}
      <ProductSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        mode={slideOverMode}
        product={slideOverMode === 'edit' && selectedItem ? products.find(p => p.id === selectedItem.id) || null : null}
      />
    </div>
    );
  } catch (error) {
    console.error('AdminInventory Error:', error);
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Erreur Inventaire</h1>
        <p className="text-red-400 mb-4">Une erreur est survenue lors du chargement de l'inventaire.</p>
        <details className="bg-red-900/20 p-4 rounded border border-red-700">
          <summary className="cursor-pointer font-medium text-red-400">Détails de l'erreur</summary>
          <pre className="mt-4 text-sm text-red-300 overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </details>
      </div>
    );
  }
};

export default AdminInventory;
