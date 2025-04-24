
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Custom hook to use the theme
export const useTheme = () => {
  const { theme, setTheme } = React.useMemo(() => {
    try {
      // Dynamic import to avoid SSR issues
      const { useTheme: useNextThemes } = require("next-themes");
      return { 
        theme: useNextThemes().theme as 'dark' | 'light' | 'system', 
        setTheme: useNextThemes().setTheme as (theme: 'dark' | 'light' | 'system') => void
      };
    } catch (e) {
      console.error("Error using next-themes:", e);
      return { 
        theme: 'system' as const, 
        setTheme: () => null 
      };
    }
  }, []);

  return { theme, setTheme };
};

// Create a context for backwards compatibility
export const ThemeContext = React.createContext<{
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}>({
  theme: 'system',
  setTheme: () => null
});
