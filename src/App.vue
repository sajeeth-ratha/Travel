<template>
  <!-- Root Application Layout -->
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-primary-600 selection:text-white">
    
    <!-- Global Toast Notifications -->
    <Toast />

    <!-- Top Navigation Bar -->
    <Navbar />

    <!-- Dynamic Routed Views -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Global Application Footer -->
    <Footer />

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from './components/common/Navbar.vue'
import Footer from './components/common/Footer.vue'
import Toast from './components/common/Toast.vue'
import { initStorage } from './services/storageService.js'

onMounted(() => {
  // Ensure seed data is initialized on first app visit
  initStorage()
})
</script>
