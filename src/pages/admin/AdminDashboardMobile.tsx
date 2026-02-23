import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Package, ShoppingCart, Users, Bell, Home, Box, ClipboardList, User, BarChart, Edit, Trash2, RefreshCw, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ProductTable } from '@/components/admin/ProductTable';
import MobileProductCard from '@/components/admin/MobileProductCard';
import { ProductSlideOver } from '@/components/admin/ProductSlideOver';

import { ScentRadarChart } from '@/components/admin/ScentRadarChart';
import { OrderList, UnboxingPersonalization } from '@/components/admin/OrderList';
import { UnboxingDialog } from '@/components/admin/UnboxingDialog';
import { AbandonedCartList } from '@/components/admin/AbandonedCartList';
import { useStockInventory } from '@/hooks/use-stock-inventory';
import { useOrderManagement } from '@/hooks/use-order-management';
import { useAbandonedCarts } from '@/hooks/use-abandoned-carts';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/context/AuthContext';

const AdminDashboardMobile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedUnboxingId, setSelectedUnboxingId] = useState<string | null>(null);
  const [unboxingDialogOpen, setUnboxingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const refreshRef = useRef<HTMLDivElement>(null);

  // État pour panneau d’ajout/édition produit
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);
  const [productPanelMode, setProductPanelMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  // Ouvre le panneau pour ajouter un produit
  const handleAddProduct = () => {
    setProductPanelMode('add');
    setSelectedProduct(null);
    setIsProductPanelOpen(true);
  };

  // Ouvre le panneau pour éditer un produit
  const handleEditProduct = (item: any) => {
    setProductPanelMode('edit');
    setSelectedProduct(item);
    setIsProductPanelOpen(true);
  };

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

  // Hooks pour chaque section
  const { stockItems, updateStockLevel, updateVelocity, deleteProduct } = useStockInventory();
  const { orders, updateOrderStatus, updateUnboxing } = useOrderManagement();
  const { carts, sendRecoveryEmail, markRecovered } = useAbandonedCarts();

  // Stats calculées dynamiquement
  const todayRevenue = orders
    .filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const todayOrders = orders.filter(order =>
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const activeCarts = carts.filter(cart => !cart.recovered).length;

  const lowStockItems = stockItems.filter(item => item.currentStock <= 5);

  const stats = [
    {
      label: 'CA Aujourd\'hui',
      value: `€${todayRevenue.toFixed(2)}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-admin-gold to-admin-gold-light',
      sparkline: [20, 35, 25, 45, 30, 50, 40],
    },
    {
      label: 'Commandes Aujourd\'hui',
      value: todayOrders.toString(),
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'from-emerald-500 to-emerald-400',
      sparkline: [10, 15, 12, 18, 14, 20, 16],
    },
    {
      label: 'Paniers Actifs',
      value: activeCarts.toString(),
      change: '-2.1%',
      icon: Package,
      color: 'from-blue-500 to-blue-400',
      sparkline: [8, 12, 10, 15, 11, 14, 13],
    },
    {
      label: 'Stocks Faibles',
      value: lowStockItems.length.toString(),
      change: lowStockItems.length > 0 ? 'Attention' : 'OK',
      icon: AlertTriangle,
      color: lowStockItems.length > 0 ? 'from-red-500 to-red-400' : 'from-green-500 to-green-400',
      sparkline: [2, 3, 1, 4, 2, 3, 2],
    },
  ];

  // Pull to refresh
  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    // Simuler un refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 80) {
      handlePullRefresh();
    }
    setPullDistance(0);
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setOrderSheetOpen(true);
  };

  const handleUnboxingEdit = (orderId: string, unboxing: UnboxingPersonalization) => {
    setSelectedUnboxingId(orderId);
    setUnboxingDialogOpen(true);
  };

  const handleUnboxingSave = (unboxing: UnboxingPersonalization) => {
    if (selectedUnboxingId) {
      updateUnboxing(selectedUnboxingId, unboxing);
    }
  };

  // Mobile Bottom Navigation Tabs
  const mobileTabs = [
    { id: 'stats', label: 'Accueil', icon: Home },
    { id: 'products', label: 'Produits', icon: Box },
    { id: 'orders', label: 'Commandes', icon: ClipboardList },
    { id: 'clients', label: 'Clients', icon: User },
    { id: 'analytics', label: 'Stats', icon: BarChart },
  ];

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text-primary">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-admin-bg/95 backdrop-blur-xl border-b border-admin-border/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-admin-gold/20 flex items-center justify-center">
            <span className="text-admin-gold font-serif text-sm font-bold">R</span>
          </div>
          <span className="font-serif text-lg font-light text-admin-text-primary">Rayha</span>
        </div>
        <button className="p-2 rounded-full hover:bg-admin-card/50 transition-colors relative">
          <Bell className="w-5 h-5 text-admin-text-secondary" />
          {todayOrders > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-admin-gold rounded-full animate-pulse" />
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4">
        <AnimatePresence mode="wait">
          {/* Stats/Dashboard View */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Pull to Refresh Container */}
              <motion.div
                ref={refreshRef}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDrag={(event, info) => setPullDistance(Math.max(0, info.offset.y))}
                onDragEnd={handleDragEnd}
                className="space-y-6"
              >
                {/* Refresh Indicator */}
                {pullDistance > 50 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center py-4"
                  >
                    <RefreshCw className={`w-6 h-6 text-admin-gold ${isRefreshing ? 'animate-spin' : ''}`} />
                  </motion.div>
                )}

                {/* Welcome Message */}
                <div className="text-center py-4">
                  <h1 className="text-2xl font-serif font-light text-admin-text-primary mb-1">
                    Bonjour, {user?.username}
                  </h1>
                  <p className="text-sm text-admin-text-secondary">Tableau de bord Rayha Store</p>
                </div>

                {/* Stats Cards */}
                <div className="space-y-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-admin-card/50 backdrop-blur-xl rounded-2xl p-5 border border-admin-border/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-admin-text-primary">{stat.value}</p>
                            <p className={`text-xs font-medium ${stat.change.includes('+') ? 'text-emerald-400' : stat.change.includes('-') ? 'text-red-400' : 'text-admin-gold'}`}>
                              {stat.change}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-admin-text-secondary font-medium">{stat.label}</p>

                        {/* Mini Sparkline */}
                        <div className="mt-3 h-8 flex items-end justify-between">
                          {stat.sparkline.map((value, i) => (
                            <div
                              key={i}
                              className="bg-admin-gold/60 rounded-sm flex-1 mx-0.5"
                              style={{ height: `${(value / 50) * 100}%` }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Actions Urgentes */}
                {lowStockItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-medium text-red-400">Actions Urgentes</h3>
                    </div>
                    <div className="space-y-3">
                      {lowStockItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-admin-card/30 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-admin-text-primary">{item.name}</p>
                            <p className="text-xs text-admin-text-secondary">Stock: {item.currentStock}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('products')}
                            className="px-3 py-1 bg-admin-gold text-black text-xs rounded-full font-medium active:scale-95 transition-transform"
                          >
                            Réappro
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recent Activity */}
                <div className="bg-admin-card/30 backdrop-blur-xl rounded-2xl p-5 border border-admin-border/30">
                  <h3 className="text-lg font-medium text-admin-text-primary mb-4">Activité Récente</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order, i) => (
                      <div key={order.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-admin-gold" />
                          <span className="text-sm text-admin-text-secondary">
                            Commande #{order.id.slice(-4)} • €{order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs text-admin-text-secondary/60">
                          {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Products View */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-light text-admin-text-primary">Gestion Produits</h2>
                <button
                  className="px-4 py-2 bg-admin-gold text-black rounded-xl font-medium text-sm active:scale-95 transition-transform"
                  onClick={handleAddProduct}
                >
                  + Nouveau
                </button>
              </div>

              <div className="space-y-3">
                {stockItems.map((item) => (
                  <motion.div
                    key={item.id}
                    drag="x"
                    dragConstraints={{ left: -100, right: 0 }}
                    onDragEnd={(event, info) => {
                      if (info.offset.x < -50) {
                        handleEditProduct(item);
                      }
                    }}
                    className="bg-admin-card/50 backdrop-blur-xl rounded-2xl p-4 border border-admin-border/30 relative overflow-hidden"
                  >
                    {/* Swipe Action Background */}
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-admin-gold flex items-center justify-center">
                      <Edit className="w-5 h-5 text-black" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-admin-card flex items-center justify-center">
                        <Box className="w-8 h-8 text-admin-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-admin-text-primary">{item.name}</h3>
                        <p className="text-sm text-admin-text-secondary">{item.brand}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-admin-gold">€{item.price.toFixed(2)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.currentStock > 10 ? 'bg-green-500/20 text-green-400' :
                            item.currentStock > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            Stock: {item.currentStock}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleEditProduct(item)}
                          className="px-3 py-1 rounded-full text-xs font-medium transition-colors bg-admin-card text-admin-text-secondary border border-admin-border hover:bg-admin-gold/10 hover:text-admin-gold"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Panneau d’ajout/édition produit */}
              <ProductSlideOver
                isOpen={isProductPanelOpen}
                onClose={() => setIsProductPanelOpen(false)}
                mode={productPanelMode}
                product={productPanelMode === 'edit' && selectedProduct ? selectedProduct : null}
              />
            </motion.div>
          )}

          {/* Orders View */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-serif font-light text-admin-text-primary">Commandes</h2>

              <div className="space-y-3">
                {orders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((order) => (
                    <motion.div
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="bg-admin-card/50 backdrop-blur-xl rounded-2xl p-4 border border-admin-border/30 active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-admin-text-primary">#{order.id.slice(-6)}</span>
                          {order.status === 'pending' && (
                            <span className="px-2 py-1 bg-admin-gold/20 text-admin-gold text-xs rounded-full font-medium">
                              À préparer
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-admin-gold">€{order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-admin-text-secondary">
                        <span>{order.clientName}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Clients View */}
          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-serif font-light text-admin-text-primary">Clients</h2>
              <div className="bg-admin-card/30 backdrop-blur-xl rounded-2xl p-5 border border-admin-border/30 text-center">
                <Users className="w-12 h-12 text-admin-text-secondary mx-auto mb-3" />
                <p className="text-admin-text-secondary">Section Clients en développement</p>
              </div>
            </motion.div>
          )}

          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-serif font-light text-admin-text-primary">Analytics</h2>
              <div className="bg-admin-card/30 backdrop-blur-xl rounded-2xl p-5 border border-admin-border/30 text-center">
                <BarChart className="w-12 h-12 text-admin-text-secondary mx-auto mb-3" />
                <p className="text-admin-text-secondary">Analytics détaillés disponibles sur desktop</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-admin-bg/95 backdrop-blur-xl border-t border-admin-border/30 px-2 py-2">
        <div className="flex justify-around">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-admin-gold/20 text-admin-gold' : 'text-admin-text-secondary hover:text-admin-text-primary'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Order Detail Bottom Sheet */}
      <AnimatePresence>
        {orderSheetOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setOrderSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-admin-bg rounded-t-3xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-light text-admin-text-primary">
                    Commande #{selectedOrder.id.slice(-6)}
                  </h3>
                  <button
                    onClick={() => setOrderSheetOpen(false)}
                    className="p-2 rounded-full hover:bg-admin-card/50"
                  >
                    <motion.div whileTap={{ scale: 0.9 }}>
                      ✕
                    </motion.div>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-admin-card/30 rounded-xl p-4">
                    <h4 className="font-medium text-admin-text-primary mb-2">Client</h4>
                    <p className="text-sm text-admin-text-secondary">{selectedOrder.clientName}</p>
                    <p className="text-sm text-admin-text-secondary">{selectedOrder.customerEmail}</p>
                  </div>

                  <div className="bg-admin-card/30 rounded-xl p-4">
                    <h4 className="font-medium text-admin-text-primary mb-2">Articles</h4>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.giftMessage && (
                    <div className="bg-admin-card/30 rounded-xl p-4">
                      <h4 className="font-medium text-admin-text-primary mb-2">Message Cadeau</h4>
                      <p className="text-sm text-admin-text-secondary italic">"{selectedOrder.giftMessage}"</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-admin-border/30">
                    <span className="font-medium text-admin-text-primary">Total</span>
                    <span className="text-lg font-bold text-admin-gold">€{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardMobile;