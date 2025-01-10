import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import naive from 'naive-ui'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'

import { registerServiceWorker } from './utils/registerServiceWorker' 

import VConsole from 'vconsole';

inject()
injectSpeedInsights()

const app = createApp(App)

app.use(router)
app.use(naive)

app.mount('#app')

registerServiceWorker()




// eslint-disable-next-line no-unused-vars
const vConsole = new VConsole();