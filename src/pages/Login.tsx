import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
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

// ─── CONSTANTES ANTI-BRUTE FORCE ───
const MAX_ATTEMPTS    = 5;
const LOCKOUT_MS      = 5 * 60 * 1000; // 5 minutes

const Login = () => {
  const [identifier, setIdentifier]     = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Anti-brute force
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil]       = useState(0);
  const [lockCountdown, setLockCountdown]   = useState(0);

  const isMountedRef = useRef(true);

  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { cartItems, isCartOpen, updateQuantity, removeItem, setIsCartOpen } = useCart();
  const { trackPageView, trackPageExit } = useAnalytics();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    trackPageView('/login', 'Connexion');
    return () => trackPageExit('/login');
  }, []);

  // Décompte lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockCountdown(left);
      if (left === 0) {
        setLockedUntil(0);
        setFailedAttempts(0);
        setError('');
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = lockedUntil > 0 && Date.now() < lockedUntil;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Vérifier le lockout
    if (isLocked) {
      setError(`Trop de tentatives échouées. Réessayez dans ${lockCountdown}s.`);
      return;
    }

    setIsLoading(true);

    try {
      await Promise.race([
        login(identifier, password),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('La connexion prend trop de temps. Vérifiez votre connexion internet.')), 15000)
        ),
      ]);

      // Succès → réinitialiser le compteur
      setFailedAttempts(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);

      if (newCount >= MAX_ATTEMPTS) {
        const end = Date.now() + LOCKOUT_MS;
        setLockedUntil(end);
        setLockCountdown(Math.ceil(LOCKOUT_MS / 1000));
        setError(`Trop de tentatives échouées. Connexion bloquée pendant 5 minutes.`);
      } else {
        const remaining = MAX_ATTEMPTS - newCount;
        setError(`${msg}${remaining <= 2 ? ` — ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}` : ''}`);
      }

      if (isMountedRef.current) setIsLoading(false);
    } finally {
      if (isMountedRef.current && !user) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-0">
        <div className="container mx-auto max-w-md">

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

          <motion.div
            className="bg-card rounded-2xl p-4 md:p-8 border border-border/50"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: luxuryEase, delay: 0.1 }}
          >
            <motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">

              <motion.h1
                variants={staggerItemVariants}
                className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal mb-2 md:mb-3"
              >
                Connexion
              </motion.h1>
              <motion.p
                variants={staggerItemVariants}
                className="text-foreground/70 mb-6 md:mb-8 font-light text-sm md:text-base"
              >
                Accédez à votre compte Rayha Store
              </motion.p>

              {/* Bandeau lockout */}
              {isLocked && (
                <motion.div
                  className="mb-6 p-3 md:p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-xs md:text-sm flex items-center gap-3"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: luxuryEase }}
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Trop de tentatives échouées. Connexion disponible dans{' '}
                    <strong>{Math.floor(lockCountdown / 60)}:{String(lockCountdown % 60).padStart(2, '0')}</strong>
                  </span>
                </motion.div>
              )}

              {/* Erreur standard */}
              {error && !isLocked && (
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

                {/* Email ou Pseudo */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="identifier" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Email ou Pseudo
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    placeholder="votre@email.com ou votre pseudo"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-50"
                    required
                    disabled={isLocked}
                    autoComplete="username"
                  />
                </motion.div>

                {/* Mot de passe */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="password" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3 md:py-2.5 pr-12 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-50"
                      required
                      disabled={isLocked}
                      autoComplete="current-password"
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

                {/* Bouton */}
                <motion.div variants={staggerItemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading || isLocked}
                    className="w-full inline-flex items-center justify-center px-4 py-3 md:py-2.5 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all text-sm font-medium text-foreground disabled:opacity-50 min-h-12 md:min-h-10"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {isLoading
                      ? 'Connexion en cours…'
                      : isLocked
                        ? `Bloqué — ${Math.floor(lockCountdown / 60)}:${String(lockCountdown % 60).padStart(2, '0')}`
                        : 'Se connecter'}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div
                variants={staggerItemVariants}
                className="mt-6 md:mt-8 space-y-3 md:space-y-4 text-center text-xs md:text-sm"
              >
                <div>
                  <Link to="/signup" className="text-primary hover:underline">
                    Créer un compte
                  </Link>
                </div>
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
      />
    </div>
  );
};

export default Login;
