
import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // No-op provider: Theme is handled via Tailwind CSS 'dark:' strategy.
  return <>{children}</>;
}
