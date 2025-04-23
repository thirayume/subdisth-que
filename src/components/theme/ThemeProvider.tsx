
/**
 * ThemeProvider for Vite+React with Tailwind CSS dark mode.
 * This is a no-op. There should be NO references to next-themes in this file or elsewhere.
 */

// Diagnostic log to ensure this provider is used, not one from next-themes
import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Diagnostic: only log on mount
  React.useEffect(() => {
    console.log('[ThemeProvider]: Local Vite+Tailwind ThemeProvider is being used.');
  }, []);
  return <>{children}</>;
}

