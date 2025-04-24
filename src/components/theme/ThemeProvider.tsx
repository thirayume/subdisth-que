
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => null,
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeProviderContent>
        {children}
      </ThemeProviderContent>
    </NextThemesProvider>
  );
}

const ThemeProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme = 'system', setTheme } = useNextTheme();
  
  const value = React.useMemo(() => ({
    theme: theme as Theme,
    setTheme: (newTheme: Theme) => setTheme(newTheme),
  }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
