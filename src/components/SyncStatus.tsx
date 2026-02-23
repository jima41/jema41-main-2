import { useEffect, useRef, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncEvent {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

/**
 * Composant qui affiche les opérations en temps réel et le statut de synchronisation
 */
export const SyncStatus = () => {
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [productHistory, setProductHistory] = useState<number[]>([]);
  const [flickerCount, setFlickerCount] = useState(0);
  const [isStable, setIsStable] = useState(true);
  const { products, productsLoading, isInitialized, productsError } = useAdminStore();
  const previousCountRef = useRef<number>(products.length);
  const lastNonZeroCountRef = useRef<number>(products.length > 0 ? products.length : 0);
  const zeroTransitionTimeRef = useRef<number | null>(null);

  // Monitor product count for true flicker detection (rapid N -> 0 -> N)
  useEffect(() => {
    const newCount = products.length;
    const previousCount = previousCountRef.current;
    const now = Date.now();

    setProductHistory(prev => {
      const updated = [...prev.slice(-9), newCount];

      // Mémoriser le dernier volume valide
      if (newCount > 0) {
        lastNonZeroCountRef.current = newCount;
      }

      // Transition vers 0 depuis un état non vide: on démarre une fenêtre de détection
      if (previousCount > 0 && newCount === 0) {
        zeroTransitionTimeRef.current = now;
      }

      // Retour rapide au même volume non vide => vrai flicker
      if (
        previousCount === 0 &&
        newCount > 0 &&
        zeroTransitionTimeRef.current !== null &&
        now - zeroTransitionTimeRef.current < 2500 &&
        newCount === lastNonZeroCountRef.current
      ) {
        setFlickerCount(c => c + 1);
        setIsStable(false);
        zeroTransitionTimeRef.current = null;
      }

      // Revenir en état stable après quelques échantillons identiques > 0
      if (updated.length >= 4) {
        const recentCounts = updated.slice(-4);
        if (recentCounts.every((count) => count === recentCounts[0]) && recentCounts[0] > 0) {
          setIsStable(true);
        }
      }

      return updated;
    });

    previousCountRef.current = newCount;
  }, [products.length]);

  useEffect(() => {
    // Écoutez les logs en temps réel (simulation via console)
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const handleLog = (type: 'success' | 'error' | 'info') => (...args: any[]) => {
      const message = args.join(' ');

      // Filter out noisy React Router future-flag warnings and similar developer hints
      const ROUTER_WARNING_PATTERNS = [
        'React Router Future Flag Warning',
        'v7_startTransition',
        'v7_relativeSplatPath',
        'reactrouter.com/v6/upgrading/future'
      ];

      if (ROUTER_WARNING_PATTERNS.some((p) => message.includes(p))) {
        // Still forward to original console but don't create a sync event
        if (type === 'success') originalLog(...args);
        else if (type === 'error') originalError(...args);
        else originalWarn(...args);
        return;
      }

      // Filtrer seulement les messages de sync (icônes emoji spécifiques)
      if (message.includes('✅') || message.includes('📝') || message.includes('📦') ||
          message.includes('🗑️') || message.includes('📊') || message.includes('❌') ||
          message.includes('⏮️') || message.includes('🆕') || message.includes('🔄')) {

        const event: SyncEvent = {
          id: `${Date.now()}-${Math.random()}`,
          message,
          type,
          timestamp: Date.now(),
        };

        setSyncEvents((prev) => {
          const updated = [event, ...prev].slice(0, 10); // Keep last 10 events
          // Auto-hide after 4 seconds if success
          if (type === 'success') {
            setTimeout(() => {
              setSyncEvents((p) => p.filter((e) => e.id !== event.id));
            }, 4000);
          }
          return updated;
        });
      }

      // Call original functions
      if (type === 'success') originalLog(...args);
      else if (type === 'error') originalError(...args);
      else originalWarn(...args);
    };

    // Monkey patch console
    console.log = handleLog('success');
    console.error = handleLog('error');
    console.warn = handleLog('info');

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <>
      {/* Status Indicator Button */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-12 right-12 p-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Statut de synchronisation"
      >
        <svg
          className="w-6 h-6 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7.16 19.09A7 7 0 1013.99 5H27m-5-2l-3 3m0 0l-3-3m3 3V2"
          />
        </svg>
      </motion.button>

      {/* Sync Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 right-12 w-96 max-h-96 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 sticky top-0">
              <h3 className="font-bold text-lg">Statut Synchronisation</h3>
              <p className="text-xs opacity-90">
                {isInitialized ? '✅ Connecté' : '⏳ Initialisation...'} • {products.length} produits
              </p>
            </div>

            {/* Status Info */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Statut:</span>
                <span className={`font-semibold ${
                  isInitialized
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {isInitialized ? '✅ Prêt' : '⏳ En cours...'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Produits:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {products.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">État:</span>
                <span className={`font-semibold ${
                  productsLoading ? 'text-yellow-600' : 'text-emerald-600'
                }`}>
                  {productsLoading ? '⏳ Chargement...' : '✅ Idle'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Stabilité:</span>
                <span className={`font-semibold ${
                  isStable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isStable ? '✅ Stable' : `⚠️ Flicker (${flickerCount})`}
                </span>
              </div>
              {productHistory.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Historique: {productHistory.join(' → ')}
                </div>
              )}
              {productsError && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  ❌ {productsError}
                </div>
              )}
            </div>

            {/* Events Log */}
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {syncEvents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  En attente de synchronisation...
                </p>
              ) : (
                syncEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`text-xs p-2 rounded ${
                      event.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : event.type === 'error'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <p className="break-words">{event.message}</p>
                    <p className="opacity-50 text-xs">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SyncStatus;
