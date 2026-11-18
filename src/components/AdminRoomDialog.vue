<script setup>
import { onMounted, reactive, ref } from 'vue'
import { saveRoom } from '../lib/data.js'

const props = defineProps({
  item: { type: Object, default: null }
})

const emit = defineEmits(['saved', 'close'])

const dialog = ref(null)
const error = ref('')

const form = reactive({
  name: props.item?.name || '',
  property: props.item?.property || '',
  type: props.item?.type || 'Hotel room',
  beds: props.item?.beds || '1 queen bed',
  destination: props.item?.destination || '',
  country: props.item?.country || '',
  price: props.item?.price ?? '',
  guests: props.item?.guests ?? 2,
  description: props.item?.description || 'A comfortable room for your stay.',
  coverImage: props.item?.coverImage || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
  amenities: (props.item?.amenities || ['Wi-Fi', 'Air conditioning']).join(', '),
  availableFrom: props.item?.availableFrom || '',
  availableTo: props.item?.availableTo || ''
})

onMounted(() => dialog.value?.showModal())

function close() {
  dialog.value?.close()
}

function save() {
  error.value = ''
  const price = Number(form.price)
  const guests = Number(form.guests)
  const firstDate = form.availableFrom.trim()
  const lastDate = form.availableTo.trim()

  if (!form.name.trim() || !form.property.trim() || !form.destination.trim() || !form.country.trim()) {
    error.value = 'Add a room name, property, destination and country.'
    return
  }
  if (!Number.isFinite(price) || price <= 0) {
    error.value = 'Enter a price greater than zero.'
    return
  }
  if (!Number.isInteger(guests) || guests < 1) {
    error.value = 'Enter at least one guest.'
    return
  }
  if ((firstDate && !/^\d{4}-\d{2}-\d{2}$/.test(firstDate)) || (lastDate && !/^\d{4}-\d{2}-\d{2}$/.test(lastDate))) {
    error.value = 'Enter availability dates in YYYY-MM-DD format, or leave them blank.'
    return
  }
  if (firstDate && lastDate && firstDate > lastDate) {
    error.value = 'The first available date must be before the last available date.'
    return
  }

  const cover = form.coverImage.trim()
  const gallery = [cover, ...(props.item?.gallery || []).filter(photo => photo && photo !== props.item?.coverImage)]
    .filter(Boolean)
    .slice(0, 3)

  saveRoom({
    ...(props.item || {}),
    name: form.name.trim(),
    property: form.property.trim(),
    type: form.type,
    beds: form.beds.trim(),
    destination: form.destination.trim(),
    country: form.country.trim(),
    price,
    guests,
    description: form.description.trim(),
    coverImage: cover,
    gallery,
    amenities: form.amenities.split(',').map(item => item.trim()).filter(Boolean),
    availableFrom: firstDate,
    availableTo: lastDate
  })
  emit('saved')
  close()
}
</script>

<template>
  <dialog ref="dialog" class="admin-edit-dialog" @close="$emit('close')">
    <button class="close" type="button" aria-label="Close editor" @click="close">×</button>
    <div class="eyebrow">{{ item ? 'EDIT ROOM' : 'NEW ROOM' }}</div>
    <h2>{{ item ? 'Edit room or stay' : 'Add room or stay' }}</h2>
    <form @submit.prevent="save">
      <div class="admin-edit-grid">
        <label>Room name<input v-model="form.name" required placeholder="Caldera View Suite"></label>
        <label>Property<input v-model="form.property" required placeholder="Aegean House"></label>
        <label>Room type
          <select v-model="form.type">
            <option>Hotel room</option><option>Boutique hotel room</option>
            <option>Traditional room</option><option>Private suite</option>
            <option>Suite</option><option>Entire villa</option>
          </select>
        </label>
        <label>Beds<input v-model="form.beds" placeholder="1 king bed"></label>
        <label>City or destination<input v-model="form.destination" required placeholder="Santorini"></label>
        <label>Country<input v-model="form.country" required placeholder="Greece"></label>
        <label>Price per night in USD<input v-model="form.price" type="number" min="1" step="1" required></label>
        <label>Maximum guests<input v-model="form.guests" type="number" min="1" step="1" required></label>
        <label class="full">Photo URL<input v-model="form.coverImage" placeholder="https://…"></label>
        <label class="full">Short room description<textarea v-model="form.description" rows="2"></textarea></label>
        <label class="full">Room features (separate with commas)<input v-model="form.amenities" placeholder="Sea view, Wi-Fi, Breakfast included"></label>
        <label>First available check-in<input v-model="form.availableFrom" type="date"></label>
        <label>Last available check-in<input v-model="form.availableTo" type="date"></label>
      </div>
      <p class="admin-edit-error" role="alert">{{ error }}</p>
      <div class="admin-edit-actions">
        <button class="button outline" type="button" @click="close">Cancel</button>
        <button class="button" type="submit">{{ item ? 'Save changes' : 'Add room' }}</button>
      </div>
    </form>
  </dialog>
</template>
