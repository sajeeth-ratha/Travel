// Shared display helpers used by the Vue components.
export function money(amount) {
  const value = Number(amount || 0)
  const digits = Number.isInteger(value) ? 0 : 2
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 2 })
}

export function formatDate(date) {
  if (!date) return 'Date not selected'
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function bookingTitle(booking) {
  return booking.packageTitle || booking.roomName || 'Room reservation'
}

export function bookingDateLabel(booking) {
  if (booking.bookingType === 'room' && booking.checkOutDate) {
    return `${formatDate(booking.travelDate)} – ${formatDate(booking.checkOutDate)} · ${booking.nights || 1} ${booking.nights === 1 ? 'night' : 'nights'}`
  }
  return formatDate(booking.travelDate)
}

export function getDiscountAmount(promo, subtotal) {
  if (!promo) return 0
  if (promo.type === 'percent') return Math.round(subtotal * promo.value / 100)
  return Math.min(subtotal, promo.value)
}

export function getLoyaltyPoints(bookings) {
  return bookings.filter(booking => booking.status !== 'Cancelled').reduce((total, booking) => {
    const earned = booking.pointsEarned ?? Math.floor(Number(booking.totalPrice || 0) / 10)
    return total + Number(earned) - Number(booking.pointsUsed || 0)
  }, 0)
}

export function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
