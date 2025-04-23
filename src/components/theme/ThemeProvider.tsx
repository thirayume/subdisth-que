
/**
 * ThemeProvider for Vite+React with Tailwind CSS dark mode.
 * This is a **no-op**.
 * There should be NO references to next-themes in this file or elsewhere.
 */

import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Diagnostic: Only log on mount to ensure this provider is used.
  React.useEffect(() => {
    console.log('[ThemeProvider]: Local Vite+Tailwind ThemeProvider is being used (NO next-themes).');
  }, []);
  return <>{children}</>;
}

// No re-exports, no next-themes usage.
