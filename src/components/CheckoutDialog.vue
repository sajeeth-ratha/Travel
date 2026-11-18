<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { createAccount } from '../lib/account.js'
import { createBooking, getBookings, validatePromoCode } from '../lib/data.js'
import { currentUser, refreshUser } from '../lib/store.js'
import { getDiscountAmount, getLoyaltyPoints, money } from '../lib/ui.js'

const props = defineProps({
  trip: { type: Object, required: true }
})

const emit = defineEmits(['booked', 'close'])

const dialog = ref(null)
const paying = ref(false)
const error = ref('')
const promoMessage = ref('')
const promoMessageType = ref('')
const appliedPromo = ref(null)
const useRewards = ref(false)

const user = computed(() => currentUser.value)
const availablePoints = computed(() => {
  if (!currentUser.value) return 0
  const bookings = getBookings().filter(booking =>
    booking.userId === currentUser.value.id || booking.customerEmail === currentUser.value.email)
  return getLoyaltyPoints(bookings)
})

const defaultDate = (props.trip.departureDates && props.trip.departureDates[0]) || new Date().toISOString().slice(0, 10)

const form = reactive({
  name: currentUser.value?.name || '',
  email: currentUser.value?.email || '',
  phone: currentUser.value?.phone || '',
  date: defaultDate,
  adults: '2',
  paymentMethod: 'Card',
  cardholder: currentUser.value?.name || '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
  promoCode: '',
  createAccount: true,
  password: ''
})

const showCardFields = computed(() => form.paymentMethod === 'Card')
const showPassword = computed(() => form.createAccount)

const totals = computed(() => {
  const subtotal = props.trip.price * Number(form.adults)
  const promoDiscount = getDiscountAmount(appliedPromo.value, subtotal)
  const pointsUsed = useRewards.value
    ? Math.min(availablePoints.value, Math.floor((subtotal - promoDiscount) * 10))
    : 0
  const pointsDiscount = pointsUsed / 10
  return {
    subtotal,
    promoDiscount,
    pointsUsed,
    pointsDiscount,
    total: Math.max(0, subtotal - promoDiscount - pointsDiscount)
  }
})

onMounted(() => dialog.value?.showModal())

function close() {
  dialog.value?.close()
}

function onDialogClose() {
  emit('close')
}

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
  if (!appliedPromo.value) {
    promoMessage.value = 'That code is not valid. Try WELCOME10 or SUMMER2026.'
    promoMessageType.value = 'error'
  } else {
    promoMessage.value = `Applied: ${appliedPromo.value.description}`
    promoMessageType.value = 'success'
  }
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
    packageId: props.trip.id,
    packageTitle: props.trip.title,
    customerName: form.name.trim(),
    customerEmail: form.email.trim().toLowerCase(),
    customerPhone: form.phone.trim(),
    travelDate: form.date,
    userId: accountUser.id,
    adults: Number(form.adults),
    children: 0,
    basePrice: props.trip.price,
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
  dialog.value?.close()
  emit('booked', { booking, isNewAccount })
}
</script>

<template>
  <dialog ref="dialog" @close="onDialogClose">
    <form id="checkout-form" @submit.prevent="submit">
      <button class="close" type="button" aria-label="Close checkout" @click="close">×</button>
      <div class="eyebrow">RESERVE YOUR PLACE</div>
      <h2>{{ trip.title }}</h2>

      <div v-if="user" class="checkout-user-banner signed-in">
        <span class="badge-icon">✓</span>
        <div>
          <b>Signed in as {{ user.name }}</b>
          <small>{{ user.email }} · Wanderlust Member ({{ availablePoints.toLocaleString() }} reward points available)</small>
        </div>
      </div>
      <div v-else class="checkout-user-banner guest">
        <div>
          <b>Traveler Details &amp; Quick Account</b>
          <small>
            Already registered?
            <a :href="`login.html?next=${encodeURIComponent(`package.html?id=${trip.id}`)}`">Log in here</a>
            or enter traveler details below.
          </small>
        </div>
      </div>

      <label>Your name<input v-model="form.name" required placeholder="First and last name"></label>
      <label>Email address<input v-model="form.email" type="email" required placeholder="you@example.com"></label>
      <label>Phone number<input v-model="form.phone" type="tel" placeholder="+1 (555) 0144"></label>
      <label>Travel departure date<input v-model="form.date" type="date" required></label>
      <label>Adults
        <select v-model="form.adults">
          <option>1</option><option>2</option><option>3</option><option>4</option>
        </select>
      </label>

      <div v-if="!user" class="checkout-account-box">
        <label class="create-account-toggle">
          <input v-model="form.createAccount" type="checkbox">
          <span>
            <b>Create account with this booking</b>
            <small>Earn {{ Math.floor((trip.price * 2) / 10) }} reward points and manage bookings in your account</small>
          </span>
        </label>
        <div v-if="showPassword">
          <label>Account password (at least 6 characters)
            <div class="password-input-wrap">
              <input
                v-model="form.password"
                type="password"
                minlength="6"
                placeholder="Choose a password"
              >
            </div>
          </label>
        </div>
      </div>

      <label>Payment method
        <select v-model="form.paymentMethod">
          <option value="Card">Credit or debit card (Simulated)</option>
          <option value="Pay at agency">Pay at agency / On arrival</option>
          <option value="Digital Wallet">Digital Wallet / Mock 1-Click</option>
        </select>
      </label>

      <template v-if="showCardFields">
        <div class="demo-card-helper">
          <button type="button" class="button outline small" @click="autofillCard">⚡ Autofill Demo Card</button>
          <span class="card-hint">4242 •••• •••• 4242 · 12/28 · 123</span>
        </div>

        <div class="card-fields-grid">
          <label class="full">Cardholder name<input v-model="form.cardholder" autocomplete="cc-name" placeholder="Name on card"></label>
          <label class="full">Card number
            <input v-model="form.cardNumber" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="23" @input="formatCardNumber">
          </label>
          <label>Expiration date
            <input v-model="form.cardExpiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5" @input="formatExpiry">
          </label>
          <label>Security code
            <input v-model="form.cardCvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" @input="formatCvc">
          </label>
        </div>
      </template>

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

      <p class="payment-note">Class Project Simulation: No real payment or banking transaction is processed.</p>

      <div class="checkout-summary">
        <div><span>Trip subtotal</span><b>{{ money(totals.subtotal) }}</b></div>
        <div v-if="totals.promoDiscount"><span>Promo discount</span><b>−{{ money(totals.promoDiscount) }}</b></div>
        <div v-if="totals.pointsDiscount"><span>Rewards discount</span><b>−{{ money(totals.pointsDiscount) }}</b></div>
        <div class="checkout-total-row"><strong>Total</strong><b>{{ money(totals.total) }}</b></div>
      </div>

      <p class="account-message" aria-live="polite">{{ error }}</p>
      <button class="button" type="submit" :disabled="paying">
        {{ paying ? 'Authorizing simulated payment…' : 'Confirm & Pay (Demo)' }}
      </button>
    </form>
  </dialog>
</template>
