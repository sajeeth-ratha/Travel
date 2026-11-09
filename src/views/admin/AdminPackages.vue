<template>
  <!-- Admin Content Management: Packages CRUD (Zero Emojis, No Gradients) -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    
    <!-- Top Admin Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
          <router-link to="/admin" class="hover:text-primary-600">Admin Dashboard</router-link>
          <span>/</span>
          <span class="text-slate-900 font-semibold">Package Inventory</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Manage Travel Packages
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Create new global itineraries, adjust pricing, upload images, and control catalog promotions.
        </p>
      </div>

      <!-- Add Package Button -->
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-colors"
      >
        <span>+</span>
        <span>Add New Package</span>
      </button>
    </div>

    <!-- Admin Sub-Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
      <router-link
        to="/admin"
        class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
      >
        Dashboard Overview
      </router-link>
      <router-link
        to="/admin/packages"
        class="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white shadow-xs"
      >
        Package Management (CRUD)
      </router-link>
      <router-link
        to="/admin/bookings"
        class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
      >
        Customer Bookings (Operations)
      </router-link>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
      <div class="relative w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search package by title, country..."
          class="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div class="absolute left-3 top-2.5 text-slate-400">
          <AppIcon name="search" class="w-3.5 h-3.5" />
        </div>
      </div>

      <div class="text-xs text-slate-500">
        Showing <strong>{{ filteredPackages.length }}</strong> packages
      </div>
    </div>

    <!-- Packages Data Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="py-3 px-4">Package</th>
              <th class="py-3 px-4">Destination</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4">Duration</th>
              <th class="py-3 px-4">Price</th>
              <th class="py-3 px-4">Flags</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="pkg in filteredPackages" :key="pkg.id" class="hover:bg-slate-50">
              
              <!-- Image & Title -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="pkg.coverImage"
                    :alt="pkg.title"
                    class="w-12 h-12 rounded-lg object-cover shrink-0 shadow-xs"
                  />
                  <div>
                    <h4 class="font-bold text-slate-900 line-clamp-1 max-w-xs">{{ pkg.title }}</h4>
                    <span class="text-[10px] text-slate-400">{{ pkg.groupSize }}</span>
                  </div>
                </div>
              </td>

              <!-- Destination & Country -->
              <td class="py-3 px-4 text-slate-700 font-medium">
                {{ pkg.destination }}, {{ pkg.country }}
              </td>

              <!-- Category -->
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded bg-sky-50 text-primary-800 text-[11px] font-semibold border border-primary-200">
                  {{ pkg.category }}
                </span>
              </td>

              <!-- Duration -->
              <td class="py-3 px-4 text-slate-600 font-medium">
                {{ pkg.duration }} Days
              </td>

              <!-- Price -->
              <td class="py-3 px-4 font-bold text-slate-900">
                ${{ pkg.price }}
              </td>

              <!-- Featured / Deal Tags -->
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <span v-if="pkg.featured" class="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">VIP</span>
                  <span v-if="pkg.deal" class="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Deal</span>
                </div>
              </td>

              <!-- Action Buttons -->
              <td class="py-3 px-4 text-right space-x-2">
                <router-link
                  :to="'/package/' + pkg.id"
                  target="_blank"
                  class="text-slate-500 hover:text-primary-600 font-semibold"
                  title="View on public site"
                >
                  View
                </router-link>
                <button
                  @click="openEditModal(pkg)"
                  class="text-primary-600 font-semibold hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="promptDeletePackage(pkg)"
                  class="text-rose-600 font-semibold hover:underline"
                >
                  Delete
                </button>
              </td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CREATE / EDIT PACKAGE MODAL -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900">
            {{ isEditing ? 'Edit Travel Package' : 'Create New Travel Package' }}
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600">
            <AppIcon name="x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Form Body -->
        <div class="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          
          <div class="space-y-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Package Title *</label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="e.g. Patagonia Fjords & Glaciers"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Destination *</label>
                <input
                  v-model="form.destination"
                  type="text"
                  required
                  placeholder="e.g. Patagonia"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Country *</label>
                <input
                  v-model="form.country"
                  type="text"
                  required
                  placeholder="e.g. Chile"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Continent *</label>
                <select
                  v-model="form.continent"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Americas">Americas</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Price (USD) *</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  required
                  class="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Duration (Days) *</label>
                <input
                  v-model.number="form.duration"
                  type="number"
                  required
                  class="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Travel Style *</label>
                <select
                  v-model="form.category"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Cultural">Cultural</option>
                  <option value="Adventure & Nature">Adventure & Nature</option>
                  <option value="Beach & Island">Beach & Island</option>
                  <option value="Safari & Wildlife">Safari & Wildlife</option>
                  <option value="Luxury Escapes">Luxury Escapes</option>
                </select>
              </div>
            </div>

            <!-- Open-Source Image URL -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Cover Image URL (Unsplash Open-Source) *</label>
              <input
                v-model="form.coverImage"
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                class="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
              <div class="flex gap-2 mt-1.5 text-[11px] text-slate-500">
                <span>Quick Photo Preset:</span>
                <button
                  type="button"
                  @click="form.coverImage = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80'"
                  class="text-primary-600 hover:underline"
                >
                  Tropical Beach
                </button>
                <span>•</span>
                <button
                  type="button"
                  @click="form.coverImage = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'"
                  class="text-primary-600 hover:underline"
                >
                  Alpine Mountain
                </button>
              </div>
            </div>

            <!-- Descriptions -->
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Short Description *</label>
              <textarea
                v-model="form.shortDescription"
                rows="2"
                required
                placeholder="A brief summary shown on cards..."
                class="w-full px-3 py-2 rounded-lg border border-slate-200"
              ></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Full Detailed Overview *</label>
              <textarea
                v-model="form.fullDescription"
                rows="3"
                required
                placeholder="Full description of the journey..."
                class="w-full px-3 py-2 rounded-lg border border-slate-200"
              ></textarea>
            </div>

            <!-- Promotion Toggles -->
            <div class="flex gap-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" v-model="form.featured" class="accent-primary-600" />
                <span>Mark as Featured (VIP)</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" v-model="form.deal" class="accent-primary-600" />
                <span>Mark as Special Deal</span>
              </label>
            </div>

          </div>

        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            @click="isModalOpen = false"
            class="px-4 py-2 font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="savePackageForm"
            class="px-5 py-2 font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs shadow-xs"
          >
            {{ isEditing ? 'Save Changes' : 'Create Package' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { getPackages, savePackage, deletePackage } from '../../services/storageService.js'
import { showToast } from '../../services/toastService.js'
import AppIcon from '../../components/common/AppIcon.vue'

const packages = ref(getPackages())
const searchQuery = ref('')

const isModalOpen = ref(false)
const isEditing = ref(false)

const form = reactive({
  id: null,
  title: '',
  destination: '',
  country: '',
  continent: 'Europe',
  category: 'Cultural',
  price: 1999,
  duration: 7,
  groupSize: '12 Travelers Max',
  coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  shortDescription: '',
  fullDescription: '',
  featured: false,
  deal: false
})

function reload() {
  packages.value = getPackages()
}

const filteredPackages = computed(() => {
  if (!searchQuery.value) return packages.value
  const q = searchQuery.value.toLowerCase()
  return packages.value.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.destination.toLowerCase().includes(q) ||
    p.country.toLowerCase().includes(q)
  )
})

function openCreateModal() {
  isEditing.value = false
  form.id = null
  form.title = ''
  form.destination = ''
  form.country = ''
  form.continent = 'Europe'
  form.category = 'Cultural'
  form.price = 1999
  form.duration = 7
  form.groupSize = '12 Travelers Max'
  form.coverImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  form.shortDescription = 'An unforgettable trip featuring curated cultural tours and boutique accommodations.'
  form.fullDescription = 'Explore vibrant cities, taste regional cuisine, and relax in luxury hotels with our expert guides.'
  form.featured = false
  form.deal = false
  isModalOpen.value = true
}

function openEditModal(pkg) {
  isEditing.value = true
  form.id = pkg.id
  form.title = pkg.title
  form.destination = pkg.destination
  form.country = pkg.country
  form.continent = pkg.continent
  form.category = pkg.category
  form.price = pkg.price
  form.duration = pkg.duration
  form.groupSize = pkg.groupSize || '12 Travelers Max'
  form.coverImage = pkg.coverImage
  form.shortDescription = pkg.shortDescription
  form.fullDescription = pkg.fullDescription
  form.featured = pkg.featured || false
  form.deal = pkg.deal || false
  isModalOpen.value = true
}

function savePackageForm() {
  if (!form.title || !form.destination || !form.country) {
    showToast('Please fill out required fields.', 'warning')
    return
  }

  savePackage({
    id: form.id,
    title: form.title,
    destination: form.destination,
    country: form.country,
    continent: form.continent,
    category: form.category,
    price: form.price,
    duration: form.duration,
    groupSize: form.groupSize,
    coverImage: form.coverImage,
    shortDescription: form.shortDescription,
    fullDescription: form.fullDescription,
    featured: form.featured,
    deal: form.deal,
    included: [
      'Boutique hotel accommodations',
      'Daily breakfast and welcome banquet',
      'Private airport/station transfers',
      'Certified English-speaking guide'
    ],
    notIncluded: [
      'International flights',
      'Personal shopping & optional activities'
    ],
    itinerary: [
      { day: 1, title: 'Arrival & Welcome Reception', description: 'Arrive at destination, private hotel check-in, and welcome dinner.' },
      { day: 2, title: 'Highlights Walking Tour', description: 'Explore historic district and architectural landmarks.' },
      { day: 3, title: 'Cultural Immersion & Cooking Class', description: 'Hands-on culinary session with local chefs.' }
    ],
    departureDates: ['2026-06-15', '2026-07-20', '2026-08-15']
  })

  reload()
  showToast(isEditing.value ? 'Package updated successfully.' : 'New package created.', 'success')
  isModalOpen.value = false
}

function promptDeletePackage(pkg) {
  if (confirm(`Are you sure you want to delete package "${pkg.title}" from inventory?`)) {
    deletePackage(pkg.id)
    reload()
    showToast(`Package "${pkg.title}" deleted.`, 'info')
  }
}
</script>
