
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => null,
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<Theme>('system');
  
  // Fix for hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const value = React.useMemo(() => ({
    theme: currentTheme,
    setTheme: (newTheme: Theme) => {
      setCurrentTheme(newTheme);
    }
  }), [currentTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        onValueChange={(theme) => setCurrentTheme(theme as Theme)}
        {...props}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  
  if (context === null || context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
