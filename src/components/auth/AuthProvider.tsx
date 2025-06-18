import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import SecureStorage from '@/utils/security/secureStorage';
import { RateLimiter } from '@/utils/security/sanitization';

const logger = createLogger('AuthProvider');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  isAdmin: false,
  isStaff: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanupAuthState = useCallback(() => {
    SecureStorage.clearAuthData();
  }, []);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user role:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      logger.error('Error in fetchUserRole:', error);
      return null;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const clientId = `${email}_${Date.now()}`;
    
    // Rate limiting check
    if (!RateLimiter.isAllowed(email, 5, 15 * 60 * 1000)) {
      const remainingTime = Math.ceil(RateLimiter.getRemainingTime(email) / 1000 / 60);
      return { 
        error: { 
          message: `Too many login attempts. Please try again in ${remainingTime} minutes.` 
        } 
      };
    }

    try {
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        logger.error('Sign in error:', error);
        return { error };
      }

      if (data.user) {
        RateLimiter.reset(email); // Reset rate limiting on success
        
        // Store session securely
        if (data.session) {
          await SecureStorage.setSecure('auth_session', {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
          });
        }

        // Fetch user role
        setTimeout(async () => {
          const role = await fetchUserRole(data.user.id);
          setUserRole(role);
        }, 0);
      }

      return { error: null };
    } catch (error) {
      logger.error('Sign in error:', error);
      return { error };
    }
  }, [cleanupAuthState, fetchUserRole]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      cleanupAuthState();

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName.trim() } : undefined
        }
      });

      if (error) {
        logger.error('Sign up error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      logger.error('Sign up error:', error);
      return { error };
    }
  }, [cleanupAuthState]);

  const signOut = useCallback(async () => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      logger.error('Sign out error:', error);
      window.location.href = '/auth';
    }
  }, [cleanupAuthState]);

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
  }, [fetchUserRole]);

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
