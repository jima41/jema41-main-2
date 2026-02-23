import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  Edit2,
  Gift,
  Star,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface UnboxingPersonalization {
  giftMessage?: string;
  giftWrap: 'none' | 'classic' | 'luxury' | 'eco';
  personalCard: boolean;
  scentNotesInsert: boolean;
  premiumInsert: boolean;
  fragileProtection: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  unboxing: UnboxingPersonalization;
  promoCode?: string;
  promoDiscount?: number;
}

interface OrderListProps {
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: Order['status']) => void;
  onUnboxingEdit?: (orderId: string, unboxing: UnboxingPersonalization) => void;
  onViewDetails?: (order: Order) => void;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'bg-amber-900/30 text-amber-300 border-amber-700',
    icon: Clock,
    nextStatus: 'confirmed' as const,
    nextLabel: 'Confirmer',
  },
  confirmed: {
    label: 'Confirmée',
    color: 'bg-blue-900/30 text-blue-300 border-blue-700',
    icon: CheckCircle2,
    nextStatus: 'shipped' as const,
    nextLabel: 'Expédier',
  },
  shipped: {
    label: 'Expédiée',
    color: 'bg-purple-900/30 text-purple-300 border-purple-700',
    icon: Truck,
    nextStatus: 'delivered' as const,
    nextLabel: 'Livrer',
  },
  delivered: {
    label: 'Livrée',
    color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700',
    icon: Package,
    nextStatus: null,
    nextLabel: null,
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-red-900/30 text-red-300 border-red-700',
    icon: AlertCircle,
    nextStatus: null,
    nextLabel: null,
  },
};

const unboxingConfig = {
  none: { label: 'Aucun', icon: '📦' },
  classic: { label: 'Classique', icon: '🎁' },
  luxury: { label: 'Luxe', icon: '👑' },
  eco: { label: 'Écologique', icon: '🌿' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onStatusChange,
  onUnboxingEdit,
  onViewDetails,
}) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const config = statusConfig[order.status];
        const StatusIcon = config.icon;
        const isExpanded = expandedOrder === order.id;

        return (
          <div
            key={order.id}
            className="border border-admin-border rounded-lg overflow-hidden hover:border-admin-gold/50 transition-colors"
          >
            {/* Main Order Row */}
            <div
              className="glass-panel p-4 bg-admin-card/50 cursor-pointer hover:bg-admin-card/70 transition-colors"
              onClick={() =>
                setExpandedOrder(isExpanded ? null : order.id)
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Order Number & Client */}
                <div className="min-w-0">
                  <p className="font-medium text-admin-text-primary truncate">
                    #{order.orderNumber}
                  </p>
                  <p className="text-sm text-admin-text-secondary truncate">
                    {order.clientName}
                  </p>
                </div>

                {/* Items Count */}
                <div className="text-center">
                  <p className="font-medium text-admin-text-primary">
                    {order.items.length}
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    article{order.items.length > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right md:text-center">
                  <p className="font-bold text-admin-gold text-lg">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    {formatDate(order.createdAt)}
                  </p>
                  {order.promoCode && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-widest text-emerald-300 border border-emerald-500/40 rounded-full px-2 py-0.5">
                      {order.promoCode} -{order.promoDiscount}%
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-center">
                  <Badge
                    className={`${config.color} border flex items-center gap-1`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(order);
                    }}
                    className="text-admin-gold hover:bg-admin-gold/10 h-8 px-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <div
                    className={`w-1 h-5 bg-gradient-to-b from-admin-gold to-transparent rounded transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-admin-border bg-admin-bg/30 p-4 space-y-4">
                {/* Unboxing Personalization Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-2">
                      Personnalisation Unboxing
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-admin-gold" />
                        <span className="text-sm text-admin-text-primary">
                          Emballage :{' '}
                          <span className="font-medium">
                            {unboxingConfig[order.unboxing.giftWrap].label}
                          </span>
                        </span>
                      </div>
                      {order.unboxing.personalCard && (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-admin-text-primary">
                            Carte personnalisée
                          </span>
                        </div>
                      )}
                      {order.unboxing.scentNotesInsert && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-admin-text-primary">
                            Guide olfactif inclus
                          </span>
                        </div>
                      )}
                      {order.unboxing.premiumInsert && (
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-admin-text-primary">
                            Insert premium
                          </span>
                        </div>
                      )}
                      {order.unboxing.fragileProtection && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-admin-text-primary">
                            Protection renforcée
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  {order.unboxing.giftMessage && (
                    <div>
                      <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-2">
                        Message Cadeau
                      </p>
                      <div className="bg-admin-card border border-admin-border rounded p-3">
                        <p className="text-sm text-admin-text-primary italic">
                          "{order.unboxing.giftMessage}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Details */}
                <div>
                  <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-2">
                    Articles ({order.items.length})
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-admin-card/30 rounded px-3 py-2"
                      >
                        <div>
                          <p className="text-admin-text-primary">{item.productName}</p>
                          <p className="text-xs text-admin-text-secondary">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-admin-gold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Info */}
                {order.promoCode && (
                  <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg px-4 py-3">
                    <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-1">
                      Code Promo Utilisé
                    </p>
                    <p className="text-sm text-emerald-300 uppercase tracking-widest font-semibold">
                      {order.promoCode} <span className="text-emerald-400 font-normal">(-{order.promoDiscount}%)</span>
                    </p>
                  </div>
                )}

                {/* Status Progression */}
                <div>
                  <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-2">
                    Statut & Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.nextStatus && onStatusChange && (
                      <Button
                        onClick={() =>
                          onStatusChange(order.id, config.nextStatus as Order['status'])
                        }
                        className="bg-admin-gold text-admin-bg hover:bg-admin-gold-light text-sm h-8"
                      >
                        {config.nextLabel}
                      </Button>
                    )}
                    {order.status !== 'cancelled' && (
                      <Button
                        onClick={() =>
                          onStatusChange?.(order.id, 'cancelled')
                        }
                        variant="outline"
                        className="border-admin-border text-red-400 hover:bg-red-900/20 text-sm h-8"
                      >
                        Annuler
                      </Button>
                    )}
                    {onUnboxingEdit && (
                      <Button
                        onClick={() => onUnboxingEdit(order.id, order.unboxing)}
                        variant="outline"
                        className="border-admin-border text-admin-gold hover:bg-admin-gold/10 text-sm h-8"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Modifier unboxing
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-admin-text-secondary/30 mx-auto mb-3" />
          <p className="text-admin-text-secondary">Aucune commande trouvée</p>
        </div>
      )}
    </div>
  );
};
