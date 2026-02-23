import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, LogOut, User, Settings, Heart } from 'lucide-react';
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
      <span className="font-serif text-2xl md:text-3xl font-normal tracking-widest text-white">
        Rayha
      </span>
      <span className="font-sans text-xs font-light tracking-widest text-white/70 uppercase ml-1 pt-1">
        Store
      </span>
    </Link>
  );
};

// ============================================================================
// PERFUME NAV DROPDOWN COMPONENT
// ============================================================================
interface PerfumeDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const PerfumeNavDropdown = () => {
  const navigate = useNavigate();
  const isActive = window.location.pathname === '/all-products';

  const underlineVariants = {
    initial: { scaleX: 0 },
    hover: { scaleX: 1, transition: { duration: 0.3 } },
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/all-products');
  };

  return (
    <motion.div className="relative pb-1 cursor-pointer group">
      <a
        href="/all-products"
        onClick={handleClick}
        className={`text-sm font-medium transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
        }`}
      >
        Nos Parfums
      </a>
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-px bg-[#D4AF37] w-full"
        variants={underlineVariants}
        initial="initial"
        whileHover="hover"
        style={{ originX: 0.5 }}
      />
    </motion.div>
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
      className={`p-2 rounded-full transition-all duration-200 relative ${
        isActive ? 'bg-white/10' : 'hover:bg-white/10'
      }`}
      onClick={onClick}
      title={title}
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
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
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 -ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="text-[#A68A56]" /> : <Menu className="text-[#A68A56]" />}
          </button>

          {/* Nav - LEFT */}
          <nav className="hidden md:flex items-center gap-8 flex-1">
            <PerfumeNavDropdown />
          </nav>

          {/* Logo - CENTER */}
          <div className="flex-1 flex justify-center md:flex-none">
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
              />
            </form>

            <ActionIcon
              icon={<ShoppingBag strokeWidth={1.5} className="w-5 h-5" />}
              onClick={onCartClick}
              badge={cartItemsCount}
            />

            {user?.role === 'admin' && (
              <ActionIcon icon={<Settings strokeWidth={1.5} className="w-5 h-5" />} onClick={() => navigate('/admin')} />
            )}

            {user ? (
              <div className="relative">
                <ActionIcon icon={<User strokeWidth={1.5} className="w-5 h-5" />} onClick={() => setIsProfileOpen(!isProfileOpen)} isActive={isProfileOpen} />
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[110]"
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                      </div>
                      <button onClick={() => navigate('/mes-informations')} className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Mes informations
                      </button>
                      <button onClick={() => navigate('/favorites')} className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Mes coups de coeurs
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#A68A56] hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5">
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex gap-4">
                <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Connexion</Link>
                <Link to="/signup" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Inscription</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-lg px-4 py-6 flex flex-col gap-4"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          >
            <button onClick={() => {navigate('/all-products'); setIsMenuOpen(false);}} className="text-sm font-medium text-white/70 hover:text-white py-2 text-left">Nos Parfums</button>
            {!user && (
              <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <Link to="/login" className="text-white/70 hover:text-white">Connexion</Link>
                <Link to="/signup" className="text-white/70 hover:text-white">Inscription</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;