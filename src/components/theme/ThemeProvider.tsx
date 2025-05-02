"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

// Ensure React is imported correctly
if (typeof window !== "undefined" && !window.React) {
  window.React = React;
}

export type Theme = 'dark' | 'light' | 'system';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Create a separate component that uses the next-themes hook
function ThemeStateProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  
  // Make the theme context available to our custom hook
  React.useEffect(() => {
    if (theme) {
      window.__themeState = {
        theme: theme as Theme,
        setTheme: (newTheme: Theme) => setTheme(newTheme)
      };
      window.dispatchEvent(new CustomEvent("theme-change"));
    }
  }, [theme, setTheme]);
  
  return <>{children}</>;
}

// Augment the Window interface to include our theme state
declare global {
  interface Window {
    __themeState?: {
      theme: Theme;
      setTheme: (theme: Theme) => void;
    };
  }
}

// Our custom hook that doesn't call hooks inside effects
export const useTheme = () => {
  const [themeState, setThemeState] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);
  
  // Handle initial setup and subscribe to theme changes
  React.useEffect(() => {
    const updateTheme = () => {
      if (window.__themeState) {
        setThemeState(window.__themeState.theme);
      }
    };
    
    // Set initial state
    updateTheme();
    setMounted(true);
    
    // Listen for changes
    window.addEventListener("theme-change", updateTheme);
    
    return () => {
      window.removeEventListener("theme-change", updateTheme);
    };
  }, []);
  
  // Function to set the theme
  const setTheme = React.useCallback((newTheme: Theme) => {
    console.log("[ThemeProvider] Setting theme to:", newTheme);
    
    if (window.__themeState) {
      window.__themeState.setTheme(newTheme);
      setThemeState(newTheme);
    }
  }, []);
  
  return {
    theme: mounted ? themeState : "light",
    setTheme
  };
};

// Export a combined provider that includes both providers
export const CombinedThemeProvider = ({ children, ...props }: ThemeProviderProps) => (
  <ThemeProvider {...props}>
    <ThemeStateProvider>{children}</ThemeStateProvider>
  </ThemeProvider>
);