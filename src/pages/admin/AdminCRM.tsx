import React, { useState } from 'react';
import {
  AbandonedCartList,
} from '@/components/admin/AbandonedCartList';
import { useAbandonedCarts } from '@/hooks/use-abandoned-carts';
import {
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import PromoCodesManager from '@/components/admin/PromoCodesManager';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface CRMStats {
  total: number;
  recovered: number;
  abandoned: number;
  totalValue: number;
  averageAttempts: number;
  recoveryRate: number;
}

const AdminCRM = () => {
  try {
    const abandonedCarts = useAbandonedCarts();
    console.log('useAbandonedCarts hook result:', abandonedCarts);
    
    const { 
      carts = [], 
      sendRecoveryEmail, 
      markRecovered, 
      getStatistics, 
      getFilteredCarts 
    } = abandonedCarts || {};
    
    const [activeTab, setActiveTab] = useState('pending');

    console.log('AdminCRM rendered', { carts, getStatistics, getFilteredCarts });

    let stats: CRMStats = { 
      total: 0, 
      recovered: 0, 
      abandoned: 0, 
      totalValue: 0, 
      averageAttempts: 0, 
      recoveryRate: 0 
    };
    let filteredCarts: any[] = [];

    if (getStatistics) {
      stats = getStatistics();
    }
    if (getFilteredCarts) {
      filteredCarts = getFilteredCarts(activeTab as 'all' | 'pending' | 'recovered' | 'urgent');
    }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          CRM & Récupération Paniers
        </h1>
        <p className="text-admin-text-secondary mt-2">
          Gestion des clients et stratégies de récupération
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Abandoned */}
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Paniers Abandonnés
              </p>
              <p className="text-2xl font-bold text-admin-gold">{stats.abandoned}</p>
              <p className="text-xs text-admin-text-secondary mt-1">
                sur {stats.total}
              </p>
            </div>
            <ShoppingCart className="w-5 h-5 text-admin-gold" />
          </div>
        </div>

        {/* Total Value */}
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Valeur à Récupérer
              </p>
              <p className="text-2xl font-bold text-amber-400">
                {(stats.totalValue / 1000).toFixed(1)}k€
              </p>
              <p className="text-xs text-admin-text-secondary mt-1">
                potentiel
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Taux Récupération
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {stats.recoveryRate.toFixed(1)}%
              </p>
              <p className="text-xs text-admin-text-secondary mt-1">
                {stats.recovered} récupérés
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Avg Attempts */}
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Tentatives Moyennes
              </p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.averageAttempts.toFixed(1)}
              </p>
              <p className="text-xs text-admin-text-secondary mt-1">
                par panier
              </p>
            </div>
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Urgent */}
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Cas Urgents
              </p>
              <p className="text-2xl font-bold text-red-400">
                {getFilteredCarts('urgent').length}
              </p>
              <p className="text-xs text-admin-text-secondary mt-1">
                à traiter
              </p>
            </div>
            <ShoppingCart className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="glass-panel border border-admin-border rounded-lg p-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-admin-bg/50 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              Tous ({stats.total})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              En Attente ({stats.abandoned})
            </TabsTrigger>
            <TabsTrigger
              value="urgent"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              Urgents ({getFilteredCarts('urgent').length})
            </TabsTrigger>
            <TabsTrigger
              value="recovered"
              className="data-[state=active]:bg-admin-card data-[state=active]:text-admin-gold text-admin-text-secondary"
            >
              Récupérés ({stats.recovered})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <AbandonedCartList
              carts={filteredCarts}
              onSendRecoveryEmail={sendRecoveryEmail}
              onMarkRecovered={markRecovered}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PromoCodesManager />

      {/* Strategy Info Box */}
      <div className="glass-panel border border-admin-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-admin-text-primary font-montserrat mb-4">
          📋 Stratégie de Récupération Recommandée
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-admin-bg/50 rounded-lg p-4 border border-admin-border/30">
            <p className="text-xs font-medium text-admin-gold uppercase tracking-wider mb-2">
              📧 Email 1 (0-6h)
            </p>
            <ul className="text-sm text-admin-text-secondary space-y-1">
              <li>• Sujet: "Votre panier vous attend"</li>
              <li>• Pas de remise (retention)</li>
              <li>• CTA: Finaliser</li>
            </ul>
          </div>
          <div className="bg-admin-bg/50 rounded-lg p-4 border border-admin-border/30">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
              🎁 Email 2 (24h)
            </p>
            <ul className="text-sm text-admin-text-secondary space-y-1">
              <li>• Sujet: "Merci client fidèle"</li>
              <li>• Offre: -10% supplémentaire</li>
              <li>• CTA: Bénéficier</li>
            </ul>
          </div>
          <div className="bg-admin-bg/50 rounded-lg p-4 border border-admin-border/30">
            <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
              🚨 Email 3 (72h+)
            </p>
            <ul className="text-sm text-admin-text-secondary space-y-1">
              <li>• Sujet: "Dernier appel -20%"</li>
              <li>• Urgence accrue (rouge)</li>
              <li>• CTA: Commander maintenant</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ROI Calculation */}
      <div className="glass-panel border border-admin-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-admin-text-primary font-montserrat mb-4">
          💰 ROI Gestion Paniers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-admin-text-secondary mb-2">Valeur total abandonnée</p>
            <p className="text-3xl font-bold text-admin-gold">
              €{stats.totalValue.toFixed(0)}
            </p>
            <p className="text-xs text-admin-text-secondary mt-2">
              Tous les paniers non récupérés
            </p>
          </div>
          <div>
            <p className="text-sm text-admin-text-secondary mb-2">À {((stats.recoveryRate + 5) % 100).toFixed(0)}% de taux</p>
            <p className="text-3xl font-bold text-emerald-400">
              €{(stats.totalValue * ((stats.recoveryRate + 5) / 100)).toFixed(0)}
            </p>
            <p className="text-xs text-admin-text-secondary mt-2">
              Revenus supplémentaires potentiels
            </p>
          </div>
          <div>
            <p className="text-sm text-admin-text-secondary mb-2">Coût moyen recover (email)</p>
            <p className="text-3xl font-bold text-blue-400">
              ~€340
            </p>
            <p className="text-xs text-admin-text-secondary mt-2">
              Investissement marketing
            </p>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('AdminCRM Error:', error);
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Erreur</h1>
        <p className="text-red-400 mb-4">Une erreur est survenue lors du chargement du CRM.</p>
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

export default AdminCRM;
