import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/package.css'
import { initStorage } from '../lib/data.js'
import PackageDetailView from '../views/PackageDetailView.vue'

initStorage()
createApp(PackageDetailView).mount('#app')
