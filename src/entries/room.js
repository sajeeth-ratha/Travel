import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/package.css'
import '../styles/room.css'
import { initStorage } from '../lib/data.js'
import RoomDetailView from '../views/RoomDetailView.vue'

initStorage()
createApp(RoomDetailView).mount('#app')
