import { createApp } from 'vue'
import '../styles/style.css'
import '../styles/wishlist.css'
import { initStorage } from '../lib/data.js'
import WishlistView from '../views/WishlistView.vue'

initStorage()
createApp(WishlistView).mount('#app')
