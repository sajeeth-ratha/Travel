<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import TripCard from '../components/TripCard.vue'
import { getPackages } from '../lib/data.js'
import { savedIds, toggleSaved } from '../lib/store.js'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=2200&q=90',
    alt: 'Colourful homes on the Italian coast',
    kicker: 'A SLOWER KIND OF ESCAPE · ITALY',
    lines: ['Find your place', 'in the sun.'],
    text: 'Coastal villages, long lunches and views worth taking the longer way for.',
    linkText: 'Explore the coast',
    query: 'Italy'
  },
  {
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2200&q=90',
    alt: 'Traditional street in Kyoto, Japan',
    kicker: 'CULTURE, AT YOUR OWN PACE · JAPAN',
    lines: ['Take the scenic', 'way through Kyoto.'],
    text: 'Quiet temple paths, small tea houses and a city that rewards curiosity.',
    linkText: 'Discover Kyoto',
    query: 'Kyoto'
  },
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=90',
    alt: 'Turquoise water beside a tropical beach',
    kicker: 'A LITTLE MORE BLUE · THE ISLANDS',
    lines: ['Let the days', 'open up.'],
    text: 'Warm water, open skies and room to make the trip your own.',
    linkText: 'See island trips',
    query: 'Beach'
  }
]

const categories = [
  { name: 'Beach & Island', note: 'Salt air and slow days', icon: 'beach_access' },
  { name: 'Cultural', note: 'History, food, and local life', icon: 'museum' },
  { name: 'Adventure & Nature', note: 'Fresh air and open trails', icon: 'hiking' },
  { name: 'Safari & Wildlife', note: 'Closer to the wild', icon: 'pets' },
  { name: 'Luxury Escapes', note: 'A little extra comfort', icon: 'hotel' }
]

const regionIcons = { Europe: 'location_city', Asia: 'temple_buddhist', Africa: 'pets', Americas: 'landscape', Oceania: 'sailing' }

const trips = getPackages()
const featured = trips.filter(trip => trip.featured).slice(0, 3)

const categoryOptions = computed(() => categories.map(style => ({
  ...style,
  count: trips.filter(trip => trip.category === style.name).length,
  image: trips.find(trip => trip.category === style.name)?.coverImage || ''
})))

const regions = computed(() => [...new Set(trips.map(trip => trip.continent))].map(region => ({
  name: region,
  icon: regionIcons[region] || 'public',
  count: trips.filter(trip => trip.continent === region).length,
  image: trips.find(trip => trip.continent === region)?.coverImage || ''
})))

const destinations = trips.slice(0, 4)

const currentSlide = ref(0)
const paused = ref(false)
const destination = ref('')
let slideTimer = null

function showSlide(index) {
  currentSlide.value = (index + slides.length) % slides.length
}

function playSlides() {
  clearInterval(slideTimer)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!paused.value && !reduceMotion) {
    slideTimer = setInterval(() => showSlide(currentSlide.value + 1), 6500)
  }
}

function goTo(index) {
  showSlide(index)
  playSlides()
}

function pause() {
  paused.value = true
  clearInterval(slideTimer)
}

function resume() {
  paused.value = false
  playSlides()
}

function searchStays() {
  window.location.href = `packages.html?q=${encodeURIComponent(destination.value)}`
}

function wish(id) {
  toggleSaved(id)
}

let observer = null

onMounted(() => {
  playSlides()
  const items = document.querySelectorAll('[data-home-reveal]')
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'))
    return
  }
  observer = new IntersectionObserver(entries => {
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
})

onBeforeUnmount(() => {
  clearInterval(slideTimer)
  observer?.disconnect()
})
</script>

<template>
  <SiteHeader active="home" />
  <main>
    <section class="home-carousel" aria-label="Featured destinations" @mouseenter="pause" @mouseleave="resume">
      <article
        v-for="(slide, index) in slides"
        :key="slide.alt"
        class="hero-slide"
        :class="{ active: index === currentSlide }"
        :aria-hidden="index === currentSlide ? 'false' : 'true'"
      >
        <img :src="slide.image" :alt="slide.alt">
        <div class="slide-shade"></div>
        <div class="slide-copy">
          <span class="slide-kicker">{{ slide.kicker }}</span>
          <h1>{{ slide.lines[0] }}<br>{{ slide.lines[1] }}</h1>
          <p>{{ slide.text }}</p>
          <a class="button gold" :href="`packages.html?q=${encodeURIComponent(slide.query)}`">
            {{ slide.linkText }} <span>↗</span>
          </a>
        </div>
      </article>
      <button class="slide-arrow previous" aria-label="Previous slide" @click="goTo(currentSlide - 1)">←</button>
      <button class="slide-arrow next" aria-label="Next slide" @click="goTo(currentSlide + 1)">→</button>
      <div class="slide-footer">
        <span>0{{ currentSlide + 1 }} / 0{{ slides.length }}</span>
        <div class="slide-dots" aria-label="Choose a slide">
          <button
            v-for="(slide, index) in slides"
            :key="slide.alt"
            :class="{ active: index === currentSlide }"
            :aria-label="`Show slide ${index + 1}`"
            @click="goTo(index)"
          ></button>
        </div>
      </div>
    </section>

    <section class="home-search-wrap">
      <div class="search-box">
        <div class="search-heading">
          <div>
            <div class="eyebrow">YOUR NEXT STAY STARTS HERE</div>
            <h2>Where to?</h2>
          </div>
          <span>Thoughtfully planned trips, made easy.</span>
        </div>
        <div class="search-fields">
          <label>Destination
            <input v-model="destination" placeholder="City, country, or experience" @keydown.enter="searchStays">
          </label>
          <label>Check-in<input type="date"></label>
          <label>Check-out<input type="date"></label>
          <label>Guests
            <select><option>1 guest</option><option selected>2 guests</option><option>3 guests</option><option>4 guests</option></select>
          </label>
          <button class="button" @click="searchStays">Search stays <span>→</span></button>
        </div>
      </div>
    </section>

    <section class="standalone-stay-link wrap">
      <div>
        <div class="eyebrow">JUST LOOKING FOR A PLACE TO STAY?</div>
        <h2>Book a room by itself.</h2>
        <p>Choose a hotel room or villa, pick your dates, and book without adding a travel package.</p>
      </div>
      <a class="button" href="rooms.html">Explore rooms <span>→</span></a>
    </section>

    <section class="wrap home-discovery">
      <div class="section-heading discovery-heading">
        <div>
          <div class="eyebrow">A GOOD PLACE TO BEGIN</div>
          <h2>Choose your kind of trip</h2>
          <p>Start with the feeling you’re after, or pick a part of the world.</p>
        </div>
      </div>
      <div class="category-options">
        <a
          v-for="option in categoryOptions"
          :key="option.name"
          class="category-option"
          data-home-reveal
          :href="`packages.html?q=${encodeURIComponent(option.name)}`"
        >
          <img :src="option.image" :alt="`${option.name} travel idea`" loading="lazy">
          <span class="category-shade"></span>
          <span class="material-symbols-outlined option-icon" aria-hidden="true">{{ option.icon }}</span>
          <span class="option-copy"><b>{{ option.name }}</b><small>{{ option.note }}</small></span>
          <span class="option-count">{{ option.count }} {{ option.count === 1 ? 'trip' : 'trips' }} <span>↗</span></span>
        </a>
      </div>
      <div class="discovery-divider"></div>
      <div class="region-heading">
        <div>
          <div class="eyebrow">GO A LITTLE FURTHER</div>
          <h3>Explore by region</h3>
        </div>
        <a href="packages.html">All destinations →</a>
      </div>
      <div class="region-options">
        <a
          v-for="(region, index) in regions"
          :key="region.name"
          class="region-option"
          data-home-reveal
          :style="{ '--region-delay': `${index * -3}s` }"
          :href="`packages.html?q=${encodeURIComponent(region.name)}`"
        >
          <img :src="region.image" alt="" loading="lazy">
          <span class="region-shade"></span>
          <span class="material-symbols-outlined region-symbol" aria-hidden="true">{{ region.icon }}</span>
          <span class="region-copy"><b>{{ region.name }}</b><small>{{ region.count }} {{ region.count === 1 ? 'journey' : 'journeys' }}</small></span>
          <span class="region-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
      <div class="popular-heading">
        <div>
          <div class="eyebrow">TRAVELER FAVORITES</div>
          <h3>Popular places</h3>
        </div>
      </div>
      <div class="destination-options">
        <a
          v-for="trip in destinations"
          :key="trip.id"
          class="destination-option"
          data-home-reveal
          :style="{ '--destination-image': `url('${trip.coverImage}')` }"
          :href="`package.html?id=${trip.id}`"
        >
          <span>{{ trip.country }}</span>
          <b>{{ trip.destination }}</b>
          <small>Explore journey ↗</small>
        </a>
      </div>
    </section>

    <section class="wrap home-featured">
      <div class="section-heading">
        <div>
          <div class="eyebrow">HAND PICKED FOR YOU</div>
          <h2>Popular journeys</h2>
        </div>
        <a href="packages.html">See all trips →</a>
      </div>
      <div class="cards">
        <TripCard
          v-for="trip in featured"
          :key="trip.id"
          :trip="trip"
          :saved="savedIds.includes(trip.id)"
          @wish="wish(trip.id)"
        />
      </div>
      <section class="discount-banner" data-home-reveal aria-labelledby="discount-title">
        <img class="discount-photo" src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85" alt="A sunny resort pool surrounded by palm trees" loading="lazy">
        <div class="discount-copy">
          <div class="eyebrow">A LITTLE SOMETHING FOR YOUR NEXT TRIP</div>
          <h2 id="discount-title">Make your next getaway a little sweeter.</h2>
          <p>Take 10% off your trip with this welcome offer.</p>
          <div class="discount-code"><span>WELCOME10</span><small>Enter this code at checkout</small></div>
          <a class="button" href="packages.html">Browse trips <span>→</span></a>
        </div>
        <div class="discount-stamp" aria-label="10 percent off"><b>10%</b><span>OFF</span></div>
      </section>
      <section class="about">
        <div>
          <div class="eyebrow">TRAVEL WITH EASE</div>
          <h2>Your trip, thoughtfully planned.</h2>
        </div>
        <p>Browse a hand-picked collection of places, choose the trip that suits you and keep your booking details in one place. No real payment is taken.</p>
      </section>
      <section class="home-story" data-home-reveal>
        <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85" alt="Bali rice terraces and tropical greenery" loading="lazy">
        <div class="story-copy">
          <div class="eyebrow">A BETTER WAY TO GET AWAY</div>
          <h2>Good trips leave room for a little surprise.</h2>
          <p>We bring the stays, local highlights, and practical details together, so you can spend less time planning and more time looking forward to the journey.</p>
          <a href="packages.html" class="story-link">Find a trip that fits you <span>→</span></a>
        </div>
      </section>
    </section>
  </main>
  <SiteFooter />
</template>
