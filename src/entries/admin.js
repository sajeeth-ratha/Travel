import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/admin.css'
import { initStorage } from '../lib/data.js'
import AdminView from '../views/AdminView.vue'

initStorage()
createApp(AdminView).mount('#app')
