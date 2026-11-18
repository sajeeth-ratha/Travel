import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/panel.css'
import { initStorage } from '../lib/data.js'
import PanelView from '../views/PanelView.vue'

initStorage()
createApp(PanelView).mount('#app')
