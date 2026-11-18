<script setup>
import { onMounted, ref } from 'vue'
import { bookingDateLabel, bookingTitle, money } from '../lib/ui.js'

const props = defineProps({
  booking: { type: Object, required: true },
  isNewAccount: { type: Boolean, default: false }
})

const dialog = ref(null)

onMounted(() => dialog.value?.showModal())

function close() {
  dialog.value?.close()
}

function printReceipt() {
  window.print()
}
</script>

<template>
  <dialog ref="dialog" class="voucher-dialog" @close="$emit('done')">
    <div class="voucher-header">
      <a class="logo" href="index.html" aria-label="Wanderlust home">
        <img src="/assets/wanderlust-mountain-logo.png" alt="Wanderlust">
      </a>
      <span class="voucher-status-badge">
        <span class="check-icon">✓</span>
        <span>Reservation Confirmed</span>
      </span>
    </div>

    <div class="voucher-ref-card">
      <div>
        <span>Booking Reference</span>
        <strong>{{ booking.bookingRef }}</strong>
      </div>
      <div>
        <span style="display:inline-block;padding:5px 9px;border-radius:4px;background:#e0f2fe;color:#0369a1;font-size:11px;font-weight:700;">
          Dummy Payment Approved
        </span>
      </div>
    </div>

    <div v-if="isNewAccount" class="voucher-account-created">
      <strong>✓ Wanderlust Account Created &amp; Signed In</strong>
      <p style="margin:4px 0 0;font-size:11px;">
        Your account for <b>{{ booking.customerEmail }}</b> is active. You can log in anytime to manage your bookings and redeem loyalty points.
      </p>
    </div>

    <div class="voucher-item-summary">
      <div class="eyebrow">{{ booking.bookingType === 'room' ? 'ROOM STAY' : 'TRAVEL PACKAGE' }}</div>
      <h3>{{ bookingTitle(booking) }}</h3>
      <div class="voucher-details-grid">
        <div>
          <span>Travel / Stay Dates</span>
          <b>{{ bookingDateLabel(booking) }}</b>
        </div>
        <div>
          <span>Guests</span>
          <b>{{ booking.adults }} guest{{ booking.adults > 1 ? 's' : '' }}</b>
        </div>
        <div>
          <span>Lead Traveler</span>
          <b>{{ booking.customerName }}</b>
        </div>
        <div>
          <span>Contact Email</span>
          <b>{{ booking.customerEmail }}</b>
        </div>
        <div v-if="booking.customerPhone">
          <span>Phone</span>
          <b>{{ booking.customerPhone }}</b>
        </div>
        <div>
          <span>Payment Method</span>
          <b>{{ booking.paymentMethod }}</b>
        </div>
      </div>

      <div class="voucher-pricing-table">
        <div>
          <span>Base Price</span>
          <span>{{ money(booking.basePrice * (booking.nights || booking.adults || 1)) }}</span>
        </div>
        <div v-if="booking.discountAmount" style="color:#047857;">
          <span>Total Discount (Promo &amp; Rewards)</span>
          <span>−{{ money(booking.discountAmount) }}</span>
        </div>
        <div class="total-row">
          <span>Amount Paid (Demo)</span>
          <span style="color:#0284c7;">{{ money(booking.totalPrice) }}</span>
        </div>
      </div>

      <div class="voucher-rewards-earned">
        <span>✦</span>
        <span><b>+{{ booking.pointsEarned || Math.floor(booking.totalPrice / 10) }} Wanderlust Rewards points</b> earned from this booking!</span>
      </div>
    </div>

    <p style="margin:8px 0;font-size:11px;color:#94a3b8;text-align:center;">
      This reservation is stored in your browser. No real payment transaction was conducted.
    </p>

    <div class="voucher-actions">
      <button type="button" class="button outline small" @click="printReceipt">Print / Save Receipt</button>
      <button type="button" class="button small" @click="close">View in My Bookings</button>
    </div>
  </dialog>
</template>
