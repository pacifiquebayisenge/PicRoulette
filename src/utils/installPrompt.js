import { createDiscreteApi } from 'naive-ui'
const { dialog } = createDiscreteApi(['dialog'])

import { h } from 'vue'

// Create a discrete API instance for dialogs


let deferredPrompt = null

// Utility to detect iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function showInstallPrompt() {
  setTimeout(() => {
    if (isIOS()) {
      // Show iOS instructions
      dialog.info({
        title: 'Install Pic Roulette',
        content: () => {
          return h('div', [
            h('p', 'Open this app in Safari:'),
            h('p', [
              'Tap the ',
              h('span', 'Share'),
              ' button in your browser toolbar.'
            ]),
            h('p', [
              'Select ',
              h('span', 'Add to Home Screen'),
              ' from the menu.'
            ])
          ])
        },
        positiveText: 'Got it!',
        bordered: true,
        class: 'install-dialog-container',
        showIcon: false
      })
    } else if (deferredPrompt) {
      // Directly trigger the browser's install prompt
      deferredPrompt.prompt()
      
      deferredPrompt.userChoice.then((choiceResult) => {
        console.log(
          choiceResult.outcome === 'accepted'
            ? 'User accepted the install prompt'
            : 'User dismissed the install prompt'
        )
        deferredPrompt = null
      })
    }
  }, 3000) // 3-second delay
}

function installPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt fired')
    e.preventDefault() // Prevent the mini-infobar from appearing on mobile
    deferredPrompt = e // Store the event
    
    showInstallPrompt() // Show the install prompt with delay
  })

  window.addEventListener('appinstalled', (event) => {
    console.log('App installed', event)
  })
}

export { installPrompt }