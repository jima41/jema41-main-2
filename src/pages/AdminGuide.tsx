import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
// Header rendered globally in App.tsx
import Footer from '@/components/Footer';
import { Shield, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminGuide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItemsCount, setIsCartOpen } = useCart();

  // Si déjà connecté en tant que admin, rediriger vers dashboard
  useEffect(() => {
    if (user && user.username === 'admin' && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-admin-bg via-admin-card to-admin-bg px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Main Card */}
          <div className="glass-panel border border-admin-border rounded-2xl p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-admin-gold animate-glow-pulse" />
                <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-admin-gold tracking-tighter">
                  Admin Panel
                </h1>
              </div>
              <p className="text-admin-text-secondary text-lg">
                Accédez à l'interface d'administration exclusive
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-6">
              <div className="bg-admin-bg/50 rounded-lg p-6 border border-admin-border/30">
                <div className="flex gap-4">
                  <KeyRound className="w-6 h-6 text-admin-gold flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-admin-text-primary">Identifiants Admin</h3>
                    <div className="bg-admin-card/50 rounded p-4 space-y-2 font-mono text-sm">
                      <div>
                        <p className="text-admin-text-secondary">Nom d'utilisateur:</p>
                        <p className="text-admin-gold font-bold">admin</p>
                      </div>
                      <div>
                        <p className="text-admin-text-secondary">Mot de passe:</p>
                        <p className="text-admin-gold font-bold">berkane41</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-admin-bg/50 rounded-lg p-6 border border-admin-border/30">
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-admin-text-primary">Email Admin</h3>
                    <p className="text-admin-text-secondary">admin@rayha.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules disponibles */}
            <div className="border-t border-admin-border pt-6 space-y-3">
              <h3 className="font-semibold text-admin-text-primary text-lg">
                Modules accessibles après connexion :
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  '📊 Statistiques & Dashboard',
                  '📦 Gestion Inventaire',
                  '📈 Analytics & Profils Olfactifs',
                  '🛒 Gestion des Commandes',
                  '👥 Profils Clients Scent-ID',
                  '💰 CRM & Récupération Paniers',
                ].map((module, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-admin-text-secondary p-2 rounded-lg bg-admin-card/30 border border-admin-border/20"
                  >
                    <span className="text-admin-gold">✓</span>
                    {module}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-4 flex-col md:flex-row">
              <Button
                onClick={() => navigate('/login')}
                className="bg-admin-gold text-admin-bg hover:bg-admin-gold-light flex-1"
              >
                Se connecter
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-admin-border text-admin-text-primary hover:bg-admin-card/50 flex-1"
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center text-sm text-admin-text-secondary/60 px-4">
            <p>🔒 Panel sécurisé - Seul l'administrateur admin peut accéder à cette interface</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminGuide;
