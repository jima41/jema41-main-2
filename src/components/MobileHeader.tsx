import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, LogOut, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface MobileHeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const MobileHeader = ({ cartItemsCount, onCartClick }: MobileHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { user, logout } = useAuth();

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  const isScrolled = scrollY > 40;

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <>
      {/* Header - Vue Fermée */}
      <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-admin-gold/10 transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="flex items-center justify-between px-4 h-16">
          {/* Gauche : Menu Hamburger */}
          <button
            onClick={handleMenuToggle}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
          </button>

          {/* Centre : Logo */}
          <Link to="/" className="flex items-center gap-0 group">
            <span className="font-serif text-2xl font-normal tracking-widest text-foreground">
              Rayha
            </span>
            <span className="font-sans text-xs font-light tracking-widest text-foreground/70 uppercase ml-1 pt-1">
              Store
            </span>
          </Link>

          {/* Droite : Icônes Recherche et Panier */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => console.log('Search clicked')}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
            </button>
            <button
              onClick={onCartClick}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform relative"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-admin-gold text-black text-xs rounded-full flex items-center justify-center font-semibold">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile - Vue Ouverte / Drawer - SANS FRAMER MOTION */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={handleMenuClose}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 z-50 w-full h-full bg-gradient-to-b from-amber-50/95 to-white/95">
            {/* Header du Drawer */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-admin-gold/20">
              <div className="w-8" /> {/* Spacer pour centrer le X */}
              <h2 className="text-lg font-serif font-normal text-foreground">Menu</h2>
              <button
                onClick={handleMenuClose}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
              </button>
            </div>

            {/* Contenu du Menu */}
            <div className="flex-1 px-6 py-8">
              {/* Section Mon Compte */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider mb-4">
                  Mon Compte
                </h3>
                <div className="space-y-3">
                  {user ? (
                    // Utilisateur connecté
                    <>
                      <Link
                        to="/mes-informations"
                        onClick={handleMenuClose}
                        className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                      >
                        Mes informations
                      </Link>
                      
                      {/* Dashboard pour les administrateurs - Uniquement admin */}
                      {user.role === 'admin' && user.username.trim().toLowerCase() === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={handleMenuClose}
                          className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                        >
                          Dashboard
                        </Link>
                      )}
                      
                      {/* Mes coups de coeur pour tous les utilisateurs connectés */}
                      <Link
                        to="/favorites"
                        onClick={handleMenuClose}
                        className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Mes coups de coeur
                        </div>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </div>
                      </button>
                    </>
                  ) : (
                    // Utilisateur non connecté
                    <>
                      <Link
                        to="/login"
                        onClick={handleMenuClose}
                        className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                      >
                        Se connecter
                      </Link>
                      <Link
                        to="/signup"
                        onClick={handleMenuClose}
                        className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                      >
                        S'inscrire
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Section Navigation */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider mb-4">
                  Navigation
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/"
                    onClick={handleMenuClose}
                    className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                  >
                    Accueil
                  </Link>
                  <Link
                    to="/all-products"
                    onClick={handleMenuClose}
                    className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                  >
                    Tous les produits
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={handleMenuClose}
                    className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                  >
                    Favoris
                  </Link>
                </div>
              </div>

              {/* Section Support */}
              <div>
                <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider mb-4">
                  Support
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleMenuClose();
                      console.log('Contact clicked');
                    }}
                    className="block w-full text-left px-4 py-3 text-foreground hover:bg-admin-gold/10 hover:text-admin-gold rounded-lg transition-colors active:scale-95"
                  >
                    Nous contacter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;