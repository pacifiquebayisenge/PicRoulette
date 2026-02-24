/* eslint-disable no-unused-vars */
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

// Add push event listener
self.addEventListener('push', (event) => {
  let notification = { title: 'Pic Roulette', body: '' };

  if (event.data) {
    try {
      notification = event.data.json();
    } catch {
      notification = { title: 'Pic Roulette', body: event.data.text() };
    }
  }

  const options = {
    body: notification.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      ...((notification.data && typeof notification.data === 'object') ? notification.data : {}),
    },
    actions: notification.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(notification.title || 'Pic Roulette', options)
  );
});


// Add notification click event listener
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
