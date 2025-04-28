
// This is the main service worker file
// Service worker specific globals
const CACHE_NAME = 'queueconnect-pharmacy-v1.3';
const OFFLINE_URL = '/offline.html';

// Install service worker and cache the essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[ServiceWorker] Caching essential offline assets');
      
      // Cache essential assets individually with error handling
      const essentialAssets = [
        '/offline.html',
        '/favicon.ico'
      ];
      
      // Cache each asset individually with error handling
      for (const asset of essentialAssets) {
        try {
          await cache.add(new Request(asset, { cache: 'reload' }));
          console.log(`[ServiceWorker] Asset cached successfully: ${asset}`);
        } catch (error) {
          console.error(`[ServiceWorker] Failed to cache asset ${asset}:`, error);
          // Continue despite errors - don't block installation
        }
      }
      
      console.log('[ServiceWorker] Essential assets caching attempted');
    })()
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Clean up old caches when new service worker activates
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported
      if ('navigationPreload' in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (error) {
          console.error('[ServiceWorker] Navigation preload error:', error);
        }
      }
      
      // Clean up old cache versions
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
      console.log('[ServiceWorker] Activated and claimed clients');
    })()
  );
  // Tell the active service worker to take control of the page immediately
  self.clients.claim();
});

// Simplified fetch handler - use network first with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses
        if (response.ok && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            try {
              cache.put(event.request, responseToCache);
            } catch (error) {
              console.error('[ServiceWorker] Failed to cache response:', error);
            }
          });
        }
        return response;
      })
      .catch(async () => {
        // Try to get from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(OFFLINE_URL) || new Response('Offline content not available', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        // Return empty response for other resources
        return new Response('', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Listen for message events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
