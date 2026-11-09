<template>
  <!-- Printable Travel Voucher / E-Ticket Modal (Zero Emojis, No Gradients) -->
  <div v-if="isOpen && booking" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
    <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
      
      <!-- Top Action Bar (Screen Only) -->
      <div class="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-semibold">
          <AppIcon name="plane" class="w-4 h-4 text-primary-400" />
          <span>Official Travel Reservation Voucher</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="printVoucher"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors flex items-center gap-1.5"
          >
            <AppIcon name="printer" class="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <button
            @click="$emit('close')"
            class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <AppIcon name="x" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Printable Voucher Ticket Body -->
      <div id="printable-voucher" class="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white">
        
        <!-- Voucher Header -->
        <div class="flex items-start justify-between border-b-2 border-primary-600 pb-5">
          <div>
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-md bg-primary-600 text-white flex items-center justify-center">
                <AppIcon name="plane" class="w-4 h-4 text-white" />
              </div>
              <h2 class="text-xl font-bold tracking-tight text-slate-900">wanderlust.</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1">Stays & Travel Package Agency</p>
            <p class="text-[11px] text-slate-400">Customer Support: +1 (800) 555-WAND</p>
          </div>
          <div class="text-right">
            <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              {{ booking.status || 'Confirmed' }}
            </span>
            <div class="mt-2 text-xs text-slate-500">Booking Reference:</div>
            <div class="font-mono text-base font-extrabold text-primary-700">{{ booking.bookingRef }}</div>
          </div>
        </div>

        <!-- Package & Itinerary Title -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span class="text-[11px] font-bold uppercase tracking-wider text-primary-700">Travel Package Reserved</span>
          <h3 class="text-base font-bold text-slate-900 mt-0.5">{{ booking.packageTitle }}</h3>
          <div class="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
            <div>
              <span class="text-slate-400">Departure:</span>
              <strong class="ml-1 text-slate-800">{{ booking.travelDate }}</strong>
            </div>
            <div>
              <span class="text-slate-400">Total Travelers:</span>
              <strong class="ml-1 text-slate-800">{{ booking.adults }} Adult(s)<span v-if="booking.children">, {{ booking.children }} Child(ren)</span></strong>
            </div>
            <div>
              <span class="text-slate-400">Room Tier:</span>
              <strong class="ml-1 text-slate-800">{{ booking.roomTier || 'Standard' }}</strong>
            </div>
          </div>
        </div>

        <!-- Lead Passenger & Contact -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="space-y-1">
            <span class="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Lead Traveler</span>
            <p class="font-bold text-slate-900 text-sm">{{ booking.customerName }}</p>
            <p class="text-slate-600">{{ booking.customerEmail }}</p>
            <p class="text-slate-600">{{ booking.customerPhone }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Payment Details</span>
            <p class="font-bold text-slate-900">Total Paid: ${{ booking.totalPrice }}</p>
            <p class="text-slate-600">Method: {{ booking.paymentMethod || 'Credit Card' }}</p>
            <p class="text-slate-600">Date Issued: {{ booking.bookingDate || 'Today' }}</p>
          </div>
        </div>

        <!-- Add-ons & Special Requests -->
        <div v-if="booking.addOns && booking.addOns.length" class="text-xs space-y-1">
          <span class="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Included Add-ons</span>
          <div class="flex flex-wrap gap-2 pt-1">
            <span
              v-for="addon in booking.addOns"
              :key="addon"
              class="px-2.5 py-1 rounded-md bg-sky-50 text-primary-800 text-[11px] font-semibold border border-primary-200"
            >
              ✓ {{ addon }}
            </span>
          </div>
        </div>

        <div v-if="booking.specialRequests" class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span class="font-bold text-slate-700">Special Requests / Notes:</span>
          <p class="text-slate-600 mt-0.5">{{ booking.specialRequests }}</p>
        </div>

        <!-- Ticket Verification QR Simulation & Terms -->
        <div class="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between">
          <div class="text-[10px] text-slate-400 max-w-xs leading-relaxed">
            Please present this electronic voucher or printed copy at your hotel check-in and excursion boarding points. Valid ID matching traveler name required.
          </div>
          <!-- Simulated QR Code Graphic -->
          <div class="w-16 h-16 bg-slate-900 p-1.5 rounded-lg flex flex-col items-center justify-center text-white text-[8px] font-mono text-center shadow-xs">
            <div class="grid grid-cols-3 gap-0.5 w-full h-full p-1 border border-dashed border-white/50">
              <span class="bg-white"></span>
              <span class="bg-white"></span>
              <span class="bg-transparent"></span>
              <span class="bg-transparent"></span>
              <span class="bg-white"></span>
              <span class="bg-white"></span>
              <span class="bg-white"></span>
              <span class="bg-transparent"></span>
              <span class="bg-white"></span>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Bar -->
      <div class="no-print px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
        >
          Close
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

function printVoucher() {
  window.print()
}
</script>
