import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useAdmin, type Product } from '@/context/AdminContext';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    cartItemsCount,
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
  const { products, addProduct, updateProduct, deleteProduct, trackPageView, getPageStats } = useAdmin();

  const [activeTab, setActiveTab] = useState<'products' | 'analytics'>('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    brand: '',
    price: 0,
    image: '',
    scent: '',
    category: 'femme',
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Si ce n'est pas admin, rediriger vers l'accueil
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Track page view on mount (only once)
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  const pageStats = getPageStats();

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, formData);
      setEditingId(null);
    } else {
      addProduct(formData);
    }
    setFormData({
      name: '',
      brand: '',
      price: 0,
      image: '',
      scent: '',
      category: 'femme',
    });
    setIsFormOpen(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({ name: product.name, brand: product.brand, price: product.price, image: product.image, scent: product.scent, category: product.category });
    setEditingId(product.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      brand: '',
      price: 0,
      image: '',
      scent: '',
      category: 'femme',
    });
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {/* Admin Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-medium mb-2">Panneau d'Administration</h1>
            <p className="text-muted-foreground">Gérez les produits et visualisez les statistiques du site</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Produits
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* Add Product Button */}
              <Button
                onClick={() => {
                  setIsFormOpen(true);
                  setEditingId(null);
                }}
                variant="luxury"
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter un produit
              </Button>

              {/* Product Form */}
              {isFormOpen && (
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h3 className="text-xl font-medium mb-6">
                    {editingId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
                  </h3>

                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background/50"
                        required
                      />
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Marque</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background/50"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Prix (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background/50"
                        required
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">URL Image</label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background/50"
                        required
                      />
                    </div>

                    {/* Scent */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Note Olfactive</label>
                      <select
                        value={formData.scent}
                        onChange={(e) => setFormData({ ...formData, scent: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background/50"
                        required
                      >
                        <option>Gourmand</option>
                        <option>Floral</option>
                        <option>Boisé</option>
                        <option>Oriental</option>
                        <option>Frais</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Catégorie</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background/50"
                        required
                      >
                        <option>femme</option>
                        <option>homme</option>
                        <option>unisex</option>
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="md:col-span-2 flex gap-4">
                      <Button type="submit" variant="luxury">
                        {editingId ? 'Modifier' : 'Ajouter'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products List */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Tous les produits ({products.length})</h3>
                <div className="grid gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.brand} - {product.price.toFixed(2)}€ - {product.scent}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <p className="text-muted-foreground text-sm mb-2">Pages Visitées</p>
                  <p className="text-3xl font-semibold">
                    {pageStats.length}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <p className="text-muted-foreground text-sm mb-2">Visites Unique</p>
                  <p className="text-3xl font-semibold">{pageStats.length}</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <p className="text-muted-foreground text-sm mb-2">Dernier Accès</p>
                  <p className="text-sm font-semibold text-primary">
                    {pageStats[0] ? new Date(pageStats[0].timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Pages Stats Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-medium">Statistiques des Pages</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Page</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Visites</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Dernière Visite</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Pourcentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageStats.map((stat, index) => {
                        const percentage = pageStats.length > 0 ? (100 / pageStats.length).toFixed(1) : 0;
                        const date = new Date(stat.timestamp).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium">{stat.path}</td>
                            <td className="px-6 py-4 text-sm">✓ Visitée</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{date}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {pageStats.length === 0 && (
                    <div className="px-6 py-12 text-center text-muted-foreground">
                      Aucune donnée d'analyse disponible pour le moment
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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

export default Admin;
