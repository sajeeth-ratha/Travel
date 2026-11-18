<script setup>
import { onMounted, reactive, ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import { createAccount, signIn } from '../lib/account.js'
import { currentUser, refreshUser } from '../lib/store.js'

const mode = ref('login')
const message = ref('')
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)

const nextPage = new URLSearchParams(location.search).get('next')

const login = reactive({ email: '', password: '' })
const register = reactive({ name: '', email: '', phone: '', password: '' })

function setMode(value) {
  mode.value = value
  message.value = ''
}

function fillDemo(email) {
  setMode('login')
  login.email = email
  login.password = 'travel123'
}

function finishLogin() {
  const isMemberPage = nextPage && /^(package\.html\?|room\.html\?|bookings\.html$)/.test(nextPage)
  if (isMemberPage) {
    window.location.href = nextPage
    return
  }
  window.location.href = currentUser.value?.role === 'admin' ? 'admin.html' : 'panel.html'
}

function submitLogin() {
  try {
    signIn(login.email, login.password)
    refreshUser()
    finishLogin()
  } catch (error) {
    message.value = error.message
  }
}

function submitRegister() {
  try {
    createAccount(register.name, register.email, register.password, register.phone)
    refreshUser()
    finishLogin()
  } catch (error) {
    message.value = error.message
  }
}

onMounted(() => {
  if (currentUser.value) {
    window.location.href = 'panel.html'
  }
})
</script>

<template>
  <SiteHeader active="account" />
  <main class="wrap page account-page">
    <section class="login-layout">
      <div class="login-story">
        <div class="eyebrow light">A GOOD TRIP STARTS HERE</div>
        <h1>Welcome to your next chapter.</h1>
        <p>Sign in to keep your journeys, saved places, and plans together.</p>
        <div class="login-story-note"><span>✦</span> Thoughtful trips, all in one place</div>
      </div>
      <div class="auth-panel">
        <div v-if="nextPage" class="login-redirect-banner">
          <span class="banner-icon" aria-hidden="true">✓</span>
          <span>Sign in or create an account to finalize your booking reservation.</span>
        </div>
        <div class="eyebrow">YOUR WANDERLUST ACCOUNT</div>
        <h2>{{ mode === 'login' ? 'Welcome back' : 'Start planning your trips' }}</h2>
        <p class="auth-intro">
          {{ mode === 'login' ? 'Log in to continue to your account.' : 'Create an account to save and manage your journeys.' }}
        </p>
        <div class="auth-tabs" role="tablist" aria-label="Choose account action">
          <button
            class="auth-tab"
            :class="{ active: mode === 'login' }"
            type="button"
            role="tab"
            :aria-selected="String(mode === 'login')"
            @click="setMode('login')"
          >Log in</button>
          <button
            class="auth-tab"
            :class="{ active: mode === 'register' }"
            type="button"
            role="tab"
            :aria-selected="String(mode === 'register')"
            @click="setMode('register')"
          >Create account</button>
        </div>
        <p class="account-message" aria-live="polite">{{ message }}</p>

        <form v-show="mode === 'login'" class="account-card" @submit.prevent="submitLogin">
          <label>Email address
            <input v-model="login.email" type="email" required autocomplete="email" placeholder="you@example.com">
          </label>
          <label>Password
            <div class="password-input-wrap">
              <input
                v-model="login.password"
                :type="showLoginPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
              >
              <button type="button" class="toggle-password" aria-label="Toggle password visibility" @click="showLoginPassword = !showLoginPassword">
                {{ showLoginPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </label>
          <button class="button" type="submit">Log in <span>→</span></button>
        </form>

        <form v-show="mode === 'register'" class="account-card" @submit.prevent="submitRegister">
          <label>Full name
            <input v-model="register.name" required autocomplete="name" placeholder="First and last name">
          </label>
          <label>Email address
            <input v-model="register.email" type="email" required autocomplete="email" placeholder="you@example.com">
          </label>
          <label>Phone number
            <input v-model="register.phone" type="tel" autocomplete="tel" placeholder="+1 (555) 0144">
          </label>
          <label>Password
            <div class="password-input-wrap">
              <input
                v-model="register.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                minlength="6"
                required
                autocomplete="new-password"
                placeholder="At least 6 characters"
              >
              <button type="button" class="toggle-password" aria-label="Toggle password visibility" @click="showRegisterPassword = !showRegisterPassword">
                {{ showRegisterPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </label>
          <button class="button" type="submit">Create my account <span>→</span></button>
        </form>

        <div class="demo-login">
          <div class="demo-login-header">
            <b>Class Project Demo Accounts</b>
            <small>Click to auto-fill credentials:</small>
          </div>
          <div class="demo-actions">
            <button type="button" class="button outline small" @click="fillDemo('alex@example.com')">Alex (Traveler)</button>
            <button type="button" class="button outline small" @click="fillDemo('admin@wanderlust.com')">Admin</button>
          </div>
          <div class="demo-credentials">
            <span>Traveler: alex@example.com / travel123</span>
            <span>Admin: admin@wanderlust.com / travel123</span>
          </div>
        </div>
        <p class="demo-note">Class project demo: account details are stored locally in this browser. Do not use a real password.</p>
      </div>
    </section>
  </main>
  <SiteFooter />
</template>
