<script setup>
import { computed, ref } from 'vue'
import { money } from '../lib/ui.js'

const props = defineProps({
  room: { type: Object, required: true },
  search: { type: Object, default: () => ({}) },
  saved: { type: Boolean, default: false }
})

defineEmits(['wish'])

const detailsUrl = computed(() => {
  const query = new URLSearchParams({ id: props.room.id })
  if (props.search.checkIn) query.set('checkIn', props.search.checkIn)
  if (props.search.checkOut) query.set('checkOut', props.search.checkOut)
  if (props.search.guests) query.set('guests', props.search.guests)
  return `room.html?${query.toString()}`
})

const gallery = computed(() => (props.room.gallery?.length ? props.room.gallery : [props.room.coverImage]))
const photoIndex = ref(0)
const currentImage = computed(() => gallery.value[photoIndex.value] || props.room.coverImage)

function stepPhoto(step) {
  photoIndex.value = (photoIndex.value + step + gallery.value.length) % gallery.value.length
}

const facilities = computed(() => (props.room.amenities || []).slice(0, 3).map(amenity => {
  const icon = amenity.toLowerCase().includes('breakfast') ? 'free_breakfast'
    : amenity.toLowerCase().includes('pool') ? 'pool'
      : amenity.toLowerCase().includes('wifi') ? 'wifi'
        : amenity.toLowerCase().includes('sea') || amenity.toLowerCase().includes('view') ? 'landscape' : 'check_circle'
  return { label: amenity, icon }
}))

const reviewLabel = computed(() => (props.room.rating >= 4.8 ? 'Excellent' : props.room.rating >= 4.5 ? 'Very good' : 'Good'))
const discount = computed(() => (props.room.originalPrice > props.room.price
  ? Math.round((1 - props.room.price / props.room.originalPrice) * 100)
  : 0))
const availability = computed(() => (props.room.availableFrom || props.room.availableTo
  ? `Available check-in: ${props.room.availableFrom || 'Any'} – ${props.room.availableTo || 'Open'}`
  : ''))
</script>

<template>
  <article class="hotel-result-card">
    <div class="hotel-result-photo">
      <a :href="detailsUrl" tabindex="-1" aria-hidden="true">
        <img :src="currentImage" :alt="`${room.name} at ${room.property}`" loading="lazy">
      </a>
      <span class="room-label">{{ room.type }}</span>
      <button
        class="room-save-button"
        :class="{ saved }"
        type="button"
        :aria-label="`${saved ? 'Remove' : 'Save'} ${room.name} ${saved ? 'from' : 'to'} wishlist`"
        @click="$emit('wish')"
      >{{ saved ? '♥' : '♡' }}</button>
      <button class="room-photo-step previous" type="button" :aria-label="`Previous ${room.name} photo`" @click="stepPhoto(-1)">‹</button>
      <button class="room-photo-step next" type="button" :aria-label="`Next ${room.name} photo`" @click="stepPhoto(1)">›</button>
    </div>
    <div class="room-result-info">
      <div class="room-result-property">{{ room.property }}</div>
      <h2><a :href="detailsUrl">{{ room.name }}</a></h2>
      <div class="room-rating-dots" :aria-label="`${room.rating} out of 5 stars`">★★★★★ <span>ⓘ</span></div>
      <div class="room-result-location">{{ room.destination }}, {{ room.country }}</div>
      <div class="room-amenity-row">
        <span v-for="facility in facilities" :key="facility.label">
          <i class="material-symbols-outlined" aria-hidden="true">{{ facility.icon }}</i>{{ facility.label }}
        </span>
      </div>
      <p>{{ room.description }}</p>
      <div class="room-review">{{ room.rating }} · {{ reviewLabel }} <span>· {{ room.reviewCount }} reviews</span></div>
      <small v-if="availability">{{ availability }}</small>
    </div>
    <div class="room-result-price">
      <template v-if="discount">
        <span class="price-tag">−{{ discount }}%</span>
        <del>{{ money(room.originalPrice) }}</del>
      </template>
      <strong>{{ money(room.price) }}</strong>
      <small>per room, per night<br>taxes may apply</small>
      <a :href="detailsUrl">See availability</a>
    </div>
  </article>
</template>
