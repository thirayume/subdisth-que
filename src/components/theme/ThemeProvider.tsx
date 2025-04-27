
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

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

export const useTheme = () => {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = require("next-themes").useTheme();
  
  // Only access theme after component mounts to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  return {
    theme: mounted ? (theme as Theme || "light") : "light",
    setTheme: (newTheme: Theme) => {
      try {
        setTheme(newTheme);
      } catch (err) {
        console.error("Error setting theme:", err);
      }
    }
  };
};
