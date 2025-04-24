
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

// Make sure useTheme is properly wrapped and protected
export const useTheme = () => {
  try {
    // Import inside the function to prevent hook initialization issues
    const { useTheme: useNextTheme } = require("next-themes");
    
    // Make this safe with error handling
    const { theme, setTheme } = useNextTheme() || { theme: "system", setTheme: () => {} };
    
    return {
      theme: (theme || "system") as Theme,
      setTheme: (newTheme: Theme) => {
        try {
          setTheme(newTheme);
        } catch (err) {
          console.error("Error setting theme:", err);
        }
      }
    };
  } catch (err) {
    console.error("Error in useTheme hook:", err);
    // Return a fallback to prevent app crashes
    return {
      theme: "system" as Theme,
      setTheme: () => console.warn("Theme functionality unavailable")
    };
  }
};
