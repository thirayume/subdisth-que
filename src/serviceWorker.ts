
// This service worker can be customized:
// https://developers.google.com/web/tools/workbox/modules/workbox-precaching

// Declare service worker specific globals
declare const self: ServiceWorkerGlobalScope;

type ExtendableEvent = Event & {
  waitUntil(fn: Promise<any>): void;
};

type FetchEvent = ExtendableEvent & {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
};

const CACHE_NAME = 'queueconnect-pharmacy-v1';
const OFFLINE_URL = '/offline.html';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/static/js/main.js',
  '/static/css/main.css',
];

// Install service worker and cache the assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CACHE_ASSETS);
    })()
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Clean up old caches when new service worker activates
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      
      // Clean up old cache versions
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })()
  );
  // Tell the active service worker to take control of the page immediately
  self.clients.claim();
});

// Serve cached content when offline
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported
          const preloadResponse = await (event as any).preloadResponse;
          
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Network failed, try to serve from cache
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If both network and cache fail, show offline page
          const offlineResponse = await cache.match(OFFLINE_URL);
          return offlineResponse || new Response('You are offline and the page is not cached.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        }
      })()
    );
  } else if (event.request.destination === 'image' || 
             event.request.destination === 'style' || 
             event.request.destination === 'script') {
    // Use cache-first strategy for assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then((response) => {
          // Cache important assets for offline use
          if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          
          return response;
        });
      })
    );
  } else {
    // Use network-first for API calls
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});

export {};
