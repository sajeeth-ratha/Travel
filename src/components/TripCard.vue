<script setup>
import { money } from '../lib/ui.js'

defineProps({
  trip: { type: Object, required: true },
  saved: { type: Boolean, default: false }
})

defineEmits(['wish'])
</script>

<template>
  <article class="card">
    <a :href="`package.html?id=${trip.id}`">
      <img :src="trip.coverImage" :alt="trip.destination">
      <div class="card-body">
        <div class="eyebrow">{{ trip.continent }} · {{ trip.duration }} days</div>
        <h3>{{ trip.title }}</h3>
        <p>{{ trip.shortDescription }}</p>
        <div class="card-bottom">
          <b>{{ money(trip.price) }} <small>/ person</small></b>
          <span>★ {{ trip.rating }}</span>
        </div>
      </div>
    </a>
    <div class="card-actions">
      <a class="button small" :href="`package.html?id=${trip.id}`">View trip</a>
      <button class="heart" type="button" @click="$emit('wish')">{{ saved ? '♥ Saved' : '♡ Save' }}</button>
    </div>
  </article>
</template>
