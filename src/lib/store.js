// Small shared reactive store. Each page is its own Vue app, so this module
// holds the values that several components on the same page need to agree on.
import { ref } from 'vue'
import { getSignedInUser } from './account.js'
import { getWishlist, toggleWishlist } from './data.js'

export const currentUser = ref(getSignedInUser())
export const savedIds = ref(getWishlist())

export function refreshUser() {
  currentUser.value = getSignedInUser()
}

export function toggleSaved(id) {
  toggleWishlist(id)
  savedIds.value = getWishlist()
}
