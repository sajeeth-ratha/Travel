<script setup>
import { computed, onMounted, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import { canCancelBooking, cancelBooking, getBookings } from '../lib/data.js'
import { currentUser } from '../lib/store.js'
import { bookingDateLabel, bookingTitle, money } from '../lib/ui.js'

const status = ref('All')
const tabs = ['All', 'Confirmed', 'Pending', 'Cancelled']

const user = currentUser
const bookings = ref([])

function loadBookings() {
  if (!user.value) return
  bookings.value = getBookings().filter(booking =>
    booking.userId === user.value.id || booking.customerEmail === user.value.email)
}

const visibleBookings = computed(() => bookings.value.filter(booking =>
  status.value === 'All' || booking.status === status.value))

function cancel(id) {
  const booking = bookings.value.find(item => item.id === id)
  if (!canCancelBooking(booking)) {
    alert('Bookings can only be cancelled at least 3 days before the travel date.')
    return
  }
  if (confirm('Cancel this booking? This will update its status to Cancelled.')) {
    cancelBooking(id)
    loadBookings()
  }
}

onMounted(() => {
  if (!user.value) {
    location.replace('login.html?next=bookings.html')
    return
  }
  loadBookings()
})
</script>

<template>
  <SiteHeader />
  <main class="wrap page">
    <div class="eyebrow">YOUR TRAVEL PLANS</div>
    <h1>My bookings</h1>
    <p class="muted">Review or update your saved reservations.</p>
    <p class="cancellation-policy">
      You can cancel a booking up to 3 days before its travel date. The cancellation option closes when fewer than 3 days remain.
    </p>
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tab"
        :class="{ selected: status === tab }"
        @click="status = tab"
      >{{ tab }}</button>
    </div>
    <div class="booking-list">
      <article v-for="booking in visibleBookings" :key="booking.id" class="booking managed-booking">
        <div>
          <span class="eyebrow">{{ booking.bookingRef }}</span>
          <h3>{{ bookingTitle(booking) }}</h3>
          <p>{{ booking.customerName }} · {{ bookingDateLabel(booking) }}</p>
        </div>
        <div>
          <b>{{ money(booking.totalPrice) }}</b>
          <p class="status">{{ booking.status }}</p>
          <small v-if="booking.discountAmount" class="discount-saved">Saved {{ money(booking.discountAmount) }}</small>
        </div>
        <div class="booking-cancel-area">
          <template v-if="canCancelBooking(booking)">
            <button class="button small danger" @click="cancel(booking.id)">Cancel booking</button>
            <small>Available until 3 days before travel</small>
          </template>
          <small v-else-if="booking.status === 'Cancelled'">Booking cancelled</small>
          <small v-else class="cancel-closed">Cancellation is closed (within 3 days of travel)</small>
        </div>
      </article>
      <p v-if="!visibleBookings.length">No bookings in this category.</p>
    </div>
  </main>
  <SiteFooter />
</template>
