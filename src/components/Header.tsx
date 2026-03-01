import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, LogOut, User, Settings, Heart, Package, UserPlus, ChevronDown, BookOpen, Layers } from 'lucide-react';

const PerfumeBottleIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Bouchon */}
    <rect x="9.5" y="2" width="5" height="2.5" rx="0.75" />
    {/* Goulot */}
    <rect x="10.5" y="4.5" width="3" height="3" />
    {/* Corps avec épaules courbées */}
    <path d="M13.5 7.5 Q16.5 8.5 17 11 L17 20 Q17 21.5 15.5 21.5 L8.5 21.5 Q7 21.5 7 20 L7 11 Q7.5 8.5 10.5 7.5 Z" />
    {/* Niveau de liquide */}
    <line x1="7.5" y1="16" x2="16.5" y2="16" strokeOpacity="0.5" />
  </svg>
);
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
}

// ============================================================================
// LOGO COMPONENT
// ============================================================================
const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-0 group">
      <span className="font-display text-2xl md:text-3xl font-normal tracking-widest text-white">
        Rayha
      </span>
      <span className="font-sans text-xs font-light tracking-widest text-white/70 uppercase ml-1 pt-1">
        Store
      </span>
    </Link>
  );
};

// ============================================================================
// ACTION ICON COMPONENT
// ============================================================================
interface ActionIconProps {
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  title?: string;
  isActive?: boolean;
}

const ActionIcon = ({ icon, onClick, badge, title, isActive }: ActionIconProps) => {
  return (
    <motion.button
      className={`p-2.5 rounded-full transition-all duration-200 relative ${
        isActive ? 'bg-white/10' : 'hover:bg-white/10'
      }`}
      onClick={onClick}
      title={title}
      aria-label={title}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-[#A68A56]">{icon}</div>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-black text-xs rounded-full flex items-center justify-center font-semibold">
          {badge}
        </span>
      )}
    </motion.button>
  );
};

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================
const Header = ({ cartItemsCount: propsCartItemsCount, onCartClick: propsOnCartClick }: HeaderProps) => {
  let cartItemsCount = propsCartItemsCount;
  let onCartClick = propsOnCartClick;

  try {
    const cart = useCart();
    if (cart) {
      cartItemsCount = cart.cartItemsCount;
      onCartClick = () => cart.setIsCartOpen(true);
    }
  } catch (err) {}

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const isScrolled = scrollY > 40;
  const headerPaddingScale = isScrolled ? 0.85 : 1;

  useEffect(() => {
    const setHeaderHeight = () => {
      if (headerRef.current) {
        const height = Math.ceil(headerRef.current.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--site-header-height', `${height}px`);
      }
    };
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
    window.addEventListener('scroll', setHeaderHeight);
    return () => {
      window.removeEventListener('resize', setHeaderHeight);
      window.removeEventListener('scroll', setHeaderHeight);
    };
  }, [headerPaddingScale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { label: 'Nos Parfums', path: '/all-products', icon: <PerfumeBottleIcon className="w-4 h-4" /> },
    { label: "L'Art de se Parfumer", path: '/art-de-se-parfumer', icon: <BookOpen className="w-4 h-4" /> },
    { label: "L'Art de Combiner", path: '/art-du-layering', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300 ${
          isScrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10' : 'bg-black'
        }`}
      >
        <div className="container mx-auto">
          <motion.div
            className="flex items-center justify-between w-full transition-[padding] duration-300 px-4"
            animate={{ padding: `${1 * headerPaddingScale}rem 1rem` }}
          >
            {/* Menu Button */}
            <div className="flex items-center flex-1">
              <motion.button
                className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <X className="text-[#A68A56] w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <Menu className="text-[#A68A56] w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Logo - CENTER */}
            <div className="flex justify-center">
              <Logo />
            </div>

            {/* Actions - RIGHT */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mr-2 w-48 md:w-64 px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
                      autoFocus
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    />
                  )}
                </AnimatePresence>
                <ActionIcon
                  icon={<Search strokeWidth={1.5} className="w-5 h-5" />}
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  title="Rechercher"
                />
              </form>

              <ActionIcon
                icon={<ShoppingBag strokeWidth={1.5} className="w-5 h-5" />}
                onClick={onCartClick}
                badge={cartItemsCount}
                title="Panier"
              />

              {user?.role === 'admin' && (
                <ActionIcon icon={<Settings strokeWidth={1.5} className="w-5 h-5" />} onClick={() => navigate('/admin')} title="Administration" />
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Side drawer — rendu en dehors du header pour couvrir toute la hauteur */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Side panel */}
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-[109] w-[62vw] max-w-[260px] md:w-64 flex flex-col overflow-hidden"
              style={{
                background: 'rgba(6, 6, 6, 0.82)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.07)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 38, mass: 0.9 }}
            >
              {/* Filet doré en haut */}
              <div className="h-px bg-gradient-to-r from-[#D4AF37] via-[#FCEEAC]/60 to-transparent flex-shrink-0" />

              {/* Header du panel */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
                <Logo />
                <motion.button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="text-white/40 w-4 h-4" />
                </motion.button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 pt-8 pb-4 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 px-4 mb-3 font-medium">
                  Navigation
                </p>
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.path}
                    onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-[#A68A56] group-hover:text-[#D4AF37] transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              {/* Compte / bas du panel */}
              <motion.div
                className="px-4 pb-6 pt-4 border-t border-white/5 space-y-1 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 px-4 mb-3 font-medium">
                  Compte
                </p>

                {user ? (
                  <>
                    {/* Accordion trigger — Mon compte */}
                    <button
                      onClick={() => setIsAccountOpen(!isAccountOpen)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[#A68A56] group-hover:text-[#D4AF37] transition-colors" />
                        <div className="text-left">
                          <p className="text-sm font-medium tracking-wide leading-none">Mon compte</p>
                          <p className="text-[10px] text-white/30 mt-0.5">{user.username}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Accordion content */}
                    <AnimatePresence initial={false}>
                      {isAccountOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden pl-4"
                        >
                          <button
                            onClick={() => { navigate('/mes-informations'); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm tracking-wide"
                          >
                            <Settings className="w-3.5 h-3.5 text-[#A68A56]" />
                            Mes informations
                          </button>
                          <button
                            onClick={() => { navigate('/favorites'); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm tracking-wide"
                          >
                            <Heart className="w-3.5 h-3.5 text-[#A68A56]" />
                            Mes coups de coeur
                          </button>
                          <button
                            onClick={() => { navigate('/mes-commandes'); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm tracking-wide"
                          >
                            <Package className="w-3.5 h-3.5 text-[#A68A56]" />
                            Mes commandes
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Déconnexion */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#A68A56]/70 hover:text-[#A68A56] hover:bg-white/5 transition-all duration-200 text-sm tracking-wide"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium tracking-wide"
                    >
                      <User className="w-4 h-4 text-[#A68A56]" />
                      Connexion
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium tracking-wide"
                    >
                      <UserPlus className="w-4 h-4 text-[#A68A56]" />
                      S'inscrire
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Filet doré en bas */}
              <div className="h-px bg-gradient-to-r from-[#D4AF37]/40 via-[#FCEEAC]/20 to-transparent flex-shrink-0" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
