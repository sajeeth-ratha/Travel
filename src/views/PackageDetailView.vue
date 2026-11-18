<script setup>
import { computed, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import CheckoutDialog from '../components/CheckoutDialog.vue'
import VoucherDialog from '../components/VoucherDialog.vue'
import { getPackageById } from '../lib/data.js'
import { savedIds, toggleSaved } from '../lib/store.js'
import { money } from '../lib/ui.js'

const id = new URLSearchParams(location.search).get('id')
const trip = getPackageById(id)

const photos = computed(() => (trip?.gallery?.length ? trip.gallery : [trip?.coverImage]))
const galleryPhotos = computed(() => [...photos.value, ...photos.value].slice(0, 3))
const saved = computed(() => (trip ? savedIds.value.includes(trip.id) : false))
const saving = computed(() => (trip && trip.originalPrice > trip.price ? trip.originalPrice - trip.price : 0))

const photoDialog = ref(null)
const activePhoto = ref(0)
const checkoutOpen = ref(false)
const voucher = ref(null)

function showPhoto(index) {
  activePhoto.value = (index + photos.value.length) % photos.value.length
}

function openPhoto(index) {
  showPhoto(index)
  photoDialog.value?.showModal()
}

function closePhoto() {
  photoDialog.value?.close()
}

function wish() {
  if (trip) toggleSaved(trip.id)
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
  <SiteHeader active="packages" />
  <main class="wrap page">
    <div v-if="!trip" class="trip-page">
      <h1>Trip not found</h1>
      <a href="packages.html">Back to all trips</a>
    </div>
    <div v-else class="trip-page">
      <a href="packages.html" class="back">← All trips</a>
      <section class="detail-heading">
        <div class="eyebrow">{{ trip.category }} · {{ trip.continent }}</div>
        <h1>{{ trip.title }}</h1>
        <div class="detail-meta">
          <span>⌖ {{ trip.destination }}, {{ trip.country }}</span>
          <a href="#trip-reviews">★ {{ trip.rating }} · {{ trip.reviewCount }} traveler reviews</a>
          <span>{{ trip.duration }} days · {{ trip.groupSize || 'Small group' }}</span>
        </div>
      </section>
      <section class="detail-gallery" :aria-label="`Photos of ${trip.destination}`">
        <button class="gallery-photo gallery-main" aria-label="Open photo 1" @click="openPhoto(0)">
          <img :src="galleryPhotos[0]" :alt="`${trip.destination} travel photo`" fetchpriority="high">
        </button>
        <button class="gallery-photo" aria-label="Open photo 2" @click="openPhoto(1)">
          <img :src="galleryPhotos[1] || galleryPhotos[0]" :alt="`${trip.destination} scenery`" loading="lazy">
        </button>
        <button class="gallery-photo gallery-last" aria-label="Open photo 3" @click="openPhoto(2)">
          <img :src="galleryPhotos[2] || galleryPhotos[0]" :alt="`${trip.destination} experience`" loading="lazy">
          <span class="gallery-all">View all {{ photos.length }} photos</span>
        </button>
      </section>
      <div class="detail-content-grid">
        <div class="detail-main-column">
          <section class="detail-overview">
            <div class="eyebrow">YOUR TRIP AT A GLANCE</div>
            <h2>A little more about this journey</h2>
            <p>{{ trip.fullDescription || trip.shortDescription }}</p>
            <div class="detail-facts">
              <span><b>{{ trip.duration }} days</b><small>Trip length</small></span>
              <span><b>{{ trip.groupSize || 'Small group' }}</b><small>Group size</small></span>
              <span><b>{{ trip.destination }}</b><small>Destination</small></span>
            </div>
          </section>
          <section class="itinerary-section">
            <div class="itinerary-heading">
              <div>
                <div class="eyebrow">THE PLAN</div>
                <h2>Your {{ trip.duration }}-day itinerary</h2>
              </div>
              <p>Open a day to see what’s planned.</p>
            </div>
            <div class="itinerary-list">
              <details v-for="day in trip.itinerary || []" :key="day.day">
                <summary>
                  <span class="day-number">{{ String(day.day).padStart(2, '0') }}</span>
                  <span class="day-title">Day {{ day.day }}<b>{{ day.title }}</b></span>
                  <span class="day-toggle">+</span>
                </summary>
                <p>{{ day.description }}</p>
              </details>
            </div>
          </section>
          <section class="included-section">
            <div>
              <div class="eyebrow">GOOD TO KNOW</div>
              <h2>What’s included</h2>
              <p>Here’s what’s covered in this trip.</p>
            </div>
            <ul class="included-list">
              <li v-for="item in trip.included || []" :key="item"><span>✓</span>{{ item }}</li>
            </ul>
            <div class="not-included">
              <b>Not included</b>
              <p>{{ (trip.notIncluded || []).join(' · ') }}</p>
            </div>
          </section>
        </div>
        <aside class="detail-booking-box">
          <div class="booking-card-top">
            <span class="booking-score">★ {{ trip.rating }}</span>
            <span>{{ trip.reviewCount }} reviews</span>
          </div>
          <div class="detail-price">
            <div><span>From</span><strong>{{ money(trip.price) }}</strong><small>per person</small></div>
            <span v-if="saving" class="detail-saving">Save {{ money(saving) }}</span>
          </div>
          <small class="availability-note">A thoughtfully planned {{ trip.duration }}-day journey</small>
          <button class="button" @click="checkoutOpen = true">Check availability <span>→</span></button>
          <button class="button outline" @click="wish">{{ saved ? '♥ Saved' : '♡ Save trip' }}</button>
          <small class="booking-caption">No payment is taken until you confirm your booking.</small>
        </aside>
      </div>

      <dialog ref="photoDialog" class="photo-dialog">
        <button class="photo-close" aria-label="Close photo viewer" @click="closePhoto">×</button>
        <div class="photo-viewer">
          <button class="photo-arrow" aria-label="Previous photo" @click="showPhoto(activePhoto - 1)">‹</button>
          <img :src="photos[activePhoto]" :alt="`${trip.destination} travel photo`">
          <button class="photo-arrow" aria-label="Next photo" @click="showPhoto(activePhoto + 1)">›</button>
        </div>
        <p>{{ activePhoto + 1 }} / {{ photos.length }}</p>
      </dialog>
    </div>
  </main>
  <SiteFooter />

  <CheckoutDialog v-if="checkoutOpen && trip" :trip="trip" @booked="booked" @close="checkoutOpen = false" />
  <VoucherDialog
    v-if="voucher"
    :booking="voucher.booking"
    :is-new-account="voucher.isNewAccount"
    @done="finishVoucher"
  />
</template>
