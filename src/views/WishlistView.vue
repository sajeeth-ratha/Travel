<template>
  <!-- Customer Wishlist / Saved Vacations View (Zero Emojis, No Gradients) -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
          <router-link to="/" class="hover:text-primary-600">Home</router-link>
          <span>/</span>
          <span class="text-slate-900 font-semibold">Saved Wishlist</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <span>Saved Stays & Packages</span>
          <AppIcon name="heart-fill" class="w-6 h-6 text-rose-500" />
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          You have <strong class="text-slate-900">{{ wishlistedPackages.length }}</strong> saved travel itineraries.
        </p>
      </div>

      <!-- Clear All Button -->
      <button
        v-if="wishlistedPackages.length > 0"
        @click="clearAllWishlist"
        class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
      >
        Clear All Saved
      </button>
    </div>

    <!-- Wishlist Packages Grid -->
    <div v-if="wishlistedPackages.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PackageCard
        v-for="pkg in wishlistedPackages"
        :key="pkg.id"
        :pkg="pkg"
        @quick-book="openBookingModal"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="p-16 text-center rounded-2xl bg-white border border-slate-200 space-y-3 max-w-lg mx-auto"
    >
      <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
        <AppIcon name="heart" class="w-6 h-6 text-slate-400" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-slate-900">Your wishlist is currently empty</h3>
        <p class="text-xs text-slate-500">
          Save your favorite itineraries while browsing by clicking the heart icon on any package card.
        </p>
      </div>
      <router-link
        to="/packages"
        class="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-xs"
      >
        Explore Trips & Save Favorites
      </router-link>
    </div>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isBookingModalOpen"
      :pkg="activeBookingPackage"
      @close="isBookingModalOpen = false"
      @view-voucher="onViewVoucher"
    />

    <!-- Voucher Modal -->
    <VoucherModal
      :is-open="isVoucherModalOpen"
      :booking="selectedVoucherBooking"
      @close="isVoucherModalOpen = false"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getPackages, getWishlist } from '../services/storageService.js'
import { showToast } from '../services/toastService.js'
import PackageCard from '../components/packages/PackageCard.vue'
import BookingModal from '../components/booking/BookingModal.vue'
import VoucherModal from '../components/booking/VoucherModal.vue'
import AppIcon from '../components/common/AppIcon.vue'

const allPackages = ref(getPackages())
const wishlistIds = ref(getWishlist())

const isBookingModalOpen = ref(false)
const activeBookingPackage = ref(null)

const isVoucherModalOpen = ref(false)
const selectedVoucherBooking = ref(null)

const wishlistedPackages = computed(() => {
  return allPackages.value.filter(p => wishlistIds.value.includes(p.id))
})

function clearAllWishlist() {
  localStorage.setItem('wanderlust_wishlist', JSON.stringify([]))
  wishlistIds.value = []
  showToast('Wishlist cleared.', 'info')
}

function openBookingModal(pkg) {
  activeBookingPackage.value = pkg
  isBookingModalOpen.value = true
}

function onViewVoucher(booking) {
  selectedVoucherBooking.value = booking
  isVoucherModalOpen.value = true
}
</script>
