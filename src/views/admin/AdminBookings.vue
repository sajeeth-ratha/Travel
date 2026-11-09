<template>
  <!-- Agency Daily Operations: All Customer Bookings (Zero Emojis, No Gradients) -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    
    <!-- Top Admin Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
          <router-link to="/admin" class="hover:text-primary-600">Admin Dashboard</router-link>
          <span>/</span>
          <span class="text-slate-900 font-semibold">Daily Operations</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Customer Bookings Management
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Review reservations across all packages, confirm pending requests, and manage passenger manifests.
        </p>
      </div>

      <div class="text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
        Total Revenue: <strong class="text-slate-900 font-extrabold">${{ totalRevenue.toLocaleString() }}</strong>
      </div>
    </div>

    <!-- Admin Sub-Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
      <router-link
        to="/admin"
        class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
        class="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white shadow-xs"
      >
        Customer Bookings (Operations)
      </router-link>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
      
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search customer name, email, TRV code..."
          class="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div class="absolute left-3 top-2.5 text-slate-400">
          <AppIcon name="search" class="w-3.5 h-3.5" />
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="flex flex-wrap gap-1.5 text-xs">
        <button
          v-for="st in ['All', 'Confirmed', 'Pending', 'Cancelled']"
          :key="st"
          @click="statusFilter = st"
          :class="[
            'px-3 py-1.5 rounded-lg font-semibold transition-colors',
            statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          ]"
        >
          {{ st }}
        </button>
      </div>

    </div>

    <!-- Bookings Operations Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="py-3 px-4">Booking Ref</th>
              <th class="py-3 px-4">Customer Details</th>
              <th class="py-3 px-4">Package</th>
              <th class="py-3 px-4">Departure</th>
              <th class="py-3 px-4">Paid Total</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Operational Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="b in filteredBookings" :key="b.id" class="hover:bg-slate-50">
              
              <!-- Ref & Date -->
              <td class="py-3 px-4 font-mono font-bold text-primary-700">
                {{ b.bookingRef }}
                <span class="block text-[10px] text-slate-400 font-sans font-normal">{{ b.bookingDate }}</span>
              </td>

              <!-- Customer Details -->
              <td class="py-3 px-4">
                <div class="font-bold text-slate-900">{{ b.customerName }}</div>
                <div class="text-slate-500 text-[11px]">{{ b.customerEmail }}</div>
                <div class="text-slate-400 text-[10px]">{{ b.customerPhone }}</div>
              </td>

              <!-- Package & Room Tier -->
              <td class="py-3 px-4">
                <div class="font-semibold text-slate-800 line-clamp-1 max-w-xs">{{ b.packageTitle }}</div>
                <div class="text-[10px] text-primary-700 font-medium">{{ b.roomTier || 'Standard' }}</div>
              </td>

              <!-- Departure & Guests -->
              <td class="py-3 px-4">
                <div class="font-medium text-slate-800">{{ b.travelDate }}</div>
                <div class="text-[10px] text-slate-400">{{ b.adults }} Adult(s)<span v-if="b.children">, {{ b.children }} Child</span></div>
              </td>

              <!-- Total Revenue -->
              <td class="py-3 px-4 font-bold text-slate-900">
                ${{ b.totalPrice }}
                <span class="block text-[10px] text-slate-400 font-normal">{{ b.paymentMethod }}</span>
              </td>

              <!-- Status Badge -->
              <td class="py-3 px-4">
                <span
                  :class="[
                    'px-2.5 py-1 rounded text-[10px] font-bold',
                    b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    b.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-rose-50 text-rose-800 border border-rose-200'
                  ]"
                >
                  {{ b.status }}
                </span>
              </td>

              <!-- Status Modification Actions -->
              <td class="py-3 px-4 text-right space-x-2">
                <button
                  @click="openVoucher(b)"
                  class="text-slate-600 hover:text-primary-600 font-semibold"
                  title="View travel ticket voucher"
                >
                  Voucher
                </button>

                <button
                  v-if="b.status === 'Pending'"
                  @click="setStatus(b.id, 'Confirmed')"
                  class="text-emerald-700 font-semibold hover:underline"
                >
                  Confirm
                </button>

                <button
                  v-if="b.status !== 'Cancelled'"
                  @click="setStatus(b.id, 'Cancelled')"
                  class="text-rose-700 font-semibold hover:underline"
                >
                  Cancel
                </button>
              </td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Voucher Modal -->
    <VoucherModal
      :is-open="isVoucherModalOpen"
      :booking="selectedBooking"
      @close="isVoucherModalOpen = false"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getBookings, updateBooking } from '../../services/storageService.js'
import { showToast } from '../../services/toastService.js'
import VoucherModal from '../../components/booking/VoucherModal.vue'
import AppIcon from '../../components/common/AppIcon.vue'

const bookings = ref(getBookings())
const searchQuery = ref('')
const statusFilter = ref('All')

const isVoucherModalOpen = ref(false)
const selectedBooking = ref(null)

function reload() {
  bookings.value = getBookings()
}

const totalRevenue = computed(() => {
  return bookings.value
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
})

const filteredBookings = computed(() => {
  return bookings.value.filter(b => {
    if (statusFilter.value !== 'All' && b.status !== statusFilter.value) {
      return false
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const match =
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.packageTitle.toLowerCase().includes(q)
      if (!match) return false
    }

    return true
  })
})

function setStatus(id, newStatus) {
  updateBooking(id, { status: newStatus })
  reload()
  showToast(`Booking status updated to "${newStatus}".`, 'success')
}

function openVoucher(b) {
  selectedBooking.value = b
  isVoucherModalOpen.value = true
}
</script>
