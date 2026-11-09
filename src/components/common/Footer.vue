<template>
  <!-- Hotels.com Style Clean Application Footer -->
  <footer class="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Top Grid: Agency Profile, Quick Navigation, Newsletter Promo -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        
        <!-- Column 1: Brand & Trust -->
        <div class="md:col-span-1 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
              <AppIcon name="plane" class="w-4 h-4 text-white" />
            </div>
            <span class="text-xl font-bold tracking-tight text-white">wanderlust.</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Your trusted global platform for hand-picked travel packages and stays. Transparent pricing, verified guest reviews, and instant reservation vouchers.
          </p>
          <div class="flex items-center gap-2 text-xs text-primary-400 font-medium">
            <AppIcon name="shield" class="w-4 h-4 text-primary-400" />
            <span>Secure Simulated Reservation Engine</span>
          </div>
        </div>

        <!-- Column 2: Quick Links -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200">Explore Stays</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li>
              <router-link to="/packages" class="hover:text-primary-400 transition-colors">All Travel Packages</router-link>
            </li>
            <li>
              <router-link to="/bookings" class="hover:text-primary-400 transition-colors">Manage My Bookings</router-link>
            </li>
            <li>
              <router-link to="/wishlist" class="hover:text-primary-400 transition-colors">Saved Destinations</router-link>
            </li>
            <li>
              <router-link to="/admin" class="hover:text-primary-400 transition-colors">Agency Operations Portal</router-link>
            </li>
          </ul>
        </div>

        <!-- Column 3: Top Travel Themes -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200">Popular Destinations</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li>Santorini, Greece (Cyclades)</li>
            <li>Kyoto, Japan (Kansai Region)</li>
            <li>Zermatt & Interlaken, Switzerland</li>
            <li>Serengeti National Park, Tanzania</li>
            <li>Positano & Amalfi Coast, Italy</li>
          </ul>
        </div>

        <!-- Column 4: Newsletter Promo Code Box -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-200">Exclusive Member Deals</h4>
          <p class="text-xs text-slate-400 leading-relaxed">
            Sign up for instant discounts. Use promo code <span class="text-sky-300 font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded">SUMMER2026</span> at checkout for 15% off.
          </p>
          <form @submit.prevent="handleSubscribe" class="flex flex-col gap-2">
            <input
              v-model="emailInput"
              type="email"
              placeholder="Enter your email address"
              required
              class="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              class="py-2 px-3 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-xs"
            >
              Get 10% Welcome Coupon
            </button>
          </form>
        </div>

      </div>

      <!-- Bottom Bar: Academic Project Attribution -->
      <div class="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>
          © 2026 Wanderlust Travel Agency Web Application. Built with HTML5, CSS3, JavaScript & Vue.js.
        </p>
        <div class="flex items-center gap-4">
          <span class="inline-flex items-center gap-1.5 text-slate-400">
            <AppIcon name="credit-card" class="w-3.5 h-3.5" />
            <span>Simulated Checkout Sandbox</span>
          </span>
          <span class="text-slate-700">|</span>
          <span class="inline-flex items-center gap-1.5 text-slate-400">
            <AppIcon name="shield" class="w-3.5 h-3.5" />
            <span>Browser LocalStorage Data</span>
          </span>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from '../../services/toastService.js'
import AppIcon from './AppIcon.vue'

const emailInput = ref('')

function handleSubscribe() {
  if (emailInput.value) {
    showToast(`Welcome! Use code 'WELCOME10' at checkout for 10% off your booking.`, 'success', 5000)
    emailInput.value = ''
  }
}
</script>
