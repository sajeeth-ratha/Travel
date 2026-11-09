<template>
  <!-- Customer Booking Management View (Zero Emojis, No Gradients) -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
          <router-link to="/" class="hover:text-primary-600">Home</router-link>
          <span>/</span>
          <span class="text-slate-900 font-semibold">My Bookings</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Manage Your Bookings
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Review, modify, or print official vouchers for your simulated travel reservations.
        </p>
      </div>

      <!-- Quick Action -->
      <router-link
        to="/packages"
        class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-colors"
      >
        <span>+ Book a New Trip</span>
      </router-link>
    </div>

    <!-- Status Tabs (All, Confirmed, Pending, Cancelled) -->
    <div class="flex gap-2 border-b border-slate-200 pb-3">
      <button
        v-for="tab in ['All', 'Confirmed', 'Pending', 'Cancelled']"
        :key="tab"
        @click="activeStatusTab = tab"
        :class="[
          'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
          activeStatusTab === tab
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        ]"
      >
        {{ tab }}
        <span class="ml-1 opacity-70">
          ({{ getTabCount(tab) }})
        </span>
      </button>
    </div>

    <!-- Bookings List -->
    <div v-if="filteredBookings.length > 0" class="space-y-4">
      <div
        v-for="b in filteredBookings"
        :key="b.id"
        class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
      >
        <!-- Booking Info -->
        <div class="space-y-2 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-xs font-bold text-primary-700 bg-sky-50 border border-primary-200 px-2 py-0.5 rounded-md">
              {{ b.bookingRef }}
            </span>
            <span
              :class="[
                'px-2.5 py-0.5 text-[11px] font-bold rounded',
                b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                b.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-rose-50 text-rose-800 border border-rose-200'
              ]"
            >
              {{ b.status }}
            </span>
            <span class="text-xs text-slate-400">
              Booked on {{ b.bookingDate || '2026-04-12' }}
            </span>
          </div>

          <h3 class="text-base font-bold text-slate-900">
            {{ b.packageTitle }}
          </h3>

          <div class="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Departure: <strong class="text-slate-800">{{ b.travelDate }}</strong></span>
            <span>Travelers: <strong class="text-slate-800">{{ b.adults }} Adult(s)<span v-if="b.children">, {{ b.children }} Child</span></strong></span>
            <span>Room: <strong class="text-slate-800">{{ b.roomTier || 'Standard' }}</strong></span>
            <span>Total: <strong class="text-slate-900 font-extrabold">${{ b.totalPrice }}</strong></span>
          </div>

          <p v-if="b.specialRequests" class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span class="font-semibold text-slate-700">Special Notes:</span> {{ b.specialRequests }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            @click="openVoucherModal(b)"
            class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <AppIcon name="printer" class="w-3.5 h-3.5" />
            <span>View Voucher</span>
          </button>

          <button
            v-if="b.status !== 'Cancelled'"
            @click="openEditModal(b)"
            class="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
          >
            <AppIcon name="edit" class="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            v-if="b.status !== 'Cancelled'"
            @click="promptCancelBooking(b)"
            class="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
          >
            Cancel Trip
          </button>
        </div>

      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3 max-w-lg mx-auto"
    >
      <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
        <AppIcon name="plane" class="w-6 h-6 text-slate-400" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-slate-900">No {{ activeStatusTab !== 'All' ? activeStatusTab.toLowerCase() : '' }} bookings found</h3>
        <p class="text-xs text-slate-500">
          Ready for your next journey? Browse our packages to create your first reservation.
        </p>
      </div>
      <router-link
        to="/packages"
        class="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-xs"
      >
        Discover Travel Packages
      </router-link>
    </div>

    <!-- Edit Booking Modal -->
    <div v-if="editingBooking" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-slate-200">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-sm font-bold text-slate-900">Modify Reservation Details</h3>
          <button @click="editingBooking = null" class="text-slate-400 hover:text-slate-600">
            <AppIcon name="x" class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveBookingEdits" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Lead Passenger Name</label>
            <input
              v-model="editForm.customerName"
              type="text"
              required
              class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Contact Email</label>
            <input
              v-model="editForm.customerEmail"
              type="email"
              required
              class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              v-model="editForm.customerPhone"
              type="tel"
              required
              class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Special Requests / Notes</label>
            <textarea
              v-model="editForm.specialRequests"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button
              type="button"
              @click="editingBooking = null"
              class="px-4 py-2 font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
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
import { ref, reactive, computed } from 'vue'
import { getBookings, updateBooking, cancelBooking } from '../services/storageService.js'
import { showToast } from '../services/toastService.js'
import VoucherModal from '../components/booking/VoucherModal.vue'
import AppIcon from '../components/common/AppIcon.vue'

const bookings = ref(getBookings())
const activeStatusTab = ref('All')

const isVoucherModalOpen = ref(false)
const selectedVoucherBooking = ref(null)

const editingBooking = ref(null)
const editForm = reactive({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  specialRequests: ''
})

function reloadBookings() {
  bookings.value = getBookings()
}

function getTabCount(tab) {
  if (tab === 'All') return bookings.value.length
  return bookings.value.filter(b => b.status === tab).length
}

const filteredBookings = computed(() => {
  if (activeStatusTab.value === 'All') return bookings.value
  return bookings.value.filter(b => b.status === activeStatusTab.value)
})

function openVoucherModal(b) {
  selectedVoucherBooking.value = b
  isVoucherModalOpen.value = true
}

function openEditModal(b) {
  editingBooking.value = b
  editForm.customerName = b.customerName
  editForm.customerEmail = b.customerEmail
  editForm.customerPhone = b.customerPhone
  editForm.specialRequests = b.specialRequests || ''
}

function saveBookingEdits() {
  if (!editingBooking.value) return
  updateBooking(editingBooking.value.id, {
    customerName: editForm.customerName,
    customerEmail: editForm.customerEmail,
    customerPhone: editForm.customerPhone,
    specialRequests: editForm.specialRequests
  })
  reloadBookings()
  showToast('Booking details updated successfully.', 'success')
  editingBooking.value = null
}

function promptCancelBooking(b) {
  if (confirm(`Are you sure you want to cancel booking ${b.bookingRef} for ${b.packageTitle}? A simulated refund of $${b.totalPrice} will be processed.`)) {
    cancelBooking(b.id)
    reloadBookings()
    showToast(`Booking ${b.bookingRef} cancelled. Refund simulated.`, 'info')
  }
}
</script>
