
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

export const useTheme = () => {
  const [mounted, setMounted] = React.useState(false);
  const [themeState, setThemeState] = React.useState<Theme>("light");
  
  // Effect to handle theme initialization
  React.useEffect(() => {
    try {
      // Import next-themes dynamically
      import("next-themes").then(({ useTheme }) => {
        const { theme } = useTheme();
        
        if (theme) {
          setThemeState(theme as Theme);
        }
        
        setMounted(true);
        console.log("[ThemeProvider] Component mounted, theme:", theme);
        
        // Set up a listener for theme changes
        window.addEventListener("theme-change", () => {
          const { theme } = useTheme();
          setThemeState(theme as Theme || "light");
        });
      });
      
      return () => {
        window.removeEventListener("theme-change", () => {});
      };
    } catch (err) {
      console.error("Error loading theme:", err);
      setMounted(true);
    }
  }, []);
  
  const setTheme = React.useCallback((newTheme: Theme) => {
    console.log("[ThemeProvider] Setting theme to:", newTheme);
    try {
      import("next-themes").then(({ useTheme }) => {
        const { setTheme } = useTheme();
        setTheme(newTheme);
        setThemeState(newTheme);
        
        // Dispatch a custom event to notify about theme changes
        window.dispatchEvent(new CustomEvent("theme-change"));
      });
    } catch (err) {
      console.error("Error setting theme:", err);
    }
  }, []);
  
  return {
    theme: mounted ? themeState : "light",
    setTheme
  };
};
