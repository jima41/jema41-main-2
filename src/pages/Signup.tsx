import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react';
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

// ─── CONSTANTES ANTI-BOT ───
const COOLDOWN_MS = 30_000;     // 30s de cooldown après chaque soumission
const MIN_FILL_MS = 2_500;      // Formulaire rempli en < 2.5s → bot probable

const validatePassword = (pw: string): string | null => {
  if (pw.length < 8)         return 'Le mot de passe doit contenir au moins 8 caractères';
  if (!/[A-Z]/.test(pw))    return 'Le mot de passe doit contenir au moins une majuscule';
  if (!/[0-9]/.test(pw))    return 'Le mot de passe doit contenir au moins un chiffre';
  return null;
};

const Signup = () => {
  const [username, setUsername]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot]               = useState(''); // champ caché anti-bot
  const [error, setError]                     = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [confirmedEmail, setConfirmedEmail]   = useState(''); // écran de confirmation
  const [cooldownEnd, setCooldownEnd]         = useState(0);
  const [cooldownLeft, setCooldownLeft]       = useState(0);

  const formLoadedAt = useRef(Date.now());

  const navigate = useNavigate();
  const { signup } = useAuth();
  const { cartItems, isCartOpen, updateQuantity, removeItem, setIsCartOpen } = useCart();
  const { trackPageView, trackPageExit } = useAnalytics();

  useEffect(() => {
    trackPageView('/signup', 'Inscription');
    return () => trackPageExit('/signup');
  }, []);

  // Décompte du cooldown
  useEffect(() => {
    if (!cooldownEnd) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setCooldownLeft(left);
      if (left === 0) { setCooldownEnd(0); clearInterval(id); }
    }, 500);
    return () => clearInterval(id);
  }, [cooldownEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ── Anti-bot : champ honeypot rempli ──
    if (honeypot) return; // On silencieuse : le bot pense avoir soumis

    // ── Anti-bot : soumission trop rapide ──
    if (Date.now() - formLoadedAt.current < MIN_FILL_MS) {
      setError('Veuillez prendre le temps de remplir le formulaire.');
      return;
    }

    // ── Cooldown ──
    if (cooldownEnd && Date.now() < cooldownEnd) {
      setError(`Veuillez patienter ${cooldownLeft}s avant de réessayer.`);
      return;
    }

    // ── Validation identifiant ──
    const trimUser = username.trim();
    if (trimUser.length < 3) {
      setError("L'identifiant doit contenir au moins 3 caractères");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimUser)) {
      setError("L'identifiant ne peut contenir que des lettres, chiffres, . - _");
      return;
    }

    // ── Validation email ──
    const trimEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    // ── Validation mot de passe ──
    const pwErr = validatePassword(password);
    if (pwErr) { setError(pwErr); return; }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await signup(trimUser, trimEmail, password);
      // Envoi email de bienvenue (fire-and-forget)
      fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimEmail }),
      }).catch(() => {});
      navigate('/'); // inscription directe (email confirmation désactivé côté Supabase)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription";

      if (msg.startsWith('CONFIRM:')) {
        // Supabase a envoyé un email de confirmation → afficher l'écran dédié
        setConfirmedEmail(trimEmail);
      } else {
        setError(msg);
        // Cooldown après toute erreur pour ralentir les bots
        const end = Date.now() + COOLDOWN_MS;
        setCooldownEnd(end);
        setCooldownLeft(Math.ceil(COOLDOWN_MS / 1000));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Écran de confirmation email ──
  if (confirmedEmail) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center py-12 px-4">
          <div className="container mx-auto max-w-md">
            <motion.div
              className="bg-card rounded-2xl p-8 md:p-10 border border-border/50 text-center"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: luxuryEase }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6"
              >
                <Mail className="w-7 h-7 text-[#D4AF37]" />
              </motion.div>

              <h2 className="font-serif text-2xl md:text-3xl font-normal mb-3">
                Confirmez votre email
              </h2>
              <p className="text-foreground/60 font-light text-sm mb-2">
                Un lien d'activation a été envoyé à
              </p>
              <p className="font-medium text-sm mb-6 break-all">{confirmedEmail}</p>
              <p className="text-foreground/50 font-light text-xs leading-relaxed mb-8">
                Cliquez sur le lien dans l'email pour activer votre compte.<br />
                Vérifiez aussi vos spams si vous ne le recevez pas dans quelques minutes.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border/60 hover:border-border hover:bg-secondary/20 transition-all text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Aller à la connexion
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Force de mot de passe (3 barres) ──
  const pwStrength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];

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
                  {cooldownLeft > 0 && (
                    <span className="block mt-1 text-red-400/70 text-[11px]">
                      Réessai disponible dans {cooldownLeft}s
                    </span>
                  )}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

                {/* ── Champ honeypot (invisible, anti-bot) ── */}
                <div
                  style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  <label htmlFor="hp_website">Website</label>
                  <input
                    id="hp_website"
                    name="hp_website"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Identifiant */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="username" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Identifiant
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Votre identifiant (min. 3 caractères)"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    required
                    autoComplete="username"
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 md:py-2.5 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    required
                    autoComplete="email"
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
                      placeholder="8+ car., 1 majuscule, 1 chiffre"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3 md:py-2.5 pr-12 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-10 flex items-center justify-center w-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Indicateur de force */}
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {pwStrength.map((ok, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${ok ? 'bg-[#D4AF37]' : 'bg-border'}`}
                        />
                      ))}
                    </div>
                  )}
                  {password.length > 0 && (
                    <p className="text-[10px] text-foreground/40 mt-1">
                      {pwStrength.filter(Boolean).length === 3 ? '✓ Mot de passe fort' : 'Minuscule + majuscule + chiffre requis'}
                    </p>
                  )}
                </motion.div>

                {/* Confirmer mot de passe */}
                <motion.div variants={staggerItemVariants}>
                  <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-widest text-foreground/70 mb-1.5 md:mb-2 font-medium">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirmer votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3 md:py-2.5 pr-12 rounded-lg border border-border bg-background/50 text-base md:text-sm min-h-12 md:min-h-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-10 flex items-center justify-center w-10"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Bouton */}
                <motion.div variants={staggerItemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading || cooldownLeft > 0}
                    className="w-full inline-flex items-center justify-center px-4 py-3 md:py-2.5 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all text-sm font-medium text-foreground disabled:opacity-50 min-h-12 md:min-h-10"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {isLoading
                      ? 'Inscription en cours…'
                      : cooldownLeft > 0
                        ? `Patienter ${cooldownLeft}s`
                        : "S'inscrire"}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div variants={staggerItemVariants} className="mt-6 md:mt-8 text-center text-xs md:text-sm">
                <p className="text-muted-foreground">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
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
      />
    </div>
  );
};

export default Signup;
