<template>
  <!-- Hotels.com Style Travel Package Detailed View (Zero Emojis, No Gradients) -->
  <div v-if="pkg" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    
    <!-- Breadcrumb & Top Bar -->
    <div class="flex items-center justify-between text-xs pb-4 border-b border-slate-200">
      <div class="flex items-center gap-1.5 font-medium text-slate-500">
        <router-link to="/" class="hover:text-primary-600">Home</router-link>
        <span>/</span>
        <router-link to="/packages" class="hover:text-primary-600">Packages</router-link>
        <span>/</span>
        <span class="text-slate-900 font-semibold">{{ pkg.destination }}</span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Wishlist Toggle -->
        <button
          @click="handleWishlistToggle"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs"
        >
          <AppIcon
            :name="isSaved ? 'heart-fill' : 'heart'"
            :class="isSaved ? 'w-4 h-4 text-rose-500' : 'w-4 h-4 text-slate-500'"
          />
          <span>{{ isSaved ? 'Saved in Wishlist' : 'Save to Wishlist' }}</span>
        </button>
      </div>
    </div>

    <!-- Title & Location Header -->
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <span class="px-2.5 py-0.5 text-xs font-semibold rounded bg-sky-50 text-primary-800 border border-primary-200">
          {{ pkg.category }}
        </span>
        <span class="px-2.5 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700">
          {{ pkg.continent }}
        </span>
        <span v-if="pkg.deal" class="px-2.5 py-0.5 text-xs font-bold rounded bg-rose-600 text-white">
          Special Deal
        </span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900">
        {{ pkg.title }}
      </h1>

      <div class="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
        <span class="flex items-center gap-1 font-semibold text-primary-700">
          <AppIcon name="pin" class="w-3.5 h-3.5 text-primary-600" />
          <span>{{ pkg.destination }}, {{ pkg.country }}</span>
        </span>
        <span class="flex items-center gap-1">
          <AppIcon name="clock" class="w-3.5 h-3.5 text-slate-400" />
          <span>{{ pkg.duration }} Days / {{ pkg.duration - 1 }} Nights</span>
        </span>
        <span class="flex items-center gap-1">
          <AppIcon name="users" class="w-3.5 h-3.5 text-slate-400" />
          <span>{{ pkg.groupSize }}</span>
        </span>
        <!-- Hotels.com Rating Pill -->
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded bg-primary-700 text-white font-bold text-xs">
            {{ pkg.rating }}
          </span>
          <span class="font-bold text-slate-800">
            {{ pkg.rating >= 4.9 ? 'Exceptional' : 'Wonderful' }}
          </span>
          <span class="text-slate-400">({{ pkg.reviewCount }} verified reviews)</span>
        </div>
      </div>
    </div>

    <!-- PHOTO GALLERY SECTION -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <!-- Main Large Photo -->
      <div class="md:col-span-2 h-[380px] sm:h-[440px] rounded-2xl overflow-hidden shadow-xs bg-slate-100">
        <img
          :src="activeGalleryImage || pkg.coverImage"
          :alt="pkg.title"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Secondary Photo Thumbnails -->
      <div class="grid grid-cols-2 md:grid-cols-1 gap-3 h-[380px] sm:h-[440px]">
        <div
          v-for="(img, idx) in pkg.gallery || [pkg.coverImage]"
          :key="idx"
          @click="activeGalleryImage = img"
          :class="[
            'h-[120px] md:h-[138px] rounded-xl overflow-hidden cursor-pointer border-2 transition-all',
            activeGalleryImage === img ? 'border-primary-600 ring-2 ring-primary-500/20' : 'border-transparent hover:opacity-90'
          ]"
        >
          <img :src="img" :alt="pkg.title" class="w-full h-full object-cover" />
        </div>
      </div>
    </section>

    <!-- MAIN TWO-COLUMN CONTENT: Details (Left) + Sticky Booking Calculator (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      <!-- LEFT 2 COLS: Itinerary, Inclusions, Reviews -->
      <div class="lg:col-span-2 space-y-10">
        
        <!-- 1. Overview & Highlights -->
        <section class="space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900">Trip Overview</h2>
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ pkg.fullDescription }}
          </p>
        </section>

        <!-- 2. Expandable Day-by-Day Itinerary -->
        <section class="space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Day-by-Day Itinerary</h2>
              <p class="text-xs text-slate-500 mt-0.5">Explore scheduled excursions and activities</p>
            </div>
            <button
              @click="toggleAllDays"
              class="text-xs font-semibold text-primary-600 hover:underline"
            >
              {{ areAllDaysOpen ? 'Collapse All' : 'Expand All Days' }}
            </button>
          </div>

          <div class="space-y-2.5 pt-2">
            <div
              v-for="item in pkg.itinerary"
              :key="item.day"
              class="border border-slate-200 rounded-xl overflow-hidden bg-white"
            >
              <!-- Accordion Header -->
              <button
                @click="toggleDay(item.day)"
                class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-md bg-sky-50 text-primary-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-primary-200">
                    {{ item.day }}
                  </span>
                  <div>
                    <h4 class="text-xs sm:text-sm font-bold text-slate-900">{{ item.title }}</h4>
                    <span class="text-[11px] text-slate-400">Day {{ item.day }} of {{ pkg.duration }}</span>
                  </div>
                </div>
                <AppIcon
                  :name="openDays.includes(item.day) ? 'chevron-down' : 'chevron-right'"
                  class="w-4 h-4 text-slate-400"
                />
              </button>

              <!-- Accordion Content -->
              <div
                v-if="openDays.includes(item.day)"
                class="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50"
              >
                {{ item.description }}
              </div>
            </div>
          </div>
        </section>

        <!-- 3. What's Included / Not Included -->
        <section class="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900">Package Inclusions</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Included -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <AppIcon name="check-circle" class="w-4 h-4 text-emerald-600" />
                <span>What's Included</span>
              </h4>
              <ul class="space-y-1.5 text-xs text-slate-700">
                <li v-for="(inc, i) in pkg.included" :key="i" class="flex items-start gap-2">
                  <span class="text-emerald-600 font-bold">•</span>
                  <span>{{ inc }}</span>
                </li>
              </ul>
            </div>

            <!-- Not Included -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <AppIcon name="x" class="w-4 h-4 text-slate-500" />
                <span>Not Included</span>
              </h4>
              <ul class="space-y-1.5 text-xs text-slate-700">
                <li v-for="(notInc, i) in pkg.notIncluded" :key="i" class="flex items-start gap-2">
                  <span class="text-slate-400 font-bold">•</span>
                  <span>{{ notInc }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 4. Customer Reviews & Write a Review -->
        <section class="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Verified Guest Reviews</h2>
              <p class="text-xs text-slate-500">Real feedback from travelers who completed this package</p>
            </div>
            <button
              @click="showReviewForm = !showReviewForm"
              class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              {{ showReviewForm ? 'Cancel' : 'Write a Review' }}
            </button>
          </div>

          <!-- Review Form -->
          <div v-if="showReviewForm" class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 class="text-xs font-bold text-slate-800">Submit Your Guest Feedback</h4>
            
            <form @submit.prevent="submitReview" class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    v-model="reviewForm.author"
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Rating</label>
                  <select
                    v-model.number="reviewForm.rating"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option :value="5">5.0 / 5.0 - Exceptional</option>
                    <option :value="4">4.0 / 5.0 - Very Good</option>
                    <option :value="3">3.0 / 5.0 - Average</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Feedback Comments</label>
                <textarea
                  v-model="reviewForm.comment"
                  required
                  rows="3"
                  placeholder="Share details about your accommodations, local guides, and excursions..."
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                ></textarea>
              </div>

              <button
                type="submit"
                class="px-4 py-2 font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-xs"
              >
                Post Review
              </button>
            </form>
          </div>

          <!-- Reviews List -->
          <div class="space-y-3">
            <div
              v-for="(rev, idx) in sampleReviews"
              :key="idx"
              class="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-primary-100 text-primary-800 font-bold text-xs flex items-center justify-center">
                    {{ rev.author.charAt(0) }}
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-slate-900">{{ rev.author }}</h5>
                    <span class="text-[10px] text-slate-400">{{ rev.date }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <span class="px-1.5 py-0.5 rounded bg-primary-700 text-white font-bold text-[10px]">
                    {{ rev.rating }}.0
                  </span>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">{{ rev.comment }}</p>
            </div>
          </div>
        </section>

      </div>

      <!-- RIGHT 1 COL: STICKY BOOKING CALCULATOR WIDGET (HOTELS.COM STYLE) -->
      <div class="lg:col-span-1 lg:sticky lg:top-24 space-y-5">
        
        <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-5">
          
          <!-- Pricing Header -->
          <div class="border-b border-slate-100 pb-4">
            <span class="text-[11px] text-slate-500 font-medium">Starting from</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-3xl font-extrabold text-slate-900">
                {{ formatCurrency(calculatedWidgetTotal) }}
              </span>
              <span v-if="pkg.originalPrice" class="text-xs text-slate-400 line-through">
                {{ formatCurrency(pkg.originalPrice) }}
              </span>
            </div>
            <span class="text-[11px] text-slate-500 block mt-1">
              Includes all taxes, fees, and included excursions
            </span>
          </div>

          <!-- Traveler Controls -->
          <div class="space-y-4 text-xs">
            
            <!-- Dates Selection -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Departure Date</label>
              <select
                v-model="widgetForm.date"
                class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 cursor-pointer focus:ring-1 focus:ring-primary-500 focus:outline-none"
              >
                <option v-for="d in pkg.departureDates || ['2026-06-15', '2026-07-20']" :key="d" :value="d">
                  {{ d }}
                </option>
              </select>
            </div>

            <!-- Adult & Children Counts -->
            <div class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span class="font-bold text-slate-700 block">Adults</span>
                <span class="text-[10px] text-slate-400">Age 18+</span>
                <div class="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    @click="widgetForm.adults > 1 ? widgetForm.adults-- : null"
                    class="w-6 h-6 rounded bg-white border border-slate-200 font-bold hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span class="font-extrabold">{{ widgetForm.adults }}</span>
                  <button
                    type="button"
                    @click="widgetForm.adults++"
                    class="w-6 h-6 rounded bg-white border border-slate-200 font-bold hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <span class="font-bold text-slate-700 block">Children</span>
                <span class="text-[10px] text-slate-400">50% off</span>
                <div class="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    @click="widgetForm.children > 0 ? widgetForm.children-- : null"
                    class="w-6 h-6 rounded bg-white border border-slate-200 font-bold hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span class="font-extrabold">{{ widgetForm.children }}</span>
                  <button
                    type="button"
                    @click="widgetForm.children++"
                    class="w-6 h-6 rounded bg-white border border-slate-200 font-bold hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Room Tier -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Room Upgrade</label>
              <select
                v-model="widgetForm.roomTier"
                class="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 cursor-pointer focus:ring-1 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Standard Room">Standard Room (Included)</option>
                <option value="Deluxe Suite">Deluxe Suite (+ $300)</option>
                <option value="Presidential Villa">Presidential Villa (+ $650)</option>
              </select>
            </div>

          </div>

          <!-- CTA Book Button -->
          <button
            @click="openBookingModal"
            class="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Reserve Now</span>
          </button>

          <!-- Safe Booking Guarantee Notes -->
          <div class="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div class="flex items-center gap-2">
              <AppIcon name="check" class="w-3.5 h-3.5 text-primary-600" />
              <span>Free cancellation up to 30 days prior</span>
            </div>
            <div class="flex items-center gap-2">
              <AppIcon name="shield" class="w-3.5 h-3.5 text-primary-600" />
              <span>Simulated payment — zero charge</span>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isBookingModalOpen"
      :pkg="pkg"
      @close="isBookingModalOpen = false"
      @view-voucher="onViewVoucher"
    />

    <!-- Voucher Modal -->
    <VoucherModal
      :is-open="isVoucherModalOpen"
      :booking="selectedVoucherBooking"
      @close="isVoucherModalOpen = false"
    />

  </div>

  <!-- Loading / Fallback when package not found -->
  <div v-else class="max-w-2xl mx-auto py-24 text-center space-y-3">
    <h2 class="text-xl font-bold text-slate-900">Package Not Found</h2>
    <p class="text-xs text-slate-500">The destination you requested may have been relocated or updated.</p>
    <router-link
      to="/packages"
      class="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white"
    >
      Browse All Packages
    </router-link>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPackageById, isWishlisted, toggleWishlist, addReview } from '../services/storageService.js'
import { formatCurrency } from '../services/currencyService.js'
import { showToast } from '../services/toastService.js'
import BookingModal from '../components/booking/BookingModal.vue'
import VoucherModal from '../components/booking/VoucherModal.vue'
import AppIcon from '../components/common/AppIcon.vue'

const route = useRoute()
const pkg = ref(null)
const activeGalleryImage = ref('')

const openDays = ref([1])

const isBookingModalOpen = ref(false)
const isVoucherModalOpen = ref(false)
const selectedVoucherBooking = ref(null)

const showReviewForm = ref(false)
const reviewForm = reactive({
  author: '',
  rating: 5,
  comment: ''
})

const sampleReviews = ref([
  {
    author: 'Emily & Jack Thornton',
    date: 'March 2026',
    rating: 5,
    comment: 'An absolute masterpiece of a journey! The private boat charter and boutique accommodations exceeded every expectation. Seamless organization.'
  },
  {
    author: 'Carlos Santana',
    date: 'February 2026',
    rating: 5,
    comment: 'The cultural immersion and our guide’s deep knowledge made this trip unforgettable. Highly recommend adding the private guided excursions!'
  }
])

const widgetForm = reactive({
  date: '',
  adults: 2,
  children: 0,
  roomTier: 'Standard Room'
})

onMounted(() => {
  const packageId = route.params.id
  pkg.value = getPackageById(packageId)
  if (pkg.value) {
    activeGalleryImage.value = pkg.value.coverImage
    if (pkg.value.departureDates && pkg.value.departureDates.length) {
      widgetForm.date = pkg.value.departureDates[0]
    }
  }
})

const isSaved = computed(() => {
  return pkg.value ? isWishlisted(pkg.value.id) : false
})

function handleWishlistToggle() {
  if (!pkg.value) return
  toggleWishlist(pkg.value.id)
  if (isWishlisted(pkg.value.id)) {
    showToast(`Saved "${pkg.value.title}" to your wishlist.`, 'success')
  } else {
    showToast(`Removed from your wishlist.`, 'info')
  }
}

function toggleDay(dayNum) {
  if (openDays.value.includes(dayNum)) {
    openDays.value = openDays.value.filter(d => d !== dayNum)
  } else {
    openDays.value.push(dayNum)
  }
}

const areAllDaysOpen = computed(() => {
  if (!pkg.value || !pkg.value.itinerary) return false
  return openDays.value.length === pkg.value.itinerary.length
})

function toggleAllDays() {
  if (areAllDaysOpen.value) {
    openDays.value = []
  } else {
    openDays.value = pkg.value.itinerary.map(i => i.day)
  }
}

const calculatedWidgetTotal = computed(() => {
  if (!pkg.value) return 0
  const adultFare = pkg.value.price * widgetForm.adults
  const childFare = Math.round(pkg.value.price * 0.5 * widgetForm.children)
  const roomSurcharge = widgetForm.roomTier === 'Deluxe Suite' ? 300 : widgetForm.roomTier === 'Presidential Villa' ? 650 : 0
  return adultFare + childFare + roomSurcharge
})

function submitReview() {
  if (!reviewForm.author || !reviewForm.comment) return
  
  addReview(pkg.value.id, {
    author: reviewForm.author,
    rating: reviewForm.rating,
    comment: reviewForm.comment
  })

  sampleReviews.value.unshift({
    author: reviewForm.author,
    date: 'Just now',
    rating: reviewForm.rating,
    comment: reviewForm.comment
  })

  pkg.value = getPackageById(pkg.value.id)

  showToast('Thank you for posting your review! Rating updated.', 'success')
  reviewForm.author = ''
  reviewForm.comment = ''
  showReviewForm.value = false
}

function openBookingModal() {
  isBookingModalOpen.value = true
}

function onViewVoucher(booking) {
  selectedVoucherBooking.value = booking
  isVoucherModalOpen.value = true
}
</script>
