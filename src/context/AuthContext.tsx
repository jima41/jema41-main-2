import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/supabase';

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_EMAIL = 'admin@rayha.com';

const isAdminEmail = (email: string) =>
  email.trim().toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();

const getAdminDisplayUsername = () =>
  import.meta.env.VITE_ADMIN_USERNAME || 'admin';

export interface User {
  did: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (email: string, firstName: string, lastName: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Crée un profil utilisateur basique à partir des infos d'auth (fallback)
 */
const buildFallbackProfile = (authUserId: string, authEmail: string): User => ({
  id: authUserId,
  username: isAdminEmail(authEmail) ? getAdminDisplayUsername() : authEmail.split('@')[0],
  email: authEmail,
  firstName: '',
  lastName: '',
  role: isAdminEmail(authEmail) ? 'admin' : 'user',
});

const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout apres ${ms}ms`)), ms)
    ),
  ]);

/**
 * Charge le profil utilisateur depuis la table profiles Supabase.
 * Retourne TOUJOURS un profil (fallback sur les infos auth si la DB échoue).
 */
const fetchUserProfile = async (authUserId: string, authEmail: string): Promise<User> => {
  try {
    console.log('🔍 fetchUserProfile: Chargement pour', authUserId);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, first_name, last_name, role')
      .eq('id', authUserId)
      .single();

    console.log('🔍 fetchUserProfile: Résultat select', { data: !!data, error: error?.message });

    if (error || !data) {
      console.warn('⚠️ Profil non trouvé, tentative de création via RPC update_user_profile...');
      try {
        // Utiliser la fonction RPC `update_user_profile` qui est définie côté DB
        const { data: rpcResult, error: rpcError } = await supabase.rpc('update_user_profile', {
          p_user_id: authUserId,
          p_email: authEmail,
          p_first_name: '',
          p_last_name: '',
        });

        if (rpcError) {
          console.error('❌ RPC update_user_profile failed:', rpcError.message);
          return buildFallbackProfile(authUserId, authEmail);
        }

        const newProfile = rpcResult as any;
        return {
          id: newProfile.id || authUserId,
          username: newProfile.username || (isAdminEmail(authEmail) ? getAdminDisplayUsername() : authEmail.split('@')[0]),
          email: newProfile.email || authEmail,
          firstName: newProfile.first_name || '',
          lastName: newProfile.last_name || '',
          role: (newProfile.role as 'admin' | 'user') || 'user',
        };
      } catch (e) {
        console.error('❌ Erreur RPC création profil:', e);
        return buildFallbackProfile(authUserId, authEmail);
      }
    }

    return {
      id: data.id,
      username: data.username || (isAdminEmail(authEmail) ? getAdminDisplayUsername() : authEmail.split('@')[0]),
      email: data.email || authEmail,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      role: (data.role as 'admin' | 'user') || 'user',
    };
  } catch (err) {
    console.error('❌ Erreur fetchUserProfile:', err);
    return buildFallbackProfile(authUserId, authEmail);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  // Garder userRef synchronisé avec user
  useEffect(() => {
    userRef.current = user;
    console.log('🔐 [AuthProvider] user state changed:', user ? `${user.username} (${user.role})` : 'null');
  }, [user]);

  // Écouter les changements de session Supabase Auth
  useEffect(() => {
    let mounted = true;

    // Écouter les changements d'état auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event, 'session:', !!session);

        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Éviter de recharger si l'utilisateur est déjà le même
            if (userRef.current?.id === session.user.id) {
              console.log('🔐 Utilisateur déjà chargé, skip');
              setIsLoading(false);
              return;
            }
            try {
              const profile = await withTimeout(
                fetchUserProfile(session.user.id, session.user.email || ''),
                8000,
                'fetchUserProfile'
              );
              if (mounted) {
                console.log('🔐 Profil chargé via auth event:', profile.username);
                setUser(profile);
              }
            } catch (err) {
              console.error('🔐 Erreur chargement profil via auth event:', err);
              if (mounted) {
                setUser(buildFallbackProfile(session.user.id, session.user.email || ''));
              }
            }
          }
          if (mounted) setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );

    // Charger la session existante au démarrage
    // Note: getSession() déclenche INITIAL_SESSION dans onAuthStateChange
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && mounted) {
        // Pas de session, finir le chargement
        setIsLoading(false);
      }
      // Si session existe, onAuthStateChange INITIAL_SESSION va la traiter
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      // Déterminer si l'identifiant est un email ou un pseudo
      let email = identifier.trim();
      const isEmail = email.includes('@');
      console.log('🔐 login: Début', { identifier: email, isEmail });

      if (!isEmail) {
        let foundEmail: string | null = null;
        
        // Méthode 1 : via fonction RPC (bypass RLS)
        try {
          const { data: emailResult, error: rpcError } = await supabase
            .rpc('get_email_by_username', { p_username: email });
          
          if (!rpcError && emailResult) {
            foundEmail = emailResult as string;
          }
        } catch (e) {
          console.warn('🔐 login: RPC échoué', e);
        }

        // Méthode 2 : fallback requête directe sur profiles
        if (!foundEmail) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email')
              .ilike('username', email)
              .single();

            if (profileData?.email) {
              foundEmail = profileData.email;
            }
          } catch (e) {
            console.warn('🔐 login: Fallback échoué', e);
          }
        }

        if (!foundEmail) {
          const normalizedIdentifier = email.toLowerCase();
          const configuredAdminUsername = (import.meta.env.VITE_ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME).toLowerCase();
          const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;

          if (normalizedIdentifier === configuredAdminUsername) {
            console.warn('🔐 login: fallback admin pseudo appliqué');
            foundEmail = configuredAdminEmail;
          }
        }

        if (!foundEmail) {
          throw new Error('Connexion par pseudo indisponible ou pseudo introuvable. Essayez avec votre email.');
        }
        email = foundEmail;
      }

      console.log('🔐 login: signInWithPassword...');
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        8000,
        'signInWithPassword'
      );

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Identifiant ou mot de passe incorrect');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        }
        throw new Error(error.message);
      }

      // signInWithPassword déclenche onAuthStateChange SIGNED_IN
      // qui va charger le profil et faire setUser.
      // On s'assure aussi manuellement que le profil est chargé ici
      // pour que le state soit mis à jour avant le retour de login().
      if (data.user) {
        try {
          const profile = await withTimeout(
            fetchUserProfile(data.user.id, data.user.email || ''),
            8000,
            'fetchUserProfile'
          );
          console.log('🔐 login: Profil chargé directement:', profile.username);
          setUser(profile);
        } catch (profileErr) {
          console.error('🔐 login: Erreur profil, utilisation du fallback', profileErr);
          setUser(buildFallbackProfile(data.user.id, data.user.email || ''));
        }
      }
      
      console.log('🔐 login: Terminé avec succès');
    } catch (err) {
      console.error('🔐 login: Erreur', err);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      try {
        const res = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
                first_name: '',
                last_name: '',
              },
            },
          }),
          10000,
          'signUp'
        );

        console.log('🔐 signup response', res);

        const { data, error } = res as any;

        if (error) {
          console.error('🔐 signup error detail', error);
          if (error.message && error.message.includes('already registered')) {
            throw new Error('Cet email est déjà utilisé');
          }
          throw new Error(error.message || 'Erreur lors de l\'inscription');
        }

        // Si l'email doit être confirmé
        if (data?.user && !data?.session) {
          throw new Error('Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail.');
        }

        // Si l'inscription connecte directement (email confirmation désactivée)
        if (data?.user && data?.session) {
          const profile = await fetchUserProfile(data.user.id, data.user.email || '');
          setUser(profile);
        }
      } catch (e) {
        console.error('🔐 signup exception', e);
        throw e;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('❌ Erreur logout:', err);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (email: string, firstName: string, lastName: string) => {
    if (!user) throw new Error('Aucun utilisateur connecté');

    try {
      // Mettre à jour le profil dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw new Error(profileError.message);

      // Mettre à jour l'email dans Supabase Auth si changé
      if (email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email });
        if (authError) {
          console.warn('⚠️ Email non mis à jour dans Auth:', authError.message);
        }
      }

      // Mettre à jour l'état local
      setUser(prev => prev ? { ...prev, email, firstName, lastName } : null);
    } catch (error) {
      throw error;
    }
  }, [user]);

  const updatePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('Aucun utilisateur connecté');

    try {
      // Vérifier l'ancien mot de passe en tentant une connexion
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (verifyError) {
        throw new Error('Le mot de passe actuel est incorrect');
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new Error(updateError.message);
    } catch (error) {
      throw error;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userId: user?.id || null, isAuthenticated: !!user, isLoading, login, signup, logout, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
