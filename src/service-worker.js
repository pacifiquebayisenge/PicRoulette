// Import the `precacheAndRoute` method from Workbox
import { precacheAndRoute } from 'workbox-precaching';

// Inject the manifest at build time
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
  });
  
  self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
  });
  