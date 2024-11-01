import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import naive from 'naive-ui'
import { inject } from '@vercel/analytics'

inject()

const app = createApp(App)

app.use(router)
app.use(naive)

app.mount('#app')
