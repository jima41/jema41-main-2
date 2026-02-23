import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import CartDrawer from '@/components/CartDrawer';
import {
  staggerContainerVariants,
  staggerItemVariants,
  luxuryEase,
} from '@/lib/animations';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();
  const {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    applyPromoCode,
    clearPromoCode,
  } = useCart();
  const { trackPageView, trackPageExit } = useAnalytics();

  useEffect(() => {
    trackPageView('/signup', 'Inscription');
    return () => trackPageExit('/signup');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-0">
        <div className="container mx-auto max-w-md">
          {/* Back button */}
          <motion.button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8 min-h-10 px-2"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: luxuryEase }}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </motion.button>

          {/* Form Container */}
          <motion.div
            className="bg-card rounded-2xl p-4 md:p-8 border border-border/50"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: luxuryEase, delay: 0.1 }}
          >
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                variants={staggerItemVariants}
                className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal mb-2 md:mb-3"
              >
                Créer un compte
              </motion.h1>
              <motion.p
                variants={staggerItemVariants}
                className="text-foreground/70 mb-6 md:mb-8 font-light text-sm md:text-base"
              >
                Rejoignez Rayha Store dès maintenant
              </motion.p>

              {error && (
                <motion.div
                  className="mb-6 p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs md:text-sm"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: luxuryEase }}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Username Field */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="username" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Identifiant
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Votre identifiant"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    required
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    required
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="password" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Au moins 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 md:py-2.5 pr-12 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-10 flex items-center justify-center w-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirmer votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 md:py-2.5 pr-12 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-10 flex items-center justify-center w-10"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={staggerItemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 md:py-2.5 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all text-sm font-medium text-foreground disabled:opacity-50 min-h-12 md:min-h-10"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                  </motion.button>
                </motion.div>
              </form>

              {/* Links */}
              <motion.div
                variants={staggerItemVariants}
                className="mt-6 md:mt-8 text-center text-xs md:text-sm"
              >
                <p className="text-muted-foreground">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Se connecter
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        promoCode={promoCode}
        promoDiscount={promoDiscount}
        onApplyPromo={applyPromoCode}
        onClearPromo={clearPromoCode}
      />
    </div>
  );
};

export default Signup;
