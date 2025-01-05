// service-worker.js
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Clean up old caches
cleanupOutdatedCaches();

// Inject the manifest at build time
precacheAndRoute(self.__WB_MANIFEST);

// Use Cache First for all assets
registerRoute(
  ({ request }) => true,  // Match all requests
  new CacheFirst({
    cacheName: 'app-cache',
  })
);

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting().then(() => {
      clientsClaim();
    });
  }
});