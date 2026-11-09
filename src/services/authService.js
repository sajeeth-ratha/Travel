// =============================================================================
// AUTHENTICATION & USER SERVICE (localStorage User Accounts)
// Manages account creation, password verification, profile updates, and active session
// =============================================================================

import { ref } from 'vue'

const USERS_KEY = 'wanderlust_users'
const CURRENT_USER_KEY = 'wanderlust_current_user'

// Pre-seeded demo user for immediate test logins
const DEFAULT_USERS = [
  {
    id: 'usr-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    password: 'password123',
    phone: '+1 (555) 382-9102',
    registeredAt: '2026-01-15'
  },
  {
    id: 'usr-2',
    name: 'Marcus Vance',
    email: 'm.vance@example.org',
    password: 'password123',
    phone: '+44 20 7946 0912',
    registeredAt: '2026-02-10'
  }
]

// Reactive state for the current logged-in user
export const currentUser = ref(getStoredCurrentUser())

export function initAuth() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
  }
  // Auto-login default user on first visit if none selected, so bookings immediately link to an account!
  if (!localStorage.getItem(CURRENT_USER_KEY)) {
    setCurrentUser(DEFAULT_USERS[0])
  } else {
    currentUser.value = getStoredCurrentUser()
  }
}

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || DEFAULT_USERS
  } catch (e) {
    return DEFAULT_USERS
  }
}

function getStoredCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

function setCurrentUser(user) {
  if (user) {
    // Exclude password from stored session object for hygiene
    const safeUser = { ...user }
    delete safeUser.password
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
    currentUser.value = safeUser
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
    currentUser.value = null
  }
}

/**
 * Register a new user account
 * @param {Object} userData - { name, email, password, phone }
 */
export function registerUser({ name, email, password, phone }) {
  const users = getUsers()
  const cleanEmail = email.trim().toLowerCase()

  // Validate existing email
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail)
  if (existing) {
    throw new Error('An account with this email address already exists.')
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name: name.trim(),
    email: cleanEmail,
    password: password,
    phone: phone ? phone.trim() : '',
    registeredAt: new Date().toISOString().split('T')[0]
  }

  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  // Automatically sign in the newly registered user
  setCurrentUser(newUser)
  return newUser
}

/**
 * Sign in user with email and password
 * @param {string} email
 * @param {string} password
 */
export function loginUser(email, password) {
  const users = getUsers()
  const cleanEmail = email.trim().toLowerCase()

  const user = users.find(u => u.email.toLowerCase() === cleanEmail)
  if (!user) {
    throw new Error('No account found with this email. Please create an account.')
  }

  if (user.password !== password) {
    throw new Error('Incorrect password. Please verify your password.')
  }

  setCurrentUser(user)
  return user
}

/**
 * Sign out current user
 */
export function logoutUser() {
  setCurrentUser(null)
}

/**
 * Update current user profile details
 * @param {Object} updates - { name, phone, password }
 */
export function updateUserProfile(updates) {
  if (!currentUser.value) return false
  const users = getUsers()
  const idx = users.findIndex(u => u.id === currentUser.value.id)

  if (idx !== -1) {
    if (updates.name) users[idx].name = updates.name.trim()
    if (updates.phone) users[idx].phone = updates.phone.trim()
    if (updates.password && updates.password.length >= 6) {
      users[idx].password = updates.password
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    setCurrentUser(users[idx])
    return true
  }
  return false
}
