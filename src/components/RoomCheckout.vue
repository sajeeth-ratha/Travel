<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createAccount } from '../lib/account.js'
import { createBooking, getBookings, validatePromoCode } from '../lib/data.js'
import { currentUser, refreshUser } from '../lib/store.js'
import { getDiscountAmount, getLoyaltyPoints, localDate, money } from '../lib/ui.js'

const props = defineProps({
  room: { type: Object, required: true },
  requestedDates: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['booked', 'close'])

const paying = ref(false)
const error = ref('')
const promoMessage = ref('')
const promoMessageType = ref('')
const appliedPromo = ref(null)
const useRewards = ref(false)
const section = ref(null)

const user = computed(() => currentUser.value)
const availablePoints = computed(() => {
  if (!currentUser.value) return 0
  const bookings = getBookings().filter(booking =>
    booking.userId === currentUser.value.id || booking.customerEmail === currentUser.value.email)
  return getLoyaltyPoints(bookings)
})

const returnPath = `room.html${window.location.search}`
const today = new Date()
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
const defaultCheckIn = props.requestedDates.checkIn
  || (props.room.availableFrom && props.room.availableFrom > localDate(tomorrow) ? props.room.availableFrom : localDate(tomorrow))
const firstCheckout = new Date(`${defaultCheckIn}T12:00:00`)
firstCheckout.setDate(firstCheckout.getDate() + 1)

const checkInMin = computed(() => {
  const base = localDate(today)
  return props.room.availableFrom && props.room.availableFrom > base ? props.room.availableFrom : base
})
const checkOutMin = computed(() => {
  if (!form.checkIn) return localDate(tomorrow)
  const next = new Date(`${form.checkIn}T12:00:00`)
  next.setDate(next.getDate() + 1)
  return localDate(next)
})

const form = reactive({
  name: currentUser.value?.name || '',
  email: currentUser.value?.email || '',
  phone: currentUser.value?.phone || '',
  createAccount: true,
  password: '',
  checkIn: defaultCheckIn,
  checkOut: props.requestedDates.checkOut || localDate(firstCheckout),
  adults: String(
    props.requestedDates.guests && Number(props.requestedDates.guests) <= props.room.guests
      ? Number(props.requestedDates.guests)
      : 1
  ),
  paymentMethod: 'Card',
  cardholder: currentUser.value?.name || '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
  promoCode: ''
})

const showPassword = computed(() => form.createAccount)
const showCardFields = computed(() => form.paymentMethod === 'Card')

const nights = computed(() => {
  if (!form.checkIn || !form.checkOut) return 0
  return Math.round((new Date(`${form.checkOut}T12:00:00`) - new Date(`${form.checkIn}T12:00:00`)) / 86400000)
})

const totals = computed(() => {
  const stayNights = Math.max(0, nights.value)
  const subtotal = props.room.price * stayNights
  const promoDiscount = getDiscountAmount(appliedPromo.value, subtotal)
  const pointsUsed = useRewards.value
    ? Math.min(availablePoints.value, Math.floor((subtotal - promoDiscount) * 10))
    : 0
  const pointsDiscount = pointsUsed / 10
  return {
    nights: stayNights,
    subtotal,
    promoDiscount,
    pointsUsed,
    pointsDiscount,
    total: Math.max(0, subtotal - promoDiscount - pointsDiscount)
  }
})

watch(() => form.checkIn, value => {
  if (!value) return
  if (!form.checkOut || form.checkOut <= value) {
    const next = new Date(`${value}T12:00:00`)
    next.setDate(next.getDate() + 1)
    form.checkOut = localDate(next)
  }
})

onMounted(() => section.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

function autofillCard() {
  form.cardholder = form.name.trim() || currentUser.value?.name || 'Alex Morgan'
  form.cardNumber = '4242 4242 4242 4242'
  form.cardExpiry = '12/28'
  form.cardCvc = '123'
  form.paymentMethod = 'Card'
}

function formatCardNumber() {
  const digits = form.cardNumber.replace(/\D/g, '').slice(0, 19)
  form.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry() {
  const digits = form.cardExpiry.replace(/\D/g, '').slice(0, 4)
  form.cardExpiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function formatCvc() {
  form.cardCvc = form.cardCvc.replace(/\D/g, '').slice(0, 4)
}

function applyPromo() {
  appliedPromo.value = validatePromoCode(form.promoCode)
  promoMessage.value = appliedPromo.value
    ? `Applied: ${appliedPromo.value.description}`
    : 'That code is not valid. Try WELCOME10 or SUMMER2026.'
  promoMessageType.value = appliedPromo.value ? 'success' : 'error'
}

function validCard() {
  const digits = form.cardNumber.replace(/\D/g, '')
  const expiryMatch = form.cardExpiry.match(/^(\d{2})\/(\d{2})$/)
  const expiryMonth = expiryMatch ? Number(expiryMatch[1]) : 0
  const expiryYear = expiryMatch ? 2000 + Number(expiryMatch[2]) : 0
  const now = new Date()
  const expiryIsPast = expiryMatch && (expiryYear < now.getFullYear()
    || (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1))
  return Boolean(form.cardholder.trim())
    && digits.length >= 13 && digits.length <= 19
    && expiryMatch && expiryMonth >= 1 && expiryMonth <= 12 && !expiryIsPast
    && form.cardCvc.length >= 3
}

async function submit() {
  error.value = ''
  if (!totals.value.nights || totals.value.nights < 1) {
    error.value = 'Choose a check-out date after your check-in date.'
    return
  }

  let accountUser = currentUser.value
  let isNewAccount = false

  if (!accountUser) {
    if (form.createAccount) {
      if ((form.password || '').length < 6) {
        error.value = 'Please choose a password with at least 6 characters to create your account.'
        return
      }
      try {
        accountUser = createAccount(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.phone.trim())
        isNewAccount = true
        refreshUser()
      } catch (err) {
        error.value = err.message + ' You can uncheck "Create account" to continue as guest or log in.'
        return
      }
    } else {
      accountUser = {
        id: 'guest-' + Date.now(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: 'traveler'
      }
    }
  }

  if (form.paymentMethod === 'Card' && !validCard()) {
    error.value = 'Please check the cardholder name, card number, expiration date, and CVC (or click Autofill Demo Card).'
    return
  }

  paying.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  const cardDigits = form.cardNumber.replace(/\D/g, '')
  const booking = createBooking({
    bookingType: 'room',
    roomId: props.room.id,
    packageId: '',
    packageTitle: `${props.room.name} · ${props.room.property}`,
    roomName: props.room.name,
    customerName: form.name.trim(),
    customerEmail: form.email.trim().toLowerCase(),
    customerPhone: form.phone.trim(),
    userId: accountUser.id,
    travelDate: form.checkIn,
    checkOutDate: form.checkOut,
    nights: totals.value.nights,
    adults: Number(form.adults),
    children: 0,
    basePrice: props.room.price,
    totalPrice: totals.value.total,
    discountAmount: totals.value.promoDiscount + totals.value.pointsDiscount,
    promoDiscountAmount: totals.value.promoDiscount,
    pointsUsed: totals.value.pointsUsed,
    pointsEarned: Math.floor(totals.value.total / 10),
    pointsDiscountAmount: totals.value.pointsDiscount,
    promoCode: appliedPromo.value?.code || '',
    paymentMethod: form.paymentMethod === 'Card' ? `Demo Card ending in ${cardDigits.slice(-4)}` : form.paymentMethod,
    paymentStatus: form.paymentMethod === 'Card'
      ? 'Demo payment approved'
      : form.paymentMethod === 'Digital Wallet' ? 'Digital wallet authorized' : 'Pay at agency'
  })

  paying.value = false
  emit('booked', { booking, isNewAccount })
}
</script>

<template>
  <section ref="section" class="room-checkout-section" id="room-checkout-section">
    <div class="room-checkout-heading">
      <div>
        <div class="eyebrow">BOOK A ROOM ON ITS OWN</div>
        <h2>Complete your stay</h2>
        <p>{{ room.name }} · {{ room.property }} · {{ room.destination }}, {{ room.country }}</p>
      </div>
      <button type="button" class="room-checkout-close" aria-label="Close booking form" @click="$emit('close')">×</button>
    </div>

    <div class="room-checkout-layout">
      <form @submit.prevent="submit">
        <section class="checkout-form-group">
          <h3>Guest details</h3>
          <div v-if="user" class="checkout-user-banner signed-in" style="margin-bottom:12px;">
            <span class="badge-icon">✓</span>
            <div>
              <b>Signed in as {{ user.name }}</b>
              <small>{{ user.email }} · Wanderlust Member ({{ availablePoints.toLocaleString() }} reward points available)</small>
            </div>
          </div>
          <div v-else class="checkout-user-banner guest" style="margin-bottom:12px;">
            <div>
              <b>Traveler Information</b>
              <small>
                Already registered?
                <a :href="`login.html?next=${encodeURIComponent(returnPath)}`">Log in here</a>
              </small>
            </div>
          </div>
          <div class="room-form-grid">
            <label>Your full name<input v-model="form.name" required placeholder="First and last name"></label>
            <label>Email address<input v-model="form.email" type="email" required placeholder="you@example.com"></label>
            <label>Phone number<input v-model="form.phone" type="tel" placeholder="+1 (555) 0144"></label>
          </div>
          <div v-if="!user" class="checkout-account-box" style="margin-top:10px;">
            <label class="create-account-toggle">
              <input v-model="form.createAccount" type="checkbox">
              <span>
                <b>Create account with this stay</b>
                <small>Save reservation to My Bookings and earn reward points</small>
              </span>
            </label>
            <div v-if="showPassword">
              <label>Account password (at least 6 characters)
                <div class="password-input-wrap">
                  <input v-model="form.password" type="password" minlength="6" placeholder="Choose a password">
                </div>
              </label>
            </div>
          </div>
        </section>

        <section class="checkout-form-group">
          <h3>Dates and guests</h3>
          <div class="room-form-grid">
            <label>Check-in
              <input v-model="form.checkIn" type="date" :min="checkInMin" :max="room.availableTo || undefined" required>
            </label>
            <label>Check-out
              <input v-model="form.checkOut" type="date" :min="checkOutMin" required>
            </label>
            <label>Guests
              <select v-model="form.adults">
                <option v-for="count in room.guests" :key="count">{{ count }}</option>
              </select>
            </label>
            <label>Payment method
              <select v-model="form.paymentMethod">
                <option value="Card">Credit or debit card (Simulated)</option>
                <option value="Pay at agency">Pay at agency / On arrival</option>
                <option value="Digital Wallet">Digital Wallet / Mock 1-Click</option>
              </select>
            </label>
          </div>
        </section>

        <section class="checkout-form-group">
          <h3>Payment details</h3>
          <template v-if="showCardFields">
            <div class="demo-card-helper" style="margin-bottom:10px;">
              <button type="button" class="button outline small" @click="autofillCard">⚡ Autofill Demo Card</button>
              <span class="card-hint">4242 •••• •••• 4242 · 12/28 · 123</span>
            </div>
            <div class="room-form-grid">
              <label>Cardholder name<input v-model="form.cardholder" autocomplete="cc-name" placeholder="Name on card"></label>
              <label class="card-number-field">Card number
                <input v-model="form.cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="23" @input="formatCardNumber">
              </label>
              <label>Expiration date
                <input v-model="form.cardExpiry" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5" @input="formatExpiry">
              </label>
              <label>Security code
                <input v-model="form.cardCvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" @input="formatCvc">
              </label>
            </div>
          </template>
          <p class="payment-note">Class Project Simulation: No real payment or banking transaction is processed.</p>
        </section>

        <div class="promo-row">
          <label>Discount code<input v-model="form.promoCode" placeholder="Try WELCOME10 or SUMMER2026"></label>
          <button class="button outline" type="button" @click="applyPromo">Apply</button>
        </div>
        <p class="promo-message" :class="promoMessageType" aria-live="polite">{{ promoMessage }}</p>

        <label class="reward-choice">
          <input v-model="useRewards" type="checkbox" :disabled="!availablePoints">
          <span>
            <b>Use reward points</b>
            <small>{{ availablePoints.toLocaleString() }} points available · 1 point = $0.10</small>
          </span>
        </label>

        <p class="account-message" aria-live="polite">{{ error }}</p>
        <button class="button" type="submit" :disabled="paying">
          {{ paying ? 'Authorizing simulated payment…' : 'Confirm & Pay (Demo)' }}
        </button>
      </form>

      <aside class="room-checkout-summary">
        <img :src="room.coverImage" :alt="room.name">
        <span class="summary-kicker">YOUR STAY</span>
        <h3>{{ room.name }}</h3>
        <p>{{ room.property }} · {{ room.destination }}</p>
        <div class="summary-nightly">
          <strong>{{ money(room.price) }}</strong>
          <span>per night</span>
        </div>
        <div class="checkout-summary">
          <div><span>Stay subtotal</span><b>{{ money(totals.subtotal) }}</b></div>
          <div><span>Length of stay</span><b>{{ totals.nights }} {{ totals.nights === 1 ? 'night' : 'nights' }}</b></div>
          <div v-if="totals.promoDiscount"><span>Promo discount</span><b>−{{ money(totals.promoDiscount) }}</b></div>
          <div v-if="totals.pointsDiscount"><span>Rewards discount</span><b>−{{ money(totals.pointsDiscount) }}</b></div>
          <div class="checkout-total-row"><strong>Total</strong><b>{{ money(totals.total) }}</b></div>
        </div>
      </aside>
    </div>
  </section>
</template>
