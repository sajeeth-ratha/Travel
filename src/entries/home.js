import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/home.css'
import { initStorage } from '../lib/data.js'
import HomeView from '../views/HomeView.vue'

initStorage()
createApp(HomeView).mount('#app')
