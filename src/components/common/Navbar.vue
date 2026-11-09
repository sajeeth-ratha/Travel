<template>
  <!-- Hotels.com Style Clean Navigation Header (No Gradients, Light Blue Accents, Zero Emojis) -->
  <header class="sticky top-0 z-40 bg-white border-b border-slate-200 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        
        <!-- Brand Logo -->
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center shadow-xs">
            <AppIcon name="plane" class="w-5 h-5 text-white" />
          </div>
          <div class="leading-none">
            <span class="text-xl font-bold tracking-tight text-slate-900">
              wanderlust<span class="text-primary-600">.</span>
            </span>
            <span class="block text-[10px] font-medium tracking-wide text-slate-500 uppercase mt-0.5">
              Stays & Packages
            </span>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8">
          <router-link
            to="/packages"
            class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            active-class="text-primary-600 font-semibold"
          >
            Explore Packages
          </router-link>

          <router-link
            to="/bookings"
            class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            active-class="text-primary-600 font-semibold"
          >
            My Bookings
          </router-link>

          <router-link
            to="/wishlist"
            class="relative text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors flex items-center gap-1.5"
            active-class="text-primary-600 font-semibold"
          >
            <AppIcon name="heart" class="w-4 h-4 text-slate-500 hover:text-rose-500 transition-colors" />
            <span>Saved</span>
            <span
              v-if="wishlistCount > 0"
              class="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white"
            >
              {{ wishlistCount }}
            </span>
          </router-link>
        </nav>

        <!-- Right Side Utility Controls (Currency, Presentation, Admin Switch) -->
        <div class="hidden md:flex items-center gap-3">
          <!-- Currency Selector -->
          <div class="relative">
            <select
              :value="currentCurrency"
              @change="onCurrencyChange($event.target.value)"
              class="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2 pl-3 pr-7 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
                {{ c.code }} ({{ c.symbol }})
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <AppIcon name="chevron-down" class="w-3 h-3" />
            </div>
          </div>

          <!-- Admin Portal Switch -->
          <router-link
            to="/admin"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <AppIcon name="building" class="w-3.5 h-3.5 text-slate-300" />
            <span>Admin Portal</span>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center gap-2 md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            <AppIcon :name="mobileMenuOpen ? 'x' : 'sliders'" class="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Dropdown Navigation -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
      <router-link
        to="/"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-medium text-slate-800 hover:text-primary-600"
      >
        Home
      </router-link>
      <router-link
        to="/packages"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-medium text-slate-800 hover:text-primary-600"
      >
        Explore Packages
      </router-link>
      <router-link
        to="/bookings"
        @click="mobileMenuOpen = false"
        class="block py-2 text-sm font-medium text-slate-800 hover:text-primary-600"
      >
        My Bookings
      </router-link>
      <router-link
        to="/wishlist"
        @click="mobileMenuOpen = false"
        class="flex items-center justify-between py-2 text-sm font-medium text-slate-800 hover:text-primary-600"
      >
        <span>Saved Packages</span>
        <span v-if="wishlistCount > 0" class="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
          {{ wishlistCount }}
        </span>
      </router-link>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs font-medium text-slate-500">Currency</span>
        <select
          :value="currentCurrency"
          @change="onCurrencyChange($event.target.value)"
          class="bg-slate-100 border border-slate-200 text-slate-800 text-xs py-1 px-2.5 rounded-lg"
        >
          <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
            {{ c.code }} ({{ c.symbol }})
          </option>
        </select>
      </div>

      <router-link
        to="/admin"
        @click="mobileMenuOpen = false"
        class="block w-full text-center py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
      >
        Enter Agency Admin Portal
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { CURRENCIES, currentCurrency, setCurrency } from '../../services/currencyService.js'
import { getWishlist } from '../../services/storageService.js'
import AppIcon from './AppIcon.vue'

const mobileMenuOpen = ref(false)
const wishlistCount = ref(0)

function updateWishlistCount() {
  wishlistCount.value = getWishlist().length
}

function onCurrencyChange(code) {
  setCurrency(code)
}

let intervalId = null

onMounted(() => {
  updateWishlistCount()
  intervalId = setInterval(updateWishlistCount, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
