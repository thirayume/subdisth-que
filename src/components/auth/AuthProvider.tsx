
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import SecureStorage from '@/utils/security/secureStorage';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthCleanup } from '@/hooks/auth/useAuthCleanup';
import { useAuthActions } from '@/hooks/auth/useAuthActions';

const logger = createLogger('AuthProvider');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    session,
    setSession,
    userRole,
    setUserRole,
    loading,
    setLoading,
    fetchUserRole
  } = useAuthState();

  const { cleanupAuthState } = useAuthCleanup();
  const { signIn, signUp, signOut } = useAuthActions(cleanupAuthState, fetchUserRole);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Store session securely
          await SecureStorage.setSecure('auth_session', {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          });
          
          // Defer role fetching to prevent deadlocks
          setTimeout(async () => {
            const role = await fetchUserRole(session.user.id);
            setUserRole(role);
          }, 0);
        } else {
          setUserRole(null);
          SecureStorage.removeSecure('auth_session');
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole, setUser, setSession, setUserRole, setLoading]);

  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff' || isAdmin;

  const value = {
    user,
    session,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
