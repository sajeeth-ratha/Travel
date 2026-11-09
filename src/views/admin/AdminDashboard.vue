<template>
  <!-- Hotels.com Extranet / Admin Operations Dashboard (Zero Emojis, No Gradients) -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    
    <!-- Top Admin Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
          <router-link to="/" class="hover:text-primary-600">Return to Public Portal</router-link>
          <span>/</span>
          <span class="text-slate-900 font-semibold">Admin Dashboard</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <span>Agency Operations Portal</span>
          <span class="px-2 py-0.5 text-xs font-semibold rounded bg-sky-50 text-primary-800 border border-primary-200">Staff Mode</span>
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Oversee daily operations, manage travel inventory, monitor customer bookings, and maintain system data.
        </p>
      </div>

      <!-- Quick Action Controls (Reset Demo Data & Export) -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          @click="handleResetDemoData"
          class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          title="Reset all packages and bookings to original factory demo state"
        >
          <AppIcon name="refresh" class="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Demo Data</span>
        </button>

        <button
          @click="exportData"
          class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <AppIcon name="download" class="w-3.5 h-3.5 text-slate-500" />
          <span>Export JSON</span>
        </button>
      </div>
    </div>

    <!-- Admin Sub-Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
      <router-link
        to="/admin"
        class="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white shadow-xs"
      >
        Dashboard Overview
      </router-link>
      <router-link
        to="/admin/packages"
        class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
      >
        Package Management (CRUD)
      </router-link>
      <router-link
        to="/admin/bookings"
        class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
      >
        Customer Bookings (Operations)
      </router-link>
    </div>

    <!-- 1. KEY PERFORMANCE INDICATOR (KPI) CARDS -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Gross Simulated Revenue -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
        <div class="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>Gross Revenue</span>
          <div class="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <AppIcon name="credit-card" class="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">${{ totalRevenue.toLocaleString() }}</div>
        <div class="text-[11px] text-emerald-700 font-medium">
          Simulated booking volume
        </div>
      </div>

      <!-- Total Bookings Count -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
        <div class="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>Total Reservations</span>
          <div class="w-7 h-7 rounded-md bg-sky-50 text-primary-700 flex items-center justify-center">
            <AppIcon name="calendar" class="w-4 h-4 text-primary-600" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ bookings.length }}</div>
        <div class="text-[11px] text-primary-700 font-medium">
          {{ confirmedCount }} Confirmed, {{ pendingCount }} Pending
        </div>
      </div>

      <!-- Active Packages in Catalog -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
        <div class="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>Active Packages</span>
          <div class="w-7 h-7 rounded-md bg-sky-50 text-primary-700 flex items-center justify-center">
            <AppIcon name="globe" class="w-4 h-4 text-primary-600" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ packages.length }}</div>
        <div class="text-[11px] text-slate-500">
          Across 4 Global Continents
        </div>
      </div>

      <!-- Average Customer Rating -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
        <div class="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>Avg Guest Rating</span>
          <div class="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
            <AppIcon name="star" class="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">4.9 / 5.0</div>
        <div class="text-[11px] text-amber-700 font-medium">
          Exceptional satisfaction score
        </div>
      </div>

    </section>

    <!-- 2. RECENT BOOKINGS & STATUS DISTRIBUTION -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- Recent Bookings Table (2 cols on desktop) -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900">Recent Customer Reservations</h3>
            <p class="text-xs text-slate-500">Latest activity recorded in the agency reservation system</p>
          </div>
          <router-link
            to="/admin/bookings"
            class="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
          >
            View All Operations
          </router-link>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th class="py-3 px-3">Reference</th>
                <th class="py-3 px-3">Traveler</th>
                <th class="py-3 px-3">Package</th>
                <th class="py-3 px-3">Departure</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in bookings.slice(0, 5)" :key="b.id" class="hover:bg-slate-50">
                <td class="py-3 px-3 font-mono font-bold text-primary-700">{{ b.bookingRef }}</td>
                <td class="py-3 px-3 font-semibold text-slate-900">{{ b.customerName }}</td>
                <td class="py-3 px-3 text-slate-600 truncate max-w-[140px]">{{ b.packageTitle }}</td>
                <td class="py-3 px-3 text-slate-500">{{ b.travelDate }}</td>
                <td class="py-3 px-3">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      b.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-rose-50 text-rose-800 border border-rose-200'
                    ]"
                  >
                    {{ b.status }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right">
                  <button
                    @click="openVoucherModal(b)"
                    class="text-primary-600 font-semibold hover:underline"
                  >
                    Voucher
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Booking Distribution & Agency Quick Stats (1 col) -->
      <div class="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
        <div>
          <h3 class="text-base font-bold text-slate-900">Reservation Status Breakdown</h3>
          <p class="text-xs text-slate-500">Distribution of all active agency reservations</p>
        </div>

        <!-- Visual Progress Bars -->
        <div class="space-y-4 text-xs">
          <div>
            <div class="flex justify-between font-semibold mb-1">
              <span class="text-emerald-800">Confirmed ({{ confirmedCount }})</span>
              <span class="text-slate-500">{{ getPercentage(confirmedCount) }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-600 h-full rounded-full transition-all duration-500" :style="{ width: getPercentage(confirmedCount) + '%' }"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between font-semibold mb-1">
              <span class="text-amber-800">Pending Review ({{ pendingCount }})</span>
              <span class="text-slate-500">{{ getPercentage(pendingCount) }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-amber-500 h-full rounded-full transition-all duration-500" :style="{ width: getPercentage(pendingCount) + '%' }"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between font-semibold mb-1">
              <span class="text-rose-800">Cancelled ({{ cancelledCount }})</span>
              <span class="text-slate-500">{{ getPercentage(cancelledCount) }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-rose-500 h-full rounded-full transition-all duration-500" :style="{ width: getPercentage(cancelledCount) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Quick Inventory Shortcuts -->
        <div class="pt-4 border-t border-slate-100 space-y-2">
          <span class="text-xs font-bold text-slate-700 block">Inventory Quick Action</span>
          <router-link
            to="/admin/packages"
            class="block w-full py-2.5 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-xs font-semibold text-white text-center transition-colors shadow-xs"
          >
            + Create New Travel Package
          </router-link>
        </div>

      </div>

    </div>

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
import { getPackages, getBookings, resetToDemoData, exportDataJSON } from '../../services/storageService.js'
import { showToast } from '../../services/toastService.js'
import VoucherModal from '../../components/booking/VoucherModal.vue'
import AppIcon from '../../components/common/AppIcon.vue'

const packages = ref(getPackages())
const bookings = ref(getBookings())

const isVoucherModalOpen = ref(false)
const selectedVoucherBooking = ref(null)

const totalRevenue = computed(() => {
  return bookings.value
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
})

const confirmedCount = computed(() => bookings.value.filter(b => b.status === 'Confirmed').length)
const pendingCount = computed(() => bookings.value.filter(b => b.status === 'Pending').length)
const cancelledCount = computed(() => bookings.value.filter(b => b.status === 'Cancelled').length)

function getPercentage(count) {
  if (!bookings.value.length) return 0
  return Math.round((count / bookings.value.length) * 100)
}

function openVoucherModal(b) {
  selectedVoucherBooking.value = b
  isVoucherModalOpen.value = true
}

function handleResetDemoData() {
  if (confirm('Reset all travel packages and bookings to original factory demo data?')) {
    resetToDemoData()
    packages.value = getPackages()
    bookings.value = getBookings()
    showToast('Application reset to factory demo state.', 'success')
  }
}

function exportData() {
  const jsonStr = exportDataJSON()
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wanderlust-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('JSON backup exported successfully.', 'success')
}
</script>
