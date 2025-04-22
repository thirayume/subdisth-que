
/**
 * ThemeProvider for Vite+React with Tailwind CSS dark mode.
 * This is a no-op. There should be NO references to next-themes in this file or elsewhere.
 */

import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Do not reference next-themes, as this project uses Tailwind's class-based dark mode.
  return <>{children}</>;
}
