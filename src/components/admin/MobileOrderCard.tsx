import React from 'react';
import { Package, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface MobileOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
}

interface MobileOrderCardProps {
  item: MobileOrderItem;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getStatusBadge = (status: string) => {
  const statuses: Record<string, { label: string; color: string }> = {
    pending: { label: 'En attente', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
    processing: { label: 'En cours', color: 'bg-blue-900/30 text-blue-300 border-blue-700' },
    shipped: { label: 'Expédié', color: 'bg-purple-900/30 text-purple-300 border-purple-700' },
    delivered: { label: 'Livré', color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' },
  };
  return statuses[status] || statuses.pending;
};

const MobileOrderCard: React.FC<MobileOrderCardProps> = ({ item, onView, onDelete }) => {
  const statusInfo = getStatusBadge(item.status);

  return (
    <div className="bg-admin-card border border-admin-border rounded-lg p-4 mb-3">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-admin-text-secondary mb-1">
            Commande #{item.orderNumber}
          </p>
          <h3 className="text-sm font-semibold text-admin-text-primary truncate">
            {item.customerName}
          </h3>
        </div>
        <Badge className={`ml-2 text-xs whitespace-nowrap border ${statusInfo.color}`}>
          {statusInfo.label}
        </Badge>
      </div>

      {/* Items & Date */}
      <div className="grid grid-cols-2 gap-2 mb-3 py-2 border-t border-b border-admin-border/30">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-admin-text-secondary" />
          <div>
            <p className="text-xs text-admin-text-secondary">Articles</p>
            <p className="text-sm font-semibold text-admin-text-primary">
              {item.itemCount}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-admin-text-secondary">Date</p>
          <p className="text-sm font-semibold text-admin-text-primary">
            {item.date}
          </p>
        </div>
      </div>

      {/* Total & Actions */}
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold text-admin-gold">
          {item.total.toFixed(2)}€
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onView?.(item.id)}
            className="p-2 hover:bg-[#C4A97D]/10 rounded transition-colors text-admin-text-secondary hover:text-admin-gold"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOrderCard;
