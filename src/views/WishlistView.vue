<script setup>
import { computed } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import TripCard from '../components/TripCard.vue'
import SavedRoomCard from '../components/SavedRoomCard.vue'
import { getPackages, getRooms } from '../lib/data.js'
import { savedIds, toggleSaved } from '../lib/store.js'

const trips = computed(() => getPackages().filter(trip => savedIds.value.includes(trip.id)))
const rooms = computed(() => getRooms().filter(room => savedIds.value.includes(room.id)))
const isEmpty = computed(() => !trips.value.length && !rooms.value.length)

function wish(id) {
  toggleSaved(id)
}
</script>

<template>
  <SiteHeader />
  <main class="wrap page">
    <div class="eyebrow">SAVED FOR LATER</div>
    <h1>Your wishlist</h1>
    <div class="cards">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
        :saved="true"
        @wish="wish(trip.id)"
      />
      <SavedRoomCard
        v-for="room in rooms"
        :key="room.id"
        :room="room"
        :saved="true"
        @wish="wish(room.id)"
      />
      <p v-if="isEmpty">Your wishlist is empty. Save a trip you like.</p>
    </div>
  </main>
  <SiteFooter />
</template>
