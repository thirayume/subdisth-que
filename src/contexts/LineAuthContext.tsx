// src/context/LineAuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { LineState, LineProfile } from '../components/settings/types';
import { lineService } from '../services/line.service';

// Initial state
const initialState: LineState = {
  isAuthenticated: false,
  isAuthenticating: false,
  profile: null,
  error: null,
};

// Action types
type LineAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LineProfile }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

// Context
const LineAuthContext = createContext<{
  state: LineState;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string, state: string) => Promise<void>;
}>({
  state: initialState,
  login: () => {},
  logout: () => {},
  handleCallback: async () => {},
});

// Reducer
const lineAuthReducer = (state: LineState, action: LineAction): LineState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isAuthenticating: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isAuthenticating: false,
        profile: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isAuthenticating: false,
        profile: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

// Provider
export const LineAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(lineAuthReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const lineProfile = localStorage.getItem('lineProfile');
      
      if (lineProfile) {
        try {
          const profile = JSON.parse(lineProfile) as LineProfile;
          dispatch({ type: 'LOGIN_SUCCESS', payload: profile });
        } catch (error) {
          localStorage.removeItem('lineProfile');
        }
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('lineLoginState', state);
    
    const loginUrl = lineService.generateLoginUrl(state);
    window.location.href = loginUrl;
  };

  const logout = () => {
    localStorage.removeItem('lineProfile');
    dispatch({ type: 'LOGOUT' });
  };

  const handleCallback = async (code: string, state: string) => {
    const savedState = sessionStorage.getItem('lineLoginState');
    sessionStorage.removeItem('lineLoginState');
    
    if (state !== savedState) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Invalid state parameter. The request may have been tampered with.' 
      });
      return;
    }

    dispatch({ type: 'LOGIN_START' });

    try {
      const profile = await lineService.handleCallback(code);
      localStorage.setItem('lineProfile', JSON.stringify(profile));
      dispatch({ type: 'LOGIN_SUCCESS', payload: profile });
    } catch (error) {
      console.error('LINE login error:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  };

  return (
    <LineAuthContext.Provider value={{ state, login, logout, handleCallback }}>
      {children}
    </LineAuthContext.Provider>
  );
};

// Hook
export const useLineAuth = () => useContext(LineAuthContext);
