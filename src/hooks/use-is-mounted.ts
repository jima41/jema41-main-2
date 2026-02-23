import { useEffect, useState } from 'react';

/**
 * Hook qui indique si le composant est monté côté client
 * Utile pour éviter les erreurs d'hydratation SSR
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}