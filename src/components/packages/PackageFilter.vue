<template>
  <!-- Hotels.com Style Multi-Criteria Travel Filter Sidebar -->
  <aside class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
    
    <!-- Filter Header & Reset -->
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div class="flex items-center gap-2">
        <AppIcon name="sliders" class="w-4 h-4 text-primary-600" />
        <h3 class="font-bold text-slate-900 text-sm">Filters</h3>
      </div>
      <button
        @click="resetFilters"
        class="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
      >
        Reset All
      </button>
    </div>

    <!-- 1. Search Query Input -->
    <div class="space-y-1.5">
      <label class="block text-xs font-bold text-slate-700">
        Search Destination
      </label>
      <div class="relative">
        <input
          type="text"
          v-model="filters.search"
          placeholder="e.g. Kyoto, Greece, Alps..."
          class="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div class="absolute left-3 top-2.5 text-slate-400">
          <AppIcon name="search" class="w-3.5 h-3.5" />
        </div>
      </div>
    </div>

    <!-- 2. Continent Selection -->
    <div class="space-y-2">
      <label class="block text-xs font-bold text-slate-700">
        Region / Continent
      </label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="region in continents"
          :key="region"
          type="button"
          @click="filters.continent = region"
          :class="[
            'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors',
            filters.continent === region
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          ]"
        >
          {{ region }}
        </button>
      </div>
    </div>

    <!-- 3. Travel Style / Category -->
    <div class="space-y-2">
      <label class="block text-xs font-bold text-slate-700">
        Property / Trip Type
      </label>
      <select
        v-model="filters.category"
        class="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        <option value="">All Travel Styles</option>
        <option value="Cultural">Cultural & Heritage</option>
        <option value="Adventure & Nature">Adventure & Nature</option>
        <option value="Beach & Island">Beach & Island</option>
        <option value="Safari & Wildlife">Safari & Wildlife</option>
        <option value="Luxury Escapes">Luxury Escapes</option>
      </select>
    </div>

    <!-- 4. Max Price Slider -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <label class="font-bold text-slate-700">Max Budget</label>
        <span class="font-extrabold text-primary-600">${{ filters.maxPrice }}</span>
      </div>
      <input
        type="range"
        v-model.number="filters.maxPrice"
        min="1000"
        max="4000"
        step="100"
        class="w-full accent-primary-600 cursor-pointer"
      />
      <div class="flex justify-between text-[11px] text-slate-400">
        <span>$1,000</span>
        <span>$4,000</span>
      </div>
    </div>

    <!-- 5. Duration Radio Options -->
    <div class="space-y-2">
      <label class="block text-xs font-bold text-slate-700">
        Trip Length
      </label>
      <div class="space-y-1.5">
        <label
          v-for="dur in durationOptions"
          :key="dur.value"
          class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
        >
          <input
            type="radio"
            v-model="filters.durationRange"
            :value="dur.value"
            class="text-primary-600 accent-primary-600"
          />
          <span>{{ dur.label }}</span>
        </label>
      </div>
    </div>

    <!-- 6. Minimum Rating -->
    <div class="space-y-2">
      <label class="block text-xs font-bold text-slate-700">
        Guest Rating
      </label>
      <select
        v-model.number="filters.minRating"
        class="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        <option :value="0">Any Rating</option>
        <option :value="4.5">4.5+ (Very Good)</option>
        <option :value="4.8">4.8+ (Wonderful)</option>
        <option :value="5.0">5.0 (Exceptional)</option>
      </select>
    </div>

  </aside>
</template>

<script setup>
import { reactive, watch } from 'vue'
import AppIcon from '../common/AppIcon.vue'

const emit = defineEmits(['update:filters'])

const continents = ['All', 'Europe', 'Asia', 'Americas', 'Africa']

const durationOptions = [
  { label: 'Any Duration', value: 'all' },
  { label: '1 - 6 Days (Short Break)', value: 'short' },
  { label: '7 - 8 Days (One Week)', value: 'medium' },
  { label: '9+ Days (Grand Tour)', value: 'long' }
]

const filters = reactive({
  search: '',
  continent: 'All',
  category: '',
  maxPrice: 4000,
  durationRange: 'all',
  minRating: 0
})

function resetFilters() {
  filters.search = ''
  filters.continent = 'All'
  filters.category = ''
  filters.maxPrice = 4000
  filters.durationRange = 'all'
  filters.minRating = 0
}

watch(filters, (newVal) => {
  emit('update:filters', { ...newVal })
}, { deep: true, immediate: true })
</script>
