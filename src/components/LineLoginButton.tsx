// src/components/LineLoginButton.tsx
import React, { useCallback } from 'react';
import { LineLoginButtonProps } from '../components/settings/types';
import { lineService } from '../services/line.service';

export const LineLoginButton: React.FC<LineLoginButtonProps> = ({ 
  className,
  children,
  state = Math.random().toString(36).substring(2, 15)
}) => {
  const handleLogin = useCallback(() => {
    // Store state in localStorage or sessionStorage for verification upon return
    sessionStorage.setItem('lineLoginState', state);
    
    // Generate and redirect to LINE login URL
    const loginUrl = lineService.generateLoginUrl(state);
    window.location.href = loginUrl;
  }, [state]);

  return (
    <button 
      className={`line-login-button ${className || ''}`}
      onClick={handleLogin}
      type="button"
    >
      {children || 'Log in with LINE'}
    </button>
  );
};
