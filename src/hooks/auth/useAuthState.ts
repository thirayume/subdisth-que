
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useAuthState');

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return {
    user,
    setUser,
    session,
    setSession,
    userRole,
    setUserRole,
    loading,
    setLoading,
    fetchUserRole
  };
};
