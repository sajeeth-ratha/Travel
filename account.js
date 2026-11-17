// Simple demo accounts saved in this browser.
// This is for a class project only, not for real passwords or payments.

const USERS_KEY = 'wanderlust_users'
const SESSION_KEY = 'wanderlust_signed_in_user'

const DEMO_ADMIN = {
  id: 'demo-admin',
  name: 'Wanderlust Admin',
  email: 'admin@wanderlust.com',
  password: 'travel123',
  phone: '+1 555-0192',
  role: 'admin'
}

const DEMO_TRAVELER = {
  id: 'demo-traveler',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  password: 'travel123',
  phone: '+1 555-0144',
  role: 'traveler'
}

export function getUsers() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  let changed = false
  if (!users.some(user => user.email === DEMO_ADMIN.email)) {
    users.push(DEMO_ADMIN)
    changed = true
  }
  if (!users.some(user => user.email === DEMO_TRAVELER.email)) {
    users.push(DEMO_TRAVELER)
    changed = true
  }
  if (changed) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }
  return users
}

export function getSignedInUser() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  if (!session) return null
  const savedUser = getUsers().find(user => user.id === session.id)
  return {
    ...session,
    phone: savedUser?.phone || session.phone || '',
    role: savedUser?.role || session.role || 'traveler'
  }
}

export function createAccount(name, email, password, phone = '') {
  const users = getUsers()
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanName = (name || '').trim()
  const cleanPhone = (phone || '').trim()

  if (!cleanName) {
    throw new Error('Please enter your full name.')
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.')
  }
  if (users.some(user => user.email === cleanEmail)) {
    throw new Error('There is already an account with that email.')
  }
  if (!password || password.length < 6) {
    throw new Error('Please use a password with at least 6 characters.')
  }

  const user = {
    id: 'user-' + Date.now(),
    name: cleanName,
    email: cleanEmail,
    password,
    phone: cleanPhone,
    role: 'traveler'
  }
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  signIn(cleanEmail, password)
  return user
}

export function signIn(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase()
  const user = getUsers().find(item => item.email === cleanEmail && item.password === password)
  if (!user) throw new Error('Email or password is not correct.')

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role || 'traveler'
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
  return safeUser
}

// Save profile changes (name, email, phone, and optional new password) for the signed-in account in this browser.
export function updateAccountProfile(userId, nameOrData, maybeEmail, maybePhone, maybePassword) {
  const users = getUsers()
  const user = users.find(item => item.id === userId)
  if (!user) throw new Error('Your account could not be found. Please log in again.')

  let cleanName = ''
  let cleanEmail = ''
  let cleanPhone = user.phone || ''
  let newPassword = null

  if (typeof nameOrData === 'object' && nameOrData !== null) {
    cleanName = (nameOrData.name || '').trim()
    cleanEmail = (nameOrData.email || '').trim().toLowerCase()
    if (nameOrData.phone !== undefined) cleanPhone = (nameOrData.phone || '').trim()
    if (nameOrData.password) newPassword = nameOrData.password
  } else {
    cleanName = (nameOrData || '').trim()
    cleanEmail = (maybeEmail || '').trim().toLowerCase()
    if (maybePhone !== undefined) cleanPhone = (maybePhone || '').trim()
    if (maybePassword) newPassword = maybePassword
  }

  if (!cleanName || !cleanEmail) throw new Error('Enter your name and email address.')
  if (users.some(item => item.id !== userId && item.email === cleanEmail)) {
    throw new Error('That email address is already used by another account.')
  }
  if (newPassword) {
    if (newPassword.length < 6) throw new Error('New password must be at least 6 characters.')
    user.password = newPassword
  }

  user.name = cleanName
  user.email = cleanEmail
  user.phone = cleanPhone
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role || 'traveler'
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function getDemoAccounts() {
  return [DEMO_TRAVELER, DEMO_ADMIN]
}
