import React, { useState } from 'react';
import { StockItem } from '@/components/admin/ProductTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditStockDialogProps {
  item: StockItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, stock: number, velocity: number) => void;
}

export const EditStockDialog: React.FC<EditStockDialogProps> = ({
  item,
  open,
  onOpenChange,
  onSave,
}) => {
  const [stock, setStock] = useState(item?.currentStock.toString() || '0');
  const [velocity, setVelocity] = useState(item?.weeklyVelocity.toString() || '0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (item) {
      setStock(item.currentStock.toString());
      setVelocity(item.weeklyVelocity.toString());
      setErrors({});
    }
  }, [item, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const stockNum = parseFloat(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Stock doit être un nombre >= 0';
    }

    const velocityNum = parseFloat(velocity);
    if (isNaN(velocityNum) || velocityNum < 0) {
      newErrors.velocity = 'Vélocité doit être un nombre >= 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm() && item) {
      onSave(item.id, parseFloat(stock), parseFloat(velocity));
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-admin-border bg-admin-card">
        <DialogHeader>
          <DialogTitle className="text-admin-text-primary font-montserrat">
            Modifier Stock - {item?.name}
          </DialogTitle>
          <DialogDescription className="text-admin-text-secondary">
            {item?.brand}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stock" className="text-admin-text-primary">
              Stock Actuel (unités)
            </Label>
            <Input
              id="stock"
              type="number"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="bg-admin-bg border-admin-border text-admin-text-primary"
              placeholder="0"
            />
            {errors.stock && (
              <p className="text-xs text-red-400 mt-1">{errors.stock}</p>
            )}
            <p className="text-xs text-admin-text-secondary">
              Stock disponible pour la vente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="velocity" className="text-admin-text-primary">
              Vélocité Hebdomadaire (u./semaine)
            </Label>
            <Input
              id="velocity"
              type="number"
              min="0"
              step="0.5"
              value={velocity}
              onChange={(e) => setVelocity(e.target.value)}
              className="bg-admin-bg border-admin-border text-admin-text-primary"
              placeholder="0"
            />
            {errors.velocity && (
              <p className="text-xs text-red-400 mt-1">{errors.velocity}</p>
            )}
            <p className="text-xs text-admin-text-secondary">
              Unités vendues en moyenne par semaine
            </p>
          </div>

          {/* Preview section */}
          <div className="pt-4 border-t border-admin-border">
            <p className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider mb-3">
              Prévisions
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-admin-bg/50 rounded p-3">
                <p className="text-xs text-admin-text-secondary mb-1">Ventes mensuelle</p>
                <p className="text-sm font-medium text-admin-gold">
                  ~{(parseFloat(velocity || '0') * 4).toFixed(0)} u.
                </p>
              </div>
              <div className="bg-admin-bg/50 rounded p-3">
                <p className="text-xs text-admin-text-secondary mb-1">Avant rupture</p>
                <p className="text-sm font-medium text-admin-text-primary">
                  {parseFloat(velocity || '0') > 0
                    ? `${Math.ceil((parseFloat(stock || '0') / parseFloat(velocity || '1')) * 7)} jours`
                    : '∞'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-admin-border text-admin-text-primary hover:bg-admin-card hover:text-admin-gold"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="bg-admin-gold text-admin-bg hover:bg-admin-gold-light"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
