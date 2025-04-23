
import * as React from "react";

/**
 * Custom theme provider that doesn't rely on next-themes.
 * This prevents the "Cannot read properties of null (reading 'useContext')" error.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Simple implementation that doesn't depend on any external context
  React.useEffect(() => {
    console.log('[ThemeProvider]: Using custom theme provider.');
    
    // You can implement actual theme switching logic here if needed
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return <>{children}</>;
}

// If you need theme-related utilities, you can add them here
export const useTheme = () => {
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('system');
  
  const setThemeValue = React.useCallback((newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return { theme, setTheme: setThemeValue };
};
