
import * as React from "react";

/**
 * Tailwind theme provider (noop).
 * This provider does nothing but logs to console - it's for Tailwind dark mode only.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    console.log('[ThemeProvider]: Using Tailwind class dark mode. next-themes NOT in use.');
  }, []);
  return <>{children}</>;
}
