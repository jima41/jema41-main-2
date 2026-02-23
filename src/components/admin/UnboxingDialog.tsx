import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UnboxingPersonalization } from '@/components/admin/OrderList';

interface UnboxingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unboxing: UnboxingPersonalization | null;
  onSave: (unboxing: UnboxingPersonalization) => void;
}

export const UnboxingDialog: React.FC<UnboxingDialogProps> = ({
  open,
  onOpenChange,
  unboxing,
  onSave,
}) => {
  const [formData, setFormData] = useState<UnboxingPersonalization>({
    giftWrap: 'classic',
    personalCard: false,
    scentNotesInsert: true,
    premiumInsert: false,
    fragileProtection: true,
  });

  useEffect(() => {
    if (unboxing) {
      setFormData(unboxing);
    }
  }, [unboxing, open]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-admin-border bg-admin-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-admin-text-primary font-montserrat">
            Personnalisation Unboxing
          </DialogTitle>
          <DialogDescription className="text-admin-text-secondary">
            Configurez l'expérience de déballage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Gift Wrap Selection */}
          <div className="space-y-2">
            <Label htmlFor="giftWrap" className="text-admin-text-primary">
              Type d'Emballage
            </Label>
            <Select value={formData.giftWrap} onValueChange={(value: any) => 
              setFormData(prev => ({ ...prev, giftWrap: value }))
            }>
              <SelectTrigger className="bg-admin-bg border-admin-border text-admin-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-admin-border bg-admin-card">
                <SelectItem value="none">Aucun emballage</SelectItem>
                <SelectItem value="classic">Classique - 5€</SelectItem>
                <SelectItem value="luxury">Luxe - 15€</SelectItem>
                <SelectItem value="eco">Écologique - 8€</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-admin-text-secondary">
              {formData.giftWrap === 'none' && 'Emballage standard'}
              {formData.giftWrap === 'classic' && 'Papier premium avec ruban doré'}
              {formData.giftWrap === 'luxury' && 'Boîte étui avec finitions dorées'}
              {formData.giftWrap === 'eco' && 'Papier kraft recyclé'}
            </p>
          </div>

          {/* Gift Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-admin-text-primary">
              Message Cadeau (optionnel)
            </Label>
            <Textarea
              id="message"
              placeholder="Écrivez un message personnel..."
              value={formData.giftMessage || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, giftMessage: e.target.value }))
              }
              className="bg-admin-bg border-admin-border text-admin-text-primary min-h-20 resize-none"
              maxLength={150}
            />
            <p className="text-xs text-admin-text-secondary">
              {(formData.giftMessage || '').length}/150 caractères
            </p>
          </div>

          {/* Add-ons */}
          <div className="space-y-3 pt-2 border-t border-admin-border">
            <p className="text-sm font-medium text-admin-text-primary">Éléments supplémentaires</p>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="personalCard"
                checked={formData.personalCard}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, personalCard: checked as boolean }))
                }
              />
              <label
                htmlFor="personalCard"
                className="text-sm text-admin-text-primary cursor-pointer flex-1"
              >
                <span>Carte de visite personnalisée</span>
                <p className="text-xs text-admin-text-secondary">Votre logo et contact</p>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="scentNotes"
                checked={formData.scentNotesInsert}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, scentNotesInsert: checked as boolean }))
                }
              />
              <label
                htmlFor="scentNotes"
                className="text-sm text-admin-text-primary cursor-pointer flex-1"
              >
                <span>Guide olfactif inclus</span>
                <p className="text-xs text-admin-text-secondary">Notes et conseils d'utilisation</p>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="premiumInsert"
                checked={formData.premiumInsert}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, premiumInsert: checked as boolean }))
                }
              />
              <label
                htmlFor="premiumInsert"
                className="text-sm text-admin-text-primary cursor-pointer flex-1"
              >
                <span>Insert premium</span>
                <p className="text-xs text-admin-text-secondary">Papier de soie + décoration dorée</p>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fragile"
                checked={formData.fragileProtection}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, fragileProtection: checked as boolean }))
                }
              />
              <label
                htmlFor="fragile"
                className="text-sm text-admin-text-primary cursor-pointer flex-1"
              >
                <span>Protection renforcée</span>
                <p className="text-xs text-admin-text-secondary">Emballage sécurisé supplémentaire</p>
              </label>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-admin-bg/50 rounded p-3 border border-admin-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-admin-text-secondary">Coût total personnalisation :</span>
              <span className="text-admin-gold font-medium">
                ~{(
                  (formData.giftWrap === 'luxury' ? 15 : formData.giftWrap === 'classic' ? 5 : formData.giftWrap === 'eco' ? 8 : 0) +
                  (formData.personalCard ? 2 : 0) +
                  (formData.premiumInsert ? 3 : 0)
                ).toFixed(2)}€
              </span>
            </div>
            <p className="text-xs text-admin-text-secondary/70">
              À ajouter au prix de la commande
            </p>
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
