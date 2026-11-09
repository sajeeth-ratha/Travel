<template>
  <!-- Hotels.com Style Explore Packages Catalog View (Zero Emojis, No Gradients) -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    
    <!-- Page Header & Breadcrumb -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
          <router-link to="/" class="hover:text-primary-600">Home</router-link>
          <span>/</span>
          <span class="text-slate-900">Explore Packages</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
          All Travel Packages & Stays
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Showing <strong class="text-slate-900 font-bold">{{ filteredPackages.length }}</strong> of {{ allPackages.length }} verified vacation itineraries
        </p>
      </div>

      <!-- Sorting Controls -->
      <div class="flex items-center gap-2 text-xs">
        <label class="font-bold text-slate-700">Sort by:</label>
        <select
          v-model="sortBy"
          class="px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 cursor-pointer shadow-xs"
        >
          <option value="featured">Recommended & Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Guest Rating (High to Low)</option>
          <option value="duration">Trip Length</option>
        </select>
      </div>
    </div>

    <!-- Main Layout: Sidebar Filters + Packages Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      
      <!-- Left Column: Filter Sidebar (1 col on desktop) -->
      <div class="lg:col-span-1">
        <PackageFilter
          :key="filterKey"
          @update:filters="onFiltersUpdate"
        />
      </div>

      <!-- Right Column: Packages Grid (3 cols on desktop) -->
      <div class="lg:col-span-3 space-y-5">
        
        <!-- Active Filter Tags Pills -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-100 text-xs">
          <span class="text-slate-600 font-semibold">Active filters:</span>
          <span
            v-if="currentFilters.search"
            class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 flex items-center gap-1"
          >
            "{{ currentFilters.search }}"
          </span>
          <span
            v-if="currentFilters.continent !== 'All'"
            class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800"
          >
            {{ currentFilters.continent }}
          </span>
          <span
            v-if="currentFilters.category"
            class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800"
          >
            {{ currentFilters.category }}
          </span>
          <span
            v-if="currentFilters.maxPrice < 4000"
            class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800"
          >
            Under ${{ currentFilters.maxPrice }}
          </span>
          <span
            v-if="currentFilters.minRating > 0"
            class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800"
          >
            Rating {{ currentFilters.minRating }}+
          </span>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredPackages.length === 0"
          class="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3"
        >
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <AppIcon name="search" class="w-6 h-6 text-slate-400" />
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-slate-900">No destinations match your criteria</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your price range, choosing "All Continents", or clearing your search keywords.
            </p>
          </div>
          <button
            @click="clearAllFilters"
            class="px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-xs"
          >
            Reset All Filters
          </button>
        </div>

        <!-- Packages Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <PackageCard
            v-for="pkg in filteredPackages"
            :key="pkg.id"
            :pkg="pkg"
            @quick-book="openBookingModal"
          />
        </div>

      </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPackages } from '../services/storageService.js'
import PackageCard from '../components/packages/PackageCard.vue'
import PackageFilter from '../components/packages/PackageFilter.vue'
import BookingModal from '../components/booking/BookingModal.vue'
import VoucherModal from '../components/booking/VoucherModal.vue'
import AppIcon from '../components/common/AppIcon.vue'

const route = useRoute()

const allPackages = ref(getPackages())
const sortBy = ref('featured')
const filterKey = ref(1)

const isBookingModalOpen = ref(false)
const activeBookingPackage = ref(null)

const isVoucherModalOpen = ref(false)
const selectedVoucherBooking = ref(null)

const currentFilters = ref({
  search: '',
  continent: 'All',
  category: '',
  maxPrice: 4000,
  durationRange: 'all',
  minRating: 0
})

onMounted(() => {
  if (route.query.search) currentFilters.value.search = route.query.search
  if (route.query.category) currentFilters.value.category = route.query.category
  if (route.query.continent) currentFilters.value.continent = route.query.continent
})

function onFiltersUpdate(newFilters) {
  currentFilters.value = { ...newFilters }
}

function clearAllFilters() {
  currentFilters.value = {
    search: '',
    continent: 'All',
    category: '',
    maxPrice: 4000,
    durationRange: 'all',
    minRating: 0
  }
  filterKey.value++
}

const hasActiveFilters = computed(() => {
  return currentFilters.value.search !== '' ||
    currentFilters.value.continent !== 'All' ||
    currentFilters.value.category !== '' ||
    currentFilters.value.maxPrice < 4000 ||
    currentFilters.value.minRating > 0
})

const filteredPackages = computed(() => {
  let list = allPackages.value.filter(pkg => {
    if (currentFilters.value.search) {
      const q = currentFilters.value.search.toLowerCase()
      const match =
        pkg.title.toLowerCase().includes(q) ||
        pkg.destination.toLowerCase().includes(q) ||
        pkg.country.toLowerCase().includes(q) ||
        pkg.shortDescription.toLowerCase().includes(q)
      if (!match) return false
    }

    if (currentFilters.value.continent !== 'All') {
      if (pkg.continent !== currentFilters.value.continent) return false
    }

    if (currentFilters.value.category) {
      if (pkg.category !== currentFilters.value.category) return false
    }

    if (pkg.price > currentFilters.value.maxPrice) {
      return false
    }

    if (currentFilters.value.durationRange === 'short' && (pkg.duration < 1 || pkg.duration > 6)) return false
    if (currentFilters.value.durationRange === 'medium' && (pkg.duration < 7 || pkg.duration > 8)) return false
    if (currentFilters.value.durationRange === 'long' && pkg.duration < 9) return false

    if (currentFilters.value.minRating > 0 && pkg.rating < currentFilters.value.minRating) {
      return false
    }

    return true
  })

  if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'rating') {
    list.sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'duration') {
    list.sort((a, b) => a.duration - b.duration)
  } else {
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }

  return list
})

function openBookingModal(pkg) {
  activeBookingPackage.value = pkg
  isBookingModalOpen.value = true
}

function onViewVoucher(booking) {
  selectedVoucherBooking.value = booking
  isVoucherModalOpen.value = true
}
</script>
