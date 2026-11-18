<script setup>
import { computed, ref, watch } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import RoomCard from '../components/RoomCard.vue'
import { getRooms } from '../lib/data.js'
import { savedIds, toggleSaved } from '../lib/store.js'
import { localDate } from '../lib/ui.js'

const rooms = getRooms()
const params = new URLSearchParams(location.search)

const search = ref(params.get('q') || '')
const countrySearch = ref(params.get('country') || '')
const propertySearch = ref('')
const price = ref(500)
const amenities = ref([])
const roomType = ref('all')
const ratingOnly = ref(false)
const sort = ref('recommended')
const checkIn = ref(params.get('checkIn') || '')
const checkOut = ref(params.get('checkOut') || '')
const guests = ref(params.get('guests') || '2')
const currentPage = ref(1)
const roomsPerPage = 10

const checkInInput = ref(null)
const checkOutInput = ref(null)

const countries = [...new Set(rooms.map(room => room.country))].sort()

const today = new Date()
const todayString = localDate(today)
const checkOutMin = computed(() => {
  if (!checkIn.value) return todayString
  const next = new Date(`${checkIn.value}T12:00:00`)
  next.setDate(next.getDate() + 1)
  return localDate(next)
})

const matches = computed(() => {
  const term = search.value.trim().toLowerCase()
  const property = propertySearch.value.trim().toLowerCase()
  const country = countrySearch.value.trim().toLowerCase()
  const maximumPrice = Number(price.value)
  const guestCount = Number(guests.value)
  const selectedAmenities = amenities.value.map(item => item.toLowerCase())

  const result = rooms.filter(room => {
    const roomText = `${room.name} ${room.property} ${room.destination} ${room.country} ${room.type}`.toLowerCase()
    const type = room.type.toLowerCase()
    const isRoomType = roomType.value === 'all'
      || (roomType.value === 'hotel' && /hotel|traditional/.test(type))
      || type.includes(roomType.value)
    const inCheckInWindow = !checkIn.value
      || ((!room.availableFrom || checkIn.value >= room.availableFrom) && (!room.availableTo || checkIn.value <= room.availableTo))
    return roomText.includes(term)
      && room.property.toLowerCase().includes(property)
      && room.country.toLowerCase().includes(country)
      && room.price <= maximumPrice
      && room.guests >= guestCount
      && isRoomType
      && selectedAmenities.every(item => (room.amenities || []).some(amenity => amenity.toLowerCase().includes(item)))
      && (!ratingOnly.value || room.rating >= 4.5)
      && inCheckInWindow
  })

  if (sort.value === 'price-low') result.sort((a, b) => a.price - b.price)
  if (sort.value === 'price-high') result.sort((a, b) => b.price - a.price)
  if (sort.value === 'rating') result.sort((a, b) => b.rating - a.rating)
  return result
})

const totalPages = computed(() => Math.ceil(matches.value.length / roomsPerPage))
const firstRoom = computed(() => (currentPage.value - 1) * roomsPerPage)
const pageRooms = computed(() => matches.value.slice(firstRoom.value, firstRoom.value + roomsPerPage))

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))

const searchContext = computed(() => ({
  checkIn: checkIn.value,
  checkOut: checkOut.value,
  guests: guests.value
}))

watch([search, countrySearch, propertySearch, price, amenities, roomType, ratingOnly, sort, checkIn, checkOut, guests], () => {
  currentPage.value = 1
})

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  document.querySelector('.results-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function toggleAmenity(value) {
  if (amenities.value.includes(value)) {
    amenities.value = amenities.value.filter(item => item !== value)
  } else {
    amenities.value = [...amenities.value, value]
  }
}

function syncCountryUrl() {
  const next = new URLSearchParams(location.search)
  if (countrySearch.value.trim()) next.set('country', countrySearch.value.trim())
  else next.delete('country')
  history.replaceState(null, '', `rooms.html${next.toString() ? `?${next}` : ''}`)
}

function onCountrySearch() {
  syncCountryUrl()
}

function submitSearch() {
  if (checkIn.value && checkOut.value && checkOut.value <= checkIn.value) {
    checkOutInput.value?.setCustomValidity('Check-out must be after check-in.')
    checkOutInput.value?.reportValidity()
    return
  }
  checkOutInput.value?.setCustomValidity('')
  const next = new URLSearchParams()
  if (search.value.trim()) next.set('q', search.value.trim())
  if (countrySearch.value.trim()) next.set('country', countrySearch.value.trim())
  if (checkIn.value) next.set('checkIn', checkIn.value)
  if (checkOut.value) next.set('checkOut', checkOut.value)
  next.set('guests', guests.value)
  history.replaceState(null, '', `rooms.html?${next.toString()}`)
}

function onCheckInChange() {
  if (!checkIn.value) return
  if (checkOut.value && checkOut.value <= checkIn.value) {
    checkOut.value = checkOutMin.value
  }
}

function wish(id) {
  toggleSaved(id)
}
</script>

<template>
  <SiteHeader active="rooms" />
  <main class="rooms-search-page">
    <form class="stay-search-bar" @submit.prevent="submitSearch">
      <label class="stay-search-field destination-field">
        <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
        <span class="sr-only">Destination</span>
        <input v-model="search" type="search" placeholder="City, region, property or hotel">
      </label>
      <label class="stay-search-field">
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="sr-only">Check-in</span>
        <input ref="checkInInput" v-model="checkIn" type="date" aria-label="Check-in" :min="todayString" @change="onCheckInChange">
      </label>
      <label class="stay-search-field">
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="sr-only">Check-out</span>
        <input ref="checkOutInput" v-model="checkOut" type="date" aria-label="Check-out" :min="checkOutMin">
      </label>
      <label class="stay-search-field guest-field">
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="sr-only">Guests</span>
        <select v-model="guests">
          <option value="1">1 guest</option>
          <option value="2">2 guests</option>
          <option value="3">3 guests</option>
          <option value="4">4 guests</option>
        </select>
      </label>
      <button class="stay-search-button" type="submit" aria-label="Search rooms">
        <span class="material-symbols-outlined" aria-hidden="true">search</span>
      </button>
    </form>

    <div class="room-search-layout">
      <aside class="room-filters" aria-label="Filter rooms">
        <section class="country-filter-card" aria-label="Find rooms by country">
          <div class="map-card-heading">
            <span class="material-symbols-outlined" aria-hidden="true">public</span>
            <div><b>Find rooms by country</b><small>Search or choose a country</small></div>
          </div>
          <label class="sr-only" for="country-search">Search country</label>
          <input
            id="country-search"
            v-model="countrySearch"
            type="search"
            list="room-country-list"
            placeholder="Type a country name"
            @input="onCountrySearch"
          >
          <datalist id="room-country-list">
            <option v-for="country in countries" :key="country" :value="country"></option>
          </datalist>
          <label class="sr-only" for="country-filter">Choose a country</label>
          <select id="country-filter" v-model="countrySearch" @change="syncCountryUrl">
            <option value="">All countries</option>
            <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
          </select>
        </section>
        <section class="filter-section">
          <h2>Property name</h2>
          <label class="filter-search">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
            <input v-model="propertySearch" type="search" placeholder="e.g. Aegean House">
          </label>
        </section>
        <section class="filter-section">
          <h2>Price per night</h2>
          <div class="price-range-values">
            <span>$<b>50</b></span>
            <span>Up to $<b>{{ price }}</b></span>
          </div>
          <input v-model.number="price" class="price-range" type="range" min="50" max="500" step="10">
          <div class="range-caption">Show rooms at or below this price</div>
        </section>
        <section class="filter-section">
          <h2>Popular filters</h2>
          <label v-for="amenity in ['Breakfast included', 'Private pool', 'Sea view', 'Wi-Fi']" :key="amenity" class="filter-option">
            <input
              type="checkbox"
              :checked="amenities.includes(amenity)"
              @change="toggleAmenity(amenity)"
            >
            <span>{{ amenity }}</span>
          </label>
        </section>
        <section class="filter-section">
          <h2>Type of stay</h2>
          <label class="filter-option"><input v-model="roomType" type="radio" name="room-type" value="all"><span>All stays</span></label>
          <label class="filter-option"><input v-model="roomType" type="radio" name="room-type" value="hotel"><span>Hotel rooms</span></label>
          <label class="filter-option"><input v-model="roomType" type="radio" name="room-type" value="suite"><span>Suites</span></label>
          <label class="filter-option"><input v-model="roomType" type="radio" name="room-type" value="villa"><span>Villas</span></label>
        </section>
        <section class="filter-section">
          <h2>Guest rating</h2>
          <label class="filter-option"><input v-model="ratingOnly" type="checkbox"><span>Very good: 4.5+</span></label>
        </section>
      </aside>

      <section class="room-results" aria-label="Room search results">
        <div class="results-heading">
          <div>
            <div class="eyebrow">ROOMS YOU CAN BOOK ON THEIR OWN</div>
            <h1>Find your stay</h1>
            <p>{{ matches.length }} {{ matches.length === 1 ? 'place to stay' : 'places to stay' }}</p>
          </div>
          <label class="sort-control">Sort by
            <select v-model="sort">
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Guest rating</option>
            </select>
          </label>
        </div>
        <div class="room-signin-banner">
          <span class="material-symbols-outlined" aria-hidden="true">loyalty</span>
          <b>Member prices are waiting for you</b>
          <span>Sign in to see your available rewards.</span>
          <a href="login.html">Sign in</a>
        </div>
        <div class="room-results-list">
          <RoomCard
            v-for="room in pageRooms"
            :key="room.id"
            :room="room"
            :search="searchContext"
            :saved="savedIds.includes(room.id)"
            @wish="wish(room.id)"
          />
          <div v-if="!matches.length" class="no-room-results">
            <b>No rooms match these filters.</b>
            <span>Try a different destination, country, date or price.</span>
          </div>
        </div>
        <nav v-if="totalPages > 1" class="room-pagination" aria-label="Room result pages">
          <span class="page-summary">
            Showing {{ firstRoom + 1 }}–{{ Math.min(firstRoom + roomsPerPage, matches.length) }} of {{ matches.length }}
          </span>
          <div class="page-controls">
            <button type="button" class="page-arrow" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Previous</button>
            <button
              v-for="page in pageNumbers"
              :key="page"
              type="button"
              class="page-number"
              :class="{ active: page === currentPage }"
              :aria-current="page === currentPage ? 'page' : null"
              @click="goToPage(page)"
            >{{ page }}</button>
            <button type="button" class="page-arrow" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Next</button>
          </div>
        </nav>
      </section>

      <aside class="room-inspiration" aria-label="Travel inspiration">
        <div class="inspiration-card inspiration-island">
          <div>
            <small>MAKE TIME FOR THE SEA</small>
            <b>Your next island stay is closer than you think.</b>
            <a href="packages.html?q=Beach">Explore island escapes <span>→</span></a>
          </div>
        </div>
        <div class="inspiration-card inspiration-city">
          <div>
            <small>GO A LITTLE FURTHER</small>
            <b>Find a room that makes the journey yours.</b>
            <a href="packages.html">See travel ideas <span>→</span></a>
          </div>
        </div>
      </aside>
    </div>
  </main>
  <SiteFooter />
</template>
