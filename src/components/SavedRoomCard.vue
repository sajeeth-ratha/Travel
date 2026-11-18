<script setup>
import { money } from '../lib/ui.js'

defineProps({
  room: { type: Object, required: true },
  saved: { type: Boolean, default: false }
})

defineEmits(['wish'])
</script>

<template>
  <article class="card room-wishlist-card">
    <a :href="`room.html?id=${room.id}`">
      <img :src="room.coverImage" :alt="`${room.name} at ${room.property}`" loading="lazy">
      <div class="card-body">
        <div class="eyebrow">{{ room.destination }} · {{ room.country }}</div>
        <h3>{{ room.name }}</h3>
        <p>{{ room.property }} · {{ room.type }}</p>
        <div class="card-bottom">
          <b>{{ money(room.price) }} <small>/ night</small></b>
          <span>★ {{ room.rating }}</span>
        </div>
      </div>
    </a>
    <div class="card-actions">
      <a class="button small" :href="`room.html?id=${room.id}`">View stay</a>
      <button class="heart" type="button" @click="$emit('wish')">{{ saved ? '♥ Saved' : '♡ Save' }}</button>
    </div>
  </article>
</template>
