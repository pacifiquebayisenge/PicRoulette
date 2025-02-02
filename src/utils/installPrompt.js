import { createDiscreteApi } from 'naive-ui'
import { h } from 'vue'

// Create a discrete API instance for dialogs
const { dialog } = createDiscreteApi(['dialog'])

let deferredPrompt = null

// Utility to detect iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function showInstallPrompt() {
  
  // Display the dialog after 5 seconds
  setTimeout(() => {
    if (isIOS()) {
      console.log('LAUNCH IOS PROMPT ?')
      // Show a custom dialog for iOS
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
        showIcon: false,
        onPositiveClick: () => {
          console.log('User acknowledged iOS install instructions')
        }
      })
    } else if (deferredPrompt) {
      // Show the default install dialog
      dialog.info({
        title: 'Install Pic Roulette',
        content: 'Click here to install Pic Roulette on your device',
        positiveText: 'Install',
        bordered: true,
        class: 'install-dialog-container',
        showIcon: false,
        onPositiveClick: () => {
          handleInstallClick()
        }
      })
    }
  }, 3000) // 3-second delay
}

function handleInstallClick() {
  if (!deferredPrompt) return

  // Show the native install prompt
  deferredPrompt.prompt()

  deferredPrompt.userChoice.then((choiceResult) => {
    console.log(
      choiceResult.outcome === 'accepted'
        ? 'User accepted the install prompt'
        : 'User dismissed the install prompt'
    )
    deferredPrompt = null // Reset the prompt
  })
}

function installPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt fired')
    e.preventDefault() // Prevent the mini-infobar from appearing on mobile
    deferredPrompt = e // Store the event for later use

    showInstallPrompt() // Show the install prompt with a delay
  })

  window.addEventListener('appinstalled', (event) => {
    console.log('App installed', event)
  })
}

export { installPrompt }
