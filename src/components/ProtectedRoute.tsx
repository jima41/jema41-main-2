import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  requiredUsername?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole = 'admin',
  requiredUsername = 'admin'
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setHasSession(!!session?.user);
      setSessionChecked(true);
    }).catch(() => {
      if (!mounted) return;
      setHasSession(false);
      setSessionChecked(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Show loading state if auth is still loading
  if (isLoading || !sessionChecked) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-admin-text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!user && !hasSession) {
    return <Navigate to="/login" replace />;
  }

  if (!user && hasSession) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-admin-text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-card flex items-center justify-center p-4">
        <div className="glass-panel border border-admin-border rounded-lg p-8 max-w-md text-center">
          <p className="text-red-400 text-lg font-bold mb-3">❌ Accès Refusé</p>
          <p className="text-admin-text-secondary mb-4">
            Vous n'avez pas les permissions requises pour accéder à cette section.
          </p>
          <p className="text-xs text-admin-text-secondary mb-6">
            Seul l'administrateur admin peut accéder à cette interface.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-admin-gold text-admin-bg rounded-lg hover:bg-admin-gold-light transition-colors"
          >
            Retourner à l'accueil
          </a>
        </div>
      </div>
    );
  }

  // Check if user has required username (for admin)
  if (
    requiredUsername &&
    user.username.trim().toLowerCase() !== requiredUsername.trim().toLowerCase()
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-card flex items-center justify-center p-4">
        <div className="glass-panel border border-admin-border rounded-lg p-8 max-w-md text-center">
          <p className="text-red-400 text-lg font-bold mb-3">❌ Accès Refusé</p>
          <p className="text-admin-text-secondary mb-4">
            Seul l'administrateur <span className="font-bold text-admin-gold">admin</span> peut accéder à cette section.
          </p>
          <p className="text-xs text-admin-text-secondary mb-6">
            Utilisateur actuel: <span className="font-medium">{user.username}</span>
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-admin-gold text-admin-bg rounded-lg hover:bg-admin-gold-light transition-colors"
          >
            Retourner à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
