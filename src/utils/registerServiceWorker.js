// src/utils/registerServiceWorker.js
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
  
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
  
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);
  
        // Immediately check for updates
        console.log('Checking for updates...');
        await registration.update();
  
        if (registration.waiting) {
          const updatePrompt = confirm('A new version is available. Would you like to update?');
          if (updatePrompt) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
  
        registration.addEventListener('updatefound', () => {
          console.log('update found => installing ...');
          const newWorker = registration.installing;
  
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              const updatePrompt = confirm('A new version is available. Would you like to update?');
              if (updatePrompt) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }