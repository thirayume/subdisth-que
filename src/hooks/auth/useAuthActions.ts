
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import SecureStorage from '@/utils/security/secureStorage';
import { RateLimiter } from '@/utils/security/sanitization';

const logger = createLogger('useAuthActions');

export const useAuthActions = (
  cleanupAuthState: () => void,
  fetchUserRole: (userId: string) => Promise<string | null>
) => {
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

  return {
    signIn,
    signUp,
    signOut
  };
};
