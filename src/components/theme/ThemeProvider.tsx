
import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Diagnostic: Only log on mount to ensure this provider is used.
  React.useEffect(() => {
    console.log('[ThemeProvider]: Local Vite+Tailwind ThemeProvider is being used (NO next-themes).');
  }, []);
  return <>{children}</>;
}
