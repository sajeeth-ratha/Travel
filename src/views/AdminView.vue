<script setup>
import { computed, onMounted, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import AdminPackageDialog from '../components/AdminPackageDialog.vue'
import AdminRoomDialog from '../components/AdminRoomDialog.vue'
import { signOut } from '../lib/account.js'
import {
  deletePackage, deleteRoom, getBookings, getPackageById, getPackages, getRoomById,
  getRooms, resetToDemoData, updateBooking
} from '../lib/data.js'
import { currentUser, savedIds, toggleSaved } from '../lib/store.js'
import { bookingDateLabel, bookingTitle, getLoyaltyPoints, money } from '../lib/ui.js'

const user = currentUser
const trips = ref(getPackages())
const rooms = ref(getRooms())
const bookings = ref([])
const selectedId = ref('')
const historySearch = ref('')
const historyStatus = ref('All')

const packageDialogOpen = ref(false)
const packageEditItem = ref(null)
const roomDialogOpen = ref(false)
const roomEditItem = ref(null)

const packageSection = ref(null)
const roomSection = ref(null)

const filterTabs = ['All', 'Confirmed', 'Pending', 'Cancelled']

function sortBookings(list) {
  return [...list].sort((a, b) => (b.bookingDate || '').localeCompare(a.bookingDate || ''))
}

function loadBookings() {
  bookings.value = sortBookings(getBookings())
  if (!bookings.value.some(booking => booking.id === selectedId.value)) {
    selectedId.value = (bookings.value.find(booking => booking.status !== 'Cancelled') || bookings.value[0])?.id || ''
  }
}

const selectedBooking = computed(() => bookings.value.find(booking => booking.id === selectedId.value) || null)

const myBookings = computed(() => {
  if (!user.value) return []
  return bookings.value.filter(booking =>
    booking.userId === user.value.id || booking.customerEmail === user.value.email)
})

const myPoints = computed(() => getLoyaltyPoints(myBookings.value))
const favoriteTrips = computed(() => trips.value.filter(trip => savedIds.value.includes(trip.id)))

const visibleBookings = computed(() => {
  const search = historySearch.value.trim().toLowerCase()
  return bookings.value.filter(booking =>
    (historyStatus.value === 'All' || booking.status === historyStatus.value)
    && `${booking.bookingRef} ${booking.customerName} ${bookingTitle(booking)} ${booking.status}`.toLowerCase().includes(search))
})

const guestTrip = computed(() => {
  const booking = selectedBooking.value
  if (!booking) return null
  return booking.bookingType === 'room' ? getRoomById(booking.roomId) : getPackageById(booking.packageId)
})

const guestInitials = computed(() => {
  const name = selectedBooking.value?.customerName || 'No guest selected'
  return name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || '?'
})

const guestCount = computed(() => Number(selectedBooking.value?.adults || 0) + Number(selectedBooking.value?.children || 0))
const isRoomBooking = computed(() => selectedBooking.value?.bookingType === 'room')
const guestTravelDate = computed(() => (selectedBooking.value ? bookingDateLabel(selectedBooking.value) : 'Not selected'))
const guestBookingDate = computed(() => (selectedBooking.value?.bookingDate
  ? new Date(`${selectedBooking.value.bookingDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—'))
const guestPhotos = computed(() => {
  const trip = guestTrip.value
  if (!trip) return []
  return trip.gallery?.length ? trip.gallery.slice(0, 3) : trip.coverImage ? [trip.coverImage] : []
})

const adminInitial = computed(() => (user.value?.name || 'Admin').trim().charAt(0).toUpperCase())

function jump(section) {
  if (section === 'admin-package-section' && packageSection.value) packageSection.value.open = true
  if (section === 'admin-room-section' && roomSection.value) roomSection.value.open = true
  document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `admin.html#${section}`)
}

function selectBooking(booking) {
  selectedId.value = booking.id
  document.querySelector('.guest-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function updateStatus(booking, status) {
  updateBooking(booking.id, { status })
  booking.status = status
}

function openNewPackage() {
  packageEditItem.value = null
  packageDialogOpen.value = true
}

function openPackage(trip) {
  packageEditItem.value = trip
  packageDialogOpen.value = true
}

function onPackageSaved() {
  packageDialogOpen.value = false
  trips.value = getPackages()
  loadBookings()
}

function removePackage(trip) {
  if (confirm('Delete this trip?')) {
    deletePackage(trip.id)
    trips.value = getPackages()
    loadBookings()
  }
}

function openNewRoom() {
  roomEditItem.value = null
  roomDialogOpen.value = true
}

function openRoom(room) {
  roomEditItem.value = room
  roomDialogOpen.value = true
}

function onRoomSaved() {
  roomDialogOpen.value = false
  rooms.value = getRooms()
}

function removeRoom(room) {
  if (confirm(`Delete ${room.name}?`)) {
    deleteRoom(room.id)
    rooms.value = getRooms()
  }
}

function resetData() {
  if (confirm('Reset all demo data?')) {
    resetToDemoData()
    trips.value = getPackages()
    rooms.value = getRooms()
    selectedId.value = ''
    loadBookings()
  }
}

function wish(id) {
  toggleSaved(id)
}

function logout() {
  signOut()
  window.location.href = 'index.html'
}

onMounted(() => {
  if (!user.value) {
    window.location.href = 'login.html?next=admin.html'
    return
  }
  if (user.value.role !== 'admin') {
    window.location.href = 'panel.html'
    return
  }
  loadBookings()
  const requested = location.hash ? document.querySelector(location.hash) : null
  if (requested?.matches('details.package-manager')) requested.open = true
})
</script>

<template>
  <SiteHeader />
  <main class="admin-workspace">
    <div class="admin-dashboard-grid">
      <aside class="admin-side-menu" aria-label="Admin sections">
        <div class="admin-side-label">MANAGE</div>
        <a href="#booking-section" @click.prevent="jump('booking-section')">Guest bookings</a>
        <a href="#admin-package-section" @click.prevent="jump('admin-package-section')">Travel packages</a>
        <a href="#admin-room-section" @click.prevent="jump('admin-room-section')">Rooms &amp; stays</a>
        <a href="rooms.html">View room listings ↗</a>
      </aside>
      <div class="admin-main-column">
        <div class="admin-toolbar">
          <div class="admin-page-title">
            <div class="eyebrow">AGENCY WORKSPACE</div>
            <h1>Guest Details</h1>
          </div>
          <label class="admin-search">
            <span class="search-icon" aria-hidden="true">⌕</span>
            <input v-model="historySearch" type="search" placeholder="Search guest, trip or booking">
          </label>
          <div class="admin-user">
            <span class="admin-avatar">{{ adminInitial }}</span>
            <span><b>{{ user?.name || 'Admin' }}</b><small>Administrator</small></span>
          </div>
          <button class="admin-logout" @click="logout">Log out</button>
        </div>

        <section class="admin-personal-tools" aria-label="Your rewards and wishlist">
          <div class="admin-reward-card">
            <div class="eyebrow">MY REWARDS</div>
            <div class="admin-reward-total"><strong>{{ myPoints.toLocaleString() }}</strong><span>points</span></div>
            <small>{{ money(myPoints / 10) }} available to use</small>
            <p>Earn 1 point per $10 spent. Each point is worth $0.10.</p>
          </div>
          <div class="admin-wishlist-card">
            <div class="admin-wishlist-heading">
              <div>
                <div class="eyebrow">SAVED FOR LATER</div>
                <h2>My wishlist <small>{{ favoriteTrips.length }} {{ favoriteTrips.length === 1 ? 'trip' : 'trips' }}</small></h2>
              </div>
              <a href="wishlist.html">Open wishlist →</a>
            </div>
            <div class="admin-wishlist-items">
              <article v-for="trip in favoriteTrips" :key="trip.id" class="admin-favorite-mini">
                <a :href="`package.html?id=${trip.id}`">
                  <img :src="trip.coverImage" :alt="trip.destination">
                  <span>{{ trip.destination }}, {{ trip.country }}</span>
                </a>
                <button type="button" :aria-label="`Remove ${trip.destination} from wishlist`" @click="wish(trip.id)">♥</button>
              </article>
              <p v-if="!favoriteTrips.length" class="admin-wishlist-empty">No saved trips yet. Browse packages and save a favorite.</p>
            </div>
          </div>
        </section>

        <div class="admin-breadcrumb">
          <a href="index.html">Dashboard</a><span>/</span>
          <b>{{ selectedBooking ? selectedBooking.customerName : 'Guests' }}</b>
        </div>

        <div class="guest-layout">
          <aside class="guest-profile">
            <div class="guest-cover"></div>
            <div class="guest-avatar">{{ guestInitials }}</div>
            <span class="guest-reference">{{ selectedBooking ? selectedBooking.bookingRef : 'NO BOOKING' }}</span>
            <h2>{{ selectedBooking ? selectedBooking.customerName : 'No guest selected' }}</h2>
            <p class="guest-label">{{ selectedBooking ? 'Traveler' : 'Choose a booking to see guest details' }}</p>
            <template v-if="selectedBooking">
              <a class="guest-contact" :href="`tel:${selectedBooking.customerPhone || ''}`">
                <span>☎</span>{{ selectedBooking.customerPhone || 'Phone not provided' }}
              </a>
              <a class="guest-contact" :href="`mailto:${selectedBooking.customerEmail || ''}`">
                <span>✉</span>{{ selectedBooking.customerEmail || 'Email not provided' }}
              </a>
            </template>
          </aside>

          <section class="current-booking">
            <template v-if="selectedBooking && guestTrip">
              <div class="current-heading">
                <div>
                  <div class="eyebrow">RESERVATION DETAILS</div>
                  <h2>Current Booking</h2>
                </div>
                <span class="status-pill" :class="selectedBooking.status.toLowerCase()">{{ selectedBooking.status }}</span>
              </div>
              <div class="booking-summary">
                <div class="booking-key">⌑</div>
                <div class="booking-title">
                  <small>{{ isRoomBooking ? 'ROOM RESERVATION' : 'BOOKING ID' }} #{{ selectedBooking.bookingRef }}</small>
                  <h3>{{ bookingTitle(selectedBooking) }}</h3>
                </div>
                <div class="booking-fact"><small>Guests</small><b>{{ guestCount || 1 }} {{ (guestCount || 1) === 1 ? 'person' : 'people' }}</b></div>
                <div class="booking-fact">
                  <small>{{ isRoomBooking ? 'Stay length' : 'Duration' }}</small>
                  <b>{{ isRoomBooking ? `${selectedBooking.nights || 1} ${(selectedBooking.nights || 1) === 1 ? 'night' : 'nights'}` : `${guestTrip.duration} days` }}</b>
                </div>
                <div class="booking-fact">
                  <small>{{ isRoomBooking ? 'Check-in · check-out' : 'Travel date' }}</small>
                  <b>{{ guestTravelDate }}</b>
                </div>
              </div>
              <div class="booking-highlight">
                <b>{{ isRoomBooking ? 'Room features' : 'Trip highlights' }}</b>
                <div class="booking-highlight-chips">
                  <span v-for="item in (guestTrip.amenities || guestTrip.included || []).slice(0, 2)" :key="item">{{ item }}</span>
                </div>
              </div>
              <div class="admin-trip-photos">
                <a
                  v-for="(photo, index) in guestPhotos"
                  :key="photo"
                  :href="isRoomBooking ? `room.html?id=${guestTrip.id}` : `package.html?id=${guestTrip.id}`"
                  class="admin-trip-photo"
                  :class="{ 'photo-overlay': index === 2 }"
                >
                  <img :src="photo" :alt="`${guestTrip.destination} ${isRoomBooking ? 'room' : 'trip'} photo`">
                  <span v-if="index === 2">View {{ isRoomBooking ? 'room' : 'trip' }} ↗</span>
                </a>
              </div>
              <div class="booking-bottom">
                <span>Booked {{ guestBookingDate }}</span>
                <b>{{ money(selectedBooking.totalPrice) }}</b>
              </div>
            </template>
            <template v-else>
              <div class="current-heading">
                <div>
                  <div class="eyebrow">RESERVATION</div>
                  <h2>Current Booking</h2>
                </div>
              </div>
              <div class="empty-booking">There are no guest bookings yet. New reservations will appear here.</div>
            </template>
          </section>
        </div>

        <section class="booking-history" id="booking-section">
          <div class="history-heading">
            <div>
              <div class="eyebrow">GUEST ACTIVITY</div>
              <h2>Booking History</h2>
              <p>Search and update room or trip reservations.</p>
            </div>
            <span>{{ visibleBookings.length }} of {{ bookings.length }} bookings</span>
          </div>
          <div class="history-tools">
            <div class="booking-filters" role="group" aria-label="Filter bookings">
              <button
                v-for="tab in filterTabs"
                :key="tab"
                type="button"
                :class="{ selected: historyStatus === tab }"
                @click="historyStatus = tab"
              >{{ tab }}</button>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th><th>Guest</th><th>Trip or room</th><th>Travel / stay dates</th>
                  <th>Guests</th><th>Status</th><th>View</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in visibleBookings" :key="booking.id">
                  <td><b>{{ booking.bookingRef }}</b></td>
                  <td>{{ booking.customerName }}</td>
                  <td>{{ booking.bookingType === 'room' ? 'Room · ' : '' }}{{ bookingTitle(booking) }}</td>
                  <td>{{ booking.travelDate ? bookingDateLabel(booking) : '—' }}</td>
                  <td>{{ Number(booking.adults || 0) + Number(booking.children || 0) || 1 }}</td>
                  <td>
                    <select
                      class="status-select"
                      :class="booking.status.toLowerCase()"
                      aria-label="Update booking status"
                      :value="booking.status"
                      @change="updateStatus(booking, $event.target.value)"
                    >
                      <option>Confirmed</option><option>Pending</option><option>Cancelled</option>
                    </select>
                  </td>
                  <td><button class="view-booking" type="button" @click="selectBooking(booking)">View</button></td>
                </tr>
                <tr v-if="!visibleBookings.length">
                  <td colspan="7" class="no-bookings">No matching bookings found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <details ref="packageSection" class="package-manager" id="admin-package-section">
          <summary>
            <span><small>TRIP COLLECTION</small><b>Manage travel packages</b></span>
            <span class="manager-plus">+</span>
          </summary>
          <section class="admin-section">
            <div class="admin-title">
              <div>
                <div class="eyebrow">YOUR COLLECTION</div>
                <h2>Travel packages</h2>
              </div>
              <div class="admin-actions">
                <button class="button" @click="openNewPackage">+ Add package</button>
                <button class="button outline" @click="resetData">Reset demo data</button>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Trip</th><th>Place</th><th>Departure dates</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr v-for="trip in trips" :key="trip.id">
                    <td>{{ trip.title }}</td>
                    <td>{{ trip.destination }}, {{ trip.country }}</td>
                    <td>{{ (trip.departureDates || []).join(', ') || 'Dates not set' }}</td>
                    <td>{{ money(trip.price) }}</td>
                    <td>
                      <button @click="openPackage(trip)">Edit</button>
                      <button class="danger-text" @click="removePackage(trip)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </details>

        <details ref="roomSection" class="package-manager room-manager" id="admin-room-section">
          <summary>
            <span><small>STAY COLLECTION</small><b>Manage rooms &amp; stays</b></span>
            <span class="manager-plus">+</span>
          </summary>
          <section class="admin-section">
            <div class="admin-title">
              <div>
                <div class="eyebrow">ROOM INVENTORY</div>
                <h2>Rooms &amp; stays</h2>
              </div>
              <div class="admin-actions">
                <button class="button" @click="openNewRoom">+ Add room</button>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Room</th><th>Property</th><th>Place</th><th>Room type</th><th>Price / night</th><th>Check-in dates</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr v-for="room in rooms" :key="room.id">
                    <td>{{ room.name }}</td>
                    <td>{{ room.property }}</td>
                    <td>{{ room.destination }}, {{ room.country }}</td>
                    <td>{{ room.type }}</td>
                    <td>{{ money(room.price) }}</td>
                    <td>{{ room.availableFrom || room.availableTo ? `${room.availableFrom || 'Any date'} – ${room.availableTo || 'Open'}` : 'All dates' }}</td>
                    <td>
                      <button @click="openRoom(room)">Edit</button>
                      <button class="danger-text" @click="removeRoom(room)">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="!rooms.length"><td colspan="7" class="no-bookings">No room listings yet.</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </details>
      </div>
    </div>
  </main>
  <SiteFooter />

  <AdminPackageDialog
    v-if="packageDialogOpen"
    :item="packageEditItem"
    @saved="onPackageSaved"
    @close="packageDialogOpen = false"
  />
  <AdminRoomDialog
    v-if="roomDialogOpen"
    :item="roomEditItem"
    @saved="onRoomSaved"
    @close="roomDialogOpen = false"
  />
</template>
