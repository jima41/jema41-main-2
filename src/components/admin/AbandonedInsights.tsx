import React, { useMemo } from 'react';
import { TrendingDown, AlertCircle, Zap, Target, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAbandonedCarts } from '@/hooks/use-abandoned-carts';

interface AbandonedProduct {
  productId: string;
  productName: string;
  abandonmentCount: number;
  totalValue: number;
  avgPrice: number;
  hypothesis: string;
  priority: 'urgent' | 'high' | 'medium';
}

interface HypothesisResult {
  message: string;
  icon: 'price' | 'visuals' | 'stock' | 'shipping' | 'reviews';
  color: string;
}

// Générer une hypothèse intelligente
const generateHypothesis = (price: number): string => {
  const hypotheses: HypothesisResult[] = [];

  if (price > 150) {
    hypotheses.push({
      message: 'Prix perçu trop élevé',
      icon: 'price',
      color: 'text-red-400',
    });
  }

  if (price < 100) {
    hypotheses.push({
      message: 'Manque de visuels de réassurance',
      icon: 'visuals',
      color: 'text-amber-400',
    });
  }

  if (Math.random() > 0.6) {
    hypotheses.push({
      message: 'Doutes sur la disponibilité',
      icon: 'stock',
      color: 'text-yellow-400',
    });
  }

  if (price > 120) {
    hypotheses.push({
      message: 'Frais de port non affichés clairement',
      icon: 'shipping',
      color: 'text-blue-400',
    });
  }

  return hypotheses[Math.floor(Math.random() * hypotheses.length)]?.message || 'Analyse en cours';
};

const calculatePriority = (price: number): 'urgent' | 'high' | 'medium' => {
  if (price > 150) return 'urgent';
  if (price > 100) return 'high';
  return 'medium';
};

const AbandonedInsights: React.FC = () => {
  try {
    const abandonedCartsHook = useAbandonedCarts();
    console.log('AbandonedInsights - hook result:', abandonedCartsHook);
    
    const carts = abandonedCartsHook?.carts || [];
    console.log('AbandonedInsights - carts:', carts);

    // Analyser les produits abandonnés
    const abandonedProducts = useMemo(() => {
      console.log('Computing abandonedProducts, carts length:', carts?.length);
      const productMap = new Map<string, AbandonedProduct>();

      // Parcourir tous les paniers abandonnés
      carts.forEach((cart) => {
        if (!cart.recovered) {
          cart.items.forEach((item) => {
            if (productMap.has(item.productId)) {
              const existing = productMap.get(item.productId)!;
              existing.abandonmentCount += 1;
              existing.totalValue += item.price * item.quantity;
            } else {
              productMap.set(item.productId, {
                productId: item.productId,
                productName: item.productName,
                abandonmentCount: 1,
                totalValue: item.price * item.quantity,
                avgPrice: item.price,
                hypothesis: generateHypothesis(item.price),
                priority: calculatePriority(item.price),
              });
            }
          });
        }
      });

      // Trier par nombre d'abandons et retourner top 5
      const result = Array.from(productMap.values())
        .sort((a, b) => b.abandonmentCount - a.abandonmentCount)
        .slice(0, 5);
      
      console.log('abandonedProducts computed:', result);
      return result;
    }, [carts]);

    const totalPotentialRevenue = abandonedProducts.reduce(
      (sum, product) => sum + product.totalValue,
      0
    );

  const handleLaunchRecovary = (productId: string, productName: string) => {
    console.log(`🚀 Relance personnalisée lancée pour ${productName}`);
    // Simulation de l'action
    alert(`Campagne de récupération lancée pour "${productName}"\nEmails segmentés en cours d'envoi...`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-montserrat font-bold text-admin-gold tracking-tighter mb-2">
          📊 Analyse Prédictive Paniers Abandonnés
        </h1>
        <p className="text-admin-text-secondary">
          Intelligence d'affaires pour récupération stratégique des ventes perdues
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Produits Identifiés
              </p>
              <p className="text-3xl font-bold text-admin-gold">{abandonedProducts.length}</p>
              <p className="text-xs text-admin-text-secondary mt-2">
                dans les 5 plus abandonnés
              </p>
            </div>
            <TrendingDown className="w-6 h-6 text-admin-gold/50" />
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Revenus Potentiels
              </p>
              <p className="text-3xl font-bold text-amber-400">
                €{(totalPotentialRevenue / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-admin-text-secondary mt-2">
                à récupérer immédiatement
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-amber-400/50" />
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Taux Récupération Potentiel
              </p>
              <p className="text-3xl font-bold text-emerald-400">35%</p>
              <p className="text-xs text-admin-text-secondary mt-2">
                avec stratégie optimale
              </p>
            </div>
            <Target className="w-6 h-6 text-emerald-400/50" />
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-1">
                Score Accélération
              </p>
              <p className="text-3xl font-bold text-orange-400">88/100</p>
              <p className="text-xs text-admin-text-secondary mt-2">
                urgence d'action
              </p>
            </div>
            <Zap className="w-6 h-6 text-orange-400/50" />
          </div>
        </div>
      </div>

      {/* Top 5 Abandoned Products */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-admin-text-primary mb-1">
            🎯 Top 5 Produits les Plus Abandonnés
          </h2>
          <p className="text-sm text-admin-text-secondary">
            Produits prioritaires pour campagne de récupération
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {abandonedProducts.map((product, index) => (
            <div
              key={product.productId}
              className="glass-panel border border-admin-border rounded-lg overflow-hidden hover:border-admin-gold/70 transition-all duration-300 group hover:shadow-lg hover:shadow-admin-gold/20"
            >
              {/* Product Ranking Badge */}
              <div className="h-12 bg-gradient-to-r from-admin-gold/20 to-transparent p-3 flex items-center justify-between border-b border-admin-border">
                <span className="text-sm font-bold text-admin-gold">#{index + 1}</span>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.priority === 'urgent'
                      ? 'bg-red-900/30 text-red-400'
                      : product.priority === 'high'
                      ? 'bg-orange-900/30 text-orange-400'
                      : 'bg-blue-900/30 text-blue-400'
                  }`}
                >
                  {product.priority === 'urgent'
                    ? '🔴 URGENT'
                    : product.priority === 'high'
                    ? '🟠 HIGH'
                    : '🔵 MEDIUM'}
                </div>
              </div>

              {/* Product Content */}
              <div className="p-4 space-y-3">
                {/* Product Name */}
                <div className="min-h-12">
                  <p className="font-montserrat font-semibold text-admin-text-primary line-clamp-2 group-hover:text-admin-gold transition-colors">
                    {product.productName}
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-admin-text-secondary">
                    <span>Abandons:</span>
                    <span className="text-admin-gold font-bold">{product.abandonmentCount}x</span>
                  </div>
                  <div className="flex justify-between text-admin-text-secondary">
                    <span>Valeur Totale:</span>
                    <span className="text-amber-400 font-bold">€{product.totalValue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-admin-text-secondary">
                    <span>Prix Moyen:</span>
                    <span className="text-emerald-400 font-bold">€{product.avgPrice.toFixed(0)}</span>
                  </div>
                </div>

                {/* Hypothesis Box */}
                <div className="mt-3 p-2 bg-admin-bg/70 border border-admin-border/50 rounded-md">
                  <p className="text-xs text-admin-text-secondary mb-1 font-medium uppercase tracking-wide">
                    💭 Hypothèse Reset
                  </p>
                  <p className="text-xs text-admin-gold italic">{product.hypothesis}</p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleLaunchRecovary(product.productId, product.productName)}
                  className="w-full mt-3 h-8 text-xs bg-admin-gold/10 hover:bg-admin-gold/20 text-admin-gold border border-admin-gold/30 hover:border-admin-gold/70 transition-all rounded"
                >
                  🚀 Relancer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Recommendations */}
      <div className="glass-panel border border-admin-border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-admin-gold flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-montserrat font-bold text-admin-text-primary mb-3">
              💡 Recommandations Stratégiques
            </h3>

            <div className="space-y-2 text-sm text-admin-text-secondary">
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Segmentation par Prix:</strong> Produits &gt;€150 = Offres de paiement
                  3x
                </span>
              </p>
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Renforcement Confiance:</strong> Ajouter avis clients &amp; garantie sur
                  landing page
                </span>
              </p>
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Urgence Perçue:</strong> Afficher stock disponible en temps réel (ex:
                  "2 en stock")
                </span>
              </p>
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Email Séquence:</strong> J0 (retargeting), J1 (+10%), J3 (-20%) +
                  offre
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-3">
            📈 Impact Potentiel 90j
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-admin-text-secondary">À 35% de récupération</span>
              <span className="text-lg font-bold text-emerald-400">
                +€{(totalPotentialRevenue * 0.35).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-admin-text-secondary">Coût campagne estimé</span>
              <span className="text-lg font-bold text-orange-400">
                ~€{(totalPotentialRevenue * 0.35 * 0.15).toFixed(0)}
              </span>
            </div>
            <div className="border-t border-admin-border/30 pt-2 mt-2 flex justify-between">
              <span className="text-xs text-admin-text-secondary font-medium">ROI Estimé</span>
              <span className="text-xl font-bold text-admin-gold">
                +{((totalPotentialRevenue * 0.35 - totalPotentialRevenue * 0.35 * 0.15) / (totalPotentialRevenue * 0.35 * 0.15) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-3">
            🔄 Cadence Recommandée
          </p>
          <div className="space-y-2 text-xs text-admin-text-secondary">
            <div className="flex justify-between">
              <span>Urgent (12h)</span>
              <span className="text-red-400 font-bold">
                {abandonedProducts.filter((p) => p.priority === 'urgent').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>High (24h)</span>
              <span className="text-orange-400 font-bold">
                {abandonedProducts.filter((p) => p.priority === 'high').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Medium (48h)</span>
              <span className="text-blue-400 font-bold">
                {abandonedProducts.filter((p) => p.priority === 'medium').length}
              </span>
            </div>
            <div className="border-t border-admin-border/30 pt-2 mt-2 flex justify-between">
              <span className="font-medium">Total à Traiter</span>
              <span className="text-admin-gold font-bold">{abandonedProducts.length}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel border border-admin-border rounded-lg p-4">
          <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide mb-3">
            ⚡ Score Santé Produits
          </p>
          <div className="space-y-2">
            {abandonedProducts.slice(0, 3).map((product) => (
              <div key={product.productId} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-admin-text-secondary truncate">{product.productName.substring(0, 15)}...</span>
                  <span className="font-bold text-admin-gold">{100 - product.abandonmentCount * 8}%</span>
                </div>
                <div className="w-full h-1.5 bg-admin-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-admin-gold to-admin-gold-light rounded-full"
                    style={{ width: `${100 - product.abandonmentCount * 8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('AbandonedInsights Error:', error);
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Erreur Dashboard Insights</h1>
        <p className="text-red-400 mb-4">Une erreur est survenue lors du chargement du dashboard.</p>
        <details className="bg-red-900/20 p-4 rounded border border-red-700">
          <summary className="cursor-pointer font-medium text-red-400">Détails de l'erreur</summary>
          <pre className="mt-4 text-sm text-red-300 overflow-auto">
            {error instanceof Error ? error.message : String(error)}
            {error instanceof Error && error.stack && (
              <>
                {'\n\nStack trace:\n'}
                {error.stack}
              </>
            )}
          </pre>
        </details>
      </div>
    );
  }
};

export default AbandonedInsights;
