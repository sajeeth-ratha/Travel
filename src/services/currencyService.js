import { ref } from 'vue'

// Supported currencies and baseline conversion rates (Base: USD)
export const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', rate: 1.36, name: 'Canadian Dollar' }
]

// Current active currency state (persisted in localStorage)
const savedCurrency = localStorage.getItem('wanderlust_currency') || 'USD'
export const currentCurrency = ref(savedCurrency)

// Change currency function
export function setCurrency(currencyCode) {
  currentCurrency.value = currencyCode
  localStorage.setItem('wanderlust_currency', currencyCode)
}

// Convert and format USD amount to the selected currency
export function formatCurrency(amountUSD) {
  const currencyObj = CURRENCIES.find(c => c.code === currentCurrency.value) || CURRENCIES[0]
  const converted = Math.round(amountUSD * currencyObj.rate)
  return `${currencyObj.symbol}${converted.toLocaleString()}`
}
