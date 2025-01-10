import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', 
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest', // Specify injectManifest strategy
      srcDir: 'src', // Source directory where your service-worker.js is located
      filename: 'service-worker.js', // Output file name for the service worker
      registerType: 'prompt',
      publicDir: 'public',
      injectManifest: {
        swSrc: 'src/service-worker.js', // Source service worker file
        swDest: 'dist/service-worker.js' // Destination service worker file
      },
      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      devOptions: {
        enabled: true // Enable PWA in development
      },
      manifest: {
        name: 'Pic Roulette',
        short_name: 'PicRoulette',
        description: 'Picture geussing game',
        theme_color: '#67a8f4',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
