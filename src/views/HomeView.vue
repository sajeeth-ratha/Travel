<template>
  <!-- Hotels.com Style Home Page View (No Gradients, Light Blue Palette, Clean SVGs) -->
  <div class="space-y-14 pb-20">
    
    <!-- 1. HERO SECTION WITH HOTELS.COM STYLE SEARCH BAR -->
    <section class="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24">
      <!-- High-Resolution Curated Travel Photo (Crisp, High Trust) -->
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
        alt="Coastal travel destination"
        class="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div class="absolute inset-0 bg-slate-900/60"></div>

      <!-- Hero Content Container -->
      <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center sm:text-left">
        
        <!-- Trust Tag -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 border border-white/15 text-xs font-medium">
          <AppIcon name="shield" class="w-3.5 h-3.5 text-primary-400" />
          <span>Curated Travel Packages & Stays with Free Cancellation</span>
        </div>

        <!-- Headline -->
        <div class="space-y-2 max-w-2xl">
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Where to next?
          </h1>
          <p class="text-sm sm:text-base text-slate-200 font-normal">
            Discover verified hotels, curated itineraries, and complete tour packages across the world.
          </p>
        </div>

        <!-- Hotels.com Signature Search Bar Widget -->
        <div class="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200 text-slate-900 max-w-5xl">
          <form @submit.prevent="executeHeroSearch" class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            
            <!-- Segment 1: Destination -->
            <div class="sm:col-span-4 relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600">
              <AppIcon name="pin" class="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <div class="w-full text-left">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1">
                  Destination
                </label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Where are you going? (e.g. Kyoto)"
                  class="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            <!-- Segment 2: Travel Style / Category -->
            <div class="sm:col-span-3 relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600">
              <AppIcon name="building" class="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <div class="w-full text-left">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1">
                  Trip Type
                </label>
                <select
                  v-model="selectedCategory"
                  class="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Cultural">Cultural & Heritage</option>
                  <option value="Adventure & Nature">Adventure & Nature</option>
                  <option value="Beach & Island">Beach & Island</option>
                  <option value="Safari & Wildlife">Safari & Wildlife</option>
                  <option value="Luxury Escapes">Luxury Escapes</option>
                </select>
              </div>
            </div>

            <!-- Segment 3: Region -->
            <div class="sm:col-span-3 relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600">
              <AppIcon name="globe" class="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <div class="w-full text-left">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1">
                  Region
                </label>
                <select
                  v-model="selectedContinent"
                  class="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="All">All Continents</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Americas">Americas</option>
                  <option value="Africa">Africa</option>
                </select>
              </div>
            </div>

            <!-- Segment 4: Search Action Button -->
            <div class="sm:col-span-2">
              <button
                type="submit"
                class="w-full h-full py-3.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <AppIcon name="search" class="w-4 h-4 text-white" />
                <span>Search</span>
              </button>
            </div>

          </form>
        </div>

        <!-- Quick Trending Search Tags -->
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
          <span class="text-slate-400 font-medium">Popular destinations:</span>
          <button
            v-for="tag in ['Santorini', 'Kyoto', 'Swiss Alps', 'Serengeti', 'Bali']"
            :key="tag"
            @click="quickSearchTag(tag)"
            class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
          >
            {{ tag }}
          </button>
        </div>

      </div>
    </section>

    <!-- 2. HOTELS.COM STYLE CATEGORY PILLS -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Explore by Travel Theme</h2>
          <p class="text-xs text-slate-500 mt-0.5">Find vacations tailored to your style of adventure.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          v-for="cat in categories"
          :key="cat.name"
          @click="selectCategoryAndNavigate(cat.name)"
          class="p-4 rounded-xl bg-white border border-slate-200 hover:border-primary-500 hover:shadow-xs cursor-pointer transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-lg bg-sky-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <AppIcon :name="cat.iconName" class="w-5 h-5" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{{ cat.name }}</h4>
            <p class="text-[11px] text-slate-400">{{ cat.count }} Packages</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. FEATURED PACKAGES GRID -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-1.5 text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
            <AppIcon name="star" class="w-3.5 h-3.5 text-amber-500" />
            <span>Top Rated & Guest Favorites</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Featured Travel Packages</h2>
          <p class="text-xs text-slate-500 mt-0.5">Curated itineraries with exceptional guest ratings.</p>
        </div>
        <router-link
          to="/packages"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
        >
          <span>View all {{ allPackages.length }} packages</span>
          <AppIcon name="chevron-right" class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <!-- Packages Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PackageCard
          v-for="pkg in featuredPackages"
          :key="pkg.id"
          :pkg="pkg"
          @quick-book="openBookingModal"
        />
      </div>
    </section>

    <!-- 4. MEMBER PROMOTIONAL BANNER (SOLID LIGHT BLUE, NO GRADIENTS) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl bg-sky-50 border border-sky-200 text-slate-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="space-y-2 max-w-xl text-center md:text-left">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary-600 text-white text-[11px] font-bold">
            <AppIcon name="tag" class="w-3 h-3 text-white" />
            <span>Member Pricing Available</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900">
            Save 15% on All 2026 Escapes
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Apply promotional coupon code <span class="font-mono font-bold text-primary-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">SUMMER2026</span> at simulated checkout to claim your instant discount.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <router-link
            to="/packages"
            class="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Explore Packages
          </router-link>
        </div>
      </div>
    </section>

    <!-- 5. WHY BOOK WITH WANDERLUST (CLEAN TRUST PROPOSITIONS) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-xl mx-auto space-y-1 mb-10">
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Why book with Wanderlust</h2>
        <p class="text-xs text-slate-500">Industry-leading standards for stress-free international travel.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div class="w-10 h-10 rounded-lg bg-sky-50 text-primary-600 flex items-center justify-center">
            <AppIcon name="check-circle" class="w-5 h-5 text-primary-600" />
          </div>
          <h4 class="text-sm font-bold text-slate-900">Verified Accommodations</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Every hotel and lodge in our itineraries is personally inspected for comfort, safety, and authentic hospitality.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div class="w-10 h-10 rounded-lg bg-sky-50 text-primary-600 flex items-center justify-center">
            <AppIcon name="tag" class="w-5 h-5 text-primary-600" />
          </div>
          <h4 class="text-sm font-bold text-slate-900">Transparent Pricing</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            No unexpected checkout fees. All national park permits, breakfast services, and excursions are itemized upfront.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div class="w-10 h-10 rounded-lg bg-sky-50 text-primary-600 flex items-center justify-center">
            <AppIcon name="clock" class="w-5 h-5 text-primary-600" />
          </div>
          <h4 class="text-sm font-bold text-slate-900">24/7 Traveler Support</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Our global concierge team is available around the clock to assist with trip changes, transfers, and recommendations.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div class="w-10 h-10 rounded-lg bg-sky-50 text-primary-600 flex items-center justify-center">
            <AppIcon name="shield" class="w-5 h-5 text-primary-600" />
          </div>
          <h4 class="text-sm font-bold text-slate-900">Simulated Safe Reservations</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Experience complete reservation lifecycles, tickets, and vouchers in an educational, zero-risk browser environment.
          </p>
        </div>
      </div>
    </section>

    <!-- Booking Modal Component -->
    <BookingModal
      :is-open="isBookingModalOpen"
      :pkg="activeBookingPackage"
      @close="isBookingModalOpen = false"
      @view-voucher="onViewVoucher"
    />

    <!-- Voucher Modal Component -->
    <VoucherModal
      :is-open="isVoucherModalOpen"
      :booking="selectedVoucherBooking"
      @close="isVoucherModalOpen = false"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getPackages } from '../services/storageService.js'
import PackageCard from '../components/packages/PackageCard.vue'
import BookingModal from '../components/booking/BookingModal.vue'
import VoucherModal from '../components/booking/VoucherModal.vue'
import AppIcon from '../components/common/AppIcon.vue'

const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedContinent = ref('All')

const isBookingModalOpen = ref(false)
const activeBookingPackage = ref(null)

const isVoucherModalOpen = ref(false)
const selectedVoucherBooking = ref(null)

const allPackages = ref(getPackages())

const featuredPackages = computed(() => {
  return allPackages.value.filter(p => p.featured).slice(0, 6)
})

const categories = [
  { name: 'Cultural', iconName: 'building', count: 3 },
  { name: 'Adventure & Nature', iconName: 'globe', count: 2 },
  { name: 'Beach & Island', iconName: 'plane', count: 2 },
  { name: 'Safari & Wildlife', iconName: 'shield', count: 1 },
  { name: 'Luxury Escapes', iconName: 'star', count: 2 }
]

function executeHeroSearch() {
  router.push({
    path: '/packages',
    query: {
      search: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
      continent: selectedContinent.value !== 'All' ? selectedContinent.value : undefined
    }
  })
}

function quickSearchTag(tag) {
  router.push({
    path: '/packages',
    query: { search: tag }
  })
}

function selectCategoryAndNavigate(categoryName) {
  router.push({
    path: '/packages',
    query: { category: categoryName }
  })
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
