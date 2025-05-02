
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
  
  // Use React.useState for theme state to avoid hydration issues
  const [themeState, setThemeState] = React.useState<Theme>("light");
  
  // Effect to handle theme initialization
  React.useEffect(() => {
    try {
      // Import next-themes only on client side to prevent SSR issues
      const { useTheme } = require("next-themes");
      const { theme, setTheme } = useTheme();
      
      if (theme) {
        setThemeState(theme as Theme);
      }
      
      // Update mounted state
      setMounted(true);
      console.log("[ThemeProvider] Component mounted, theme:", theme);
      
      // Set up a listener for theme changes
      const handleThemeChange = () => {
        const { theme } = useTheme();
        setThemeState(theme as Theme || "light");
      };
      
      window.addEventListener("theme-change", handleThemeChange);
      
      return () => {
        window.removeEventListener("theme-change", handleThemeChange);
      };
    } catch (err) {
      console.error("Error loading theme:", err);
      setMounted(true);
    }
  }, []);
  
  return {
    theme: mounted ? themeState : "light",
    setTheme: (newTheme: Theme) => {
      console.log("[ThemeProvider] Setting theme to:", newTheme);
      try {
        const { useTheme } = require("next-themes");
        const { setTheme } = useTheme();
        setTheme(newTheme);
        setThemeState(newTheme);
        
        // Dispatch a custom event to notify about theme changes
        window.dispatchEvent(new CustomEvent("theme-change"));
      } catch (err) {
        console.error("Error setting theme:", err);
      }
    }
  };
};
