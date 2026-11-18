<script setup>
import { onMounted, reactive, ref } from 'vue'
import { savePackage } from '../lib/data.js'

const props = defineProps({
  item: { type: Object, default: null }
})

const emit = defineEmits(['saved', 'close'])

const dialog = ref(null)
const error = ref('')

const form = reactive({
  title: props.item?.title || '',
  destination: props.item?.destination || '',
  country: props.item?.country || '',
  continent: props.item?.continent || 'Europe',
  category: props.item?.category || 'Cultural',
  price: props.item?.price ?? '',
  duration: props.item?.duration ?? '',
  departureDates: (props.item?.departureDates || []).join(', '),
  coverImage: props.item?.coverImage || '',
  shortDescription: props.item?.shortDescription || 'A memorable trip planned for you.'
})

onMounted(() => dialog.value?.showModal())

function close() {
  dialog.value?.close()
}

function save() {
  error.value = ''
  const price = Number(form.price)
  const duration = Number(form.duration)
  const dates = form.departureDates.split(',').map(date => date.trim()).filter(Boolean)

  if (!form.title.trim() || !form.destination.trim() || !form.country.trim()) {
    error.value = 'Add a trip title, destination and country.'
    return
  }
  if (!Number.isFinite(price) || price <= 0) {
    error.value = 'Enter a price greater than zero.'
    return
  }
  if (!Number.isInteger(duration) || duration < 1) {
    error.value = 'Enter the trip length in whole days.'
    return
  }
  if (dates.some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    error.value = 'Enter departure dates in YYYY-MM-DD format, separated by commas.'
    return
  }

  savePackage({
    ...(props.item || {}),
    title: form.title.trim(),
    destination: form.destination.trim(),
    country: form.country.trim(),
    continent: form.continent,
    category: form.category,
    price,
    duration,
    departureDates: dates,
    coverImage: form.coverImage.trim(),
    shortDescription: form.shortDescription.trim() || 'A memorable trip planned for you.'
  })
  emit('saved')
  close()
}
</script>

<template>
  <dialog ref="dialog" class="admin-edit-dialog" @close="$emit('close')">
    <button class="close" type="button" aria-label="Close editor" @click="close">×</button>
    <div class="eyebrow">{{ item ? 'EDIT TRIP' : 'NEW TRIP' }}</div>
    <h2>{{ item ? 'Edit travel package' : 'Add travel package' }}</h2>
    <form @submit.prevent="save">
      <div class="admin-edit-grid">
        <label class="full">Trip title<input v-model="form.title" required placeholder="e.g. Santorini Sunset Escape"></label>
        <label>Destination<input v-model="form.destination" required placeholder="Santorini"></label>
        <label>Country<input v-model="form.country" required placeholder="Greece"></label>
        <label>Continent
          <select v-model="form.continent">
            <option>Europe</option><option>Asia</option><option>Africa</option>
            <option>Americas</option><option>Oceania</option>
          </select>
        </label>
        <label>Category
          <select v-model="form.category">
            <option>Beach &amp; Island</option><option>Cultural</option><option>Adventure &amp; Nature</option>
            <option>Safari &amp; Wildlife</option><option>Luxury Escapes</option>
          </select>
        </label>
        <label>Price in USD<input v-model="form.price" type="number" min="1" step="1" required></label>
        <label>Duration in days<input v-model="form.duration" type="number" min="1" step="1" required></label>
        <label class="full">Departure dates<input v-model="form.departureDates" placeholder="2026-06-15, 2026-07-10"></label>
        <label class="full">Cover image URL<input v-model="form.coverImage" placeholder="https://…"></label>
        <label class="full">Short description<textarea v-model="form.shortDescription" rows="3"></textarea></label>
      </div>
      <p class="admin-edit-error" role="alert">{{ error }}</p>
      <div class="admin-edit-actions">
        <button class="button outline" type="button" @click="close">Cancel</button>
        <button class="button" type="submit">{{ item ? 'Save changes' : 'Add package' }}</button>
      </div>
    </form>
  </dialog>
</template>
