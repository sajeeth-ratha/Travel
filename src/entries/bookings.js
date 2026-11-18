import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/bookings.css'
import { initStorage } from '../lib/data.js'
import BookingsView from '../views/BookingsView.vue'

initStorage()
createApp(BookingsView).mount('#app')
