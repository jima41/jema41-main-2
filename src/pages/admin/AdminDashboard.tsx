import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Package, ShoppingCart,
  CheckCircle2, Clock, Truck, AlertCircle,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ProductTable } from '@/components/admin/ProductTable';
import MobileProductCard from '@/components/admin/MobileProductCard';
import { ScentRadarChart } from '@/components/admin/ScentRadarChart';
import { useStockInventory } from '@/hooks/use-stock-inventory';
import { useMediaQuery } from '@/hooks/use-media-query';
import AdminCRM from './AdminCRM';
import { useAuth } from '@/context/AuthContext';
import { useAdminStore } from '@/store/useAdminStore';
import AdminOrders from './AdminOrders';
import AdminDashboardMobile from './AdminDashboardMobile';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

const STATUS_ACTIVITY: Record<string, { label: string; dotColor: string }> = {
  pending:   { label: 'est en attente',         dotColor: 'bg-amber-400' },
  confirmed: { label: 'a été confirmée',         dotColor: 'bg-blue-400' },
  shipped:   { label: 'a été expédiée',          dotColor: 'bg-purple-400' },
  delivered: { label: 'a été livrée',            dotColor: 'bg-emerald-400' },
  cancelled: { label: 'a été annulée',           dotColor: 'bg-red-400' },
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
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

  // ── Data Sources ─────────────────────────────────────────────────────────

  const { products, orders } = useAdminStore();
  const { stockItems, updateStockLevel, updateVelocity, deleteProduct } = useStockInventory();

  // ── Computed Stats ───────────────────────────────────────────────────────

  const now = Date.now();
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).getTime();

  const monthOrders = orders.filter(
    (o) => o.timestamp >= monthStart && o.status !== 'cancelled'
  );
  const monthRevenue  = monthOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalStock    = products.reduce((s, p) => s + (p.stock || 0), 0);
  const uniqueClients = new Set(
    orders.map((o) => o.userEmail || o.userId).filter(Boolean)
  ).size;

  const stats = [
    {
      label: 'Revenu du mois',
      value: formatCurrency(monthRevenue),
      icon: TrendingUp,
      color: 'from-admin-gold to-admin-gold-light',
    },
    {
      label: 'Articles en stock',
      value: totalStock.toLocaleString('fr-FR'),
      icon: Package,
      color: 'from-blue-500 to-blue-400',
    },
    {
      label: 'Commandes ce mois',
      value: monthOrders.length.toString(),
      icon: ShoppingCart,
      color: 'from-emerald-500 to-emerald-400',
    },
    {
      label: 'Clients uniques',
      value: uniqueClients.toString(),
      icon: BarChart3,
      color: 'from-purple-500 to-purple-400',
    },
  ];

  // Recent activity: 5 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {isMobile ? (
        <AdminDashboardMobile />
      ) : (
        <>
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
              Tableau de bord
            </h1>
            <p className="text-admin-text-secondary mt-1">
              Bienvenue dans l'administration Rayha Store
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="glass-panel border border-admin-border rounded-lg p-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-admin-bg/50 p-1 rounded-lg">
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
                  value="crm"
                  className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary text-xs md:text-sm"
                >
                  CRM
                </TabsTrigger>
              </TabsList>

              {/* ── Statistiques Tab ─────────────────────────────────────── */}
              <TabsContent value="stats" className="mt-6 space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={index}
                        className="glass-panel border border-admin-border rounded-xl p-4 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60">
                            {stat.label}
                          </p>
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                            <Icon size={16} className="text-white" />
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-admin-text-primary">
                          {stat.value}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'En attente',
                      value: orders.filter((o) => o.status === 'pending').length,
                      icon: Clock,
                      color: 'text-amber-400',
                    },
                    {
                      label: 'Confirmées',
                      value: orders.filter((o) => o.status === 'confirmed').length,
                      icon: CheckCircle2,
                      color: 'text-blue-400',
                    },
                    {
                      label: 'Expédiées',
                      value: orders.filter((o) => o.status === 'shipped').length,
                      icon: Truck,
                      color: 'text-purple-400',
                    },
                    {
                      label: 'Livrées',
                      value: orders.filter((o) => o.status === 'delivered').length,
                      icon: CheckCircle2,
                      color: 'text-emerald-400',
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="glass-panel border border-admin-border rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-admin-text-secondary/60">
                          {label}
                        </p>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-xl font-montserrat font-bold tracking-tighter text-admin-text-primary mb-4">
                    Activité récente
                  </h2>
                  {recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center py-8 gap-3">
                      <AlertCircle className="w-8 h-8 text-admin-text-secondary/20" />
                      <p className="text-sm text-admin-text-secondary">
                        Aucune commande pour le moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((o) => {
                        const act = STATUS_ACTIVITY[o.status] ?? STATUS_ACTIVITY.pending;
                        return (
                          <div
                            key={o.id}
                            className="flex items-center justify-between py-3 border-b border-admin-border/50 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${act.dotColor}`} />
                              <span className="text-sm text-admin-text-secondary">
                                <span className="text-admin-text-primary font-medium">
                                  {o.reference ?? `#${o.id.slice(0, 8).toUpperCase()}`}
                                </span>{' '}
                                {act.label}
                                {(o.userName || o.userEmail) && (
                                  <span className="ml-1 opacity-60">
                                    — {o.userName ?? o.userEmail}
                                  </span>
                                )}
                              </span>
                            </div>
                            <span className="text-xs text-admin-text-secondary/60 whitespace-nowrap ml-4">
                              {formatDate(o.timestamp)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── Inventaire Tab ───────────────────────────────────────── */}
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

              {/* ── Analytics Tab ────────────────────────────────────────── */}
              <TabsContent value="analytics" className="mt-6">
                <div className="space-y-6">
                  <ScentRadarChart height={400} />
                </div>
              </TabsContent>

              {/* ── Commandes Tab — real orders ──────────────────────────── */}
              <TabsContent value="orders" className="mt-6">
                <AdminOrders />
              </TabsContent>

              {/* ── CRM Tab ──────────────────────────────────────────────── */}
              <TabsContent value="crm" className="mt-6">
                <AdminCRM />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
