import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/packages.css'
import { initStorage } from '../lib/data.js'
import PackagesView from '../views/PackagesView.vue'

initStorage()
createApp(PackagesView).mount('#app')
