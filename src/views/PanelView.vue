<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import TripCard from '../components/TripCard.vue'
import SavedRoomCard from '../components/SavedRoomCard.vue'
import VoucherDialog from '../components/VoucherDialog.vue'
import { signOut, updateAccountProfile } from '../lib/account.js'
import {
  canCancelBooking, cancelBooking, getBookings, getPackages, getRoomById,
  getRooms, getPackageById, updateBooking
} from '../lib/data.js'
import { currentUser, refreshUser, savedIds, toggleSaved } from '../lib/store.js'
import { bookingDateLabel, bookingTitle, getLoyaltyPoints, money } from '../lib/ui.js'

const user = currentUser
const bookings = ref([])
const trips = ref([])
const rooms = ref([])

const activeFilter = ref('All')
const voucher = ref(null)
const copyFeedback = ref('')
const profileMessage = ref('')
const bookingMessage = ref('')
const settingsProfileStatus = reactive({ text: '', type: '' })
const settingsPasswordStatus = reactive({ text: '', type: '' })

const profileDialog = ref(null)
const bookingDialog = ref(null)
const settingsPasswordVisible = ref(false)
const showProfilePassword = ref(false)
const editSummary = ref('')

const today = new Date().toISOString().slice(0, 10)

const profileForm = reactive({ name: '', email: '', phone: '', password: '' })
const editForm = reactive({ bookingId: '', customerName: '', customerEmail: '', customerPhone: '', specialRequests: '' })
const settingsForm = reactive({ name: '', email: '', phone: '' })
const passwordForm = reactive({ newPassword: '', confirmPassword: '' })

const filters = ['All', 'Upcoming', 'Past', 'Cancelled']

function loadData() {
  if (!user.value) return
  bookings.value = getBookings()
  trips.value = getPackages()
  rooms.value = getRooms()
  profileForm.name = user.value.name
  profileForm.email = user.value.email
  profileForm.phone = user.value.phone || ''
  settingsForm.name = user.value.name
  settingsForm.email = user.value.email
  settingsForm.phone = user.value.phone || ''
}

const memberId = computed(() => {
  if (!user.value) return ''
  return `#WL-2026-${(user.value.id || 'TRAVELER').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`
})

const initials = computed(() => (user.value?.name || 'Traveler').trim().charAt(0).toUpperCase())

const myBookings = computed(() => {
  if (!user.value) return []
  return bookings.value.filter(booking =>
    booking.userId === user.value.id || booking.customerEmail === user.value.email)
})

const points = computed(() => getLoyaltyPoints(myBookings.value))
const upcomingCount = computed(() => myBookings.value.filter(booking =>
  booking.status !== 'Cancelled' && booking.travelDate >= today).length)
const totalSavings = computed(() => myBookings.value.reduce((sum, booking) => sum + (Number(booking.discountAmount) || 0), 0))

const favoriteTrips = computed(() => trips.value.filter(trip => savedIds.value.includes(trip.id)))
const favoriteRooms = computed(() => rooms.value.filter(room => savedIds.value.includes(room.id)))
const savedCount = computed(() => favoriteTrips.value.length + favoriteRooms.value.length)

const filteredBookings = computed(() => {
  const list = myBookings.value.filter(booking => {
    if (activeFilter.value === 'Upcoming') return booking.status !== 'Cancelled' && booking.travelDate >= today
    if (activeFilter.value === 'Past') return booking.status !== 'Cancelled' && booking.travelDate < today
    if (activeFilter.value === 'Cancelled') return booking.status === 'Cancelled'
    return true
  })
  return [...list].sort((a, b) => (a.travelDate || '').localeCompare(b.travelDate || ''))
})

const progressPercent = computed(() => Math.min(100, Math.round((points.value / 500) * 100)))

function scrollToSection(tab) {
  document.querySelector(`#section-${tab}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function copyMemberId() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(memberId.value).then(() => {
      copyFeedback.value = 'Copied!'
      setTimeout(() => { copyFeedback.value = '' }, 2000)
    }).catch(() => {})
  }
}

function wish(id) {
  toggleSaved(id)
}

function viewVoucher(booking) {
  const item = booking.bookingType === 'room' ? getRoomById(booking.roomId) : getPackageById(booking.packageId)
  voucher.value = { booking, item }
}

function finishVoucher() {
  window.location.href = 'bookings.html'
}

function cancel(id) {
  const booking = myBookings.value.find(item => item.id === id)
  if (!canCancelBooking(booking)) {
    alert('Bookings can only be cancelled at least 3 days before the travel date.')
    return
  }
  if (confirm('Cancel this booking? This will update its status to Cancelled and points earned will be deducted.')) {
    cancelBooking(id)
    loadData()
  }
}

function openBookingEdit(booking) {
  if (!canCancelBooking(booking)) {
    alert('Booking changes are available until 3 days before travel.')
    return
  }
  editForm.bookingId = booking.id
  editForm.customerName = booking.customerName || user.value.name
  editForm.customerEmail = booking.customerEmail || user.value.email
  editForm.customerPhone = booking.customerPhone || ''
  editForm.specialRequests = booking.specialRequests || ''
  editSummary.value = `${bookingTitle(booking)} · ${bookingDateLabel(booking)}`
  bookingMessage.value = ''
  bookingDialog.value?.showModal()
}

function saveBookingEdit() {
  const booking = myBookings.value.find(item => item.id === editForm.bookingId)
  if (!canCancelBooking(booking)) {
    bookingMessage.value = 'Changes close 3 days before travel.'
    return
  }
  updateBooking(booking.id, {
    customerName: editForm.customerName.trim(),
    customerEmail: editForm.customerEmail.trim(),
    customerPhone: editForm.customerPhone.trim(),
    specialRequests: editForm.specialRequests.trim()
  })
  bookingDialog.value?.close()
  loadData()
}

function openProfile() {
  profileForm.name = user.value.name
  profileForm.email = user.value.email
  profileForm.phone = user.value.phone || ''
  profileForm.password = ''
  profileMessage.value = ''
  profileDialog.value?.showModal()
}

function saveProfile() {
  try {
    const updated = updateAccountProfile(user.value.id, {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      password: profileForm.password || undefined
    })
    myBookings.value.forEach(booking => {
      updateBooking(booking.id, {
        customerName: updated.name,
        customerEmail: updated.email,
        customerPhone: updated.phone
      })
    })
    refreshUser()
    profileDialog.value?.close()
    loadData()
  } catch (error) {
    profileMessage.value = error.message
  }
}

function saveSettingsProfile() {
  try {
    const updated = updateAccountProfile(user.value.id, {
      name: settingsForm.name,
      email: settingsForm.email,
      phone: settingsForm.phone
    })
    myBookings.value.forEach(booking => {
      updateBooking(booking.id, {
        customerName: updated.name,
        customerEmail: updated.email,
        customerPhone: updated.phone
      })
    })
    refreshUser()
    settingsProfileStatus.type = 'success'
    settingsProfileStatus.text = 'Profile details saved!'
    loadData()
  } catch (error) {
    settingsProfileStatus.type = 'error'
    settingsProfileStatus.text = error.message
  }
}

function saveSettingsPassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    settingsPasswordStatus.type = 'error'
    settingsPasswordStatus.text = 'Passwords do not match.'
    return
  }
  try {
    updateAccountProfile(user.value.id, {
      name: user.value.name,
      email: user.value.email,
      phone: user.value.phone,
      password: passwordForm.newPassword
    })
    settingsPasswordStatus.type = 'success'
    settingsPasswordStatus.text = 'Password updated successfully!'
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    setTimeout(() => { settingsPasswordStatus.text = '' }, 3000)
  } catch (error) {
    settingsPasswordStatus.type = 'error'
    settingsPasswordStatus.text = error.message
  }
}

function logout() {
  signOut()
  window.location.href = 'index.html'
}

onMounted(() => {
  if (!user.value) {
    window.location.href = 'login.html'
    return
  }
  loadData()
})
</script>

<template>
  <SiteHeader active="account" />
  <main class="wrap page account-dashboard">
    <section class="panel-hero" aria-label="Member profile banner">
      <div class="panel-hero-copy">
        <span class="eyebrow">YOUR TRAVEL, ALL IN ONE PLACE</span>
        <p>Good to see you again</p>
      </div>
      <div class="panel-hero-profile">
        <div class="profile-avatar">{{ initials }}</div>
        <div class="panel-hero-info">
          <div class="member-badge-row">
            <span class="member-tier-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Wanderlust Rewards · Silver Member</span>
            </span>
            <span class="member-id-pill" title="Click to copy your Member ID" @click="copyMemberId">
              <span class="id-label">Member ID:</span>
              <strong>{{ memberId }}</strong>
              <button type="button" class="copy-id-btn" aria-label="Copy member ID" @click.stop="copyMemberId">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <span class="copied-tooltip" :class="{ visible: copyFeedback }" role="status" aria-live="polite">{{ copyFeedback }}</span>
            </span>
          </div>

          <h1>{{ user?.name }}</h1>

          <div class="panel-hero-meta">
            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>{{ user?.email }}</span>
            </span>
            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>{{ user?.phone || 'No phone saved' }}</span>
            </span>
            <span class="meta-item member-since-tag">Member since 2026</span>
          </div>
        </div>
      </div>

      <div class="panel-hero-actions">
        <button class="button outline small" type="button" @click="openProfile">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit Profile
        </button>
        <button class="button small text-action" type="button" @click="logout">Log out</button>
      </div>
    </section>

    <div class="account-layout">
      <nav class="panel-subnav" aria-label="Account sections">
        <button type="button" class="subnav-pill active" @click="scrollToSection('overview')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Overview
        </button>
        <button type="button" class="subnav-pill" @click="scrollToSection('bookings')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          My Bookings <span class="tab-badge">{{ myBookings.length }}</span>
        </button>
        <button type="button" class="subnav-pill" @click="scrollToSection('rewards')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Wanderlust Rewards
        </button>
        <button type="button" class="subnav-pill" @click="scrollToSection('wishlist')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          Saved Wishlist <span class="tab-badge">{{ savedCount }}</span>
        </button>
        <button type="button" class="subnav-pill" @click="scrollToSection('security')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Security &amp; Settings
        </button>
      </nav>

      <div class="account-content">
        <div id="section-overview" class="panel-section">
          <div class="overview-heading">
            <div>
              <span class="eyebrow">A LITTLE MORE TIME AWAY</span>
              <h2>Your travel at a glance</h2>
              <p>Keep your upcoming stays, rewards and favorite places close at hand.</p>
            </div>
            <a href="rooms.html" class="button">Find your next stay <span aria-hidden="true">→</span></a>
          </div>
          <section class="account-stats" aria-label="Account overview statistics">
            <article class="account-stat">
              <div class="stat-icon stat-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="stat-content"><small>UPCOMING TRIPS</small><strong>{{ upcomingCount }}</strong><span>ready for departure</span></div>
            </article>
            <article class="account-stat">
              <div class="stat-icon stat-amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div class="stat-content"><small>REWARD POINTS</small><strong>{{ points.toLocaleString() }}</strong><span>{{ money(points / 10) }} available to use</span></div>
            </article>
            <article class="account-stat">
              <div class="stat-icon stat-rose">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <div class="stat-content"><small>SAVED PLACES</small><strong>{{ savedCount }}</strong><span>in your wishlist</span></div>
            </article>
            <article class="account-stat">
              <div class="stat-icon stat-emerald">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </div>
              <div class="stat-content"><small>LIFETIME SAVINGS</small><strong>{{ money(totalSavings) }}</strong><span>saved with promos &amp; rewards</span></div>
            </article>
          </section>
        </div>

        <div id="section-rewards" class="panel-section">
          <section class="rewards-card" aria-label="Wanderlust rewards and loyalty program">
            <div class="reward-main">
              <div class="eyebrow">ONEKEY REWARDS &amp; VIP PERKS</div>
              <h2>Unlock travel savings on every reservation.</h2>
              <p>Earn 1 point for every $10 spent across hotels and tour packages. Every 10 points equals $1.00 instant discount at checkout.</p>
              <div class="rewards-progress-card">
                <div class="progress-info">
                  <span>Next reward milestone: <b>$50 Travel Credit</b> (500 pts)</span>
                  <span>{{ points }} / 500 points</span>
                </div>
                <div class="progress-track" aria-hidden="true">
                  <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
                </div>
              </div>
              <div class="rewards-perks-row">
                <div class="perk-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Member-Only Rates (Up to 15% off)</span></div>
                <div class="perk-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Free Cancellation on Select Stays</span></div>
                <div class="perk-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Instant Redemption at Checkout</span></div>
              </div>
            </div>
            <div class="rewards-balance-box">
              <span class="balance-title">AVAILABLE POINTS</span>
              <strong>{{ points.toLocaleString() }}</strong>
              <span class="balance-pts">points</span>
              <div class="balance-cash-badge">{{ money(points / 10) }} available</div>
              <a class="button small" href="rooms.html">Browse Stays &amp; Earn</a>
            </div>
          </section>
        </div>

        <div id="section-bookings" class="panel-section">
          <section class="panel-bookings" aria-label="Your bookings and reservations">
            <div class="section-heading">
              <div>
                <div class="eyebrow">YOUR TRAVEL PLANS</div>
                <h2>Bookings &amp; Stays</h2>
                <p>Access your reservations, manage lead traveler details, download official vouchers, or cancel if needed.</p>
              </div>
              <a href="packages.html" class="browse-link">Explore packages
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>
            <div class="booking-history-tabs" role="group" aria-label="Filter booking history">
              <button
                v-for="filter in filters"
                :key="filter"
                type="button"
                :class="{ selected: activeFilter === filter }"
                @click="activeFilter = filter"
              >{{ filter === 'Past' ? 'Past trips' : filter === 'All' ? 'All bookings' : filter }}</button>
            </div>
            <div class="booking-list">
              <div v-if="!filteredBookings.length" class="empty-state">
                <div class="empty-state-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3>{{ activeFilter === 'All' || activeFilter === 'Upcoming' ? 'Your next adventure awaits' : `No ${activeFilter.toLowerCase()} reservations` }}</h3>
                <p>{{ activeFilter === 'All' || activeFilter === 'Upcoming' ? 'You have no active bookings at this time. Browse our curated hotels and trips to plan your next escape.' : 'When you have reservations in this category, they will appear here.' }}</p>
                <a v-if="activeFilter === 'All' || activeFilter === 'Upcoming'" class="button small" href="rooms.html">Browse Stays &amp; Packages</a>
              </div>

              <article v-for="booking in filteredBookings" :key="booking.id" class="booking member-booking">
                <a
                  class="member-booking-photo"
                  :href="booking.bookingType === 'room' ? `room.html?id=${booking.roomId}` : `package.html?id=${booking.packageId}`"
                  :aria-label="`View ${bookingTitle(booking)}`"
                >
                  <img :src="(booking.bookingType === 'room' ? getRoomById(booking.roomId) : getPackageById(booking.packageId))?.coverImage || ''" :alt="bookingTitle(booking)" loading="lazy">
                </a>
                <div class="member-booking-info">
                  <div class="booking-tag-row">
                    <span class="booking-ref-badge">{{ booking.bookingRef }}</span>
                    <span class="booking-type-badge">{{ booking.bookingType === 'room' ? 'HOTEL STAY' : 'TOUR PACKAGE' }}</span>
                  </div>
                  <h3>{{ bookingTitle(booking) }}</h3>
                  <p class="booking-date">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{{ bookingDateLabel(booking) }}</span>
                  </p>
                  <div>
                    <span class="booking-status" :class="(booking.status || 'Confirmed').toLowerCase()">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      {{ booking.status }}
                    </span>
                  </div>
                </div>
                <div class="member-booking-payment">
                  <b>{{ money(booking.totalPrice) }}</b>
                  <small>{{ booking.paymentMethod || 'Paid (Demo Card)' }}</small>
                  <small v-if="booking.discountAmount" class="discount-saved">Saved {{ money(booking.discountAmount) }}</small>
                  <small style="color:#0284c7;font-weight:600;">+{{ booking.pointsEarned || Math.floor(booking.totalPrice / 10) }} pts</small>
                </div>
                <div class="member-booking-actions">
                  <button class="button small voucher-action" type="button" @click="viewVoucher(booking)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    View Voucher
                  </button>
                  <template v-if="canCancelBooking(booking)">
                    <button class="button small manage-booking" type="button" @click="openBookingEdit(booking)">Manage Details</button>
                    <button class="button small danger" type="button" @click="cancel(booking.id)">Cancel Booking</button>
                    <small class="booking-policy-note">Free cancellation up to 3 days before travel</small>
                  </template>
                  <small v-else-if="booking.status === 'Cancelled'" class="booking-policy-note">Reservation cancelled</small>
                  <small v-else-if="booking.status !== 'Cancelled' && booking.travelDate >= today" class="booking-policy-note warning">Changes close 3 days prior to departure</small>
                  <small v-else class="booking-policy-note">Completed trip</small>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div id="section-wishlist" class="panel-section">
          <section class="panel-favorites" aria-label="Saved places and trips">
            <div class="section-heading">
              <div>
                <div class="eyebrow">SAVED FOR LATER</div>
                <h2>Your Wishlist <small>({{ savedCount }})</small></h2>
                <p>Destinations and hotel rooms you have bookmarked for your upcoming adventures.</p>
              </div>
              <a href="wishlist.html" class="browse-link">Full wishlist
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>
            <div class="cards">
              <div v-if="!savedCount" class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
                <h3>Your wishlist is empty</h3>
                <p>Tap the heart icon on any package or room to save your dream destinations for later.</p>
                <a class="button small" href="packages.html">Explore Travel Packages</a>
              </div>
              <TripCard v-for="trip in favoriteTrips" :key="trip.id" :trip="trip" :saved="true" @wish="wish(trip.id)" />
              <SavedRoomCard v-for="room in favoriteRooms" :key="room.id" :room="room" :saved="true" @wish="wish(room.id)" />
            </div>
          </section>
        </div>

        <div id="section-security" class="panel-section">
          <section class="panel-security" aria-label="Security and account settings">
            <div class="section-heading">
              <div>
                <div class="eyebrow">PROFILE &amp; SECURITY</div>
                <h2>Account Settings</h2>
                <p>Update your personal details, verified phone number, and password anytime.</p>
              </div>
            </div>
            <div class="settings-grid">
              <article class="settings-card">
                <div class="settings-card-header">
                  <div class="settings-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div><h3>Personal Information</h3><p>Used to automatically populate lead traveler information during booking.</p></div>
                </div>
                <form class="settings-form" @submit.prevent="saveSettingsProfile">
                  <label>Full Name<input v-model="settingsForm.name" required autocomplete="name"></label>
                  <label>Email Address<input v-model="settingsForm.email" type="email" required autocomplete="email"></label>
                  <label>Phone Number<input v-model="settingsForm.phone" type="tel" autocomplete="tel" placeholder="+1 (555) 0144"></label>
                  <div class="settings-action-row">
                    <button type="submit" class="button small">Save Profile Details</button>
                    <span class="settings-status" :class="settingsProfileStatus.type" aria-live="polite">{{ settingsProfileStatus.text }}</span>
                  </div>
                </form>
              </article>
              <article class="settings-card">
                <div class="settings-card-header">
                  <div class="settings-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <div><h3>Change Password</h3><p>Ensure your account is protected with a secure password (at least 6 characters).</p></div>
                </div>
                <form class="settings-form" @submit.prevent="saveSettingsPassword">
                  <label>New Password
                    <div class="password-input-wrap">
                      <input
                        v-model="passwordForm.newPassword"
                        :type="settingsPasswordVisible ? 'text' : 'password'"
                        minlength="6"
                        required
                        autocomplete="new-password"
                        placeholder="At least 6 characters"
                      >
                      <button type="button" class="toggle-password" aria-label="Toggle password visibility" @click="settingsPasswordVisible = !settingsPasswordVisible">
                        <svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </div>
                  </label>
                  <label>Confirm New Password
                    <input v-model="passwordForm.confirmPassword" type="password" minlength="6" required autocomplete="new-password" placeholder="Re-enter new password">
                  </label>
                  <div class="settings-action-row">
                    <button type="submit" class="button small outline">Update Password</button>
                    <span class="settings-status" :class="settingsPasswordStatus.type" aria-live="polite">{{ settingsPasswordStatus.text }}</span>
                  </div>
                </form>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
  <SiteFooter />

  <dialog ref="profileDialog" class="account-dialog" aria-labelledby="profile-dialog-title">
    <button class="dialog-close" type="button" aria-label="Close profile editor" @click="profileDialog.close()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
    <div class="eyebrow">ACCOUNT DETAILS</div>
    <h2 id="profile-dialog-title">Edit Your Profile</h2>
    <p class="dialog-intro">Keep your contact details up to date for effortless bookings and notifications.</p>
    <form @submit.prevent="saveProfile">
      <label>Full name<input v-model="profileForm.name" required autocomplete="name"></label>
      <label>Email address<input v-model="profileForm.email" type="email" required autocomplete="email"></label>
      <label>Phone number<input v-model="profileForm.phone" type="tel" autocomplete="tel" placeholder="+1 (555) 0144"></label>
      <label>Change password (optional)
        <div class="password-input-wrap">
          <input
            v-model="profileForm.password"
            :type="showProfilePassword ? 'text' : 'password'"
            minlength="6"
            autocomplete="new-password"
            placeholder="Leave blank to keep current password"
          >
          <button type="button" class="toggle-password" aria-label="Toggle password visibility" @click="showProfilePassword = !showProfilePassword">
            <svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      </label>
      <p class="profile-message" aria-live="polite">{{ profileMessage }}</p>
      <div class="dialog-actions">
        <button class="button outline" type="button" @click="profileDialog.close()">Cancel</button>
        <button class="button" type="submit">Save Profile</button>
      </div>
    </form>
  </dialog>

  <dialog ref="bookingDialog" class="account-dialog booking-edit-dialog" aria-labelledby="booking-edit-title">
    <button class="dialog-close" type="button" aria-label="Close booking editor" @click="bookingDialog.close()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
    <div class="eyebrow">MANAGE YOUR BOOKING</div>
    <h2 id="booking-edit-title">Update Guest Details</h2>
    <p class="dialog-intro">{{ editSummary }}</p>
    <form @submit.prevent="saveBookingEdit">
      <label>Lead guest name<input v-model="editForm.customerName" required></label>
      <label>Contact email<input v-model="editForm.customerEmail" type="email" required></label>
      <label>Phone number<input v-model="editForm.customerPhone" type="tel" placeholder="+1 (555) 0144"></label>
      <label>Special requests<textarea v-model="editForm.specialRequests" rows="3" placeholder="e.g. Quiet room, ground floor, late check-in notice"></textarea></label>
      <p class="profile-message" aria-live="polite">{{ bookingMessage }}</p>
      <div class="dialog-actions">
        <button class="button outline" type="button" @click="bookingDialog.close()">Close</button>
        <button class="button" type="submit">Save Changes</button>
      </div>
    </form>
  </dialog>

  <VoucherDialog
    v-if="voucher"
    :booking="voucher.booking"
    @done="finishVoucher"
  />
</template>
