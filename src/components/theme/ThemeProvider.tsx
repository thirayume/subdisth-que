
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
  
  // Use try/catch to avoid errors during server-side rendering
  let theme, setTheme;
  try {
    const nextThemes = require("next-themes");
    const themeData = nextThemes.useTheme();
    theme = themeData.theme;
    setTheme = themeData.setTheme;
  } catch (err) {
    console.error("Error loading theme:", err);
    theme = "light";
    setTheme = () => console.warn("Theme setter not available");
  }
  
  // Only access theme after component mounts to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    console.log("[ThemeProvider] Component mounted, theme:", theme);
  }, [theme]);
  
  return {
    theme: mounted ? (theme as Theme || "light") : "light",
    setTheme: (newTheme: Theme) => {
      console.log("[ThemeProvider] Setting theme to:", newTheme);
      try {
        setTheme(newTheme);
      } catch (err) {
        console.error("Error setting theme:", err);
      }
    }
  };
};
