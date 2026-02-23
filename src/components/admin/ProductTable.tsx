import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export interface StockItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  currentStock: number;
  weeklyVelocity: number; // units sold per week
  category: string;
  lastUpdated: Date;
}

interface ProductTableProps {
  items: StockItem[];
  onEdit?: (item: StockItem) => void;
  onDelete?: (id: string) => void;
}

// Calculate days until stockout based on weekly velocity
const calculateDaysUntilStockout = (currentStock: number, weeklyVelocity: number): number => {
  if (weeklyVelocity === 0) return 999; // No sales, indefinite stock
  return Math.ceil((currentStock / weeklyVelocity) * 7);
};

// Get stock status with enhanced styling
const getStockStatus = (daysUntilStockout: number, weeklyVelocity: number) => {
  if (daysUntilStockout < 7) {
    return { 
      label: 'Critique', 
      color: 'destructive',
      badgeClass: 'bg-red-900/30 text-red-300 border-red-700 font-medium',
      icon: AlertTriangle 
    };
  }
  if (daysUntilStockout < 14) {
    return { 
      label: 'Faible', 
      color: 'warning',
      badgeClass: 'bg-amber-900/30 text-amber-300 border-amber-700 font-medium',
      icon: AlertTriangle 
    };
  }
  return { 
    label: 'OK', 
    color: 'default',
    badgeClass: 'bg-emerald-900/30 text-emerald-300 border-emerald-700 font-medium',
    icon: CheckCircle2 
  };
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const ProductTable: React.FC<ProductTableProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ productId: string; productName: string } | null>(null);
  const { toast } = useToast();

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-end">
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs sm:text-sm font-medium text-admin-text-secondary mb-1.5 md:mb-2 block font-montserrat tracking-tight">
            Rechercher produit
          </label>
          <Input
            placeholder="Nom ou marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-admin-card border-admin-border text-xs sm:text-sm h-9 md:h-10"
          />
        </div>
        <div className="text-xs sm:text-sm text-admin-text-secondary font-montserrat tracking-tight">
          {filteredItems.length} produit{filteredItems.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="rounded-lg border border-admin-border overflow-hidden overflow-x-auto -mx-4 sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-admin-card/50 hover:bg-admin-card/50">
              <TableHead className="text-admin-text-primary w-10"></TableHead>
              <TableHead className="text-admin-text-primary font-montserrat font-bold tracking-tight">Produit</TableHead>
              <TableHead className="text-admin-text-primary font-montserrat font-bold tracking-tight">Marque</TableHead>
              <TableHead className="text-admin-text-primary text-right font-montserrat font-bold tracking-tight">Prix</TableHead>
              <TableHead className="text-admin-text-primary text-center font-montserrat font-bold tracking-tight">Stock</TableHead>
              <TableHead className="text-admin-text-primary text-center font-montserrat font-bold tracking-tight">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Vélocité
                </div>
              </TableHead>
              <TableHead className="text-admin-text-primary text-center font-montserrat font-bold tracking-tight">Avant rupture</TableHead>
              <TableHead className="text-admin-text-primary text-center font-montserrat font-bold tracking-tight">Status</TableHead>
              <TableHead className="text-admin-text-primary text-center font-montserrat font-bold tracking-tight">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const daysUntilStockout = calculateDaysUntilStockout(
                item.currentStock,
                item.weeklyVelocity
              );
              const status = getStockStatus(daysUntilStockout, item.weeklyVelocity);
              const StatusIcon = status.icon;
              const isExpanded = expandedRow === item.id;

              return (
                <React.Fragment key={item.id}>
                  <TableRow className="border-admin-border hover:bg-admin-card/30">
                    <TableCell>
                      <button
                        onClick={() =>
                          setExpandedRow(isExpanded ? null : item.id)
                        }
                        className="p-0 hover:text-admin-gold transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-admin-text-primary font-montserrat">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-admin-text-secondary">
                      {item.brand}
                    </TableCell>
                    <TableCell className="text-right text-admin-text-primary font-medium">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`${
                          item.currentStock < 10
                            ? 'bg-red-900/30 text-red-300 border-red-700 font-medium'
                            : item.currentStock < 50
                              ? 'bg-amber-900/30 text-amber-300 border-amber-700 font-medium'
                              : 'bg-emerald-900/30 text-emerald-300 border-emerald-700 font-medium'
                        }`}
                      >
                        {item.currentStock} u.
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-admin-gold">
                        {item.weeklyVelocity.toFixed(1)}/sem
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-sm font-medium ${
                          daysUntilStockout < 7
                            ? 'text-red-400'
                            : daysUntilStockout < 14
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {daysUntilStockout < 999 ? `${daysUntilStockout}j` : '∞'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Badge
                          variant="outline"
                          className={status.badgeClass}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit?.(item)}
                          className="text-admin-gold hover:bg-amber-400/10 hover:text-amber-300 h-8 w-8 p-0 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm({ productId: item.id, productName: item.name })}
                          className="text-red-500 hover:bg-red-900/30 hover:text-red-400 h-8 w-8 p-0 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded details row */}
                  {isExpanded && (
                    <TableRow className="bg-admin-card/30 border-admin-border">
                      <TableCell colSpan={9} className="p-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-1 font-montserrat">
                                Catégorie
                              </p>
                              <p className="text-sm text-admin-text-primary capitalize font-montserrat">
                                {item.category}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-1 font-montserrat">
                                Dernière mise à jour
                              </p>
                              <p className="text-sm text-admin-text-primary font-montserrat">
                                {new Intl.DateTimeFormat('fr-FR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }).format(item.lastUpdated)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-1 font-montserrat">
                                Analyse de vélocité
                              </p>
                              <p className="text-sm text-admin-text-primary font-montserrat">
                                Ventes moyennes : <span className="text-admin-gold font-bold">{item.weeklyVelocity.toFixed(1)} u./sem</span>
                              </p>
                              <p className="text-xs text-admin-text-secondary mt-1 font-montserrat">
                                ≈ {(item.weeklyVelocity * 4).toFixed(0)} u./mois
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-1 font-montserrat">
                                Estimation rupture
                              </p>
                              <p className="text-sm text-admin-text-primary font-montserrat">
                                <span
                                  className={
                                    daysUntilStockout < 7
                                      ? 'text-red-400 font-bold'
                                      : daysUntilStockout < 14
                                        ? 'text-amber-400 font-bold'
                                        : 'text-emerald-400 font-bold'
                                  }
                                >
                                  {daysUntilStockout < 999
                                    ? `${daysUntilStockout} jours`
                                    : 'Stock illimité'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-admin-text-secondary">Aucun produit trouvé</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-admin-card border-admin-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-admin-text-primary font-montserrat">
              Supprimer le produit
            </AlertDialogTitle>
            <AlertDialogDescription className="text-admin-text-secondary">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-admin-text-primary">"{deleteConfirm?.productName}"</span> ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="bg-admin-card border-admin-border text-admin-text-secondary hover:bg-admin-card/80">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDelete?.(deleteConfirm.productId);
                  toast({
                    title: 'Produit supprimé',
                    description: `${deleteConfirm.productName} a été supprimé avec succès.`,
                  });
                  setDeleteConfirm(null);
                }
              }}
              className="bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700/50"
            >
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductTable;
