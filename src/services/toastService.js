import { ref } from 'vue'

// Global toast notification state
export const toasts = ref([])

let nextToastId = 1

/**
 * Show a toast notification
 * @param {string} message - Notification text
 * @param {string} type - 'success' | 'info' | 'warning' | 'error'
 * @param {number} duration - Milliseconds before auto-dismiss
 */
export function showToast(message, type = 'success', duration = 3500) {
  const id = nextToastId++
  toasts.value.push({ id, message, type })

  setTimeout(() => {
    removeToast(id)
  }, duration)
}

export function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}
