// src/components/LineLoginButton.tsx
import React, { useCallback } from 'react';
import { lineService } from '../services/line.service';

interface LineLoginButtonProps {
  onSuccess?: (token: string, userId: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const LineLoginButton: React.FC<LineLoginButtonProps> = ({ 
  onSuccess,
  className,
  children 
}) => {
  const handleLogin = useCallback(() => {
    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('lineLoginState', state);
    
    // Generate and redirect to LINE login URL
    const loginUrl = lineService.generateLoginUrl(state);
    window.location.href = loginUrl;
  }, []);

  return (
    <button 
      className={`line-login-button ${className || ''}`}
      onClick={handleLogin}
      type="button"
      style={{
        backgroundColor: '#06C755',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {children || 'Log in with LINE'}
    </button>
  );
};

export default LineLoginButton;