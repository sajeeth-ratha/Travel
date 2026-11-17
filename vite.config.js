import { resolve } from 'path'
import { defineConfig } from 'vite'

// Multi-page Vite configuration for Travel Agency Web Application
export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        packages: resolve(__dirname, 'packages.html'),
        package: resolve(__dirname, 'package.html'),
        rooms: resolve(__dirname, 'rooms.html'),
        room: resolve(__dirname, 'room.html'),
        bookings: resolve(__dirname, 'bookings.html'),
        login: resolve(__dirname, 'login.html'),
        panel: resolve(__dirname, 'panel.html'),
        admin: resolve(__dirname, 'admin.html'),
        wishlist: resolve(__dirname, 'wishlist.html')
      }
    }
  }
})
