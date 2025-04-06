
// This file is a wrapper for the TypeScript service worker
// It's needed because service workers must be in the root public folder

// Correctly use the self context for the service worker
self.importScripts('/src/serviceWorker.ts');
