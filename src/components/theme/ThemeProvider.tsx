
import * as React from "react";

// Create a context for theme management
export const ThemeContext = React.createContext<{
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}>({
  theme: 'system',
  setTheme: () => null
});

/**
 * Custom theme provider that handles theme switching internally
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('system');
  
  React.useEffect(() => {
    console.log('[ThemeProvider]: Initializing theme provider');
    
    // Check if theme preference exists in localStorage
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null;
    
    if (savedTheme) {
      handleThemeChange(savedTheme);
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      handleThemeChange(prefersDark ? 'dark' : 'light');
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);
  
  const handleThemeChange = React.useCallback((newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const contextValue = React.useMemo(() => {
    return {
      theme,
      setTheme: handleThemeChange
    };
  }, [theme, handleThemeChange]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
