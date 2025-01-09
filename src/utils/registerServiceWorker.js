import { createApp } from 'vue'

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    let refreshing = false

    // Create update prompt component
    const updatePrompt = (await import('@/components/alerts/UpdatePrompt.vue')).default
    const updatePromptComponent = createApp(updatePrompt).mount(document.createElement('div'))
    document.body.appendChild(updatePromptComponent.$el)

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service Worker registered:', registration)

      // Immediately check for updates
      console.log('Checking for updates...')
      await registration.update()

      if (registration.waiting) {
        const shouldUpdate = await updatePromptComponent.showPrompt()
        if (shouldUpdate) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }

      registration.addEventListener('updatefound', () => {
        console.log('update found => installing ...')
        const newWorker = registration.installing

        newWorker.addEventListener('statechange', async () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            const shouldUpdate = await updatePromptComponent.showPrompt()
            if (shouldUpdate) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          }
        })
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}
