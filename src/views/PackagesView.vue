<script setup>
import { computed, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import TripCard from '../components/TripCard.vue'
import { getPackages } from '../lib/data.js'
import { savedIds, toggleSaved } from '../lib/store.js'

const trips = getPackages()
const search = ref(new URLSearchParams(location.search).get('q') || '')

const matches = computed(() => {
  const term = search.value.toLowerCase()
  return trips.filter(trip =>
    `${trip.title}${trip.destination}${trip.country}${trip.category}`.toLowerCase().includes(term)
  )
})

function updateSearch() {
  history.replaceState(null, '', `packages.html?q=${encodeURIComponent(search.value)}`)
}

function wish(id) {
  toggleSaved(id)
}
</script>

<template>
  <SiteHeader active="packages" />
  <main class="package-catalog">
    <section class="package-catalog-hero">
      <div class="package-catalog-copy">
        <div class="eyebrow light">CURATED JOURNEYS · OPEN THE WORLD</div>
        <h1>Find your next trip</h1>
        <p>Thoughtful trips to remarkable places, made easier to explore.</p>
      </div>
      <label class="package-search-box">
        <span class="material-symbols-outlined" aria-hidden="true">search</span>
        <span class="sr-only">Search trips</span>
        <input v-model="search" type="search" placeholder="Search a place or travel style" @input="updateSearch">
        <span>{{ matches.length }} {{ matches.length === 1 ? 'trip' : 'trips' }}</span>
      </label>
    </section>
    <section class="package-catalog-content">
      <div class="package-catalog-heading">
        <div>
          <div class="eyebrow">THE WANDERLUST COLLECTION</div>
          <h2>Journeys worth remembering</h2>
        </div>
        <p>Choose a trip to see what’s included, explore the itinerary, and reserve your place.</p>
      </div>
      <div class="cards package-cards">
        <TripCard
          v-for="trip in matches"
          :key="trip.id"
          :trip="trip"
          :saved="savedIds.includes(trip.id)"
          @wish="wish(trip.id)"
        />
        <p v-if="!matches.length">No trips found. Try a different search.</p>
      </div>
    </section>
  </main>
  <SiteFooter />
</template>
