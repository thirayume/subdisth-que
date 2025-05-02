"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
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

// Import these at the top level
import { useTheme as useNextTheme } from "next-themes";

export const useTheme = () => {
  const [mounted, setMounted] = React.useState(false);
  const [themeState, setThemeState] = React.useState<Theme>("light");
  
  // Use the next-themes hook directly (only works in client components)
  const { theme: nextTheme, setTheme: nextSetTheme } = useNextTheme();
  
  // Effect to handle theme initialization
  React.useEffect(() => {
    try {
      if (nextTheme) {
        setThemeState(nextTheme as Theme);
      }
      
      setMounted(true);
      console.log("[ThemeProvider] Component mounted, theme:", nextTheme);
      
      // Set up a listener for theme changes
      const handleThemeChange = () => {
        if (nextTheme) {
          setThemeState(nextTheme as Theme || "light");
        }
      };
      
      window.addEventListener("theme-change", handleThemeChange);
      
      return () => {
        window.removeEventListener("theme-change", handleThemeChange);
      };
    } catch (err) {
      console.error("Error loading theme:", err);
      setMounted(true);
    }
  }, [nextTheme]);
  
  const setTheme = React.useCallback((newTheme: Theme) => {
    console.log("[ThemeProvider] Setting theme to:", newTheme);
    try {
      nextSetTheme(newTheme);
      setThemeState(newTheme);
      
      // Dispatch a custom event to notify about theme changes
      window.dispatchEvent(new CustomEvent("theme-change"));
    } catch (err) {
      console.error("Error setting theme:", err);
    }
  }, [nextSetTheme]);
  
  return {
    theme: mounted ? themeState : "light",
    setTheme
  };
};