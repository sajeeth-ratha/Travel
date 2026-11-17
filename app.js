// This file adds trip information and button actions to the HTML pages.
import {
  initStorage, getPackages, getPackageById, getRooms, getRoomById, getBookings, createBooking,
  updateBooking, getWishlist, toggleWishlist, savePackage, deletePackage, saveRoom, deleteRoom,
  resetToDemoData, validatePromoCode, daysUntilTravel, canCancelBooking, cancelBooking
} from './data.js'
import { getSignedInUser, createAccount, signIn, signOut, updateAccountProfile } from './account.js'

initStorage()

const pageName = location.pathname.split('/').pop() || 'index.html'
const tripId = new URLSearchParams(location.search).get('id')
let slideTimer
let navigationBound = false

function money(amount) {
  const value = Number(amount || 0)
  const digits = Number.isInteger(value) ? 0 : 2
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 2 })
}

function formatDate(date) {
  if (!date) return 'Date not selected'
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function bookingTitle(booking) {
  return booking.packageTitle || booking.roomName || 'Room reservation'
}

function bookingDateLabel(booking) {
  if (booking.bookingType === 'room' && booking.checkOutDate) {
    return `${formatDate(booking.travelDate)} – ${formatDate(booking.checkOutDate)} · ${booking.nights || 1} ${booking.nights === 1 ? 'night' : 'nights'}`
  }
  return formatDate(booking.travelDate)
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

function roomWishlistCardHtml(room) {
  const saved = getWishlist().includes(room.id)
  return `<article class="card room-wishlist-card">
    <a href="room.html?id=${room.id}"><img src="${room.coverImage}" alt="${room.name} at ${room.property}" loading="lazy"><div class="card-body"><div class="eyebrow">${room.destination} · ${room.country}</div><h3>${room.name}</h3><p>${room.property} · ${room.type}</p><div class="card-bottom"><b>${money(room.price)} <small>/ night</small></b><span>★ ${room.rating}</span></div></div></a>
    <div class="card-actions"><a class="button small" href="room.html?id=${room.id}">View stay</a><button class="heart" type="button" data-wish="${room.id}">${saved ? '♥ Saved' : '♡ Save'}</button></div>
  </article>`
}

function roomCardHtml(room, search = {}) {
  const query = new URLSearchParams({ id: room.id })
  const isSaved = getWishlist().includes(room.id)
  if (search.checkIn) query.set('checkIn', search.checkIn)
  if (search.checkOut) query.set('checkOut', search.checkOut)
  if (search.guests) query.set('guests', search.guests)
  const detailsUrl = `room.html?${query.toString()}`
  const facilities = (room.amenities || []).slice(0, 3).map(amenity => {
    const icon = amenity.toLowerCase().includes('breakfast') ? 'free_breakfast'
      : amenity.toLowerCase().includes('pool') ? 'pool'
        : amenity.toLowerCase().includes('wifi') ? 'wifi'
          : amenity.toLowerCase().includes('sea') || amenity.toLowerCase().includes('view') ? 'landscape' : 'check_circle'
    return `<span><i class="material-symbols-outlined" aria-hidden="true">${icon}</i>${amenity}</span>`
  }).join('')
  const reviewLabel = room.rating >= 4.8 ? 'Excellent' : room.rating >= 4.5 ? 'Very good' : 'Good'
  const discount = room.originalPrice > room.price ? Math.round((1 - room.price / room.originalPrice) * 100) : 0
  const dates = room.availableFrom || room.availableTo
    ? `<small>Available check-in: ${room.availableFrom || 'Any'} – ${room.availableTo || 'Open'}</small>`
    : ''
  return `<article class="hotel-result-card">
    <div class="hotel-result-photo"><a href="${detailsUrl}" tabindex="-1" aria-hidden="true"><img data-room-image="${room.id}" src="${room.coverImage}" alt="${room.name} at ${room.property}" loading="lazy"></a>
      <span class="room-label">${room.type}</span><button class="room-save-button ${isSaved ? 'saved' : ''}" type="button" data-wish="${room.id}" aria-label="${isSaved ? 'Remove' : 'Save'} ${room.name} ${isSaved ? 'from' : 'to'} wishlist">${isSaved ? '♥' : '♡'}</button><button class="room-photo-step previous" type="button" data-room-photo="${room.id}" data-step="-1" aria-label="Previous ${room.name} photo">‹</button><button class="room-photo-step next" type="button" data-room-photo="${room.id}" data-step="1" aria-label="Next ${room.name} photo">›</button></div>
    <div class="room-result-info"><div class="room-result-property">${room.property}</div><h2><a href="${detailsUrl}">${room.name}</a></h2>
      <div class="room-rating-dots" aria-label="${room.rating} out of 5 stars">★★★★★ <span>ⓘ</span></div>
      <div class="room-result-location">${room.destination}, ${room.country}</div>
      <div class="room-amenity-row">${facilities}</div><p>${room.description}</p><div class="room-review">${room.rating} · ${reviewLabel} <span>· ${room.reviewCount} reviews</span></div>${dates}</div>
    <div class="room-result-price">${discount ? `<span class="price-tag">−${discount}%</span><del>${money(room.originalPrice)}</del>` : ''}<strong>${money(room.price)}</strong><small>per room, per night<br>taxes may apply</small><a href="${detailsUrl}">See availability</a></div>
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
  link.href = user ? 'panel.html' : 'login.html'
  link.textContent = user ? 'My account' : 'Login'
}

// Mark the current page and support the compact menu on phones.
function initializeNavigation() {
  const menu = document.querySelector('#primary-navigation')
  const toggle = document.querySelector('.menu-toggle')
  if (!menu || !toggle) return

  const current = pageName === 'package.html' ? 'packages.html'
    : pageName === 'room.html' ? 'rooms.html' : pageName
  menu.querySelectorAll('a').forEach(link => {
    const target = new URL(link.href, location.href).pathname.split('/').pop()
    if (target === current) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })
  if (navigationBound) return
  navigationBound = true
  const setMenuOpen = open => {
    menu.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu')
  }
  toggle.addEventListener('click', () => setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true'))
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)))
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenuOpen(false)
  })
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

function showRooms() {
  const searchBox = document.querySelector('#room-search')
  const propertySearch = document.querySelector('#property-search')
  const checkInInput = document.querySelector('#room-check-in')
  const checkOutInput = document.querySelector('#room-check-out')
  const guestsSelect = document.querySelector('#room-guests')
  const priceFilter = document.querySelector('#room-price-filter')
  const ratingFilter = document.querySelector('#room-rating-filter')
  const sortSelect = document.querySelector('#room-sort')
  const cards = document.querySelector('#room-cards')
  const count = document.querySelector('#room-count')
  const pagination = document.querySelector('#room-pagination')
  const countrySearch = document.querySelector('#country-search')
  const countryFilter = document.querySelector('#country-filter')
  const countryList = document.querySelector('#room-country-list')
  const params = new URLSearchParams(location.search)
  const photoIndexes = new Map()
  const roomsPerPage = 10
  let currentPage = 1
  let filteredRooms = []

  const countries = [...new Set(getRooms().map(room => room.country))].sort()
  countries.forEach(country => {
    const option = document.createElement('option')
    option.value = country
    countryList.append(option)
    countryFilter.append(option.cloneNode(true))
  })

  searchBox.value = params.get('q') || ''
  countrySearch.value = params.get('country') || ''
  countryFilter.value = countrySearch.value
  checkInInput.value = params.get('checkIn') || ''
  checkOutInput.value = params.get('checkOut') || ''
  guestsSelect.value = params.get('guests') || '2'
  const today = new Date()
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  checkInInput.min = localDate(today)
  checkOutInput.min = checkInInput.value || localDate(today)
  if (checkInInput.value) {
    const next = new Date(`${checkInInput.value}T12:00:00`)
    next.setDate(next.getDate() + 1)
    checkOutInput.min = localDate(next)
  }

  function renderRoomPage() {
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage)
    const firstRoom = (currentPage - 1) * roomsPerPage
    const pageRooms = filteredRooms.slice(firstRoom, firstRoom + roomsPerPage)
    cards.innerHTML = pageRooms.map(room => roomCardHtml(room, {
      checkIn: checkInInput.value,
      checkOut: checkOutInput.value,
      guests: guestsSelect.value
    })).join('') || '<div class="no-room-results"><b>No rooms match these filters.</b><span>Try a different destination, country, date or price.</span></div>'
    connectWishlistButtons()

    if (totalPages < 2) {
      pagination.innerHTML = ''
    } else {
      const pageButtons = Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1
        return `<button type="button" class="page-number ${page === currentPage ? 'active' : ''}" data-room-page="${page}" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</button>`
      }).join('')
      pagination.innerHTML = `<span class="page-summary">Showing ${firstRoom + 1}–${Math.min(firstRoom + roomsPerPage, filteredRooms.length)} of ${filteredRooms.length}</span><div class="page-controls"><button type="button" class="page-arrow" data-room-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>${pageButtons}<button type="button" class="page-arrow" data-room-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button></div>`
      pagination.querySelectorAll('[data-room-page]').forEach(button => button.addEventListener('click', () => {
        const nextPage = Number(button.dataset.roomPage)
        if (nextPage < 1 || nextPage > totalPages) return
        currentPage = nextPage
        renderRoomPage()
        document.querySelector('.results-heading').scrollIntoView({ behavior: 'smooth', block: 'start' })
      }))
    }

    document.querySelectorAll('[data-room-photo]').forEach(button => button.addEventListener('click', () => {
      const room = getRoomById(button.dataset.roomPhoto)
      if (!room) return
      const gallery = room.gallery?.length ? room.gallery : [room.coverImage]
      const current = photoIndexes.get(room.id) || 0
      const next = (current + Number(button.dataset.step) + gallery.length) % gallery.length
      photoIndexes.set(room.id, next)
      const image = document.querySelector(`[data-room-image="${room.id}"]`)
      image.src = gallery[next]
    }))
  }

  function filterRooms() {
    const search = searchBox.value.trim().toLowerCase()
    const property = propertySearch.value.trim().toLowerCase()
    const country = countrySearch.value.trim().toLowerCase()
    const maximumPrice = Number(priceFilter.value)
    const guests = Number(guestsSelect.value)
    const roomType = document.querySelector('input[name="room-type"]:checked').value
    const selectedAmenities = [...document.querySelectorAll('[data-room-amenity]:checked')].map(input => input.dataset.roomAmenity.toLowerCase())
    let matches = getRooms().filter(room => {
      const roomText = `${room.name} ${room.property} ${room.destination} ${room.country} ${room.type}`.toLowerCase()
      const isRoomType = roomType === 'all' || (roomType === 'hotel' && /hotel|traditional/.test(room.type.toLowerCase())) || room.type.toLowerCase().includes(roomType)
      const inCheckInWindow = !checkInInput.value || ((!room.availableFrom || checkInInput.value >= room.availableFrom) && (!room.availableTo || checkInInput.value <= room.availableTo))
      return roomText.includes(search) && room.property.toLowerCase().includes(property) && room.country.toLowerCase().includes(country) && room.price <= maximumPrice && room.guests >= guests &&
        isRoomType && selectedAmenities.every(item => (room.amenities || []).some(amenity => amenity.toLowerCase().includes(item))) &&
        (!ratingFilter.checked || room.rating >= 4.5) && inCheckInWindow
    })
    if (sortSelect.value === 'price-low') matches.sort((a, b) => a.price - b.price)
    if (sortSelect.value === 'price-high') matches.sort((a, b) => b.price - a.price)
    if (sortSelect.value === 'rating') matches.sort((a, b) => b.rating - a.rating)
    filteredRooms = matches
    currentPage = 1
    renderRoomPage()
    count.textContent = `${matches.length} ${matches.length === 1 ? 'place to stay' : 'places to stay'}`
    document.querySelector('#maximum-room-price').textContent = maximumPrice
  }

  document.querySelector('#stay-search-form').addEventListener('submit', event => {
    event.preventDefault()
    if (checkInInput.value && checkOutInput.value && checkOutInput.value <= checkInInput.value) {
      checkOutInput.setCustomValidity('Check-out must be after check-in.')
      checkOutInput.reportValidity()
      return
    }
    checkOutInput.setCustomValidity('')
    const nextParams = new URLSearchParams()
    if (searchBox.value.trim()) nextParams.set('q', searchBox.value.trim())
    if (countrySearch.value.trim()) nextParams.set('country', countrySearch.value.trim())
    if (checkInInput.value) nextParams.set('checkIn', checkInInput.value)
    if (checkOutInput.value) nextParams.set('checkOut', checkOutInput.value)
    nextParams.set('guests', guestsSelect.value)
    history.replaceState(null, '', `rooms.html?${nextParams.toString()}`)
    filterRooms()
  })
  countryFilter.addEventListener('change', () => {
    countrySearch.value = countryFilter.value
    updateCountrySearch()
  })
  function updateCountrySearch() {
    const nextParams = new URLSearchParams(location.search)
    if (countrySearch.value.trim()) nextParams.set('country', countrySearch.value.trim())
    else nextParams.delete('country')
    history.replaceState(null, '', `rooms.html${nextParams.toString() ? `?${nextParams}` : ''}`)
    filterRooms()
  }
  countrySearch.addEventListener('input', () => {
    countryFilter.value = countries.find(item => item.toLowerCase() === countrySearch.value.trim().toLowerCase()) || ''
    updateCountrySearch()
  })
  checkInInput.addEventListener('change', () => {
    if (!checkInInput.value) return
    const next = new Date(`${checkInInput.value}T12:00:00`)
    next.setDate(next.getDate() + 1)
    checkOutInput.min = localDate(next)
    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) checkOutInput.value = localDate(next)
  })
  ;[propertySearch, priceFilter, ratingFilter, sortSelect, guestsSelect, ...document.querySelectorAll('[data-room-amenity]'), ...document.querySelectorAll('input[name="room-type"]')]
    .forEach(input => {
      input.addEventListener('input', filterRooms)
      input.addEventListener('change', filterRooms)
    })
  document.querySelector('#minimum-room-price').textContent = priceFilter.min
  filterRooms()
}

function showRoomDetails() {
  const room = getRoomById(new URLSearchParams(location.search).get('id'))
  const content = document.querySelector('#room-content')
  if (!room) {
    content.innerHTML = '<h1>Room not found</h1><a href="rooms.html">Browse available rooms</a>'
    return
  }
  const photos = room.gallery?.length ? room.gallery : [room.coverImage]
  const roomParams = new URLSearchParams(location.search)
  const dateWindow = room.availableFrom || room.availableTo
    ? `Check-in dates: ${room.availableFrom || 'Any date'} to ${room.availableTo || 'Open'}.`
    : 'Choose the dates that suit you.'
  content.innerHTML = `<a href="rooms.html" class="back">← All rooms</a>
    <section class="room-detail-heading"><div><div class="eyebrow">${room.property} · ${room.type}</div><h1>${room.name}</h1>
      <div class="detail-meta"><span>⌖ ${room.destination}, ${room.country}</span><span>★ ${room.rating} · ${room.reviewCount} guest reviews</span><span>Up to ${room.guests} guests · ${room.beds}</span></div></div><button class="button outline room-detail-favorite" type="button" data-wish="${room.id}">${getWishlist().includes(room.id) ? '♥ Saved to wishlist' : '♡ Save to wishlist'}</button></section>
    <section class="detail-gallery room-gallery" aria-label="Photos of ${room.name}">
      ${photos.slice(0, 3).map((photo, index) => `<div class="gallery-photo ${index === 0 ? 'gallery-main' : ''}"><img src="${photo}" alt="${room.name}, photo ${index + 1}" ${index ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`).join('')}
    </section>
    <div class="room-detail-grid"><section class="room-description"><div class="eyebrow">A PLACE TO SETTLE IN</div><h2>Room details</h2><p>${room.description}</p>
      <div class="room-amenities">${room.amenities.map(item => `<span>✓ ${item}</span>`).join('')}</div></section>
      <aside class="room-booking-box"><div class="room-price"><strong>${money(room.price)}</strong><span> / night</span></div><p>Book this room on its own. No travel package required.</p><p class="room-date-window">${dateWindow}</p>
        <div class="room-capacity">Sleeps up to ${room.guests} · ${room.beds}</div><button class="button" id="book-room">Choose dates</button><small>Card payment options are shown at checkout</small></aside>
    </div><div id="room-checkout-slot"></div>`
  document.querySelector('#book-room').addEventListener('click', () => {
    roomBookingForm(room.id, { checkIn: roomParams.get('checkIn'), checkOut: roomParams.get('checkOut'), guests: roomParams.get('guests') })
  })
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
      <h3>${bookingTitle(booking)}</h3><p>${booking.customerName} · ${bookingDateLabel(booking)}</p></div>
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
  const rooms = getRooms().filter(room => ids.includes(room.id))
  document.querySelector('#wishlist-trips').innerHTML = [...trips.map(cardHtml), ...rooms.map(roomWishlistCardHtml)].join('') ||
    '<p>Your wishlist is empty. Save a trip you like.</p>'
  connectWishlistButtons()
}

function showLogin() {
  const signedInUser = getSignedInUser()
  if (signedInUser) {
    location.href = 'panel.html'
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

  const redirectBanner = document.querySelector('#login-redirect-banner')
  if (redirectBanner && nextPage) {
    redirectBanner.hidden = false
  }

  // Password visibility toggles
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target)
      if (!input) return
      const isPassword = input.type === 'password'
      input.type = isPassword ? 'text' : 'password'
      btn.textContent = isPassword ? 'Hide' : 'Show'
    })
  })

  // Quick autofill buttons for demo credentials
  document.querySelector('#demo-fill-traveler')?.addEventListener('click', () => {
    setAuthMode('login')
    const emailField = document.querySelector('#login-email')
    const passField = document.querySelector('#login-password')
    if (emailField) emailField.value = 'alex@example.com'
    if (passField) passField.value = 'travel123'
  })
  document.querySelector('#demo-fill-admin')?.addEventListener('click', () => {
    setAuthMode('login')
    const emailField = document.querySelector('#login-email')
    const passField = document.querySelector('#login-password')
    if (emailField) emailField.value = 'admin@wanderlust.com'
    if (passField) passField.value = 'travel123'
  })

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

  function finishLogin() {
    const isMemberPage = nextPage && /^(package\.html\?|room\.html\?|bookings\.html$)/.test(nextPage)
    location.href = isMemberPage ? nextPage : 'panel.html'
  }

  loginForm.addEventListener('submit', event => {
    event.preventDefault()
    const form = new FormData(loginForm)
    try {
      const user = signIn(form.get('email'), form.get('password'))
      finishLogin()
    } catch (error) {
      message.textContent = error.message
      message.classList.remove('success')
    }
  })

  registerForm.addEventListener('submit', event => {
    event.preventDefault()
    const form = new FormData(registerForm)
    try {
      const user = createAccount(form.get('name'), form.get('email'), form.get('password'), form.get('phone') || '')
      finishLogin()
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

  // Identity Banner
  const cleanInitial = (user.name || 'Traveler').trim().charAt(0).toUpperCase()
  const avatarEl = document.querySelector('#profile-avatar')
  if (avatarEl) avatarEl.textContent = cleanInitial

  const nameEl = document.querySelector('#account-name')
  if (nameEl) nameEl.textContent = user.name
  const emailEl = document.querySelector('#account-email')
  if (emailEl) emailEl.textContent = user.email

  const profileNameEl = document.querySelector('#profile-name')
  if (profileNameEl) profileNameEl.textContent = user.name
  const profileEmailEl = document.querySelector('#profile-email')
  if (profileEmailEl) profileEmailEl.textContent = user.email

  const phoneDisplay = document.querySelector('#profile-phone')
  if (phoneDisplay) phoneDisplay.textContent = user.phone ? user.phone : 'No phone saved'

  // Member ID
  const memberId = `#WL-2026-${(user.id || 'TRAVELER').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`
  const memberIdText = document.querySelector('#member-id-text')
  if (memberIdText) memberIdText.textContent = memberId

  const copyBtn = document.querySelector('#copy-member-id-btn')
  const copyFeedback = document.querySelector('#copy-id-feedback')
  const copyTag = document.querySelector('#member-id-tag')

  function copyIdAction() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(memberId).then(() => {
        if (copyFeedback) {
          copyFeedback.textContent = 'Copied!'
          copyFeedback.classList.add('visible')
          setTimeout(() => {
            copyFeedback.classList.remove('visible')
            copyFeedback.textContent = ''
          }, 2000)
        }
      }).catch(() => {})
    }
  }
  if (copyBtn) copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyIdAction() })
  if (copyTag) copyTag.addEventListener('click', copyIdAction)

  // Booking data and loyalty points
  const bookings = getBookings().filter(booking => booking.userId === user.id || booking.customerEmail === user.email)
  const points = getLoyaltyPoints(bookings)
  const today = new Date().toISOString().slice(0, 10)
  const upcomingBookings = bookings.filter(booking => booking.status !== 'Cancelled' && booking.travelDate >= today)
  const totalSavings = bookings.reduce((sum, b) => sum + (Number(b.discountAmount) || 0), 0)

  // Overview stats
  const upcomingCountEl = document.querySelector('#upcoming-count')
  if (upcomingCountEl) upcomingCountEl.textContent = upcomingBookings.length

  const shortPointsEl = document.querySelector('#member-points-short')
  if (shortPointsEl) shortPointsEl.textContent = points.toLocaleString()
  const shortPointsValEl = document.querySelector('#member-points-value-short')
  if (shortPointsValEl) shortPointsValEl.textContent = `${money(points / 10)} available`

  const lifetimeSavingsEl = document.querySelector('#lifetime-savings')
  if (lifetimeSavingsEl) lifetimeSavingsEl.textContent = money(totalSavings)

  // Rewards section
  const memberPointsEl = document.querySelector('#member-points')
  if (memberPointsEl) memberPointsEl.textContent = points.toLocaleString()
  const memberPointsValEl = document.querySelector('#member-points-value')
  if (memberPointsValEl) memberPointsValEl.textContent = `${money(points / 10)} available`

  const milestoneGoal = 500
  const progressPct = Math.min(100, Math.round((points / milestoneGoal) * 100))
  const progressFill = document.querySelector('#rewards-progress-fill')
  if (progressFill) progressFill.style.width = `${progressPct}%`
  const progressLabel = document.querySelector('#rewards-progress-label')
  if (progressLabel) progressLabel.textContent = `${points} / ${milestoneGoal} pts (${progressPct}%)`

  // Wishlist
  const favoriteIds = getWishlist()
  const favoriteTrips = getPackages().filter(trip => favoriteIds.includes(trip.id))
  const favoriteRooms = getRooms().filter(room => favoriteIds.includes(room.id))
  const savedItems = [...favoriteTrips.map(cardHtml), ...favoriteRooms.map(roomWishlistCardHtml)]
  const savedCountEl = document.querySelector('#saved-count')
  if (savedCountEl) savedCountEl.textContent = savedItems.length
  const favoriteCountEl = document.querySelector('#favorite-count')
  if (favoriteCountEl) favoriteCountEl.textContent = `(${savedItems.length})`

  // Tab badges
  const bookingsBadge = document.querySelector('#bookings-tab-badge')
  if (bookingsBadge) bookingsBadge.textContent = bookings.length
  const wishlistBadge = document.querySelector('#wishlist-tab-badge')
  if (wishlistBadge) wishlistBadge.textContent = savedItems.length

  // Subnav pill navigation
  document.querySelectorAll('.subnav-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.subnav-pill').forEach(p => p.classList.remove('active'))
      pill.classList.add('active')
      const targetSection = document.querySelector(`#section-${pill.dataset.panelTab}`)
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

  // Render bookings
  let activeBookingFilter = 'All'
  function renderMemberBookings(filter = activeBookingFilter) {
    activeBookingFilter = filter
    document.querySelectorAll('[data-member-filter]').forEach(button => {
      button.classList.toggle('selected', button.dataset.memberFilter === filter)
    })

    const filteredBookings = bookings.filter(booking => {
      if (filter === 'Upcoming') return booking.status !== 'Cancelled' && booking.travelDate >= today
      if (filter === 'Past') return booking.status !== 'Cancelled' && booking.travelDate < today
      if (filter === 'Cancelled') return booking.status === 'Cancelled'
      return true
    })

    const bookingsContainer = document.querySelector('#panel-bookings')
    if (!bookingsContainer) return

    if (filteredBookings.length === 0) {
      bookingsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>${filter === 'All' || filter === 'Upcoming' ? 'Your next adventure awaits' : `No ${filter.toLowerCase()} reservations`}</h3>
          <p>${filter === 'All' || filter === 'Upcoming' ? 'You have no active bookings at this time. Browse our curated hotels and trips to plan your next escape.' : 'When you have reservations in this category, they will appear here.'}</p>
          ${filter === 'All' || filter === 'Upcoming' ? '<a class="button small" href="rooms.html">Browse Stays & Packages</a>' : ''}
        </div>
      `
      return
    }

    bookingsContainer.innerHTML = [...filteredBookings]
      .sort((a, b) => (a.travelDate || '').localeCompare(b.travelDate || ''))
      .map(booking => {
        const isRoom = booking.bookingType === 'room'
        const listing = isRoom ? getRoomById(booking.roomId) : getPackageById(booking.packageId)
        const photo = listing?.coverImage || ''
        const title = bookingTitle(booking)
        const canCancel = canCancelBooking(booking)
        const statusClass = (booking.status || 'Confirmed').toLowerCase()

        return `
          <article class="booking member-booking">
            <a class="member-booking-photo" href="${isRoom ? `room.html?id=${booking.roomId}` : `package.html?id=${booking.packageId}`}" aria-label="View ${title}">
              <img src="${photo}" alt="${title}" loading="lazy">
            </a>

            <div class="member-booking-info">
              <div class="booking-tag-row">
                <span class="booking-ref-badge">${booking.bookingRef}</span>
                <span class="booking-type-badge">${isRoom ? 'HOTEL STAY' : 'TOUR PACKAGE'}</span>
              </div>
              <h3>${title}</h3>
              <p class="booking-date">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>${bookingDateLabel(booking)}</span>
              </p>
              <div>
                <span class="booking-status ${statusClass}">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ${booking.status}
                </span>
              </div>
            </div>

            <div class="member-booking-payment">
              <b>${money(booking.totalPrice)}</b>
              <small>${booking.paymentMethod || 'Paid (Demo Card)'}</small>
              ${booking.discountAmount ? `<small class="discount-saved">Saved ${money(booking.discountAmount)}</small>` : ''}
              <small style="color:#0284c7;font-weight:600;">+${booking.pointsEarned || Math.floor(booking.totalPrice / 10)} pts</small>
            </div>

            <div class="member-booking-actions">
              <button class="button small voucher-action" type="button" data-view-voucher="${booking.id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                View Voucher
              </button>
              ${canCancel ? `
                <button class="button small manage-booking" type="button" data-manage-booking="${booking.id}">
                  Manage Details
                </button>
                <button class="button small danger" type="button" data-member-cancel="${booking.id}">
                  Cancel Booking
                </button>
                <small class="booking-policy-note">Free cancellation up to 3 days before travel</small>
              ` : booking.status === 'Cancelled' ? `
                <small class="booking-policy-note">Reservation cancelled</small>
              ` : booking.status !== 'Cancelled' && booking.travelDate >= today ? `
                <small class="booking-policy-note warning">Changes close 3 days prior to departure</small>
              ` : `
                <small class="booking-policy-note">Completed trip</small>
              `}
            </div>
          </article>
        `
      }).join('')
  }
  renderMemberBookings()
  document.querySelectorAll('[data-member-filter]').forEach(button => {
    button.addEventListener('click', () => renderMemberBookings(button.dataset.memberFilter))
  })

  // Booking actions event delegation (Voucher, Manage, Cancel)
  const bookingEditDialog = document.querySelector('#booking-edit-dialog')
  document.querySelector('#panel-bookings').addEventListener('click', event => {
    const voucherButton = event.target.closest('[data-view-voucher]')
    const cancelButton = event.target.closest('[data-member-cancel]')
    const manageButton = event.target.closest('[data-manage-booking]')

    if (voucherButton) {
      const booking = bookings.find(item => item.id === voucherButton.dataset.viewVoucher)
      if (booking) {
        const item = booking.bookingType === 'room' ? getRoomById(booking.roomId) : getPackageById(booking.packageId)
        showBookingConfirmationVoucher(booking, item)
      }
      return
    }

    if (cancelButton) {
      const booking = bookings.find(item => item.id === cancelButton.dataset.memberCancel)
      if (!canCancelBooking(booking)) {
        alert('Bookings can only be cancelled at least 3 days before the travel date.')
        return
      }
      if (confirm('Cancel this booking? This will update its status to Cancelled and points earned will be deducted.')) {
        cancelBooking(booking.id)
        location.reload()
      }
      return
    }

    if (manageButton) {
      const booking = bookings.find(item => item.id === manageButton.dataset.manageBooking)
      if (!canCancelBooking(booking)) {
        alert('Booking changes are available until 3 days before travel.')
        return
      }
      const form = document.querySelector('#booking-edit-form')
      form.elements.bookingId.value = booking.id
      form.elements.customerName.value = booking.customerName || user.name
      form.elements.customerEmail.value = booking.customerEmail || user.email
      form.elements.customerPhone.value = booking.customerPhone || ''
      form.elements.specialRequests.value = booking.specialRequests || ''
      document.querySelector('#booking-edit-summary').textContent = `${bookingTitle(booking)} · ${bookingDateLabel(booking)}`
      document.querySelector('#booking-edit-message').textContent = ''
      bookingEditDialog.showModal()
    }
  })

  // Booking edit form submission
  document.querySelector('#booking-edit-form').addEventListener('submit', event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const booking = bookings.find(item => item.id === form.get('bookingId'))
    if (!canCancelBooking(booking)) {
      document.querySelector('#booking-edit-message').textContent = 'Changes close 3 days before travel.'
      return
    }
    updateBooking(booking.id, {
      customerName: form.get('customerName').trim(),
      customerEmail: form.get('customerEmail').trim(),
      customerPhone: form.get('customerPhone').trim(),
      specialRequests: form.get('specialRequests').trim()
    })
    bookingEditDialog.close()
    location.reload()
  })
  document.querySelector('#close-booking-dialog').addEventListener('click', () => bookingEditDialog.close())
  document.querySelector('#cancel-booking-edit').addEventListener('click', () => bookingEditDialog.close())

  // Profile Dialog logic
  const profileDialog = document.querySelector('#profile-dialog')
  document.querySelector('#profile-name-input').value = user.name
  document.querySelector('#profile-email-input').value = user.email
  const dialogPhoneInput = document.querySelector('#profile-phone-input')
  if (dialogPhoneInput) dialogPhoneInput.value = user.phone || ''

  document.querySelector('#open-profile-dialog').addEventListener('click', () => profileDialog.showModal())
  document.querySelector('#close-profile-dialog').addEventListener('click', () => profileDialog.close())
  document.querySelector('#cancel-profile-edit').addEventListener('click', () => profileDialog.close())

  // Password toggles
  const dialogToggleBtn = document.querySelector('#toggle-dialog-password')
  if (dialogToggleBtn) {
    dialogToggleBtn.addEventListener('click', () => {
      const pwdInput = document.querySelector('#profile-password-input')
      if (pwdInput) pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password'
    })
  }

  const settingsToggleBtn = document.querySelector('#toggle-settings-password')
  if (settingsToggleBtn) {
    settingsToggleBtn.addEventListener('click', () => {
      const pwdInput = document.querySelector('#settings-password-input')
      if (pwdInput) pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password'
    })
  }

  // Profile Dialog form submit
  document.querySelector('#profile-form').addEventListener('submit', event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const oldEmail = user.email
    try {
      const updatedUser = updateAccountProfile(user.id, {
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password') || undefined
      })
      bookings.filter(b => b.userId === user.id || b.customerEmail === oldEmail).forEach(b => {
        updateBooking(b.id, {
          customerName: updatedUser.name,
          customerEmail: updatedUser.email,
          customerPhone: updatedUser.phone
        })
      })
      profileDialog.close()
      location.reload()
    } catch (error) {
      document.querySelector('#profile-message').textContent = error.message
    }
  })

  // Settings Section: Profile Details Form
  const settingsNameInput = document.querySelector('#settings-name-input')
  const settingsEmailInput = document.querySelector('#settings-email-input')
  const settingsPhoneInput = document.querySelector('#settings-phone-input')
  if (settingsNameInput) settingsNameInput.value = user.name
  if (settingsEmailInput) settingsEmailInput.value = user.email
  if (settingsPhoneInput) settingsPhoneInput.value = user.phone || ''

  const settingsProfileForm = document.querySelector('#settings-profile-form')
  if (settingsProfileForm) {
    settingsProfileForm.addEventListener('submit', event => {
      event.preventDefault()
      const statusEl = document.querySelector('#settings-profile-status')
      const form = new FormData(event.currentTarget)
      const oldEmail = user.email
      try {
        const updatedUser = updateAccountProfile(user.id, {
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone')
        })
        bookings.filter(b => b.userId === user.id || b.customerEmail === oldEmail).forEach(b => {
          updateBooking(b.id, {
            customerName: updatedUser.name,
            customerEmail: updatedUser.email,
            customerPhone: updatedUser.phone
          })
        })
        statusEl.className = 'settings-status success'
        statusEl.textContent = 'Profile details saved!'
        setTimeout(() => location.reload(), 800)
      } catch (error) {
        statusEl.className = 'settings-status error'
        statusEl.textContent = error.message
      }
    })
  }

  // Settings Section: Password Form
  const settingsPasswordForm = document.querySelector('#settings-password-form')
  if (settingsPasswordForm) {
    settingsPasswordForm.addEventListener('submit', event => {
      event.preventDefault()
      const statusEl = document.querySelector('#settings-password-status')
      const form = new FormData(event.currentTarget)
      const newPwd = form.get('newPassword')
      const confirmPwd = form.get('confirmPassword')

      if (newPwd !== confirmPwd) {
        statusEl.className = 'settings-status error'
        statusEl.textContent = 'Passwords do not match.'
        return
      }

      try {
        updateAccountProfile(user.id, {
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: newPwd
        })
        statusEl.className = 'settings-status success'
        statusEl.textContent = 'Password updated successfully!'
        settingsPasswordForm.reset()
        setTimeout(() => { statusEl.textContent = '' }, 3000)
      } catch (error) {
        statusEl.className = 'settings-status error'
        statusEl.textContent = error.message
      }
    })
  }

  // Wishlist rendering
  const wishlistContainer = document.querySelector('#member-favorites')
  if (wishlistContainer) {
    if (savedItems.length === 0) {
      wishlistContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart icon on any package or room to save your dream destinations for later.</p>
          <a class="button small" href="packages.html">Explore Travel Packages</a>
        </div>
      `
    } else {
      wishlistContainer.innerHTML = savedItems.join('')
      connectWishlistButtons()
    }
  }

  // Logout
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
    const isRoomBooking = booking?.bookingType === 'room'
    const trip = booking ? (isRoomBooking ? getRoomById(booking.roomId) : getPackageById(booking.packageId)) : trips[0]
    const travelDate = booking ? bookingDateLabel(booking) : 'Not selected'
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
      <div class="booking-summary"><div class="booking-key">⌑</div><div class="booking-title"><small>${isRoomBooking ? 'ROOM RESERVATION' : 'BOOKING ID'} #${booking.bookingRef}</small><h3>${bookingTitle(booking)}</h3></div>
        <div class="booking-fact"><small>Guests</small><b>${guestCount || 1} ${guestCount === 1 ? 'person' : 'people'}</b></div>
        <div class="booking-fact"><small>${isRoomBooking ? 'Stay length' : 'Duration'}</small><b>${isRoomBooking ? `${booking.nights || 1} ${(booking.nights || 1) === 1 ? 'night' : 'nights'}` : `${trip.duration} days`}</b></div>
        <div class="booking-fact"><small>${isRoomBooking ? 'Check-in · check-out' : 'Travel date'}</small><b>${travelDate}</b></div>
      </div>
      <div class="booking-highlight"><b>${isRoomBooking ? 'Room features' : 'Trip highlights'}</b><div class="booking-highlight-chips">${(trip.amenities || trip.included || []).slice(0, 2).map(item => `<span>${item}</span>`).join('')}</div></div>
      <div class="admin-trip-photos">${photos.map((photo, index) => `<a href="${isRoomBooking ? `room.html?id=${trip.id}` : `package.html?id=${trip.id}`}" class="admin-trip-photo${index === 2 ? ' photo-overlay' : ''}"><img src="${photo}" alt="${trip.destination} ${isRoomBooking ? 'room' : 'trip'} photo">${index === 2 ? `<span>View ${isRoomBooking ? 'room' : 'trip'} ↗</span>` : ''}</a>`).join('')}</div>
      <div class="booking-bottom"><span>Booked ${bookingDate}</span><b>${money(booking.totalPrice)}</b></div>`
  }

  function renderHistory() {
    const search = historySearch.trim().toLowerCase()
    const visibleBookings = bookings.filter(booking =>
      (historyStatus === 'All' || booking.status === historyStatus) &&
      `${booking.bookingRef} ${booking.customerName} ${bookingTitle(booking)} ${booking.status}`.toLowerCase().includes(search)
    )
    document.querySelector('#booking-count').textContent = `${visibleBookings.length} of ${bookings.length} bookings`
    document.querySelectorAll('[data-history-filter]').forEach(button => {
      button.classList.toggle('selected', button.dataset.historyFilter === historyStatus)
    })
    document.querySelector('#admin-bookings').innerHTML = visibleBookings.map(booking => {
      const guestCount = Number(booking.adults || 0) + Number(booking.children || 0) || 1
      const travelDate = booking.travelDate ? bookingDateLabel(booking) : '—'
      return `<tr><td><b>${booking.bookingRef}</b></td><td>${booking.customerName}</td><td>${booking.bookingType === 'room' ? 'Room · ' : ''}${bookingTitle(booking)}</td><td>${travelDate}</td><td>${guestCount}</td>
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
    `<tr><td>${trip.title}</td><td>${trip.destination}, ${trip.country}</td><td>${(trip.departureDates || []).join(', ') || 'Dates not set'}</td>
      <td>${money(trip.price)}</td><td><button data-edit="${trip.id}">Edit</button>
      <button class="danger-text" data-delete="${trip.id}">Delete</button></td></tr>`
  ).join('')
  renderRoomsTable()
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
  document.querySelector('#add-room').addEventListener('click', () => editRoom())
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

  document.querySelectorAll('[data-admin-section]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault()
    const section = document.getElementById(link.dataset.adminSection)
    if (!section) return
    section.open = true
    history.replaceState(null, '', `admin.html#${section.id}`)
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }))
  const requestedSection = location.hash ? document.querySelector(location.hash) : null
  if (requestedSection?.matches('details.package-manager')) requestedSection.open = true
}

function showBookingConfirmationVoucher(booking, item, { isNewAccount = false } = {}) {
  const isRoom = booking.bookingType === 'room'
  const title = bookingTitle(booking)
  const dialog = document.createElement('dialog')
  dialog.className = 'voucher-dialog'
  dialog.id = 'booking-voucher-modal'

  dialog.innerHTML = `
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
        <strong>${booking.bookingRef}</strong>
      </div>
      <div>
        <span style="display:inline-block;padding:5px 9px;border-radius:4px;background:#e0f2fe;color:#0369a1;font-size:11px;font-weight:700;">
          Dummy Payment Approved
        </span>
      </div>
    </div>

    ${isNewAccount ? `
      <div class="voucher-account-created">
        <strong>✓ Wanderlust Account Created & Signed In</strong>
        <p style="margin:4px 0 0;font-size:11px;">Your account for <b>${booking.customerEmail}</b> is active. You can log in anytime to manage your bookings and redeem loyalty points.</p>
      </div>
    ` : ''}

    <div class="voucher-item-summary">
      <div class="eyebrow">${isRoom ? 'ROOM STAY' : 'TRAVEL PACKAGE'}</div>
      <h3>${title}</h3>
      <div class="voucher-details-grid">
        <div>
          <span>Travel / Stay Dates</span>
          <b>${bookingDateLabel(booking)}</b>
        </div>
        <div>
          <span>Guests</span>
          <b>${booking.adults} guest${booking.adults > 1 ? 's' : ''}</b>
        </div>
        <div>
          <span>Lead Traveler</span>
          <b>${booking.customerName}</b>
        </div>
        <div>
          <span>Contact Email</span>
          <b>${booking.customerEmail}</b>
        </div>
        ${booking.customerPhone ? `
        <div>
          <span>Phone</span>
          <b>${booking.customerPhone}</b>
        </div>` : ''}
        <div>
          <span>Payment Method</span>
          <b>${booking.paymentMethod}</b>
        </div>
      </div>

      <div class="voucher-pricing-table">
        <div>
          <span>Base Price</span>
          <span>${money(booking.basePrice * (booking.nights || booking.adults || 1))}</span>
        </div>
        ${booking.discountAmount ? `
        <div style="color:#047857;">
          <span>Total Discount (Promo & Rewards)</span>
          <span>−${money(booking.discountAmount)}</span>
        </div>` : ''}
        <div class="total-row">
          <span>Amount Paid (Demo)</span>
          <span style="color:#0284c7;">${money(booking.totalPrice)}</span>
        </div>
      </div>

      <div class="voucher-rewards-earned">
        <span>✦</span>
        <span><b>+${booking.pointsEarned || Math.floor(booking.totalPrice / 10)} Wanderlust Rewards points</b> earned from this booking!</span>
      </div>
    </div>

    <p style="margin:8px 0;font-size:11px;color:#94a3b8;text-align:center;">
      This reservation is stored in your browser. No real payment transaction was conducted.
    </p>

    <div class="voucher-actions">
      <button type="button" class="button outline small" id="voucher-print">Print / Save Receipt</button>
      <button type="button" class="button small" id="voucher-view-bookings">View in My Bookings</button>
    </div>
  `

  document.body.append(dialog)
  dialog.showModal()

  dialog.querySelector('#voucher-print')?.addEventListener('click', () => {
    window.print()
  })

  dialog.querySelector('#voucher-view-bookings')?.addEventListener('click', () => {
    dialog.close()
    dialog.remove()
    location.href = 'bookings.html'
  })

  dialog.addEventListener('close', () => {
    dialog.remove()
    location.href = 'bookings.html'
  })
}

function bookingForm(id) {
  const trip = getPackageById(id)
  if (!trip) return
  let user = getSignedInUser()
  const userBookings = user ? getBookings().filter(booking => booking.userId === user.id || booking.customerEmail === user.email) : []
  const availablePoints = user ? getLoyaltyPoints(userBookings) : 0
  const defaultDate = (trip.departureDates && trip.departureDates[0]) || new Date().toISOString().slice(0, 10)

  const dialog = document.createElement('dialog')
  dialog.innerHTML = `<form method="dialog" id="checkout-form"><button class="close" value="cancel">×</button>
    <div class="eyebrow">RESERVE YOUR PLACE</div>
    <h2>${trip.title}</h2>

    ${user ? `
      <div class="checkout-user-banner signed-in">
        <span class="badge-icon">✓</span>
        <div>
          <b>Signed in as ${user.name}</b>
          <small>${user.email} · Wanderlust Member (${availablePoints.toLocaleString()} reward points available)</small>
        </div>
      </div>
    ` : `
      <div class="checkout-user-banner guest">
        <div>
          <b>Traveler Details & Quick Account</b>
          <small>Already registered? <a href="login.html?next=${encodeURIComponent(`package.html?id=${trip.id}`)}">Log in here</a> or enter traveler details below.</small>
        </div>
      </div>
    `}

    <label>Your name<input name="name" id="pkg-customer-name" value="${user?.name || ''}" required placeholder="First and last name"></label>
    <label>Email address<input name="email" id="pkg-customer-email" type="email" value="${user?.email || ''}" required placeholder="you@example.com"></label>
    <label>Phone number<input name="phone" id="pkg-customer-phone" type="tel" value="${user?.phone || ''}" placeholder="+1 (555) 0144"></label>
    <label>Travel departure date<input name="date" type="date" value="${defaultDate}" required></label>
    <label>Adults<select name="adults"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>

    ${!user ? `
      <div class="checkout-account-box">
        <label class="create-account-toggle">
          <input type="checkbox" id="pkg-create-account" name="createAccount" checked>
          <span>
            <b>Create account with this booking</b>
            <small>Earn ${Math.floor((trip.price * 2) / 10)} reward points and manage bookings in your account</small>
          </span>
        </label>
        <div id="pkg-password-wrap">
          <label>Account password (at least 6 characters)
            <div class="password-input-wrap">
              <input name="password" id="pkg-account-password" type="password" minlength="6" placeholder="Choose a password">
              <button type="button" class="toggle-password" data-target="pkg-account-password">Show</button>
            </div>
          </label>
        </div>
      </div>
    ` : ''}

    <label>Payment method
      <select name="paymentMethod">
        <option value="Card">Credit or debit card (Simulated)</option>
        <option value="Pay at agency">Pay at agency / On arrival</option>
        <option value="Digital Wallet">Digital Wallet / Mock 1-Click</option>
      </select>
    </label>

    <div class="demo-card-helper" id="pkg-demo-helper">
      <button type="button" class="button outline small" id="pkg-autofill-card">⚡ Autofill Demo Card</button>
      <span class="card-hint">4242 •••• •••• 4242 · 12/28 · 123</span>
    </div>

    <div class="card-fields-grid" id="pkg-card-fields">
      <label class="full">Cardholder name<input name="cardholder" id="pkg-cardholder" value="${user?.name || ''}" autocomplete="cc-name" placeholder="Name on card"></label>
      <label class="full">Card number<input name="cardNumber" id="pkg-card-number" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="23"></label>
      <label>Expiration date<input name="cardExpiry" id="pkg-card-expiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5"></label>
      <label>Security code<input name="cardCvc" id="pkg-card-cvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"></label>
    </div>

    <div class="promo-row">
      <label>Discount code<input name="promoCode" id="promo-code" placeholder="Try WELCOME10 or SUMMER2026"></label>
      <button class="button outline" type="button" id="apply-promo">Apply</button>
    </div>
    <p class="promo-message" id="promo-message" aria-live="polite"></p>

    <label class="reward-choice">
      <input id="use-rewards" type="checkbox" ${availablePoints ? '' : 'disabled'}>
      <span>
        <b>Use reward points</b>
        <small>${availablePoints.toLocaleString()} points available · 1 point = $0.10</small>
      </span>
    </label>

    <p class="payment-note">Class Project Simulation: No real payment or banking transaction is processed.</p>

    <div class="checkout-summary">
      <div><span>Trip subtotal</span><b id="checkout-subtotal">${money(trip.price * 2)}</b></div>
      <div id="checkout-discount-row" hidden><span>Promo discount</span><b id="checkout-discount"></b></div>
      <div id="checkout-rewards-row" hidden><span>Rewards discount</span><b id="checkout-rewards-discount"></b></div>
      <div class="checkout-total-row"><strong>Total</strong><b id="checkout-total">${money(trip.price * 2)}</b></div>
    </div>

    <p class="account-message" id="checkout-error-message" aria-live="polite"></p>
    <button class="button" id="pay-button" value="confirm">Confirm & Pay (Demo)</button>
  </form>`

  document.body.append(dialog)
  dialog.showModal()

  const formElement = dialog.querySelector('form')
  const adultSelect = formElement.querySelector('[name="adults"]')
  const methodSelect = formElement.querySelector('[name="paymentMethod"]')
  const cardFields = formElement.querySelector('#pkg-card-fields')
  const demoHelper = formElement.querySelector('#pkg-demo-helper')
  const cardholder = formElement.querySelector('#pkg-cardholder')
  const cardNumber = formElement.querySelector('#pkg-card-number')
  const cardExpiry = formElement.querySelector('#pkg-card-expiry')
  const cardCvc = formElement.querySelector('#pkg-card-cvc')
  const payButton = formElement.querySelector('#pay-button')
  const promoInput = formElement.querySelector('#promo-code')
  const promoMessage = formElement.querySelector('#promo-message')
  const checkoutError = formElement.querySelector('#checkout-error-message')
  const useRewards = formElement.querySelector('#use-rewards')
  const autofillBtn = formElement.querySelector('#pkg-autofill-card')
  const createAccountCheckbox = formElement.querySelector('#pkg-create-account')
  const passwordWrap = formElement.querySelector('#pkg-password-wrap')
  let appliedPromo = null

  // Password toggle
  dialog.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = dialog.querySelector(`#${btn.dataset.target}`)
      if (!input) return
      const isPass = input.type === 'password'
      input.type = isPass ? 'text' : 'password'
      btn.textContent = isPass ? 'Hide' : 'Show'
    })
  })

  // Create account checkbox toggle
  createAccountCheckbox?.addEventListener('change', () => {
    if (passwordWrap) passwordWrap.hidden = !createAccountCheckbox.checked
  })

  // Autofill demo card
  autofillBtn?.addEventListener('click', () => {
    const custName = formElement.querySelector('#pkg-customer-name')?.value.trim()
    cardholder.value = custName || user?.name || 'Alex Morgan'
    cardNumber.value = '4242 4242 4242 4242'
    cardExpiry.value = '12/28'
    cardCvc.value = '123'
    if (methodSelect.value !== 'Card') {
      methodSelect.value = 'Card'
      methodSelect.dispatchEvent(new Event('change'))
    }
  })

  cardNumber.addEventListener('input', () => {
    const digits = cardNumber.value.replace(/\D/g, '').slice(0, 19)
    cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim()
  })
  cardExpiry.addEventListener('input', () => {
    const digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4)
    cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  })
  cardCvc.addEventListener('input', () => { cardCvc.value = cardCvc.value.replace(/\D/g, '').slice(0, 4) })

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
    const showCard = methodSelect.value === 'Card'
    if (cardFields) cardFields.hidden = !showCard
    if (demoHelper) demoHelper.hidden = !showCard
  })

  formElement.addEventListener('submit', async event => {
    if (event.submitter.value !== 'confirm') return
    event.preventDefault()
    checkoutError.textContent = ''

    const form = new FormData(event.currentTarget)
    const custName = form.get('name').trim()
    const custEmail = form.get('email').trim().toLowerCase()
    const custPhone = (form.get('phone') || '').trim()

    let isNewAccount = false
    if (!user) {
      if (createAccountCheckbox?.checked) {
        const pass = form.get('password') || ''
        if (pass.length < 6) {
          checkoutError.textContent = 'Please choose a password with at least 6 characters to create your account.'
          return
        }
        try {
          user = createAccount(custName, custEmail, pass, custPhone)
          isNewAccount = true
        } catch (err) {
          checkoutError.textContent = err.message + ' You can uncheck "Create account" to continue as guest or log in.'
          return
        }
      } else {
        user = { id: 'guest-' + Date.now(), name: custName, email: custEmail, phone: custPhone, role: 'traveler' }
      }
    }

    const cardDigits = cardNumber.value.replace(/\D/g, '')
    const expiryMatch = cardExpiry.value.match(/^(\d{2})\/(\d{2})$/)
    const expiryMonth = expiryMatch ? Number(expiryMatch[1]) : 0
    const expiryYear = expiryMatch ? 2000 + Number(expiryMatch[2]) : 0
    const currentDate = new Date()
    const expiryIsPast = expiryMatch && (expiryYear < currentDate.getFullYear() || (expiryYear === currentDate.getFullYear() && expiryMonth < currentDate.getMonth() + 1))

    if (methodSelect.value === 'Card') {
      if (!cardholder.value.trim() || cardDigits.length < 13 || cardDigits.length > 19 || !expiryMatch || expiryMonth < 1 || expiryMonth > 12 || expiryIsPast || cardCvc.value.length < 3) {
        checkoutError.textContent = 'Please check the cardholder name, card number, expiration date, and CVC (or click Autofill Demo Card).'
        return
      }
    }

    payButton.disabled = true
    payButton.textContent = 'Authorizing simulated payment…'
    await new Promise(resolve => setTimeout(resolve, 800))

    const adults = Number(form.get('adults'))
    const totals = updateCheckoutTotal()
    const booking = createBooking({
      packageId: trip.id,
      packageTitle: trip.title,
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      travelDate: form.get('date'),
      userId: user.id,
      adults,
      children: 0,
      basePrice: trip.price,
      totalPrice: totals.total,
      discountAmount: totals.promoDiscount + totals.pointsDiscount,
      promoDiscountAmount: totals.promoDiscount,
      pointsUsed: totals.pointsUsed,
      pointsEarned: Math.floor(totals.total / 10),
      pointsDiscountAmount: totals.pointsDiscount,
      promoCode: appliedPromo?.code || '',
      paymentMethod: methodSelect.value === 'Card' ? `Demo Card ending in ${cardDigits.slice(-4)}` : methodSelect.value,
      paymentStatus: methodSelect.value === 'Card' ? 'Demo payment approved' : methodSelect.value === 'Digital Wallet' ? 'Digital wallet authorized' : 'Pay at agency'
    })

    dialog.close()
    dialog.remove()
    updateAccountLink()
    showBookingConfirmationVoucher(booking, trip, { isNewAccount })
  })

  dialog.addEventListener('close', () => dialog.remove())
}

function roomBookingForm(id, requestedDates = {}) {
  const room = getRoomById(id)
  if (!room) return
  let user = getSignedInUser()
  const userBookings = user ? getBookings().filter(booking => booking.userId === user.id || booking.customerEmail === user.email) : []
  const availablePoints = user ? getLoyaltyPoints(userBookings) : 0
  const slot = document.querySelector('#room-checkout-slot')

  slot.innerHTML = `<section class="room-checkout-section" id="room-checkout-section">
    <div class="room-checkout-heading">
      <div>
        <div class="eyebrow">BOOK A ROOM ON ITS OWN</div>
        <h2>Complete your stay</h2>
        <p>${room.name} · ${room.property} · ${room.destination}, ${room.country}</p>
      </div>
      <button type="button" class="room-checkout-close" aria-label="Close booking form">×</button>
    </div>

    <div class="room-checkout-layout">
      <form id="room-checkout-form">
        <section class="checkout-form-group">
          <h3>Guest details</h3>
          ${user ? `
            <div class="checkout-user-banner signed-in" style="margin-bottom:12px;">
              <span class="badge-icon">✓</span>
              <div>
                <b>Signed in as ${user.name}</b>
                <small>${user.email} · Wanderlust Member (${availablePoints.toLocaleString()} reward points available)</small>
              </div>
            </div>
          ` : `
            <div class="checkout-user-banner guest" style="margin-bottom:12px;">
              <div>
                <b>Traveler Information</b>
                <small>Already registered? <a href="login.html?next=${encodeURIComponent(`room.html${location.search}`)}">Log in here</a></small>
              </div>
            </div>
          `}
          <div class="room-form-grid">
            <label>Your full name<input name="name" id="room-guest-name" value="${user?.name || ''}" required placeholder="First and last name"></label>
            <label>Email address<input name="email" id="room-guest-email" type="email" value="${user?.email || ''}" required placeholder="you@example.com"></label>
            <label>Phone number<input name="phone" id="room-guest-phone" type="tel" value="${user?.phone || ''}" placeholder="+1 (555) 0144"></label>
          </div>
          ${!user ? `
            <div class="checkout-account-box" style="margin-top:10px;">
              <label class="create-account-toggle">
                <input type="checkbox" id="room-create-account" name="createAccount" checked>
                <span>
                  <b>Create account with this stay</b>
                  <small>Save reservation to My Bookings and earn reward points</small>
                </span>
              </label>
              <div id="room-password-wrap">
                <label>Account password (at least 6 characters)
                  <div class="password-input-wrap">
                    <input name="password" id="room-account-password" type="password" minlength="6" placeholder="Choose a password">
                    <button type="button" class="toggle-password" data-target="room-account-password">Show</button>
                  </div>
                </label>
              </div>
            </div>
          ` : ''}
        </section>

        <section class="checkout-form-group">
          <h3>Dates and guests</h3>
          <div class="room-form-grid">
            <label>Check-in<input name="checkIn" type="date" required></label>
            <label>Check-out<input name="checkOut" type="date" required></label>
            <label>Guests<select name="adults">${Array.from({ length: room.guests }, (_, i) => `<option ${i === 0 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
            <label>Payment method
              <select name="paymentMethod">
                <option value="Card">Credit or debit card (Simulated)</option>
                <option value="Pay at agency">Pay at agency / On arrival</option>
                <option value="Digital Wallet">Digital Wallet / Mock 1-Click</option>
              </select>
            </label>
          </div>
        </section>

        <section class="checkout-form-group">
          <h3>Payment details</h3>
          <div class="demo-card-helper" id="room-demo-helper" style="margin-bottom:10px;">
            <button type="button" class="button outline small" id="room-autofill-card">⚡ Autofill Demo Card</button>
            <span class="card-hint">4242 •••• •••• 4242 · 12/28 · 123</span>
          </div>
          <div class="room-form-grid" id="room-card-fields">
            <label>Cardholder name<input name="cardholder" id="room-cardholder" value="${user?.name || ''}" autocomplete="cc-name" placeholder="Name on card"></label>
            <label class="card-number-field">Card number<input name="cardNumber" id="room-card-number" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="23"></label>
            <label>Expiration date<input name="cardExpiry" id="room-card-expiry" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5"></label>
            <label>Security code<input name="cardCvc" id="room-card-cvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"></label>
          </div>
          <p class="payment-note">Class Project Simulation: No real payment or banking transaction is processed.</p>
        </section>

        <div class="promo-row">
          <label>Discount code<input name="promoCode" id="room-promo-code" placeholder="Try WELCOME10 or SUMMER2026"></label>
          <button class="button outline" type="button" id="room-apply-promo">Apply</button>
        </div>
        <p class="promo-message" id="room-promo-message" aria-live="polite"></p>

        <label class="reward-choice">
          <input id="room-use-rewards" type="checkbox" ${availablePoints ? '' : 'disabled'}>
          <span>
            <b>Use reward points</b>
            <small>${availablePoints.toLocaleString()} points available · 1 point = $0.10</small>
          </span>
        </label>

        <p class="account-message" id="room-checkout-error" aria-live="polite"></p>
        <button class="button" id="room-pay-button" type="submit" value="confirm">Confirm & Pay (Demo)</button>
      </form>

      <aside class="room-checkout-summary">
        <img src="${room.coverImage}" alt="${room.name}">
        <span class="summary-kicker">YOUR STAY</span>
        <h3>${room.name}</h3>
        <p>${room.property} · ${room.destination}</p>
        <div class="summary-nightly">
          <strong>${money(room.price)}</strong>
          <span>per night</span>
        </div>
        <div class="checkout-summary">
          <div><span>Stay subtotal</span><b id="room-subtotal">${money(room.price)}</b></div>
          <div><span>Length of stay</span><b id="room-night-count">Choose dates</b></div>
          <div id="room-discount-row" hidden><span>Promo discount</span><b id="room-discount"></b></div>
          <div id="room-rewards-row" hidden><span>Rewards discount</span><b id="room-rewards-discount"></b></div>
          <div class="checkout-total-row"><strong>Total</strong><b id="room-total">${money(room.price)}</b></div>
        </div>
      </aside>
    </div>
  </section>`

  const form = slot.querySelector('form')
  slot.querySelector('.room-checkout-close').addEventListener('click', () => { slot.innerHTML = '' })
  slot.querySelector('#room-checkout-section').scrollIntoView({ behavior: 'smooth', block: 'start' })

  // Password toggle
  slot.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = slot.querySelector(`#${btn.dataset.target}`)
      if (!input) return
      const isPass = input.type === 'password'
      input.type = isPass ? 'text' : 'password'
      btn.textContent = isPass ? 'Hide' : 'Show'
    })
  })

  const checkIn = form.elements.checkIn
  const checkOut = form.elements.checkOut
  const method = form.elements.paymentMethod
  const cardFields = slot.querySelector('#room-card-fields')
  const demoHelper = slot.querySelector('#room-demo-helper')
  const cardholder = form.elements.cardholder
  const cardNumber = form.elements.cardNumber
  const cardExpiry = form.elements.cardExpiry
  const cardCvc = form.elements.cardCvc
  const payButton = form.querySelector('#room-pay-button')
  const useRewards = form.querySelector('#room-use-rewards')
  const promoInput = form.querySelector('#room-promo-code')
  const promoMessage = form.querySelector('#room-promo-message')
  const checkoutError = form.querySelector('#room-checkout-error')
  const autofillBtn = slot.querySelector('#room-autofill-card')
  const createAccountCheckbox = slot.querySelector('#room-create-account')
  const passwordWrap = slot.querySelector('#room-password-wrap')

  createAccountCheckbox?.addEventListener('change', () => {
    if (passwordWrap) passwordWrap.hidden = !createAccountCheckbox.checked
  })

  // Autofill demo card
  autofillBtn?.addEventListener('click', () => {
    const custName = form.elements.name.value.trim()
    cardholder.value = custName || user?.name || 'Alex Morgan'
    cardNumber.value = '4242 4242 4242 4242'
    cardExpiry.value = '12/28'
    cardCvc.value = '123'
    if (method.value !== 'Card') {
      method.value = 'Card'
      method.dispatchEvent(new Event('change'))
    }
  })

  const today = new Date()
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  checkIn.min = localDate(today)
  if (room.availableFrom && room.availableFrom > checkIn.min) checkIn.min = room.availableFrom
  if (room.availableTo) checkIn.max = room.availableTo
  checkIn.value = requestedDates.checkIn || (room.availableFrom && room.availableFrom > localDate(tomorrow) ? room.availableFrom : localDate(tomorrow))
  const firstCheckout = new Date(`${checkIn.value}T12:00:00`)
  firstCheckout.setDate(firstCheckout.getDate() + 1)
  checkOut.value = requestedDates.checkOut || localDate(firstCheckout)
  if (requestedDates.guests && Number(requestedDates.guests) <= room.guests) {
    form.elements.adults.value = requestedDates.guests
  }
  let appliedPromo = null

  cardNumber.addEventListener('input', () => {
    const digits = cardNumber.value.replace(/\D/g, '').slice(0, 19)
    cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim()
  })
  cardExpiry.addEventListener('input', () => {
    const digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4)
    cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  })
  cardCvc.addEventListener('input', () => { cardCvc.value = cardCvc.value.replace(/\D/g, '').slice(0, 4) })

  function stayNights() {
    if (!checkIn.value || !checkOut.value) return 0
    return Math.round((new Date(`${checkOut.value}T12:00:00`) - new Date(`${checkIn.value}T12:00:00`)) / 86400000)
  }

  function updateRoomTotal() {
    const dayAfterCheckIn = checkIn.value ? new Date(`${checkIn.value}T12:00:00`) : nextDay
    if (checkIn.value) dayAfterCheckIn.setDate(dayAfterCheckIn.getDate() + 1)
    checkOut.min = localDate(dayAfterCheckIn)
    const nights = Math.max(0, stayNights())
    const subtotal = room.price * nights
    const promoDiscount = getDiscountAmount(appliedPromo, subtotal)
    const pointsUsed = useRewards.checked ? Math.min(availablePoints, Math.floor((subtotal - promoDiscount) * 10)) : 0
    const pointsDiscount = pointsUsed / 10
    form.querySelector('#room-subtotal').textContent = money(subtotal)
    form.querySelector('#room-night-count').textContent = `${nights} ${nights === 1 ? 'night' : 'nights'}`
    form.querySelector('#room-total').textContent = money(Math.max(0, subtotal - promoDiscount - pointsDiscount))
    form.querySelector('#room-discount-row').hidden = promoDiscount === 0
    form.querySelector('#room-discount').textContent = `−${money(promoDiscount)}`
    form.querySelector('#room-rewards-row').hidden = pointsDiscount === 0
    form.querySelector('#room-rewards-discount').textContent = `−${money(pointsDiscount)}`
    return { nights, subtotal, promoDiscount, pointsUsed, pointsDiscount, total: Math.max(0, subtotal - promoDiscount - pointsDiscount) }
  }

  checkIn.addEventListener('change', updateRoomTotal)
  checkOut.addEventListener('change', updateRoomTotal)
  useRewards.addEventListener('change', updateRoomTotal)
  form.querySelector('#room-apply-promo').addEventListener('click', () => {
    appliedPromo = validatePromoCode(promoInput.value)
    promoMessage.textContent = appliedPromo ? `Applied: ${appliedPromo.description}` : 'That code is not valid. Try WELCOME10 or SUMMER2026.'
    promoMessage.className = `promo-message ${appliedPromo ? 'success' : 'error'}`
    updateRoomTotal()
  })

  method.addEventListener('change', () => {
    const showCard = method.value === 'Card'
    if (cardFields) cardFields.hidden = !showCard
    if (demoHelper) demoHelper.hidden = !showCard
  })

  updateRoomTotal()

  form.addEventListener('submit', async event => {
    if (event.submitter.value !== 'confirm') return
    event.preventDefault()
    checkoutError.textContent = ''

    const totals = updateRoomTotal()
    if (!totals.nights || totals.nights < 1) {
      checkoutError.textContent = 'Choose a check-out date after your check-in date.'
      return
    }

    const values = new FormData(form)
    const custName = values.get('name').trim()
    const custEmail = values.get('email').trim().toLowerCase()
    const custPhone = (values.get('phone') || '').trim()

    let isNewAccount = false
    if (!user) {
      if (createAccountCheckbox?.checked) {
        const pass = values.get('password') || ''
        if (pass.length < 6) {
          checkoutError.textContent = 'Please choose a password with at least 6 characters to create your account.'
          return
        }
        try {
          user = createAccount(custName, custEmail, pass, custPhone)
          isNewAccount = true
        } catch (err) {
          checkoutError.textContent = err.message + ' You can uncheck "Create account" to continue as guest or log in.'
          return
        }
      } else {
        user = { id: 'guest-' + Date.now(), name: custName, email: custEmail, phone: custPhone, role: 'traveler' }
      }
    }

    const cardDigits = cardNumber.value.replace(/\D/g, '')
    const expiryMatch = cardExpiry.value.match(/^(\d{2})\/(\d{2})$/)
    const expiryMonth = expiryMatch ? Number(expiryMatch[1]) : 0
    const expiryYear = expiryMatch ? 2000 + Number(expiryMatch[2]) : 0
    const currentDate = new Date()
    const expiryIsPast = expiryMatch && (expiryYear < currentDate.getFullYear() || (expiryYear === currentDate.getFullYear() && expiryMonth < currentDate.getMonth() + 1))

    if (method.value === 'Card') {
      if (!cardholder.value.trim() || cardDigits.length < 13 || cardDigits.length > 19 || !expiryMatch || expiryMonth < 1 || expiryMonth > 12 || expiryIsPast || cardCvc.value.length < 3) {
        checkoutError.textContent = 'Please check the cardholder name, card number, expiration date, and CVC (or click Autofill Demo Card).'
        return
      }
    }

    payButton.disabled = true
    payButton.textContent = 'Authorizing simulated payment…'
    await new Promise(resolve => setTimeout(resolve, 800))

    const booking = createBooking({
      bookingType: 'room',
      roomId: room.id,
      packageId: '',
      packageTitle: `${room.name} · ${room.property}`,
      roomName: room.name,
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      userId: user.id,
      travelDate: values.get('checkIn'),
      checkOutDate: values.get('checkOut'),
      nights: totals.nights,
      adults: Number(values.get('adults')),
      children: 0,
      basePrice: room.price,
      totalPrice: totals.total,
      discountAmount: totals.promoDiscount + totals.pointsDiscount,
      promoDiscountAmount: totals.promoDiscount,
      pointsUsed: totals.pointsUsed,
      pointsEarned: Math.floor(totals.total / 10),
      pointsDiscountAmount: totals.pointsDiscount,
      promoCode: appliedPromo?.code || '',
      paymentMethod: method.value === 'Card' ? `Demo Card ending in ${cardDigits.slice(-4)}` : method.value,
      paymentStatus: method.value === 'Card' ? 'Demo payment approved' : method.value === 'Digital Wallet' ? 'Digital wallet authorized' : 'Pay at agency'
    })

    slot.innerHTML = ''
    updateAccountLink()
    showBookingConfirmationVoucher(booking, room, { isNewAccount })
  })
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
  const dates = prompt('Departure dates (YYYY-MM-DD, separated by commas)', (oldTrip.departureDates || []).join(', '))
  if (dates === null) return
  savePackage({ ...oldTrip, title, destination, country, price: Number(price), duration: Number(duration),
    departureDates: dates.split(',').map(date => date.trim()).filter(Boolean),
    continent: oldTrip.continent || 'Europe', category: oldTrip.category || 'Cultural',
    coverImage: oldTrip.coverImage || '', shortDescription: oldTrip.shortDescription || 'A memorable trip planned for you.' })
  showPage()
}

function renderRoomsTable() {
  const table = document.querySelector('#admin-rooms')
  if (!table) return
  table.innerHTML = getRooms().map(room => {
    const checkInDates = room.availableFrom || room.availableTo
      ? `${room.availableFrom || 'Any date'} – ${room.availableTo || 'Open'}`
      : 'All dates'
    return `<tr><td>${room.name}</td><td>${room.property}</td><td>${room.destination}, ${room.country}</td><td>${room.type}</td><td>${money(room.price)}</td><td>${checkInDates}</td>
      <td><button data-room-edit="${room.id}">Edit</button><button class="danger-text" data-room-delete="${room.id}">Delete</button></td></tr>`
  }).join('') || '<tr><td colspan="7" class="no-bookings">No room listings yet.</td></tr>'
  table.querySelectorAll('[data-room-edit]').forEach(button => button.addEventListener('click', () => editRoom(button.dataset.roomEdit)))
  table.querySelectorAll('[data-room-delete]').forEach(button => button.addEventListener('click', () => {
    const room = getRoomById(button.dataset.roomDelete)
    if (room && confirm(`Delete ${room.name}?`)) { deleteRoom(room.id); renderRoomsTable() }
  }))
}

function editRoom(id) {
  const oldRoom = id ? getRoomById(id) : {}
  const name = prompt('Room name', oldRoom.name || '')
  if (name === null) return
  const property = prompt('Property name', oldRoom.property || '')
  if (property === null) return
  const type = prompt('Room type (suite, hotel room, villa)', oldRoom.type || 'Hotel room')
  if (type === null) return
  const beds = prompt('Bed details', oldRoom.beds || '1 queen bed')
  if (beds === null) return
  const destination = prompt('City or destination', oldRoom.destination || '')
  if (destination === null) return
  const country = prompt('Country', oldRoom.country || '')
  if (country === null) return
  const price = prompt('Price per night in USD', oldRoom.price || '')
  if (price === null) return
  const guests = prompt('Maximum guests', oldRoom.guests || '2')
  if (guests === null) return
  const description = prompt('Short room description', oldRoom.description || 'A comfortable room for your stay.')
  if (description === null) return
  const coverImage = prompt('Photo URL', oldRoom.coverImage || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85')
  if (coverImage === null) return
  const amenities = prompt('Room features (separate with commas)', (oldRoom.amenities || ['Wi-Fi', 'Air conditioning']).join(', '))
  if (amenities === null) return
  const availableFrom = prompt('First available check-in date (YYYY-MM-DD, optional)', oldRoom.availableFrom || '')
  if (availableFrom === null) return
  const availableTo = prompt('Last available check-in date (YYYY-MM-DD, optional)', oldRoom.availableTo || '')
  if (availableTo === null) return
  const firstDate = availableFrom.trim()
  const lastDate = availableTo.trim()
  if (!name.trim() || !property.trim() || !destination.trim() || !country.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0 || !Number.isInteger(Number(guests)) || Number(guests) < 1) {
    alert('Add a room name, property, destination, country, a positive price and at least one guest.')
    return
  }
  if ((firstDate && !/^\d{4}-\d{2}-\d{2}$/.test(firstDate)) || (lastDate && !/^\d{4}-\d{2}-\d{2}$/.test(lastDate))) {
    alert('Enter availability dates in YYYY-MM-DD format, or leave them blank.')
    return
  }
  if (firstDate && lastDate && firstDate > lastDate) {
    alert('The first available date must be before the last available date.')
    return
  }
  const gallery = [coverImage.trim(), ...(oldRoom.gallery || []).filter(photo => photo && photo !== oldRoom.coverImage)].filter(Boolean).slice(0, 3)
  saveRoom({ ...oldRoom, name, property, type, beds, destination, country, price: Number(price), guests: Number(guests),
    description, coverImage: coverImage.trim(), gallery, amenities: amenities.split(',').map(item => item.trim()).filter(Boolean),
    availableFrom: firstDate, availableTo: lastDate })
  renderRoomsTable()
}

function showPage() {
  updateAccountLink()
  initializeNavigation()
  if (pageName === 'index.html') showHome()
  if (pageName === 'packages.html') showPackages()
  if (pageName === 'rooms.html') showRooms()
  if (pageName === 'package.html') showTripDetails()
  if (pageName === 'room.html') showRoomDetails()
  if (pageName === 'bookings.html') showBookings()
  if (pageName === 'wishlist.html') showWishlist()
  if (pageName === 'admin.html') showAdmin()
  if (pageName === 'login.html') showLogin()
  if (pageName === 'panel.html') showMemberPanel()
}

showPage()
