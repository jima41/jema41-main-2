import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';

export function DebugPanel() {
  const products = useAdminStore((state) => state.products);
  const isInitialized = useAdminStore((state) => state.isInitialized);
  const productsLoading = useAdminStore((state) => state.productsLoading);
  const productsError = useAdminStore((state) => state.productsError);
  const [envVars, setEnvVars] = useState<{url?: string, key?: string}>({});

  useEffect(() => {
    // Récupérer les variables d'env
    setEnvVars({
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅' : '❌'
    });

    console.log('🔍 DEBUG PANEL:');
    console.log('  URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('  Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Présente' : 'MANQUANTE');
    console.log('  Produits:', products.length);
    console.log('  Initialisé:', isInitialized);
    console.log('  Chargement:', productsLoading);
    console.log('  Erreur:', productsError);
  }, [products.length, isInitialized, productsLoading, productsError]);

  if (!import.meta.env.DEV) {
    return null; // Ne pas afficher en production
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#1a1a1a',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 10000,
      border: '1px solid #00ff00',
    }}>
      <div>🔍 DEBUG PANEL</div>
      <div>━━━━━━━━━━━━━━━━━━━</div>
      <div>URL: {envVars.url ? '✅' : '❌'}</div>
      <div>Key: {envVars.key}</div>
      <div>━━━━━━━━━━━━━━━━━━━</div>
      <div>Produits: <strong>{products.length}</strong></div>
      <div>Initialisé: {isInitialized ? '✅' : '⏳'}</div>
      <div>Chargement: {productsLoading ? '⏳' : '✅'}</div>
      {productsError && <div style={{color: '#ff6b6b'}}>Erreur: {productsError}</div>}
    </div>
  );
}
