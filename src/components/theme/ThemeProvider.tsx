
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
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
  const context = React.useContext(NextThemesProvider);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return {
    theme: context.theme as Theme,
    setTheme: context.setTheme as (theme: Theme) => void
  };
};

