
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Enforce a single React instance
      jsxImportSource: 'react'
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force all React imports to resolve to the single root instance
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      // Also alias next-themes to ensure it uses the same React
      "next-themes": path.resolve(__dirname, "node_modules/next-themes"),
      // Ensure sonner uses the same React
      "sonner": path.resolve(__dirname, "node_modules/sonner")
    },
    dedupe: ['react', 'react-dom', '@radix-ui/react-toast', 'next-themes', 'sonner'] // Ensure React is deduped
  },
  build: {
    // Generate source maps for production
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minify configuration
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        // Remove debugger statements in production
        drop_debugger: true,
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query',
            'next-themes',  // Add next-themes here
            'sonner'        // Add sonner here
          ],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          charts: ['recharts']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'next-themes', 'sonner'],
    force: true // Force dependency pre-bundling
  }
}));
