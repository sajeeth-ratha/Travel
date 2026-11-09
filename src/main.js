import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/main.css'

// Mount Vue 3 Single Page Application
const app = createApp(App)
app.use(router)
app.mount('#app')
