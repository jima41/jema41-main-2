import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  productName,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="bg-[#1A1D23] border-admin-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <AlertDialogTitle className="text-admin-text-primary font-montserrat">
              Supprimer "{productName}"?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-admin-text-secondary">
            Cette action est irréversible. Le produit et toutes ses données seront supprimés de votre catalogue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel className="border-admin-border text-admin-text-secondary hover:bg-admin-card">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700/50 font-semibold"
          >
            Supprimer
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
