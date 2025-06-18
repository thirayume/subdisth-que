
import { useCallback } from 'react';
import SecureStorage from '@/utils/security/secureStorage';

export const useAuthCleanup = () => {
  const cleanupAuthState = useCallback(() => {
    SecureStorage.clearAuthData();
  }, []);

  return { cleanupAuthState };
};
