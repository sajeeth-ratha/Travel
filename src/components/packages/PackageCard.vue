<template>
  <!-- Hotels.com Style Travel Package Card (No Gradients, Light Blue Accents, Crisp Vector SVGs) -->
  <article class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
    
    <!-- Image Header with Badges & Wishlist Heart -->
    <div class="relative h-56 w-full overflow-hidden bg-slate-100">
      <img
        :src="pkg.coverImage"
        :alt="pkg.title"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      <!-- Top Left Badges -->
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <span
          v-if="pkg.deal"
          class="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-600 text-white shadow-xs"
        >
          Special Deal
        </span>
        <span
          v-if="pkg.featured"
          class="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-900 text-white shadow-xs"
        >
          VIP Access
        </span>
        <span class="px-2 py-0.5 text-[11px] font-medium rounded bg-white/95 text-slate-800 shadow-xs">
          {{ pkg.continent }}
        </span>
      </div>

      <!-- Wishlist Heart Button -->
      <button
        @click.stop="handleWishlistToggle"
        class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center shadow-sm transition-transform hover:scale-110 active:scale-95"
        :title="isSaved ? 'Remove from wishlist' : 'Save to wishlist'"
        :aria-label="isSaved ? 'Remove from wishlist' : 'Save to wishlist'"
      >
        <AppIcon
          :name="isSaved ? 'heart-fill' : 'heart'"
          :class="isSaved ? 'w-4 h-4 text-rose-500' : 'w-4 h-4 text-slate-600'"
        />
      </button>

      <!-- Bottom Category Pill -->
      <div class="absolute bottom-3 left-3">
        <span class="px-2.5 py-0.5 text-[11px] font-semibold rounded bg-white text-slate-800 shadow-xs">
          {{ pkg.category }}
        </span>
      </div>
    </div>

    <!-- Content Body -->
    <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
      
      <!-- Destination & Title -->
      <div class="space-y-1.5">
        <div class="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
          <AppIcon name="pin" class="w-3.5 h-3.5 text-primary-600" />
          <span>{{ pkg.destination }}, {{ pkg.country }}</span>
        </div>
        
        <router-link :to="'/package/' + pkg.id">
          <h3 class="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {{ pkg.title }}
          </h3>
        </router-link>

        <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {{ pkg.shortDescription }}
        </p>
      </div>

      <!-- Hotels.com Style Rating Badge & Trip Meta -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <!-- Hotels.com Score Pill -->
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-primary-700 text-white font-bold text-xs">
            {{ pkg.rating }}
          </span>
          <div class="leading-none">
            <span class="font-bold text-slate-800 block text-xs">
              {{ pkg.rating >= 4.9 ? 'Exceptional' : pkg.rating >= 4.7 ? 'Wonderful' : 'Very Good' }}
            </span>
            <span class="text-[11px] text-slate-400">{{ pkg.reviewCount }} reviews</span>
          </div>
        </div>

        <div class="flex items-center gap-1 text-slate-500 font-medium text-xs">
          <AppIcon name="clock" class="w-3.5 h-3.5 text-slate-400" />
          <span>{{ pkg.duration }} Days</span>
        </div>
      </div>

      <!-- Price & CTA Action Buttons -->
      <div class="pt-2 border-t border-slate-100 flex items-end justify-between gap-3">
        <div>
          <span class="block text-[11px] text-slate-500 font-medium">From</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold text-slate-900">
              {{ formatCurrency(pkg.price) }}
            </span>
            <span v-if="pkg.originalPrice" class="text-xs text-slate-400 line-through">
              {{ formatCurrency(pkg.originalPrice) }}
            </span>
          </div>
          <span class="block text-[10px] text-slate-400">includes taxes & fees</span>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-2">
          <router-link
            :to="'/package/' + pkg.id"
            class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            Details
          </router-link>
          <button
            @click="$emit('quick-book', pkg)"
            class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-xs"
          >
            Reserve
          </button>
        </div>
      </div>

    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../../services/currencyService.js'
import { isWishlisted, toggleWishlist } from '../../services/storageService.js'
import { showToast } from '../../services/toastService.js'
import AppIcon from '../common/AppIcon.vue'

const props = defineProps({
  pkg: {
    type: Object,
    required: true
  }
})

defineEmits(['quick-book'])

const isSaved = computed(() => {
  return isWishlisted(props.pkg.id)
})

function handleWishlistToggle() {
  toggleWishlist(props.pkg.id)
  if (isWishlisted(props.pkg.id)) {
    showToast(`Saved "${props.pkg.title}" to your wishlist.`, 'success')
  } else {
    showToast(`Removed "${props.pkg.title}" from your wishlist.`, 'info')
  }
}
</script>
