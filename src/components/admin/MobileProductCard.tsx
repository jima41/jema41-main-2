import React from 'react';
import { Edit2, Trash2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface MobileStockItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  currentStock: number;
  weeklyVelocity: number;
  lastUpdated: Date;
}

interface MobileProductCardProps {
  item: MobileStockItem;
  onEdit?: (item: MobileStockItem) => void;
  onDelete?: (id: string) => void;
}

const calculateDaysUntilStockout = (currentStock: number, weeklyVelocity: number): number => {
  if (weeklyVelocity === 0) return 999;
  return Math.ceil((currentStock / weeklyVelocity) * 7);
};

const getStockStatus = (daysUntilStockout: number) => {
  if (daysUntilStockout < 7) {
    return { label: 'CRITIQUE', color: 'bg-red-900/30 text-red-300 border-red-700' };
  }
  if (daysUntilStockout < 14) {
    return { label: 'FAIBLE', color: 'bg-amber-900/30 text-amber-300 border-amber-700' };
  }
  return { label: 'OK', color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' };
};

const MobileProductCard: React.FC<MobileProductCardProps> = ({ item, onEdit, onDelete }) => {
  const daysUntilStockout = calculateDaysUntilStockout(item.currentStock, item.weeklyVelocity);
  const status = getStockStatus(daysUntilStockout);

  return (
    <div className="bg-admin-card border border-admin-border rounded-lg p-4 mb-3">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-admin-text-secondary mb-1">{item.brand}</p>
          <h3 className="text-sm font-semibold text-admin-text-primary truncate">
            {item.name}
          </h3>
        </div>
        <Badge className={`ml-2 text-xs whitespace-nowrap border ${status.color}`}>
          {status.label}
        </Badge>
      </div>

      {/* Stock Info */}
      <div className="grid grid-cols-2 gap-2 mb-3 py-2 border-t border-b border-admin-border/30">
        <div>
          <p className="text-xs text-admin-text-secondary">Stock</p>
          <p className={`text-sm font-semibold ${
            item.currentStock === 0 ? 'text-red-400' : 'text-admin-gold'
          }`}>
            {item.currentStock} unités
          </p>
        </div>
        <div>
          <p className="text-xs text-admin-text-secondary flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Ventes/sem
          </p>
          <p className="text-sm font-semibold text-admin-text-primary">
            {item.weeklyVelocity}
          </p>
        </div>
      </div>

      {/* Stock Duration */}
      <div className="mb-3">
        <p className="text-xs text-admin-text-secondary mb-1">Durée estimée</p>
        <p className={`text-sm font-semibold ${
          daysUntilStockout < 7 ? 'text-red-400' :
          daysUntilStockout < 14 ? 'text-amber-400' :
          'text-emerald-400'
        }`}>
          {daysUntilStockout < 999 ? `${daysUntilStockout} jours` : '∞ jours'}
        </p>
      </div>

      {/* Price & Actions */}
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold text-admin-gold">
          {item.price.toFixed(2)}€
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(item)}
            className="p-2 hover:bg-[#C4A97D]/10 rounded transition-colors text-admin-text-secondary hover:text-admin-gold"
          >
            <Edit2 className="w-4 h-4" />
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

export default MobileProductCard;
