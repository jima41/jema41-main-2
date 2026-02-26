import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Check, Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useAddressStore, type ShippingAddress } from '@/store/useAddressStore';

// ── Formulaire d'adresse (ajout / modification) ───────────────────────────────
const EMPTY_ADDR = {
  label: '', firstName: '', lastName: '', email: '',
  phone: '', address: '', city: '', postalCode: '', country: 'France',
};

interface AddressFormProps {
  initial?: Partial<typeof EMPTY_ADDR>;
  onSave: (data: typeof EMPTY_ADDR) => void;
  onCancel: () => void;
}

const AddressForm = ({ initial, onSave, onCancel }: AddressFormProps) => {
  const [form, setForm] = useState({ ...EMPTY_ADDR, ...initial });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.firstName && form.lastName && form.address && form.city && form.postalCode;

  const field = (
    label: string, key: keyof typeof EMPTY_ADDR,
    opts?: { type?: string; placeholder?: string; colSpan?: boolean }
  ) => (
    <div className={opts?.colSpan ? 'md:col-span-2' : ''}>
      <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2 font-medium">
        {label}
      </label>
      <input
        type={opts?.type ?? 'text'}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={opts?.placeholder}
        className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground transition-all outline-none text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Étiquette', 'label', { placeholder: 'ex: Domicile, Bureau…', colSpan: true })}
        {field('Prénom', 'firstName', { placeholder: 'Jean' })}
        {field('Nom', 'lastName', { placeholder: 'Dupont' })}
        {field('Email', 'email', { type: 'email', placeholder: 'jean@example.com' })}
        {field('Téléphone', 'phone', { type: 'tel', placeholder: '+33 6 12 34 56 78' })}
        {field('Adresse', 'address', { placeholder: '12 Rue de la Paix', colSpan: true })}
        {field('Ville', 'city', { placeholder: 'Paris' })}
        {field('Code postal', 'postalCode', { placeholder: '75001' })}
        <div>
          <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2 font-medium">
            Pays
          </label>
          <select
            value={form.country}
            onChange={e => set('country', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground transition-all outline-none text-sm"
          >
            {['France', 'Belgique', 'Suisse', 'Luxembourg'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => valid && onSave(form)}
          disabled={!valid}
          className="flex-1 px-5 py-2.5 rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/20 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-border/40 hover:border-border/80 text-sm font-medium transition-all"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

// ── Carte d'une adresse ───────────────────────────────────────────────────────
interface AddressCardProps {
  addr: ShippingAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const AddressCard = ({ addr, onEdit, onDelete, onSetDefault }: AddressCardProps) => (
  <div className={`relative rounded-xl border p-5 transition-all ${
    addr.isDefault ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-border/30 bg-background/30'
  }`}>
    {addr.isDefault && (
      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
        <Star className="w-3 h-3 fill-[#D4AF37]" /> Par défaut
      </span>
    )}

    <p className="text-xs uppercase tracking-widest text-foreground/50 mb-2 font-semibold">
      {addr.label || 'Adresse'}
    </p>
    <p className="text-sm text-foreground font-medium">{addr.firstName} {addr.lastName}</p>
    <p className="text-sm text-foreground/70 mt-0.5">{addr.address}</p>
    <p className="text-sm text-foreground/70">{addr.postalCode} {addr.city}, {addr.country}</p>
    {addr.phone && <p className="text-xs text-foreground/50 mt-1">{addr.phone}</p>}
    {addr.email && <p className="text-xs text-foreground/50">{addr.email}</p>}

    <div className="flex items-center gap-2 mt-4">
      {!addr.isDefault && (
        <button
          onClick={onSetDefault}
          className="inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-[#D4AF37] transition-colors px-2 py-1 rounded-md hover:bg-[#D4AF37]/10"
        >
          <Star className="w-3 h-3" /> Définir par défaut
        </button>
      )}
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-white/5"
      >
        <Pencil className="w-3 h-3" /> Modifier
      </button>
      <button
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-500/10 ml-auto"
      >
        <Trash2 className="w-3 h-3" /> Supprimer
      </button>
    </div>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────
const UserProfile = () => {
  const navigate = useNavigate();
  const { user, userId, updateProfile, updatePassword } = useAuth();
  const { trackPageView, trackPageExit } = useAnalytics();
  const { getAddresses, saveAddress, removeAddress, setDefault } = useAddressStore();

  useEffect(() => {
    trackPageView('/mes-informations', 'Mon profil');
    return () => trackPageExit('/mes-informations');
  }, []);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // ── État profil ──
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
    oldPassword: '', newPassword: '', confirmPassword: '',
  });

  // ── État adresses ──
  const addresses = userId ? getAddresses(userId) : [];
  // editingId : null = pas d'édition, 'new' = ajout, string = édition d'une adresse
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!user) return null;

  // ── Handlers profil ──
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleSaveProfile = async () => {
    setError(''); setIsLoading(true);
    try {
      await updateProfile(formData.email, formData.firstName, formData.lastName);
      showSuccess('Modifications enregistrées avec succès');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas'); return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères'); return;
    }
    setIsLoading(true);
    try {
      await updatePassword(passwordData.oldPassword, passwordData.newPassword);
      showSuccess('Mot de passe mis à jour avec succès');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditingPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handlers adresses ──
  const handleSaveAddress = (data: typeof EMPTY_ADDR, id?: string) => {
    if (!userId) return;
    saveAddress(userId, { ...data, ...(id ? { id } : {}) });
    setEditingId(null);
    showSuccess('Adresse enregistrée');
  };

  const handleDelete = (id: string) => {
    if (!userId) return;
    removeAddress(userId, id);
    showSuccess('Adresse supprimée');
  };

  const handleSetDefault = (id: string) => {
    if (!userId) return;
    setDefault(userId, id);
    showSuccess('Adresse par défaut mise à jour');
  };

  const editingAddr = editingId && editingId !== 'new'
    ? addresses.find(a => a.id === editingId)
    : undefined;

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border/40 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 bg-background/50 text-foreground disabled:bg-background/30 disabled:cursor-not-allowed transition-all outline-none";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-2xl px-4">

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-12 text-xs tracking-[0.15em] uppercase font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-normal mb-3">Mes Informations</h1>
            <p className="text-foreground/70 font-light">Gérez votre profil, vos adresses et votre sécurité</p>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="mb-6 inline-flex items-center gap-3 px-6 py-3 rounded-lg border-b-2 border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/8 to-transparent"
              >
                <Check className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm text-foreground/90">{successMsg}</span>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="mb-6 flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm"
              >
                <span>{error}</span>
                <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Informations du compte ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 md:p-10 border border-border/30 mb-6"
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

            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2 font-medium">
                  Nom d'utilisateur (non modifiable)
                </label>
                <input type="text" value={user.username} disabled className={inputClass} />
              </div>
              {[
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Prénom', name: 'firstName', type: 'text' },
                { label: 'Nom', name: 'lastName', type: 'text' },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2 font-medium">
                    {label}
                  </label>
                  <input
                    type={type} name={name}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={inputClass}
                  />
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={handleSaveProfile} disabled={isLoading}
                  className="w-full px-6 py-3 rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/20 transition-all font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Adresses de livraison ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="glass rounded-2xl p-8 md:p-10 border border-border/30 mb-6"
          >
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-border/30">
              <div>
                <h2 className="font-serif text-2xl font-normal">Adresses de livraison</h2>
                <p className="text-xs text-foreground/50 mt-1">
                  {addresses.length === 0
                    ? 'Aucune adresse enregistrée'
                    : `${addresses.length} adresse${addresses.length > 1 ? 's' : ''} enregistrée${addresses.length > 1 ? 's' : ''}`}
                </p>
              </div>
              {editingId !== 'new' && (
                <button
                  onClick={() => setEditingId('new')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 hover:border-[#D4AF37]/60 text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              )}
            </div>

            {/* Formulaire d'ajout */}
            <AnimatePresence>
              {editingId === 'new' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6"
                >
                  <div className="p-5 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 mb-4">
                    <p className="text-xs uppercase tracking-widest text-[#D4AF37]/80 font-bold mb-4">
                      Nouvelle adresse
                    </p>
                    <AddressForm
                      onSave={data => handleSaveAddress(data)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste des adresses */}
            {addresses.length === 0 && editingId !== 'new' ? (
              <p className="text-sm text-foreground/40 text-center py-8">
                Vos adresses apparaîtront ici après votre première commande,<br />ou ajoutez-en une manuellement.
              </p>
            ) : (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div key={addr.id}>
                    {editingId === addr.id ? (
                      <div className="p-5 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                        <p className="text-xs uppercase tracking-widest text-[#D4AF37]/80 font-bold mb-4">
                          Modifier l'adresse
                        </p>
                        <AddressForm
                          initial={addr}
                          onSave={data => handleSaveAddress(data, addr.id)}
                          onCancel={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <AddressCard
                        addr={addr}
                        onEdit={() => setEditingId(addr.id)}
                        onDelete={() => handleDelete(addr.id)}
                        onSetDefault={() => handleSetDefault(addr.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Sécurité ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="glass rounded-2xl p-8 md:p-10 border border-border/30"
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
              <div className="space-y-5">
                {[
                  { label: 'Mot de passe actuel', name: 'oldPassword', key: 'old' as const },
                  { label: 'Nouveau mot de passe', name: 'newPassword', key: 'new' as const },
                  { label: 'Confirmer le mot de passe', name: 'confirmPassword', key: 'confirm' as const },
                ].map(({ label, name, key }) => (
                  <div key={name}>
                    <label className="block text-xs uppercase tracking-widest text-foreground/60 mb-2 font-medium">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[key] ? 'text' : 'password'}
                        name={name}
                        value={passwordData[name as keyof typeof passwordData]}
                        onChange={handlePasswordChange}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                      >
                        {showPasswords[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleSavePassword} disabled={isLoading}
                  className="w-full px-6 py-3 rounded-lg border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/20 transition-all font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
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
