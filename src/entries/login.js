import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/login.css'
import { initStorage } from '../lib/data.js'
import LoginView from '../views/LoginView.vue'

initStorage()
createApp(LoginView).mount('#app')
