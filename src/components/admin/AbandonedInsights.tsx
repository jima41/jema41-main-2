import { useMemo } from 'react';
import { TrendingDown, AlertCircle, Zap, Target, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAbandonedCarts } from '@/hooks/use-abandoned-carts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AbandonedProduct {
  productId: string;
  productName: string;
  abandonmentCount: number;
  totalValue: number;
  avgPrice: number;
  hypothesis: string;
  priority: 'urgent' | 'high' | 'medium';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Deterministic hash from productId — no Math.random() */
const strHash = (s: string) =>
  s.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

const HYPOTHESES = [
  'Prix perçu trop élevé',
  'Manque de visuels de réassurance',
  'Doutes sur la disponibilité',
  'Frais de port non affichés clairement',
  "Pas assez d'avis clients",
];

const generateHypothesis = (productId: string, price: number): string => {
  const candidates: string[] = [];
  if (price > 150) candidates.push('Prix perçu trop élevé');
  if (price < 100) candidates.push('Manque de visuels de réassurance');
  const h = strHash(productId);
  if (h % 3 === 0) candidates.push('Doutes sur la disponibilité');
  if (price > 120) candidates.push('Frais de port non affichés clairement');
  if (candidates.length === 0) candidates.push(HYPOTHESES[h % HYPOTHESES.length]);
  return candidates[h % candidates.length];
};

const calculatePriority = (price: number): 'urgent' | 'high' | 'medium' => {
  if (price > 150) return 'urgent';
  if (price > 100) return 'high';
  return 'medium';
};

// ── Component ─────────────────────────────────────────────────────────────────

const AbandonedInsights: React.FC = () => {
  const { carts = [] } = useAbandonedCarts();

  const abandonedProducts = useMemo<AbandonedProduct[]>(() => {
    const productMap = new Map<string, AbandonedProduct>();

    carts.forEach((cart) => {
      if (!cart.recovered) {
        cart.items.forEach((item) => {
          if (productMap.has(item.productId)) {
            const existing = productMap.get(item.productId)!;
            existing.abandonmentCount += 1;
            existing.totalValue += item.price * item.quantity;
          } else {
            productMap.set(item.productId, {
              productId:        item.productId,
              productName:      item.productName,
              abandonmentCount: 1,
              totalValue:       item.price * item.quantity,
              avgPrice:         item.price,
              hypothesis:       generateHypothesis(item.productId, item.price),
              priority:         calculatePriority(item.price),
            });
          }
        });
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.abandonmentCount - a.abandonmentCount)
      .slice(0, 5);
  }, [carts]);

  const totalPotentialRevenue = abandonedProducts.reduce((s, p) => s + p.totalValue, 0);

  const urgentCount = abandonedProducts.filter((p) => p.priority === 'urgent').length;
  const highCount   = abandonedProducts.filter((p) => p.priority === 'high').length;
  const accelScore  = Math.min(100, 50 + urgentCount * 20 + highCount * 10);

  const handleLaunchRecovery = (productName: string) => {
    alert(`Campagne de récupération lancée pour "${productName}"\nEmails segmentés en cours d'envoi...`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary font-montserrat tracking-tighter">
          Analyse Prédictive Paniers
        </h1>
        <p className="text-admin-text-secondary mt-1">
          Intelligence d'affaires pour récupération stratégique des ventes perdues
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel border border-admin-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-2">
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

        <div className="glass-panel border border-admin-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-2">
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

        <div className="glass-panel border border-admin-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-2">
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

        <div className="glass-panel border border-admin-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-2">
                Score Accélération
              </p>
              <p className="text-3xl font-bold text-orange-400">{accelScore}/100</p>
              <p className="text-xs text-admin-text-secondary mt-2">urgence d'action</p>
            </div>
            <Zap className="w-6 h-6 text-orange-400/50" />
          </div>
        </div>
      </div>

      {/* Top products or empty state */}
      {abandonedProducts.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-montserrat font-bold text-admin-text-primary mb-1">
              Top {abandonedProducts.length} Produits les Plus Abandonnés
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
                      ? 'URGENT'
                      : product.priority === 'high'
                      ? 'HIGH'
                      : 'MEDIUM'}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="min-h-12">
                    <p className="font-montserrat font-semibold text-admin-text-primary line-clamp-2 group-hover:text-admin-gold transition-colors">
                      {product.productName}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-admin-text-secondary">
                      <span>Abandons :</span>
                      <span className="text-admin-gold font-bold">{product.abandonmentCount}×</span>
                    </div>
                    <div className="flex justify-between text-admin-text-secondary">
                      <span>Valeur totale :</span>
                      <span className="text-amber-400 font-bold">€{product.totalValue.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-admin-text-secondary">
                      <span>Prix moyen :</span>
                      <span className="text-emerald-400 font-bold">€{product.avgPrice.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-admin-bg/70 border border-admin-border/50 rounded-md">
                    <p className="text-xs text-admin-text-secondary mb-1 font-medium uppercase tracking-wide">
                      Hypothèse
                    </p>
                    <p className="text-xs text-admin-gold italic">{product.hypothesis}</p>
                  </div>

                  <Button
                    onClick={() => handleLaunchRecovery(product.productName)}
                    className="w-full mt-3 h-8 text-xs bg-admin-gold/10 hover:bg-admin-gold/20 text-admin-gold border border-admin-gold/30 hover:border-admin-gold/70 transition-all rounded"
                  >
                    Relancer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel border border-admin-border rounded-xl p-12 text-center">
          <TrendingDown className="w-10 h-10 text-admin-text-secondary/20 mx-auto mb-4" />
          <p className="text-admin-text-secondary text-sm">
            Aucun panier abandonné pour le moment.
          </p>
          <p className="text-admin-text-secondary/60 text-xs mt-2">
            Les données apparaîtront dès que des clients abandonneront leur panier.
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div className="glass-panel border border-admin-border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-admin-gold flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-montserrat font-bold text-admin-text-primary mb-3">
              Recommandations Stratégiques
            </h3>
            <div className="space-y-2 text-sm text-admin-text-secondary">
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Segmentation par Prix :</strong> Produits &gt;€150 = Offres de paiement 3×
                </span>
              </p>
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Renforcement Confiance :</strong> Ajouter avis clients &amp; garantie sur landing page
                </span>
              </p>
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Urgence Perçue :</strong> Afficher le stock disponible en temps réel
                </span>
              </p>
              <p className="flex gap-2">
                <span className="text-admin-gold">→</span>
                <span>
                  <strong>Email Séquence :</strong> J0 (retargeting), J1 (+10%), J3 (-20%) + offre
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics cards */}
      {abandonedProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel border border-admin-border rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">
              Impact Potentiel 90j
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
                  {totalPotentialRevenue > 0
                    ? `+${(((0.85 / 0.15)) * 100).toFixed(0)}%`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel border border-admin-border rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">
              Cadence Recommandée
            </p>
            <div className="space-y-2 text-xs text-admin-text-secondary">
              <div className="flex justify-between">
                <span>Urgent (12h)</span>
                <span className="text-red-400 font-bold">{urgentCount}</span>
              </div>
              <div className="flex justify-between">
                <span>High (24h)</span>
                <span className="text-orange-400 font-bold">{highCount}</span>
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

          <div className="glass-panel border border-admin-border rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-admin-text-secondary/60 mb-3">
              Score Santé Produits
            </p>
            <div className="space-y-2">
              {abandonedProducts.slice(0, 3).map((product) => {
                const score = Math.max(0, 100 - product.abandonmentCount * 8);
                return (
                  <div key={product.productId} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-admin-text-secondary truncate">
                        {product.productName.length > 16
                          ? product.productName.substring(0, 16) + '…'
                          : product.productName}
                      </span>
                      <span className="font-bold text-admin-gold ml-2">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-admin-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-admin-gold to-admin-gold-light rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbandonedInsights;
