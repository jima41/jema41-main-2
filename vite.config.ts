import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Stripe — chargé uniquement sur /checkout
          if (id.includes('@stripe')) {
            return 'stripe';
          }
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Recharts + dépendances D3 — chargé uniquement admin analytics
          if (id.includes('recharts') || id.includes('d3-') || id.includes('d3_')) {
            return 'charts';
          }
          // React + toutes les librairies dépendant de React → même chunk
          // pour éviter les erreurs "createContext of undefined"
          return 'vendor';
        },
      },
    },
  },
}));