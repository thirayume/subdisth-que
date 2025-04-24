
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export type Theme = 'dark' | 'light' | 'system';

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

export const useTheme = () => {
  // Use the built-in hook from next-themes
  const { theme, setTheme } = useNextTheme();
  
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return {
    theme: theme as Theme,
    setTheme: (newTheme: Theme) => setTheme(newTheme)
  };
};

