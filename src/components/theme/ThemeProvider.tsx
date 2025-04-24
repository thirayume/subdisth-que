
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export type Theme = 'dark' | 'light' | 'system';

// Create a fallback context to avoid the null context error
const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'system',
  setTheme: () => {}
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add error handling for the ThemeProvider
  try {
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
  } catch (error) {
    console.error("Error in ThemeProvider:", error);
    // Provide a fallback UI in case the ThemeProvider fails
    return (
      <ThemeContext.Provider value={{ theme: 'system', setTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }
}

// Safer implementation of useTheme hook
export const useTheme = () => {
  try {
    // Use dynamic import to ensure the module is loaded properly
    const { useTheme: useNextTheme } = require("next-themes");
    
    // Use React's useEffect to ensure the hook is called during component lifecycle
    const [themeState, setThemeState] = React.useState<{
      theme: Theme;
      setTheme: (theme: Theme) => void;
    }>({
      theme: "system" as Theme,
      setTheme: () => console.warn("Theme functionality initializing...")
    });
    
    React.useEffect(() => {
      try {
        const { theme, setTheme } = useNextTheme();
        setThemeState({
          theme: (theme || "system") as Theme,
          setTheme: (newTheme: Theme) => {
            try {
              setTheme(newTheme);
            } catch (err) {
              console.error("Error setting theme:", err);
            }
          }
        });
      } catch (err) {
        console.error("Error in useTheme effect:", err);
      }
    }, []);
    
    return themeState;
  } catch (err) {
    console.error("Error in useTheme hook:", err);
    // Return a fallback to prevent app crashes
    return {
      theme: "system" as Theme,
      setTheme: () => console.warn("Theme functionality unavailable")
    };
  }
};
