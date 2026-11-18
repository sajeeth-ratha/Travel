<script setup>
import { computed, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import RoomCheckout from '../components/RoomCheckout.vue'
import VoucherDialog from '../components/VoucherDialog.vue'
import { getRoomById } from '../lib/data.js'
import { savedIds, toggleSaved } from '../lib/store.js'
import { money } from '../lib/ui.js'

const params = new URLSearchParams(location.search)
const room = getRoomById(params.get('id'))

const photos = computed(() => (room?.gallery?.length ? room.gallery : [room?.coverImage]))
const saved = computed(() => (room ? savedIds.value.includes(room.id) : false))
const dateWindow = room && (room.availableFrom || room.availableTo)
  ? `Check-in dates: ${room.availableFrom || 'Any date'} to ${room.availableTo || 'Open'}.`
  : 'Choose the dates that suit you.'

const requestedDates = {
  checkIn: params.get('checkIn'),
  checkOut: params.get('checkOut'),
  guests: params.get('guests')
}

const checkoutOpen = ref(false)
const voucher = ref(null)

function wish() {
  if (room) toggleSaved(room.id)
}

function booked(result) {
  checkoutOpen.value = false
  voucher.value = result
}

function finishVoucher() {
  window.location.href = 'bookings.html'
}
</script>

<template>
  <SiteHeader active="rooms" />
  <main class="wrap page">
    <div v-if="!room">
      <h1>Room not found</h1>
      <a href="rooms.html">Browse available rooms</a>
    </div>
    <div v-else>
      <a href="rooms.html" class="back">← All rooms</a>
      <section class="room-detail-heading">
        <div>
          <div class="eyebrow">{{ room.property }} · {{ room.type }}</div>
          <h1>{{ room.name }}</h1>
          <div class="detail-meta">
            <span>⌖ {{ room.destination }}, {{ room.country }}</span>
            <span>★ {{ room.rating }} · {{ room.reviewCount }} guest reviews</span>
            <span>Up to {{ room.guests }} guests · {{ room.beds }}</span>
          </div>
        </div>
        <button class="button outline room-detail-favorite" type="button" @click="wish">
          {{ saved ? '♥ Saved to wishlist' : '♡ Save to wishlist' }}
        </button>
      </section>
      <section class="detail-gallery room-gallery" :aria-label="`Photos of ${room.name}`">
        <div
          v-for="(photo, index) in photos.slice(0, 3)"
          :key="photo"
          class="gallery-photo"
          :class="{ 'gallery-main': index === 0 }"
        >
          <img
            :src="photo"
            :alt="`${room.name}, photo ${index + 1}`"
            :loading="index ? 'lazy' : undefined"
            :fetchpriority="index ? undefined : 'high'"
          >
        </div>
      </section>
      <div class="room-detail-grid">
        <section class="room-description">
          <div class="eyebrow">A PLACE TO SETTLE IN</div>
          <h2>Room details</h2>
          <p>{{ room.description }}</p>
          <div class="room-amenities">
            <span v-for="item in room.amenities" :key="item">✓ {{ item }}</span>
          </div>
        </section>
        <aside class="room-booking-box">
          <div class="room-price"><strong>{{ money(room.price) }}</strong><span> / night</span></div>
          <p>Book this room on its own. No travel package required.</p>
          <p class="room-date-window">{{ dateWindow }}</p>
          <div class="room-capacity">Sleeps up to {{ room.guests }} · {{ room.beds }}</div>
          <button class="button" @click="checkoutOpen = true">Choose dates</button>
          <small>Card payment options are shown at checkout</small>
        </aside>
      </div>
      <div id="room-checkout-slot">
        <RoomCheckout
          v-if="checkoutOpen"
          :room="room"
          :requested-dates="requestedDates"
          @booked="booked"
          @close="checkoutOpen = false"
        />
      </div>
    </div>
  </main>
  <SiteFooter />

  <VoucherDialog
    v-if="voucher"
    :booking="voucher.booking"
    :is-new-account="voucher.isNewAccount"
    @done="finishVoucher"
  />
</template>
