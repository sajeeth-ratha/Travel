import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/rooms.css'
import { initStorage } from '../lib/data.js'
import RoomsView from '../views/RoomsView.vue'

initStorage()
createApp(RoomsView).mount('#app')
