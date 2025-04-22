
// ThemeProvider is a no-op since we use Tailwind's dark mode in this Vite app.
// No references to next-themes remain.

import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
