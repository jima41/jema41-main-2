/**
 * Hook pour gérer les erreurs Supabase avec notifications toast
 */

import { useCallback } from 'react';
import { useToast } from './use-toast';
import { SupabaseError } from '@/integrations/supabase/supabase';

export function useSupabaseErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, fallbackMessage: string = 'Une erreur est survenue') => {
      let title = 'Erreur';
      let description = fallbackMessage;

      if (error instanceof SupabaseError) {
        title = 'Erreur Supabase';
        description = error.message;

        // Gestion des codes d'erreur spécifiques
        if (error.statusCode === 401) {
          title = 'Authentification requise';
          description = 'Vous devez vous connecter pour effectuer cette action.';
        } else if (error.statusCode === 403) {
          title = 'Accès refusé';
          description = 'Vous n\'avez pas les droits pour effectuer cette action.';
        } else if (error.statusCode === 404) {
          title = 'Ressource non trouvée';
          description = 'La ressource demandée n\'existe pas ou a été supprimée.';
        } else if (error.statusCode === 400) {
          title = 'Erreur de requête';
          description = 'Les données fournies sont invalides.';
        }
      } else if (error instanceof Error) {
        description = error.message;
      }

      toast({
        title,
        description,
        variant: 'destructive',
        duration: 5000,
      });

      // Log pour debug
      console.error('🔴 Erreur capturée:', error);
    },
    [toast]
  );

  const handleSuccess = useCallback(
    (message: string, title: string = 'Succès') => {
      toast({
        title,
        description: message,
        variant: 'default',
        duration: 3000,
      });
    },
    [toast]
  );

  return { handleError, handleSuccess };
}

export default useSupabaseErrorHandler;
