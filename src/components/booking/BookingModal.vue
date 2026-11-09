<template>
  <!-- Hotels.com / Stripe Style Multi-Step Booking & Simulated Payment Modal (Zero Emojis, No Gradients) -->
  <div v-if="isOpen && pkg" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
    <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-primary-700">
            Step {{ currentStep }} of 4: {{ stepTitles[currentStep - 1] }}
          </span>
          <h3 class="text-base font-bold text-slate-900 truncate max-w-md">
            {{ pkg.title }}
          </h3>
        </div>
        <button
          @click="closeModal"
          class="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          aria-label="Close booking modal"
        >
          <AppIcon name="x" class="w-4 h-4" />
        </button>
      </div>

      <!-- Step Indicator Bar -->
      <div class="grid grid-cols-4 border-b border-slate-200 bg-white">
        <div
          v-for="s in 4"
          :key="s"
          :class="[
            'py-2.5 text-center text-xs font-semibold border-b-2 transition-all',
            currentStep === s
              ? 'border-primary-600 text-primary-700 bg-sky-50/50'
              : currentStep > s
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400'
          ]"
        >
          {{ s === 1 ? '1. Traveler' : s === 2 ? '2. Extras' : s === 3 ? '3. Payment' : '4. Confirm' }}
        </div>
      </div>

      <!-- Modal Body (Dynamic Steps) -->
      <div class="flex-1 p-6 overflow-y-auto space-y-5">
        
        <!-- STEP 1: Traveler Information -->
        <div v-if="currentStep === 1" class="space-y-4">
          <h4 class="text-sm font-bold text-slate-900">Lead Passenger Details</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                v-model="bookingForm.customerName"
                placeholder="e.g. Sarah Jenkins"
                required
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                v-model="bookingForm.customerEmail"
                placeholder="e.g. sarah.j@example.com"
                required
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                v-model="bookingForm.customerPhone"
                placeholder="e.g. +1 (555) 382-9102"
                required
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Travel Departure Date *</label>
              <select
                v-model="bookingForm.travelDate"
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white cursor-pointer"
              >
                <option v-for="d in pkg.departureDates || ['2026-06-15', '2026-07-20']" :key="d" :value="d">
                  {{ formatDate(d) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Guests Counter -->
          <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label class="block text-xs font-bold text-slate-700">Adults (18+)</label>
              <span class="text-[11px] text-slate-500">Full package fare</span>
              <div class="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  @click="bookingForm.adults > 1 ? bookingForm.adults-- : null"
                  class="w-7 h-7 rounded-md bg-white border border-slate-200 font-bold text-sm hover:bg-slate-100"
                >
                  -
                </button>
                <span class="font-extrabold text-sm">{{ bookingForm.adults }}</span>
                <button
                  type="button"
                  @click="bookingForm.adults++"
                  class="w-7 h-7 rounded-md bg-white border border-slate-200 font-bold text-sm hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700">Children (0-17)</label>
              <span class="text-[11px] text-slate-500">50% discount</span>
              <div class="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  @click="bookingForm.children > 0 ? bookingForm.children-- : null"
                  class="w-7 h-7 rounded-md bg-white border border-slate-200 font-bold text-sm hover:bg-slate-100"
                >
                  -
                </button>
                <span class="font-extrabold text-sm">{{ bookingForm.children }}</span>
                <button
                  type="button"
                  @click="bookingForm.children++"
                  class="w-7 h-7 rounded-md bg-white border border-slate-200 font-bold text-sm hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <!-- Special Requests -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Special Requests / Dietary Needs (Optional)
            </label>
            <textarea
              v-model="bookingForm.specialRequests"
              rows="2"
              placeholder="e.g. Vegetarian diet, quiet room on upper floor..."
              class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <!-- STEP 2: Customization & Promo Code -->
        <div v-if="currentStep === 2" class="space-y-4">
          <h4 class="text-sm font-bold text-slate-900">Room Upgrade & Optional Add-ons</h4>
          
          <!-- Room Tier Selection -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-700">Select Room Standard</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                v-for="room in roomTiers"
                :key="room.name"
                :class="[
                  'p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between',
                  bookingForm.roomTier === room.name
                    ? 'border-primary-600 bg-sky-50/50 ring-1 ring-primary-500'
                    : 'border-slate-200 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800">{{ room.name }}</span>
                  <input
                    type="radio"
                    v-model="bookingForm.roomTier"
                    :value="room.name"
                    class="accent-primary-600"
                  />
                </div>
                <span class="text-[11px] text-primary-700 font-bold mt-2">
                  {{ room.price === 0 ? 'Included' : '+ $' + room.price }}
                </span>
              </label>
            </div>
          </div>

          <!-- Optional Add-ons -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-700">Recommended Travel Add-ons</label>
            <div class="space-y-2">
              <label
                v-for="addon in availableAddons"
                :key="addon.name"
                class="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    v-model="bookingForm.addOns"
                    :value="addon.name"
                    class="rounded text-primary-600 accent-primary-600"
                  />
                  <div>
                    <span class="text-xs font-bold text-slate-800">{{ addon.name }}</span>
                    <p class="text-[11px] text-slate-500">{{ addon.desc }}</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-primary-700">+ ${{ addon.price }}</span>
              </label>
            </div>
          </div>

          <!-- Promo Code Box -->
          <div class="pt-3 border-t border-slate-100">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Promotional Voucher Code</label>
            <div class="flex gap-2">
              <input
                type="text"
                v-model="promoInput"
                placeholder="Try 'SUMMER2026' or 'WELCOME10'"
                class="flex-1 px-3 py-2 text-xs uppercase rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <button
                type="button"
                @click="applyPromo"
                class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Apply
              </button>
            </div>
            <p v-if="appliedPromo" class="text-xs text-emerald-700 font-semibold mt-1">
              ✓ Promo code "{{ appliedPromo.code }}" applied: {{ appliedPromo.description }}
            </p>
            <p v-if="promoError" class="text-xs text-rose-600 font-semibold mt-1">
              {{ promoError }}
            </p>
          </div>
        </div>

        <!-- STEP 3: Simulated Payment Gateway -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-slate-900">Simulated Payment Gateway</h4>
            <span class="px-2.5 py-0.5 text-[11px] font-semibold rounded bg-sky-50 text-primary-800 border border-primary-200 flex items-center gap-1">
              <AppIcon name="shield" class="w-3.5 h-3.5 text-primary-600" />
              <span>256-Bit SSL Sandbox</span>
            </span>
          </div>

          <!-- Payment Tabs (Credit Card, PayPal, Apple Pay) -->
          <div class="flex gap-2 border-b border-slate-200 pb-2">
            <button
              v-for="tab in ['Credit Card', 'PayPal', 'Apple Pay']"
              :key="tab"
              type="button"
              @click="paymentMethodTab = tab"
              :class="[
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                paymentMethodTab === tab ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Credit Card Input Form -->
          <div v-if="paymentMethodTab === 'Credit Card'" class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500 font-medium">Enter mock card credentials:</span>
              <button
                type="button"
                @click="autofillTestCard"
                class="text-[11px] font-semibold text-primary-700 hover:underline bg-sky-50 px-2 py-1 rounded border border-primary-200"
              >
                Autofill Demo Card
              </button>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                v-model="cardForm.name"
                placeholder="Name on card"
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
              <input
                type="text"
                v-model="cardForm.number"
                placeholder="4242 4242 4242 4242"
                maxlength="19"
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  v-model="cardForm.expiry"
                  placeholder="MM/YY"
                  maxlength="5"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Security CVV</label>
                <input
                  type="text"
                  v-model="cardForm.cvv"
                  placeholder="123"
                  maxlength="4"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Alternative Mock Methods -->
          <div v-else class="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <AppIcon name="credit-card" class="w-8 h-8 text-slate-600 mx-auto" />
            <p class="text-xs font-bold text-slate-800">Simulate {{ paymentMethodTab }} Authorization</p>
            <p class="text-[11px] text-slate-500">
              Clicking below will process this reservation using your simulated {{ paymentMethodTab }} account.
            </p>
          </div>

        </div>

        <!-- STEP 4: Booking Confirmation & Voucher View -->
        <div v-if="currentStep === 4" class="text-center space-y-4 py-4">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <AppIcon name="check" class="w-6 h-6 text-emerald-600" />
          </div>
          <div class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-primary-700">Booking Confirmed</span>
            <h3 class="text-lg font-bold text-slate-900">Your Journey to {{ pkg.destination }} is Booked</h3>
            <p class="text-xs text-slate-500">
              A confirmation email has been dispatched to <strong class="text-slate-800">{{ bookingForm.customerEmail }}</strong>.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
            <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span class="text-slate-500">Booking Reference:</span>
              <strong class="font-mono text-primary-700">{{ confirmedBooking?.bookingRef }}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span class="text-slate-500">Package:</span>
              <span class="font-medium text-slate-800">{{ pkg.title }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span class="text-slate-500">Departure:</span>
              <span class="font-medium text-slate-800">{{ formatDate(bookingForm.travelDate) }}</span>
            </div>
            <div class="flex justify-between pt-1">
              <span class="text-slate-500">Total Paid:</span>
              <strong class="font-bold text-slate-900">${{ calculatedTotal }}</strong>
            </div>
          </div>
        </div>

        <!-- LIVE PRICE SUMMARY FOOTER IN MODAL -->
        <div v-if="currentStep < 4" class="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-600 block text-[11px]">Total Estimated Price:</span>
            <div class="flex items-baseline gap-2">
              <span class="text-xl font-extrabold text-slate-900">${{ calculatedTotal }}</span>
              <span v-if="discountAmount > 0" class="text-xs font-semibold text-emerald-700">
                (Saved ${{ discountAmount }})
              </span>
            </div>
          </div>
          <div class="text-right text-[11px] text-slate-500">
            <span>{{ bookingForm.adults }} Adult(s)</span>
            <span v-if="bookingForm.children > 0">, {{ bookingForm.children }} Child(ren)</span>
          </div>
        </div>

      </div>

      <!-- Modal Footer (Action Buttons) -->
      <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
        <button
          v-if="currentStep > 1 && currentStep < 4"
          type="button"
          @click="currentStep--"
          class="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Back
        </button>
        <div v-else></div>

        <!-- Next / Pay / Done Buttons -->
        <button
          v-if="currentStep === 1"
          type="button"
          @click="validateStep1"
          class="px-5 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          Continue to Extras
        </button>

        <button
          v-else-if="currentStep === 2"
          type="button"
          @click="currentStep = 3"
          class="px-5 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          Proceed to Payment
        </button>

        <button
          v-else-if="currentStep === 3"
          type="button"
          @click="processSimulatedPayment"
          :disabled="isProcessing"
          class="px-6 py-2.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Confirm & Pay ${{ calculatedTotal }}</span>
        </button>

        <div v-else-if="currentStep === 4" class="flex items-center gap-2">
          <button
            type="button"
            @click="openVoucher"
            class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <AppIcon name="printer" class="w-3.5 h-3.5" />
            <span>View & Print Voucher</span>
          </button>
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { createBooking, validatePromoCode } from '../../services/storageService.js'
import { showToast } from '../../services/toastService.js'
import AppIcon from '../common/AppIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  pkg: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'booking-created', 'view-voucher'])

const currentStep = ref(1)
const isProcessing = ref(false)
const paymentMethodTab = ref('Credit Card')
const confirmedBooking = ref(null)

const stepTitles = [
  'Traveler Information',
  'Options & Promo Code',
  'Payment Details',
  'Confirmation'
]

const roomTiers = [
  { name: 'Standard Room', price: 0 },
  { name: 'Deluxe Suite', price: 300 },
  { name: 'Presidential Villa', price: 650 }
]

const availableAddons = [
  { name: 'Airport Chauffeur', price: 50, desc: 'Private arrival and departure transport' },
  { name: 'Travel Insurance', price: 120, desc: '100% trip cancellation and medical coverage' },
  { name: 'Private Tour Guide', price: 250, desc: 'Dedicated personal local guide for all days' }
]

const bookingForm = reactive({
  customerName: 'Sarah Jenkins',
  customerEmail: 'sarah.j@example.com',
  customerPhone: '+1 (555) 382-9102',
  travelDate: '',
  adults: 2,
  children: 0,
  roomTier: 'Standard Room',
  addOns: ['Airport Chauffeur'],
  specialRequests: ''
})

const cardForm = reactive({
  name: 'Sarah Jenkins',
  number: '4242 4242 4242 4242',
  expiry: '12/28',
  cvv: '888'
})

const promoInput = ref('')
const appliedPromo = ref(null)
const promoError = ref('')

watch(() => props.pkg, (newPkg) => {
  if (newPkg && newPkg.departureDates && newPkg.departureDates.length > 0) {
    bookingForm.travelDate = newPkg.departureDates[0]
  }
}, { immediate: true })

const calculatedTotal = computed(() => {
  if (!props.pkg) return 0
  const base = props.pkg.price || 0
  const adultTotal = base * bookingForm.adults
  const childTotal = Math.round(base * 0.5 * bookingForm.children)

  const selectedTier = roomTiers.find(r => r.name === bookingForm.roomTier)
  const roomPrice = selectedTier ? selectedTier.price : 0

  const addonsTotal = bookingForm.addOns.reduce((sum, name) => {
    const item = availableAddons.find(a => a.name === name)
    return sum + (item ? item.price : 0)
  }, 0)

  let gross = adultTotal + childTotal + roomPrice + addonsTotal

  if (appliedPromo.value) {
    if (appliedPromo.value.type === 'percent') {
      gross = Math.round(gross * (1 - appliedPromo.value.value / 100))
    } else if (appliedPromo.value.type === 'fixed') {
      gross = Math.max(0, gross - appliedPromo.value.value)
    }
  }

  return gross
})

const discountAmount = computed(() => {
  if (!appliedPromo.value || !props.pkg) return 0
  const base = props.pkg.price || 0
  const adultTotal = base * bookingForm.adults
  const childTotal = Math.round(base * 0.5 * bookingForm.children)
  const selectedTier = roomTiers.find(r => r.name === bookingForm.roomTier)
  const roomPrice = selectedTier ? selectedTier.price : 0
  const addonsTotal = bookingForm.addOns.reduce((sum, name) => {
    const item = availableAddons.find(a => a.name === name)
    return sum + (item ? item.price : 0)
  }, 0)
  const gross = adultTotal + childTotal + roomPrice + addonsTotal
  return gross - calculatedTotal.value
})

function formatDate(dateStr) {
  if (!dateStr) return 'Flexible'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function applyPromo() {
  promoError.value = ''
  const promo = validatePromoCode(promoInput.value)
  if (promo) {
    appliedPromo.value = promo
    showToast(`Promo "${promo.code}" applied!`, 'success')
  } else {
    promoError.value = 'Invalid code. Try "SUMMER2026" or "WELCOME10".'
  }
}

function autofillTestCard() {
  cardForm.name = bookingForm.customerName || 'Test Traveler'
  cardForm.number = '4242 4242 4242 4242'
  cardForm.expiry = '12/28'
  cardForm.cvv = '999'
  showToast('Test credit card credentials populated.', 'info')
}

function validateStep1() {
  if (!bookingForm.customerName || !bookingForm.customerEmail || !bookingForm.customerPhone) {
    showToast('Please fill out all passenger contact fields.', 'warning')
    return
  }
  currentStep.value = 2
}

function processSimulatedPayment() {
  isProcessing.value = true
  
  setTimeout(() => {
    isProcessing.value = false
    const newBooking = createBooking({
      packageId: props.pkg.id,
      packageTitle: props.pkg.title,
      customerName: bookingForm.customerName,
      customerEmail: bookingForm.customerEmail,
      customerPhone: bookingForm.customerPhone,
      travelDate: bookingForm.travelDate,
      adults: bookingForm.adults,
      children: bookingForm.children,
      roomTier: bookingForm.roomTier,
      addOns: [...bookingForm.addOns],
      basePrice: props.pkg.price,
      totalPrice: calculatedTotal.value,
      discountAmount: discountAmount.value,
      paymentMethod: `${paymentMethodTab.value} (Simulated)`,
      specialRequests: bookingForm.specialRequests
    })

    confirmedBooking.value = newBooking
    currentStep.value = 4
    showToast(`Booking ${newBooking.bookingRef} confirmed successfully.`, 'success')
    emit('booking-created', newBooking)
  }, 650)
}

function openVoucher() {
  if (confirmedBooking.value) {
    emit('view-voucher', confirmedBooking.value)
    closeModal()
  }
}

function closeModal() {
  currentStep.value = 1
  emit('close')
}
</script>
