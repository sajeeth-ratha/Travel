// This file adds trip information and button actions to the HTML pages.
import {
  initStorage, getPackages, getPackageById, getBookings, createBooking,
  updateBooking, getWishlist, toggleWishlist, savePackage, deletePackage,
  resetToDemoData, validatePromoCode, daysUntilTravel, canCancelBooking, cancelBooking
} from './data.js'
import { getSignedInUser, createAccount, signIn, signOut } from './account.js'

initStorage()

const pageName = location.pathname.split('/').pop() || 'index.html'
const tripId = new URLSearchParams(location.search).get('id')
let slideTimer

function money(amount) {
  const value = Number(amount || 0)
  const digits = Number.isInteger(value) ? 0 : 2
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 2 })
}

function getDiscountAmount(promo, subtotal) {
  if (!promo) return 0
  if (promo.type === 'percent') return Math.round(subtotal * promo.value / 100)
  return Math.min(subtotal, promo.value)
}

function getLoyaltyPoints(bookings) {
  return bookings.filter(booking => booking.status !== 'Cancelled').reduce((total, booking) => {
    const earned = booking.pointsEarned ?? Math.floor(Number(booking.totalPrice || 0) / 10)
    return total + Number(earned) - Number(booking.pointsUsed || 0)
  }, 0)
}

function cardHtml(trip) {
  const saved = getWishlist().includes(trip.id)
  return `<article class="card">
    <a href="package.html?id=${trip.id}">
      <img src="${trip.coverImage}" alt="${trip.destination}">
      <div class="card-body">
        <div class="eyebrow">${trip.continent} · ${trip.duration} days</div>
        <h3>${trip.title}</h3>
        <p>${trip.shortDescription}</p>
        <div class="card-bottom"><b>${money(trip.price)} <small>/ person</small></b><span>★ ${trip.rating}</span></div>
      </div>
    </a>
    <div class="card-actions"><a class="button small" href="package.html?id=${trip.id}">View trip</a>
      <button class="heart" data-wish="${trip.id}">${saved ? '♥ Saved' : '♡ Save'}</button></div>
  </article>`
}

function connectWishlistButtons() {
  document.querySelectorAll('[data-wish]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault()
      toggleWishlist(button.dataset.wish)
      showPage()
    })
  })
}

function updateAccountLink() {
  const link = document.querySelector('#account-link')
  if (!link) return
  const user = getSignedInUser()
  link.href = user ? (user.role === 'admin' ? 'admin.html' : 'panel.html') : 'login.html'
  link.textContent = user ? (user.role === 'admin' ? 'Admin dashboard' : 'My panel') : 'Login'
}

function showHome() {
  const featured = getPackages().filter(trip => trip.featured).slice(0, 3)
  document.querySelector('#featured-trips').innerHTML = featured.map(cardHtml).join('')
  showHomeOptions()
  startHomeAnimations()
  document.querySelector('#search-button').addEventListener('click', searchFromHome)
  document.querySelector('#destination-search').addEventListener('keydown', event => {
    if (event.key === 'Enter') searchFromHome()
  })
  startCarousel()
  connectWishlistButtons()
}

function showHomeOptions() {
  const trips = getPackages()
  const styles = [
    { name: 'Beach & Island', note: 'Salt air and slow days', icon: 'beach_access' },
    { name: 'Cultural', note: 'History, food, and local life', icon: 'museum' },
    { name: 'Adventure & Nature', note: 'Fresh air and open trails', icon: 'hiking' },
    { name: 'Safari & Wildlife', note: 'Closer to the wild', icon: 'pets' },
    { name: 'Luxury Escapes', note: 'A little extra comfort', icon: 'hotel' }
  ]
  document.querySelector('#category-options').innerHTML = styles.map(style => {
    const count = trips.filter(trip => trip.category === style.name).length
    const sampleTrip = trips.find(trip => trip.category === style.name)
    return `<a class="category-option" data-home-reveal href="packages.html?q=${encodeURIComponent(style.name)}">
      <img src="${sampleTrip?.coverImage || ''}" alt="${style.name} travel idea" loading="lazy">
      <span class="category-shade"></span><span class="material-symbols-outlined option-icon" aria-hidden="true">${style.icon}</span>
      <span class="option-copy"><b>${style.name}</b><small>${style.note}</small></span>
      <span class="option-count">${count} ${count === 1 ? 'trip' : 'trips'} <span>↗</span></span></a>`
  }).join('')

  const regions = [...new Set(trips.map(trip => trip.continent))]
  const regionIcons = { Europe: 'location_city', Asia: 'temple_buddhist', Africa: 'pets', Americas: 'landscape', Oceania: 'sailing' }
  document.querySelector('#region-options').innerHTML = regions.map((region, index) => {
    const count = trips.filter(trip => trip.continent === region).length
    const sampleTrip = trips.find(trip => trip.continent === region)
    return `<a class="region-option" data-home-reveal style="--region-delay:${index * -3}s" href="packages.html?q=${encodeURIComponent(region)}">
      <img src="${sampleTrip?.coverImage || ''}" alt="" loading="lazy"><span class="region-shade"></span>
      <span class="material-symbols-outlined region-symbol" aria-hidden="true">${regionIcons[region] || 'public'}</span>
      <span class="region-copy"><b>${region}</b><small>${count} ${count === 1 ? 'journey' : 'journeys'}</small></span>
      <span class="region-arrow" aria-hidden="true">↗</span></a>`
  }).join('')

  document.querySelector('#destination-options').innerHTML = trips.slice(0, 4).map(trip =>
    `<a class="destination-option" data-home-reveal href="package.html?id=${trip.id}" style="--destination-image:url('${trip.coverImage}')">
      <span>${trip.country}</span><b>${trip.destination}</b><small>Explore journey ↗</small></a>`
  ).join('')
}

function startHomeAnimations() {
  const items = document.querySelectorAll('[data-home-reveal]')
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })
  items.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${(index % 5) * 70}ms`)
    observer.observe(item)
  })
}

function startCarousel() {
  const slides = [...document.querySelectorAll('.hero-slide')]
  const dots = [...document.querySelectorAll('[data-slide]')]
  if (!slides.length) return
  let currentSlide = 0
  let isPaused = false

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length
    slides.forEach((slide, position) => {
      slide.classList.toggle('active', position === currentSlide)
      slide.setAttribute('aria-hidden', position === currentSlide ? 'false' : 'true')
    })
    dots.forEach((dot, position) => dot.classList.toggle('active', position === currentSlide))
    document.querySelector('#slide-number').textContent = `0${currentSlide + 1} / 0${slides.length}`
  }

  function playSlides() {
    clearInterval(slideTimer)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isPaused && !reduceMotion) {
      slideTimer = setInterval(() => showSlide(currentSlide + 1), 6500)
    }
  }

  document.querySelector('#previous-slide').addEventListener('click', () => { showSlide(currentSlide - 1); playSlides() })
  document.querySelector('#next-slide').addEventListener('click', () => { showSlide(currentSlide + 1); playSlides() })
  dots.forEach((dot, position) => dot.addEventListener('click', () => { showSlide(position); playSlides() }))

  const carousel = document.querySelector('.home-carousel')
  carousel.addEventListener('mouseenter', () => { isPaused = true; clearInterval(slideTimer) })
  carousel.addEventListener('mouseleave', () => { isPaused = false; playSlides() })
  showSlide(0)
  playSlides()
}

function searchFromHome() {
  const search = document.querySelector('#destination-search').value
  location.href = `packages.html?q=${encodeURIComponent(search)}`
}

function showPackages() {
  const searchBox = document.querySelector('#package-search')
  const cards = document.querySelector('#package-cards')
  const count = document.querySelector('#trip-count')

  function filterTrips() {
    const search = searchBox.value.toLowerCase()
    const matches = getPackages().filter(trip =>
      (trip.title + trip.destination + trip.country + trip.category).toLowerCase().includes(search)
    )
    cards.innerHTML = matches.map(cardHtml).join('') || '<p>No trips found. Try a different search.</p>'
    count.textContent = `${matches.length} trips`
    connectWishlistButtons()
  }

  searchBox.value = new URLSearchParams(location.search).get('q') || ''
  searchBox.addEventListener('input', () => {
    history.replaceState(null, '', `packages.html?q=${encodeURIComponent(searchBox.value)}`)
    filterTrips()
  })
  filterTrips()
}

function showTripDetails() {
  const trip = getPackageById(tripId)
  const content = document.querySelector('#trip-content')
  if (!trip) {
    content.innerHTML = '<h1>Trip not found</h1><a href="packages.html">Back to all trips</a>'
    return
  }

  const saved = getWishlist().includes(trip.id)
  const saving = trip.originalPrice > trip.price ? trip.originalPrice - trip.price : 0
  const photos = trip.gallery?.length ? trip.gallery : [trip.coverImage]
  const galleryPhotos = [...photos, ...photos].slice(0, 3)
  content.innerHTML = `<a href="packages.html" class="back">← All trips</a>
    <section class="detail-heading">
      <div class="eyebrow">${trip.category} · ${trip.continent}</div>
      <h1>${trip.title}</h1>
      <div class="detail-meta"><span>⌖ ${trip.destination}, ${trip.country}</span><a href="#trip-reviews">★ ${trip.rating} · ${trip.reviewCount} traveler reviews</a><span>${trip.duration} days · ${trip.groupSize || 'Small group'}</span></div>
    </section>
    <section class="detail-gallery" aria-label="Photos of ${trip.destination}">
      <button class="gallery-photo gallery-main" data-photo-index="0" aria-label="Open photo 1"><img src="${galleryPhotos[0]}" alt="${trip.destination} travel photo" fetchpriority="high"></button>
      <button class="gallery-photo" data-photo-index="1" aria-label="Open photo 2"><img src="${galleryPhotos[1] || galleryPhotos[0]}" alt="${trip.destination} scenery" loading="lazy"></button>
      <button class="gallery-photo gallery-last" data-photo-index="2" aria-label="Open photo 3"><img src="${galleryPhotos[2] || galleryPhotos[0]}" alt="${trip.destination} experience" loading="lazy"><span class="gallery-all">View all ${photos.length} photos</span></button>
    </section>
    <div class="detail-content-grid">
      <div class="detail-main-column">
        <section class="detail-overview"><div class="eyebrow">YOUR TRIP AT A GLANCE</div><h2>A little more about this journey</h2>
          <p>${trip.fullDescription || trip.shortDescription}</p>
          <div class="detail-facts"><span><b>${trip.duration} days</b><small>Trip length</small></span><span><b>${trip.groupSize || 'Small group'}</b><small>Group size</small></span><span><b>${trip.destination}</b><small>Destination</small></span></div>
        </section>
        <section class="itinerary-section"><div class="itinerary-heading"><div><div class="eyebrow">THE PLAN</div><h2>Your ${trip.duration}-day itinerary</h2></div><p>Open a day to see what’s planned.</p></div>
          <div class="itinerary-list">${(trip.itinerary || []).map(day =>
            `<details><summary><span class="day-number">${String(day.day).padStart(2, '0')}</span><span class="day-title">Day ${day.day}<b>${day.title}</b></span><span class="day-toggle">+</span></summary><p>${day.description}</p></details>`
          ).join('')}</div>
        </section>
        <section class="included-section"><div><div class="eyebrow">GOOD TO KNOW</div><h2>What’s included</h2><p>Here’s what’s covered in this trip.</p></div>
          <ul class="included-list">${(trip.included || []).map(item => `<li><span>✓</span>${item}</li>`).join('')}</ul>
          <div class="not-included"><b>Not included</b><p>${(trip.notIncluded || []).join(' · ')}</p></div>
        </section>
      </div>
      <aside class="detail-booking-box">
        <div class="booking-card-top"><span class="booking-score">★ ${trip.rating}</span><span>${trip.reviewCount} reviews</span></div>
        <div class="detail-price"><div><span>From</span><strong>${money(trip.price)}</strong><small>per person</small></div>${saving ? `<span class="detail-saving">Save ${money(saving)}</span>` : ''}</div>
        <small class="availability-note">A thoughtfully planned ${trip.duration}-day journey</small>
        <button class="button" id="book-trip">Check availability <span>→</span></button>
        <button class="button outline" data-wish="${trip.id}">${saved ? '♥ Saved' : '♡ Save trip'}</button>
        <small class="booking-caption">No payment is taken until you confirm your booking.</small>
      </aside>
    </div>
    <dialog class="photo-dialog" id="photo-dialog"><button class="photo-close" aria-label="Close photo viewer">×</button><div class="photo-viewer"><button class="photo-arrow" data-photo-step="-1" aria-label="Previous photo">‹</button><img id="viewer-photo" src="${galleryPhotos[0]}" alt="${trip.destination} travel photo"><button class="photo-arrow" data-photo-step="1" aria-label="Next photo">›</button></div><p id="photo-count">1 / ${photos.length}</p></dialog>`

  let activePhoto = 0
  const photoDialog = content.querySelector('#photo-dialog')
  const viewerPhoto = content.querySelector('#viewer-photo')
  const photoCount = content.querySelector('#photo-count')
  function showPhoto(index) {
    activePhoto = (index + photos.length) % photos.length
    viewerPhoto.src = photos[activePhoto]
    photoCount.textContent = `${activePhoto + 1} / ${photos.length}`
  }
  content.querySelectorAll('[data-photo-index]').forEach(button => button.addEventListener('click', () => {
    showPhoto(Number(button.dataset.photoIndex))
    photoDialog.showModal()
  }))
  content.querySelectorAll('[data-photo-step]').forEach(button => button.addEventListener('click', () => showPhoto(activePhoto + Number(button.dataset.photoStep))))
  content.querySelector('.photo-close').addEventListener('click', () => photoDialog.close())
  document.querySelector('#book-trip').addEventListener('click', () => {
    if (!getSignedInUser()) {
      location.href = `login.html?next=${encodeURIComponent(`package.html?id=${trip.id}`)}`
      return
    }
    bookingForm(trip.id)
  })
  connectWishlistButtons()
}

function showBookings(status = 'All') {
  const user = getSignedInUser()
  if (!user) {
    location.href = 'login.html?next=bookings.html'
    return
  }
  const bookings = user
    ? getBookings().filter(booking => booking.userId === user.id || booking.customerEmail === user.email)
    : []
  const tabs = ['All', 'Confirmed', 'Pending', 'Cancelled']
  document.querySelector('#booking-tabs').innerHTML = tabs.map(tab =>
    `<button class="tab ${status === tab ? 'selected' : ''}" data-status="${tab}">${tab}</button>`
  ).join('')
  const visibleBookings = bookings.filter(booking => status === 'All' || booking.status === status)
  document.querySelector('#booking-list').innerHTML = visibleBookings.map(booking =>
    `<article class="booking managed-booking"><div><span class="eyebrow">${booking.bookingRef}</span>
      <h3>${booking.packageTitle}</h3><p>${booking.customerName} · ${booking.travelDate || 'Date not selected'}</p></div>
      <div><b>${money(booking.totalPrice)}</b><p class="status">${booking.status}</p>${booking.discountAmount ? `<small class="discount-saved">Saved ${money(booking.discountAmount)}</small>` : ''}</div>
      <div class="booking-cancel-area">${canCancelBooking(booking) ? `<button class="button small danger" data-cancel="${booking.id}">Cancel booking</button><small>Available until 3 days before travel</small>` : booking.status === 'Cancelled' ? '<small>Booking cancelled</small>' : '<small class="cancel-closed">Cancellation is closed (within 3 days of travel)</small>'}</div></article>`
  ).join('') || '<p>No bookings in this category.</p>'

  document.querySelectorAll('[data-status]').forEach(button =>
    button.addEventListener('click', () => showBookings(button.dataset.status))
  )
  document.querySelectorAll('[data-cancel]').forEach(button =>
    button.addEventListener('click', () => {
      const booking = bookings.find(item => item.id === button.dataset.cancel)
      if (!canCancelBooking(booking)) {
        alert('Bookings can only be cancelled at least 3 days before the travel date.')
        showBookings(status)
        return
      }
      if (confirm('Cancel this booking? This will update its status to Cancelled.')) {
        cancelBooking(button.dataset.cancel)
        showBookings(status)
      }
    })
  )
}

function showWishlist() {
  const ids = getWishlist()
  const trips = getPackages().filter(trip => ids.includes(trip.id))
  document.querySelector('#wishlist-trips').innerHTML = trips.map(cardHtml).join('') ||
    '<p>Your wishlist is empty. Save a trip you like.</p>'
  connectWishlistButtons()
}

function showLogin() {
  const signedInUser = getSignedInUser()
  if (signedInUser) {
    location.href = signedInUser.role === 'admin' ? 'admin.html' : 'panel.html'
    return
  }
  const message = document.querySelector('#account-message')
  const loginForm = document.querySelector('#login-form')
  const registerForm = document.querySelector('#register-form')
  const loginTab = document.querySelector('#login-tab')
  const registerTab = document.querySelector('#register-tab')
  const authTitle = document.querySelector('#auth-title')
  const authIntro = document.querySelector('#auth-intro')
  const nextPage = new URLSearchParams(location.search).get('next')

  function setAuthMode(mode) {
    const isLogin = mode === 'login'
    loginForm.hidden = !isLogin
    registerForm.hidden = isLogin
    loginTab.classList.toggle('active', isLogin)
    registerTab.classList.toggle('active', !isLogin)
    loginTab.setAttribute('aria-selected', String(isLogin))
    registerTab.setAttribute('aria-selected', String(!isLogin))
    authTitle.textContent = isLogin ? 'Welcome back' : 'Start planning your trips'
    authIntro.textContent = isLogin ? 'Log in to continue to your account.' : 'Create an account to save and manage your journeys.'
    message.textContent = ''
    message.classList.remove('success')
  }

  loginTab.addEventListener('click', () => setAuthMode('login'))
  registerTab.addEventListener('click', () => setAuthMode('register'))

  function finishLogin(user) {
    const isMemberPage = nextPage && /^(package\.html\?|bookings\.html$)/.test(nextPage)
    const isAdminPage = nextPage === 'admin.html' && user.role === 'admin'
    location.href = isAdminPage ? 'admin.html' : isMemberPage ? nextPage : user.role === 'admin' ? 'admin.html' : 'panel.html'
  }

  loginForm.addEventListener('submit', event => {
    event.preventDefault()
    const form = new FormData(loginForm)
    try {
      const user = signIn(form.get('email'), form.get('password'))
      finishLogin(user)
    } catch (error) {
      message.textContent = error.message
      message.classList.remove('success')
    }
  })

  registerForm.addEventListener('submit', event => {
    event.preventDefault()
    const form = new FormData(registerForm)
    try {
      const user = createAccount(form.get('name'), form.get('email'), form.get('password'))
      finishLogin(user)
    } catch (error) {
      message.textContent = error.message
      message.classList.remove('success')
    }
  })
}

function showMemberPanel() {
  const user = getSignedInUser()
  if (!user) {
    location.href = 'login.html'
    return
  }

  document.querySelector('#account-name').textContent = user.name
  document.querySelector('#account-email').textContent = user.email
  const bookings = getBookings().filter(booking => booking.userId === user.id || booking.customerEmail === user.email)
  const points = getLoyaltyPoints(bookings)
  document.querySelector('#member-points').textContent = points.toLocaleString()
  document.querySelector('#member-points-value').textContent = `${money(points / 10)} available to use`
  document.querySelector('#panel-bookings').innerHTML = bookings.map(booking =>
    `<article class="booking member-booking"><div><span class="eyebrow">${booking.bookingRef}</span><h3>${booking.packageTitle}</h3>
      <p>${booking.travelDate || 'Date not selected'}</p></div><div><b>${money(booking.totalPrice)}</b>
      <p class="status">${booking.status} · ${booking.paymentStatus || 'Demo payment'}</p>
      ${booking.discountAmount ? `<small class="discount-saved">Saved ${money(booking.discountAmount)}</small>` : ''}</div>
      <div class="member-booking-actions">${canCancelBooking(booking) ? `<button class="button small danger" data-member-cancel="${booking.id}">Cancel booking</button><small>Available until 3 days before travel</small>` : booking.status === 'Cancelled' ? '<small>Booking cancelled</small>' : '<small class="member-cancel-note">Cancellation is closed (within 3 days of travel)</small>'}</div></article>`
  ).join('') || '<p>You have no bookings yet. Explore the trips to get started.</p>'

  const favoriteIds = getWishlist()
  const favoriteTrips = getPackages().filter(trip => favoriteIds.includes(trip.id))
  document.querySelector('#favorite-count').textContent = `(${favoriteTrips.length})`
  document.querySelector('#member-favorites').innerHTML = favoriteTrips.map(cardHtml).join('') ||
    '<p>You have not saved any favorite trips yet. Browse trips and choose “Save”.</p>'
  connectWishlistButtons()

  document.querySelectorAll('[data-member-cancel]').forEach(button => button.addEventListener('click', () => {
    const booking = bookings.find(item => item.id === button.dataset.memberCancel)
    if (!canCancelBooking(booking)) {
      alert('Bookings can only be cancelled at least 3 days before the travel date.')
      showPage()
      return
    }
    if (confirm('Cancel this booking? This will update its status to Cancelled.')) {
      cancelBooking(button.dataset.memberCancel)
      showPage()
    }
  }))

  document.querySelector('#logout-button').addEventListener('click', () => {
    signOut()
    location.href = 'index.html'
  })
}

function showAdmin() {
  const user = getSignedInUser()
  if (!user) {
    location.href = 'login.html?next=admin.html'
    return
  }
  if (user.role !== 'admin') {
    location.href = 'panel.html'
    return
  }

  const name = document.querySelector('#admin-name')
  if (name) name.textContent = user.name
  const avatar = document.querySelector('.admin-avatar')
  if (avatar) avatar.textContent = user.name.trim().charAt(0).toUpperCase()
  const trips = getPackages()
  const bookings = getBookings().sort((a, b) => (b.bookingDate || '').localeCompare(a.bookingDate || ''))
  const myBookings = bookings.filter(booking => booking.userId === user.id || booking.customerEmail === user.email)
  const myPoints = getLoyaltyPoints(myBookings)
  document.querySelector('#admin-points').textContent = myPoints.toLocaleString()
  document.querySelector('#admin-points-value').textContent = `${money(myPoints / 10)} available to use`
  const favoriteIds = getWishlist()
  const favoriteTrips = trips.filter(trip => favoriteIds.includes(trip.id))
  document.querySelector('#admin-wishlist-count').textContent = `${favoriteTrips.length} ${favoriteTrips.length === 1 ? 'trip' : 'trips'}`
  document.querySelector('#admin-wishlist-items').innerHTML = favoriteTrips.map(trip =>
    `<article class="admin-favorite-mini"><a href="package.html?id=${trip.id}"><img src="${trip.coverImage}" alt="${trip.destination}"><span>${trip.destination}, ${trip.country}</span></a><button type="button" data-wish="${trip.id}" aria-label="Remove ${trip.destination} from wishlist">♥</button></article>`
  ).join('') || '<p class="admin-wishlist-empty">No saved trips yet. Browse packages and save a favorite.</p>'
  connectWishlistButtons()
  let selectedBooking = bookings.find(booking => booking.status !== 'Cancelled') || bookings[0]
  let historySearch = ''
  let historyStatus = 'All'

  function renderSelectedBooking(booking) {
    const profile = document.querySelector('#guest-profile')
    const current = document.querySelector('#current-booking')
    const guestName = booking?.customerName || 'No guest selected'
    const initials = guestName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
    const trip = booking ? getPackageById(booking.packageId) : trips[0]
    const travelDate = booking?.travelDate
      ? new Date(`${booking.travelDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Not selected'
    const bookingDate = booking?.bookingDate
      ? new Date(`${booking.bookingDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—'
    const guestCount = Number(booking?.adults || 0) + Number(booking?.children || 0)
    const photos = trip?.gallery?.length ? trip.gallery.slice(0, 3) : trip?.coverImage ? [trip.coverImage] : []

    document.querySelector('#selected-guest-name').textContent = booking ? guestName : 'Guests'
    profile.innerHTML = `<div class="guest-cover"></div><div class="guest-avatar">${initials || '?'}</div>
      <span class="guest-reference">${booking ? booking.bookingRef : 'NO BOOKING'}</span>
      <h2>${guestName}</h2><p class="guest-label">${booking ? 'Traveler' : 'Choose a booking to see guest details'}</p>
      ${booking ? `<a class="guest-contact" href="tel:${booking.customerPhone || ''}"><span>☎</span>${booking.customerPhone || 'Phone not provided'}</a>
        <a class="guest-contact" href="mailto:${booking.customerEmail || ''}"><span>✉</span>${booking.customerEmail || 'Email not provided'}</a>` : ''}`

    if (!booking || !trip) {
      current.innerHTML = `<div class="current-heading"><div><div class="eyebrow">RESERVATION</div><h2>Current Booking</h2></div></div><div class="empty-booking">There are no guest bookings yet. New reservations will appear here.</div>`
      return
    }

    current.innerHTML = `<div class="current-heading"><div><div class="eyebrow">RESERVATION DETAILS</div><h2>Current Booking</h2></div><span class="status-pill ${booking.status.toLowerCase()}">${booking.status}</span></div>
      <div class="booking-summary"><div class="booking-key">⌑</div><div class="booking-title"><small>Booking ID #${booking.bookingRef}</small><h3>${booking.packageTitle}</h3></div>
        <div class="booking-fact"><small>Guests</small><b>${guestCount || 1} ${guestCount === 1 ? 'person' : 'people'}</b></div>
        <div class="booking-fact"><small>Duration</small><b>${trip.duration} days</b></div>
        <div class="booking-fact"><small>Travel date</small><b>${travelDate}</b></div>
      </div>
      <div class="booking-highlight"><b>Trip highlights</b><div class="booking-highlight-chips">${(trip.included || []).slice(0, 2).map(item => `<span>${item}</span>`).join('')}</div></div>
      <div class="admin-trip-photos">${photos.map((photo, index) => `<a href="package.html?id=${trip.id}" class="admin-trip-photo${index === 2 ? ' photo-overlay' : ''}"><img src="${photo}" alt="${trip.destination} trip photo">${index === 2 ? '<span>View trip ↗</span>' : ''}</a>`).join('')}</div>
      <div class="booking-bottom"><span>Booked ${bookingDate}</span><b>${money(booking.totalPrice)}</b></div>`
  }

  function renderHistory() {
    const search = historySearch.trim().toLowerCase()
    const visibleBookings = bookings.filter(booking =>
      (historyStatus === 'All' || booking.status === historyStatus) &&
      `${booking.bookingRef} ${booking.customerName} ${booking.packageTitle} ${booking.status}`.toLowerCase().includes(search)
    )
    document.querySelector('#booking-count').textContent = `${visibleBookings.length} of ${bookings.length} bookings`
    document.querySelectorAll('[data-history-filter]').forEach(button => {
      button.classList.toggle('selected', button.dataset.historyFilter === historyStatus)
    })
    document.querySelector('#admin-bookings').innerHTML = visibleBookings.map(booking => {
      const guestCount = Number(booking.adults || 0) + Number(booking.children || 0) || 1
      const travelDate = booking.travelDate
        ? new Date(`${booking.travelDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—'
      return `<tr><td><b>${booking.bookingRef}</b></td><td>${booking.customerName}</td><td>${booking.packageTitle}</td><td>${travelDate}</td><td>${guestCount}</td>
        <td><select class="status-select ${booking.status.toLowerCase()}" aria-label="Update booking status" data-booking-status="${booking.id}"><option ${booking.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option><option ${booking.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${booking.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option></select></td>
        <td><button class="view-booking" type="button" data-view-booking="${booking.id}">View</button></td></tr>`
    }).join('') || `<tr><td colspan="7" class="no-bookings">No matching bookings found.</td></tr>`

    document.querySelectorAll('[data-view-booking]').forEach(button => button.addEventListener('click', () => {
      selectedBooking = bookings.find(booking => booking.id === button.dataset.viewBooking)
      renderSelectedBooking(selectedBooking)
      document.querySelector('.guest-layout').scrollIntoView({ behavior: 'smooth', block: 'start' })
    }))
    document.querySelectorAll('[data-booking-status]').forEach(select => select.addEventListener('change', () => {
      const booking = bookings.find(item => item.id === select.dataset.bookingStatus)
      updateBooking(select.dataset.bookingStatus, { status: select.value })
      if (booking && selectedBooking?.id === booking.id) {
        booking.status = select.value
        renderSelectedBooking(booking)
      }
      if (booking) booking.status = select.value
      renderHistory()
    }))
  }

  renderSelectedBooking(selectedBooking)
  document.querySelector('#admin-packages').innerHTML = trips.map(trip =>
    `<tr><td>${trip.title}</td><td>${trip.destination}, ${trip.country}</td><td>${trip.duration} days</td>
      <td>${money(trip.price)}</td><td><button data-edit="${trip.id}">Edit</button>
      <button class="danger-text" data-delete="${trip.id}">Delete</button></td></tr>`
  ).join('')
  renderHistory()
  document.querySelector('#booking-search').addEventListener('input', event => {
    historySearch = event.target.value
    renderHistory()
  })
  document.querySelectorAll('[data-history-filter]').forEach(button => button.addEventListener('click', () => {
    historyStatus = button.dataset.historyFilter
    renderHistory()
  }))

  document.querySelector('#admin-logout').addEventListener('click', () => {
    signOut()
    location.href = 'index.html'
  })

  document.querySelector('#add-package').addEventListener('click', () => editPackage())
  document.querySelector('#reset-data').addEventListener('click', () => {
    if (confirm('Reset all demo data?')) { resetToDemoData(); showPage() }
  })
  document.querySelectorAll('[data-edit]').forEach(button =>
    button.addEventListener('click', () => editPackage(button.dataset.edit))
  )
  document.querySelectorAll('[data-delete]').forEach(button =>
    button.addEventListener('click', () => {
      if (confirm('Delete this trip?')) { deletePackage(button.dataset.delete); showPage() }
    })
  )
  document.querySelectorAll('[data-booking-status]').forEach(select =>
    select.addEventListener('change', () => updateBooking(select.dataset.bookingStatus, { status: select.value }))
  )
}

function bookingForm(id) {
  const trip = getPackageById(id)
  const user = getSignedInUser()
  if (!trip) return
  const userBookings = getBookings().filter(booking => booking.userId === user.id || booking.customerEmail === user.email)
  const availablePoints = getLoyaltyPoints(userBookings)
  const dialog = document.createElement('dialog')
  dialog.innerHTML = `<form method="dialog" id="checkout-form"><button class="close" value="cancel">×</button>
    <div class="eyebrow">RESERVE YOUR PLACE</div><h2>${trip.title}</h2>
    <label>Your name<input name="name" value="${user?.name || ''}" required></label>
    <label>Email<input name="email" type="email" value="${user?.email || ''}" required></label>
    <label>Phone<input name="phone"></label>
    <label>Travel date<input name="date" type="date" required></label>
    <label>Adults<select name="adults"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>
    <label>Payment method<select name="paymentMethod"><option value="Demo card">Demo card</option><option value="Pay at agency">Pay at agency</option></select></label>
    <label>Cardholder name<input name="cardholder" value="${user?.name || ''}" autocomplete="off"></label>
    <label>Demo card last 4 digits<input name="lastFour" value="4242" inputmode="numeric" maxlength="4" pattern="[0-9]{4}"></label>
    <div class="promo-row"><label>Discount code<input name="promoCode" id="promo-code" placeholder="Try WELCOME10"></label><button class="button outline" type="button" id="apply-promo">Apply</button></div>
    <p class="promo-message" id="promo-message" aria-live="polite"></p>
    <label class="reward-choice"><input id="use-rewards" type="checkbox" ${availablePoints ? '' : 'disabled'}><span><b>Use reward points</b><small>${availablePoints.toLocaleString()} points available · 1 point = $0.10</small></span></label>
    <p class="payment-note">Demo checkout only. No real payment is processed and no full card number is requested.</p>
    <div class="checkout-summary"><div><span>Trip subtotal</span><b id="checkout-subtotal">${money(trip.price * 2)}</b></div>
      <div id="checkout-discount-row" hidden><span>Promo discount</span><b id="checkout-discount"></b></div>
      <div id="checkout-rewards-row" hidden><span>Rewards discount</span><b id="checkout-rewards-discount"></b></div>
      <div class="checkout-total-row"><strong>Total</strong><b id="checkout-total">${money(trip.price * 2)}</b></div></div>
    <button class="button" id="pay-button" value="confirm">Complete demo payment</button></form>`
  document.body.append(dialog)
  dialog.showModal()
  const formElement = dialog.querySelector('form')
  const adultSelect = formElement.querySelector('[name="adults"]')
  const methodSelect = formElement.querySelector('[name="paymentMethod"]')
  const cardholder = formElement.querySelector('[name="cardholder"]')
  const lastFour = formElement.querySelector('[name="lastFour"]')
  const payButton = formElement.querySelector('#pay-button')
  const promoInput = formElement.querySelector('#promo-code')
  const promoMessage = formElement.querySelector('#promo-message')
  const useRewards = formElement.querySelector('#use-rewards')
  let appliedPromo = null

  function updateCheckoutTotal() {
    const subtotal = trip.price * Number(adultSelect.value)
    const promoDiscount = getDiscountAmount(appliedPromo, subtotal)
    const pointsUsed = useRewards.checked ? Math.min(availablePoints, Math.floor((subtotal - promoDiscount) * 10)) : 0
    const pointsDiscount = pointsUsed / 10
    formElement.querySelector('#checkout-subtotal').textContent = money(subtotal)
    formElement.querySelector('#checkout-total').textContent = money(Math.max(0, subtotal - promoDiscount - pointsDiscount))
    formElement.querySelector('#checkout-discount-row').hidden = promoDiscount === 0
    formElement.querySelector('#checkout-discount').textContent = `−${money(promoDiscount)}`
    formElement.querySelector('#checkout-rewards-row').hidden = pointsDiscount === 0
    formElement.querySelector('#checkout-rewards-discount').textContent = `−${money(pointsDiscount)}`
    return { subtotal, promoDiscount, pointsUsed, pointsDiscount, total: Math.max(0, subtotal - promoDiscount - pointsDiscount) }
  }

  adultSelect.addEventListener('change', updateCheckoutTotal)
  useRewards.addEventListener('change', updateCheckoutTotal)
  formElement.querySelector('#apply-promo').addEventListener('click', () => {
    appliedPromo = validatePromoCode(promoInput.value)
    if (!appliedPromo) {
      promoMessage.textContent = 'That code is not valid. Try WELCOME10 or SUMMER2026.'
      promoMessage.className = 'promo-message error'
    } else {
      promoMessage.textContent = `Applied: ${appliedPromo.description}`
      promoMessage.className = 'promo-message success'
    }
    updateCheckoutTotal()
  })
  methodSelect.addEventListener('change', () => {
    const showCard = methodSelect.value === 'Demo card'
    cardholder.closest('label').hidden = !showCard
    lastFour.closest('label').hidden = !showCard
  })
  formElement.addEventListener('submit', async event => {
    if (event.submitter.value !== 'confirm') return
    event.preventDefault()
    if (methodSelect.value === 'Demo card' && (!cardholder.value.trim() || !/^\d{4}$/.test(lastFour.value))) {
      alert('Enter a cardholder name and four demo digits, such as 4242.')
      return
    }
    payButton.disabled = true
    payButton.textContent = 'Processing demo payment…'
    await new Promise(resolve => setTimeout(resolve, 700))
    const form = new FormData(event.currentTarget)
    const adults = Number(form.get('adults'))
    const totals = updateCheckoutTotal()
    const booking = createBooking({
      packageId: trip.id, packageTitle: trip.title, customerName: form.get('name'),
      customerEmail: form.get('email'), customerPhone: form.get('phone'), travelDate: form.get('date'),
      userId: user.id, adults, children: 0, basePrice: trip.price, totalPrice: totals.total,
      discountAmount: totals.promoDiscount + totals.pointsDiscount, promoDiscountAmount: totals.promoDiscount,
      pointsUsed: totals.pointsUsed, pointsEarned: Math.floor(totals.total / 10), pointsDiscountAmount: totals.pointsDiscount,
      promoCode: appliedPromo?.code || '',
      paymentMethod: form.get('paymentMethod'), paymentStatus: form.get('paymentMethod') === 'Demo card' ? 'Paid (demo)' : 'Pay at agency'
    })
    dialog.close()
    dialog.remove()
    alert(`Booking confirmed! Your reference is ${booking.bookingRef}`)
    location.href = 'bookings.html'
  })
  dialog.addEventListener('close', () => dialog.remove())
}

function editPackage(id) {
  const oldTrip = id ? getPackageById(id) : {}
  const title = prompt('Trip title', oldTrip.title || '')
  if (title === null) return
  const destination = prompt('Destination', oldTrip.destination || '')
  if (destination === null) return
  const country = prompt('Country', oldTrip.country || '')
  if (country === null) return
  const price = prompt('Price in USD', oldTrip.price || '')
  if (price === null) return
  const duration = prompt('Duration in days', oldTrip.duration || '')
  if (duration === null) return
  savePackage({ ...oldTrip, title, destination, country, price: Number(price), duration: Number(duration),
    continent: oldTrip.continent || 'Europe', category: oldTrip.category || 'Cultural',
    coverImage: oldTrip.coverImage || '', shortDescription: oldTrip.shortDescription || 'A memorable trip planned for you.' })
  showPage()
}

function showPage() {
  updateAccountLink()
  if (pageName === 'index.html') showHome()
  if (pageName === 'packages.html') showPackages()
  if (pageName === 'package.html') showTripDetails()
  if (pageName === 'bookings.html') showBookings()
  if (pageName === 'wishlist.html') showWishlist()
  if (pageName === 'admin.html') showAdmin()
  if (pageName === 'login.html') showLogin()
  if (pageName === 'panel.html') showMemberPanel()
}

showPage()
