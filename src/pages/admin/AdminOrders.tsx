import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderList, Order, UnboxingPersonalization } from '@/components/admin/OrderList';
import { UnboxingDialog } from '@/components/admin/UnboxingDialog';
import { useOrderManagement } from '@/hooks/use-order-management';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, updateOrderStatus, updateUnboxing, getOrderStats } =
    useOrderManagement();
  const [selectedUnboxingId, setSelectedUnboxingId] = useState<string | null>(null);
  const [unboxingDialogOpen, setUnboxingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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

  const stats = getOrderStats();

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          Gestion des Commandes
        </h1>
        <p className="text-admin-text-secondary mt-2">
          Suivi, statut et personnalisation unboxing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Total
              </p>
              <p className="text-2xl font-bold text-admin-gold">{stats.total}</p>
            </div>
            <ShoppingCart className="w-5 h-5 text-admin-gold" />
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                En attente
              </p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Expédiées
              </p>
              <p className="text-2xl font-bold text-blue-400">{stats.shipped}</p>
            </div>
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Livrées
              </p>
              <p className="text-2xl font-bold text-emerald-400">{stats.delivered}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Revenus Total
              </p>
              <p className="text-2xl font-bold text-admin-gold">
                {(stats.revenue / 1000).toFixed(1)}k€
              </p>
            </div>
            <Eye className="w-5 h-5 text-admin-gold" />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="glass-panel border border-admin-border rounded-lg p-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-admin-bg/50 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              Tous
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              En attente
            </TabsTrigger>
            <TabsTrigger
              value="confirmed"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              Confirmées
            </TabsTrigger>
            <TabsTrigger
              value="shipped"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              Expédiées
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              Livrées
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <OrderList
              orders={filteredOrders}
              onStatusChange={updateOrderStatus}
              onUnboxingEdit={handleUnboxingEdit}
            />
          </TabsContent>
        </Tabs>
      </div>

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
  );
};

export default AdminOrders;
