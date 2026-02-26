import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import Header from "@/components/Header";
import DataSyncInitializer from "@/components/DataSyncInitializer";
import UserDataSyncInitializer from "@/components/UserDataSyncInitializer";
// Pages critiques (chargées immédiatement)
import Index from "./pages/Index";
import AllProducts from "./pages/AllProducts";
import ProductDetail from "./pages/ProductDetail";
// Pages secondaires (lazy-loaded)
import { lazy, Suspense } from "react";
const SearchResults       = lazy(() => import("./pages/SearchResults"));
const Favorites           = lazy(() => import("./pages/Favorites"));
const Checkout            = lazy(() => import("./pages/Checkout"));
const Success             = lazy(() => import("./pages/Success"));
const Login               = lazy(() => import("./pages/Login"));
const Signup              = lazy(() => import("./pages/Signup"));
const UserProfile         = lazy(() => import("./pages/UserProfile"));
const MesCommandes        = lazy(() => import("./pages/MesCommandes"));
const ArtOfPerfuming      = lazy(() => import("./pages/ArtOfPerfuming"));
const LayeringGuide       = lazy(() => import("./pages/LayeringGuide"));
const NotFound            = lazy(() => import("./pages/NotFound"));
// Pages admin (lazy-loaded — bundle séparé)
const AdminLayout         = lazy(() => import("./components/admin/AdminLayout"));
const AdminGuide          = lazy(() => import("./pages/AdminGuide"));
const AdminDashboard      = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminInventory      = lazy(() => import("./pages/admin/AdminInventory"));
const AdminFeatured       = lazy(() => import("./pages/admin/AdminFeatured"));
const AdminClients        = lazy(() => import("./pages/admin/AdminClients"));
const AdminOrders         = lazy(() => import("./pages/admin/AdminOrders"));
const AdminAnalytics      = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCRM            = lazy(() => import("./pages/admin/AdminCRM"));
const AdminAbandonedInsights = lazy(() => import("./pages/admin/AdminAbandonedInsights"));
const AdminPromoCodes     = lazy(() => import("./pages/admin/AdminPromoCodes"));
const AdminOlfactoryNotes = lazy(() => import("./pages/admin/AdminOlfactoryNotes"));
const AdminLayering       = lazy(() => import("./pages/admin/AdminLayering"));
const AdminScentIDPage    = lazy(() => import("./pages/admin/AdminScentIDPage"));
import { ProtectedRoute } from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";
import { useTracking } from "./hooks/useTracking";
import { pageVariants } from "./lib/animations";

const queryClient = new QueryClient();

// Inner component with access to useLocation (must be inside BrowserRouter)
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100%' }}
      >
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-foreground/60">Chargement...</p>
            </div>
          </div>
        }>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mes-informations" element={<UserProfile />} />
            <Route path="/mes-commandes" element={<MesCommandes />} />
            <Route path="/art-de-se-parfumer" element={<ArtOfPerfuming />} />
            <Route path="/art-du-layering" element={<LayeringGuide />} />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminGuide />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminInventory /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/featured" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminFeatured /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminClients /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminOrders /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminAnalytics /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/crm" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminCRM /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/abandoned-insights" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminAbandonedInsights /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/olfactory-notes" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminOlfactoryNotes /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/promo-codes" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminPromoCodes /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/scent-id" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminScentIDPage /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/layering" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminLayering /></AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieBanner />
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  useTracking();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AnalyticsProvider>
            <AuthProvider>
              <AdminProvider>
                <CartProvider>
                  <DataSyncInitializer>
                    <UserDataSyncInitializer />
                    <Header />
                    <ScrollToTop />
                    <main style={{ paddingTop: 'var(--site-header-height, 64px)' }}>
                      <AppRoutes />
                    </main>
                  </DataSyncInitializer>
                </CartProvider>
              </AdminProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
