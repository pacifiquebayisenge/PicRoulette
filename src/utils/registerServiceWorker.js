import { createApp } from 'vue'
import { installPrompt } from './installPrompt'

// import { createDiscreteApi } from 'naive-ui'
// import { h } from 'vue'

// Create a discrete API instance for dialogs
// const { dialog } = createDiscreteApi(['dialog'])

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
      console.log('Service Worker registered:')
      console.log('install prompt?')

      installPrompt()

      // let deferredPrompt = null

      // // Utility to detect iOS
      // let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

      // window.addEventListener('beforeinstallprompt', (e) => {
      //   console.log('beforeinstallprompt fired')
      //   e.preventDefault() // Prevent the mini-infobar from appearing on mobile
      //   deferredPrompt = e // Store the event for later use

      //   // Show the install prompt with a delay

      //   // Display the dialog after 5 seconds
      //   setTimeout(() => {
      //     if (isIOS()) {
      //       // Show a custom dialog for iOS
      //       dialog.info({
      //         title: 'Install Pic Roulette',
      //         content: () => {
      //           return h('div', [
      //             h('p', 'Open this app in Safari:'),
      //             h('p', ['Tap the ', h('span', 'Share'), ' button in your browser toolbar.']),
      //             h('p', ['Select ', h('span', 'Add to Home Screen'), ' from the menu.'])
      //           ])
      //         },
      //         positiveText: 'Got it!',
      //         bordered: true,
      //         class: 'install-dialog-container',
      //         showIcon: false,
      //         onPositiveClick: () => {
      //           console.log('User acknowledged iOS install instructions')
      //         }
      //       })
      //     } else if (deferredPrompt) {
      //       // Show the default install dialog
      //       dialog.info({
      //         title: 'Install Pic Roulette',
      //         content: 'Click here to install Pic Roulette on your device',
      //         positiveText: 'Install',
      //         bordered: true,
      //         class: 'install-dialog-container',
      //         showIcon: false,
      //         onPositiveClick: () => {
      //           if (!deferredPrompt) return

      //           // Show the native install prompt
      //           deferredPrompt.prompt()

      //           deferredPrompt.userChoice.then((choiceResult) => {
      //             console.log(
      //               choiceResult.outcome === 'accepted'
      //                 ? 'User accepted the install prompt'
      //                 : 'User dismissed the install prompt'
      //             )
      //             deferredPrompt = null // Reset the prompt
      //           })
      //         }
      //       })
      //     }
      //   }, 3000) // 3-second delay
      // })

      // window.addEventListener('appinstalled', (event) => {
      //   console.log('App installed', event)
      // })

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
