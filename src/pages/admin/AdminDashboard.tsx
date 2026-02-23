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
import { ScentRadarChart } from '@/components/admin/ScentRadarChart';
import { OrderList, UnboxingPersonalization } from '@/components/admin/OrderList';
import { UnboxingDialog } from '@/components/admin/UnboxingDialog';
import { AbandonedCartList } from '@/components/admin/AbandonedCartList';
import { useStockInventory } from '@/hooks/use-stock-inventory';
import { useOrderManagement } from '@/hooks/use-order-management';
import { useAbandonedCarts } from '@/hooks/use-abandoned-carts';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/context/AuthContext';
import AdminDashboardMobile from './AdminDashboardMobile';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedUnboxingId, setSelectedUnboxingId] = useState<string | null>(null);
  const [unboxingDialogOpen, setUnboxingDialogOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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

  const stats = [
    {
      label: 'Revenu du mois',
      value: '€12,450',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'from-admin-gold to-admin-gold-light',
    },
    {
      label: 'Articles en stock',
      value: '847',
      change: '-2.1%',
      icon: Package,
      color: 'from-blue-500 to-blue-400',
    },
    {
      label: 'Commandes ce mois',
      value: '124',
      change: '+12.4%',
      icon: ShoppingCart,
      color: 'from-emerald-500 to-emerald-400',
    },
    {
      label: 'Clients actifs',
      value: '3,249',
      change: '+5.1%',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-400',
    },
  ];

  const handleUnboxingEdit = (orderId: string, unboxing: UnboxingPersonalization) => {
    setSelectedUnboxingId(orderId);
    setUnboxingDialogOpen(true);
  };

  const handleUnboxingSave = (unboxing: UnboxingPersonalization) => {
    if (selectedUnboxingId) {
      updateUnboxing(selectedUnboxingId, unboxing);
    }
  };

  return (
    <div className="space-y-6">
      {/* Use mobile version on mobile devices */}
      {isMobile ? (
        <AdminDashboardMobile />
      ) : (
        <>
          {/* Header */}
          <div>
            <h1 className="text-3xl font-montserrat font-bold tracking-tighter text-admin-text-primary mb-2">
              Tableau de bord
            </h1>
            <p className="text-admin-text-secondary">Bienvenue dans l'administration Rayha Store</p>
          </div>

          {/* Navigation Tabs */}
          <div className="glass-panel border border-admin-border rounded-lg p-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-admin-bg/50 p-1 rounded-lg">
                <TabsTrigger
                  value="stats"
                  className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary text-xs md:text-sm"
                >
                  Statistiques
                </TabsTrigger>
                <TabsTrigger
                  value="inventory"
                  className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary text-xs md:text-sm"
                >
                  Inventaire
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary text-xs md:text-sm"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary text-xs md:text-sm"
                >
                  Commandes
                </TabsTrigger>
                <TabsTrigger
                  value="clients"
                  className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary text-xs md:text-sm"
                >
                  Clients
                </TabsTrigger>
                <TabsTrigger
                  value="crm"
                  className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary text-xs md:text-sm"
                >
                  CRM
                </TabsTrigger>
              </TabsList>

              {/* Statistiques Tab */}
              <TabsContent value="stats" className="mt-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={index}
                        className="glass-panel rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
                      >
                        {/* Icon Background */}
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-2 mb-4 group-hover:shadow-lg group-hover:shadow-admin-gold/30 transition-all duration-300`}>
                          <Icon size={28} className="text-white" />
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          <p className="text-sm text-admin-text-secondary">{stat.label}</p>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-admin-text-primary">
                              {stat.value}
                            </span>
                            <span className="text-xs text-emerald-400 font-medium">
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Activity Section */}
                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-xl font-montserrat font-bold tracking-tighter text-admin-text-primary mb-4">
                    Activité récente
                  </h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-admin-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-admin-gold" />
                          <span className="text-sm text-admin-text-secondary">
                            Commande #{1000 + i} a été expédiée
                          </span>
                        </div>
                        <span className="text-xs text-admin-text-secondary/60">
                          Il y a {i * 2} h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Inventaire Tab */}
              <TabsContent value="inventory" className="mt-6">
                <div className="space-y-4">
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
                          onEdit={() => {}}
                          onDelete={deleteProduct}
                        />
                      ))}
                    </div>
                  ) : (
                    <ProductTable
                      items={stockItems}
                      onEdit={() => {}}
                      onDelete={deleteProduct}
                    />
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-6">
                <div className="space-y-6">
                  <ScentRadarChart height={400} />
                </div>
              </TabsContent>

              {/* Commandes Tab */}
              <TabsContent value="orders" className="mt-6">
                <div className="space-y-6">
                  <OrderList
                    orders={orders}
                    onStatusChange={updateOrderStatus}
                    onUnboxingEdit={handleUnboxingEdit}
                  />
                </div>
              </TabsContent>

              {/* Clients Tab */}
              <TabsContent value="clients" className="mt-6">
                <div className="glass-panel border border-admin-border rounded-lg p-8">
                  <h2 className="text-xl font-montserrat font-bold tracking-tighter text-admin-text-primary mb-4">
                    Profils Clients Scent-ID
                  </h2>
                  <div className="bg-admin-bg/30 rounded-lg p-12 text-center">
                    <p className="text-admin-text-secondary">
                      Module de gestion des profils clients en cours de développement
                    </p>
                    <p className="text-sm text-admin-text-secondary/60 mt-2">
                      Analyse des préférences olfactives et historiques d'achats
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* CRM Tab */}
              <TabsContent value="crm" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-montserrat font-bold tracking-tighter text-admin-text-primary mb-2">
                      Récupération Paniers Abandonnés
                    </h2>
                    <p className="text-admin-text-secondary mb-4">
                      Stratégies de reprise et gestion CRM
                    </p>
                  </div>
                  <AbandonedCartList
                    carts={carts}
                    onSendRecoveryEmail={sendRecoveryEmail}
                    onMarkRecovered={markRecovered}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Unboxing Dialog */}
            <UnboxingDialog
              open={unboxingDialogOpen}
              onOpenChange={setUnboxingDialogOpen}
              unboxing={
                selectedUnboxingId
                  ? orders.find((o) => o.id === selectedUnboxingId)?.unboxing || null
                  : null
              }
              onSave={handleUnboxingSave}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
