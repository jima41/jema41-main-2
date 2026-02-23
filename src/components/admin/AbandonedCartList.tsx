import React, { useState } from 'react';
import {
  ShoppingCart,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Send,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface AbandonedCartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface AbandonedCart {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: AbandonedCartItem[];
  totalValue: number;
  abandonedAt: Date | string;
  recoveryAttempts: number;
  lastRecoveryEmail?: Date | string;
  recovered: boolean;
  recoveryDate?: Date | string;
  discountOffered?: number; // percentage
}

interface AbandonedCartListProps {
  carts: AbandonedCart[];
  onSendRecoveryEmail?: (cartId: string, discount: number) => void;
  onMarkRecovered?: (cartId: string) => void;
}

// Calculate hours since abandonment
const getHoursSinceAbandonment = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return Math.round((Date.now() - dateObj.getTime()) / (1000 * 60 * 60));
};

// Determine recovery priority based on hours and attempts
const getRecoveryPriority = (cart: AbandonedCart) => {
  if (cart.recovered) {
    return { 
      label: 'Récupéré', 
      badgeClass: 'bg-emerald-900/30 text-emerald-300 border-emerald-700 font-medium',
      icon: CheckCircle2 
    };
  }
  
  const abandonedDate = typeof cart.abandonedAt === 'string' ? new Date(cart.abandonedAt) : cart.abandonedAt;
  const hoursSince = (Date.now() - abandonedDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSince > 72 || cart.recoveryAttempts >= 3) {
    return { 
      label: 'Urgent', 
      badgeClass: 'bg-red-900/30 text-red-300 border-red-700 font-medium',
      icon: AlertTriangle 
    };
  }
  if (hoursSince > 24) {
    return { 
      label: 'Prioritaire', 
      badgeClass: 'bg-amber-900/30 text-amber-300 border-amber-700 font-medium',
      icon: Clock 
    };
  }
  return { 
    label: 'Normal', 
    badgeClass: 'bg-blue-900/30 text-blue-300 border-blue-700 font-medium',
    icon: ShoppingCart 
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const AbandonedCartList: React.FC<AbandonedCartListProps> = ({
  carts,
  onSendRecoveryEmail,
  onMarkRecovered,
}) => {
  const [expandedCart, setExpandedCart] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {carts.map((cart) => {
        const priority = getRecoveryPriority(cart);
        const PriorityIcon = priority.icon;
        const isExpanded = expandedCart === cart.id;
        const hoursSince = getHoursSinceAbandonment(cart.abandonedAt);

        return (
          <div
            key={cart.id}
            className="border border-admin-border rounded-lg overflow-hidden hover:border-admin-gold/50 transition-colors"
          >
            {/* Main Cart Row */}
            <div
              className="glass-panel p-4 bg-admin-card/50 cursor-pointer hover:bg-admin-card/70 transition-colors"
              onClick={() =>
                setExpandedCart(isExpanded ? null : cart.id)
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Client */}
                <div className="min-w-0">
                  <p className="font-medium text-admin-text-primary truncate font-montserrat">
                    {cart.clientName}
                  </p>
                  <p className="text-xs text-admin-text-secondary truncate">
                    {cart.clientEmail}
                  </p>
                </div>

                {/* Items Count */}
                <div className="text-center">
                  <p className="font-medium text-admin-text-primary">
                    {cart.items.length}
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    article{cart.items.length > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Cart Value */}
                <div className="text-center">
                  <p className="font-bold text-admin-gold text-lg">
                    {formatCurrency(cart.totalValue)}
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    Valeur potentielle
                  </p>
                </div>

                {/* Time Since */}
                <div className="text-center">
                  <p className="font-medium text-admin-text-primary">
                    {hoursSince}h
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    depuis abandon
                  </p>
                </div>

                {/* Recovery Attempts */}
                <div className="text-center">
                  <p className="font-medium text-admin-text-primary">
                    {cart.recoveryAttempts}
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    tentative{cart.recoveryAttempts !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Priority & Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Badge
                    variant="outline"
                    className={`${priority.badgeClass} flex items-center gap-1`}
                  >
                    <PriorityIcon className="w-3 h-3" />
                    {priority.label}
                  </Badge>
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
                {/* Items Details */}
                <div>
                  <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-2">
                    Produits abandonnés
                  </p>
                  <div className="space-y-2">
                    {cart.items.map((item, idx) => (
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

                {/* Recovery Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-admin-border">
                  <div>
                    <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-2">
                      Abandon
                    </p>
                    <p className="text-sm text-admin-text-primary">
                      {formatDate(cart.abandonedAt)}
                    </p>
                    <p className="text-xs text-admin-text-secondary mt-1">
                      ({hoursSince} heures)
                    </p>
                  </div>

                  {cart.lastRecoveryEmail && (
                    <div>
                      <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-2">
                        Dernier email
                      </p>
                      <p className="text-sm text-admin-text-primary">
                        {formatDate(cart.lastRecoveryEmail)}
                      </p>
                      <p className="text-xs text-admin-text-secondary mt-1">
                        Tentative {cart.recoveryAttempts}
                      </p>
                    </div>
                  )}

                  {cart.recoveryDate && (
                    <div>
                      <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">
                        ✓ Récupéré
                      </p>
                      <p className="text-sm text-admin-text-primary">
                        {formatDate(cart.recoveryDate)}
                      </p>
                      {cart.discountOffered && (
                        <p className="text-xs text-emerald-400 mt-1">
                          Remise: -{cart.discountOffered}%
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-admin-border">
                  {!cart.recovered && cart.recoveryAttempts < 3 && (
                    <>
                      <Button
                        onClick={() => onSendRecoveryEmail?.(cart.id, 10)}
                        className="bg-admin-gold text-admin-bg hover:bg-admin-gold-light text-sm h-8"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email -10%
                      </Button>
                      <Button
                        onClick={() => onSendRecoveryEmail?.(cart.id, 15)}
                        variant="outline"
                        className="border-admin-border text-admin-gold hover:bg-admin-gold/10 text-sm h-8"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email -15%
                      </Button>
                    </>
                  )}

                  {!cart.recovered && cart.recoveryAttempts >= 3 && (
                    <Button
                      onClick={() => onSendRecoveryEmail?.(cart.id, 20)}
                      className="bg-red-900/50 text-red-300 hover:bg-red-900/70 border border-red-700 text-sm h-8"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Dernier appel -20%
                    </Button>
                  )}

                  {!cart.recovered && (
                    <Button
                      onClick={() => onMarkRecovered?.(cart.id)}
                      variant="outline"
                      className="border-admin-border text-admin-text-secondary hover:text-emerald-400 hover:border-emerald-700 text-sm h-8"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Marquer récupéré
                    </Button>
                  )}

                  {cart.recovered && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Panier récupéré avec succès
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {carts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-admin-text-secondary/30 mx-auto mb-3" />
          <p className="text-admin-text-secondary">Aucun panier abandonné</p>
        </div>
      )}
    </div>
  );
};
