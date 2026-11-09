// Simple demo accounts saved in this browser.
// This is for a class project only, not for real passwords or payments.

const USERS_KEY = 'wanderlust_users'
const SESSION_KEY = 'wanderlust_signed_in_user'
const DEMO_ADMIN = {
  id: 'demo-admin',
  name: 'Wanderlust Admin',
  email: 'admin@wanderlust.com',
  password: 'travel123',
  role: 'admin'
}

export function getUsers() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  if (!users.some(user => user.email === DEMO_ADMIN.email)) {
    users.push(DEMO_ADMIN)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }
  return users
}

export function getSignedInUser() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  if (!session) return null
  const savedUser = getUsers().find(user => user.id === session.id)
  return { ...session, role: savedUser?.role || 'traveler' }
}

export function createAccount(name, email, password) {
  const users = getUsers()
  const cleanEmail = email.trim().toLowerCase()
  if (users.some(user => user.email === cleanEmail)) {
    throw new Error('There is already an account with that email.')
  }
  if (password.length < 6) {
    throw new Error('Please use a password with at least 6 characters.')
  }

  const user = { id: 'user-' + Date.now(), name: name.trim(), email: cleanEmail, password, role: 'traveler' }
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  signIn(cleanEmail, password)
  return user
}

export function signIn(email, password) {
  const cleanEmail = email.trim().toLowerCase()
  const user = getUsers().find(item => item.email === cleanEmail && item.password === password)
  if (!user) throw new Error('Email or password is not correct.')

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role || 'traveler' }
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
  return safeUser
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}
