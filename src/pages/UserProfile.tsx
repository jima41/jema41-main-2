import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updatePassword } = useAuth();
  const { cartItems, cartItemsCount, isCartOpen, addToCart, updateQuantity, removeItem, setIsCartOpen } = useCart();
  const { trackPageView, trackPageExit } = useAnalytics();

  useEffect(() => {
    trackPageView('/mes-informations', 'Mon profil');
    return () => trackPageExit('/mes-informations');
  }, []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await updateProfile(formData.email, formData.firstName, formData.lastName);
      setSuccessMsg('Modification effectuée avec succès');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setError('');
    setSuccessMsg('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccessMsg('Modification effectuée avec succès');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditingPassword(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-12 text-xs tracking-[0.15em] uppercase font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-normal mb-3">Mes Informations</h1>
            <p className="text-foreground/70 font-light">Gérez votre profil et votre sécurité</p>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -20, scaleX: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleX: 1 }}
                exit={{ opacity: 0, y: -20, scaleX: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-6 inline-flex items-center gap-3 px-6 py-3 rounded-lg border-b-2 border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/8 to-transparent backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <Check className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </motion.div>
                <span className="text-sm font-light text-foreground/90 tracking-wide">
                  {successMsg}
                </span>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scaleX: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleX: 1 }}
                exit={{ opacity: 0, y: -20, scaleX: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 md:p-12 border border-border/30 mb-8"
          >
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-border/30">
              <h2 className="font-serif text-2xl font-normal">Informations du compte</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-lg border border-border/40 hover:border-[#D4AF37]/60 text-sm font-medium transition-all"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Username (Read-only) */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                  Nom d'utilisateur (non modifiable)
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-border/40 bg-background/30 text-foreground/60 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground disabled:bg-background/30 disabled:cursor-not-allowed transition-all outline-none"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground disabled:bg-background/30 disabled:cursor-not-allowed transition-all outline-none"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground disabled:bg-background/30 disabled:cursor-not-allowed transition-all outline-none"
                />
              </div>

              {/* Save Button */}
              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="w-full px-6 py-3 rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/20 hover:to-[#D4AF37]/10 transition-all text-foreground font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-8 md:p-12 border border-border/30"
          >
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-border/30">
              <h2 className="font-serif text-2xl font-normal">Sécurité</h2>
              <button
                onClick={() => setIsEditingPassword(!isEditingPassword)}
                className="px-4 py-2 rounded-lg border border-border/40 hover:border-[#D4AF37]/60 text-sm font-medium transition-all"
              >
                {isEditingPassword ? 'Annuler' : 'Changer le mot de passe'}
              </button>
            </div>

            {isEditingPassword && (
              <div className="space-y-6">
                {/* Old Password */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                    >
                      {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-foreground/70 mb-2 font-medium">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePassword}
                  disabled={isLoading}
                  className="w-full px-6 py-3 rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/20 hover:to-[#D4AF37]/10 transition-all text-foreground font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;
