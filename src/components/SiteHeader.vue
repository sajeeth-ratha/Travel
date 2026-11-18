<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { currentUser } from '../lib/store.js'

defineProps({
  active: { type: String, default: '' }
})

const open = ref(false)
const accountHref = computed(() => (currentUser.value ? 'panel.html' : 'login.html'))
const accountLabel = computed(() => (currentUser.value ? 'My account' : 'Login'))

function closeMenu() {
  open.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="top">
    <a class="logo" href="index.html" aria-label="Wanderlust home">
      <img src="/assets/wanderlust-mountain-logo.png" alt="Wanderlust">
    </a>
    <button
      class="menu-toggle"
      type="button"
      :aria-label="open ? 'Close navigation menu' : 'Open navigation menu'"
      aria-controls="primary-navigation"
      :aria-expanded="String(open)"
      @click="open = !open"
    >
      <span></span><span></span><span></span>
    </button>
    <nav
      id="primary-navigation"
      class="site-nav"
      :class="{ 'is-open': open }"
      aria-label="Main navigation"
    >
      <a href="index.html" :aria-current="active === 'home' ? 'page' : null" @click="closeMenu">Home</a>
      <a href="rooms.html" :aria-current="active === 'rooms' ? 'page' : null" @click="closeMenu">Stays</a>
      <a href="packages.html" :aria-current="active === 'packages' ? 'page' : null" @click="closeMenu">Trips</a>
      <a
        id="account-link"
        :href="accountHref"
        :class="{ active: active === 'account' }"
        :aria-current="active === 'account' ? 'page' : null"
        @click="closeMenu"
      >{{ accountLabel }}</a>
    </nav>
  </header>
</template>
