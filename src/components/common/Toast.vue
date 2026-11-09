<template>
  <!-- Toast Notification Container (Floating in top-right) -->
  <aside aria-live="polite" class="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'pointer-events-auto p-3.5 rounded-xl shadow-lg border flex items-start gap-3 transition-all duration-300 transform',
        toast.type === 'success' ? 'bg-white border-emerald-300 text-emerald-950' :
        toast.type === 'error' ? 'bg-white border-rose-300 text-rose-950' :
        toast.type === 'warning' ? 'bg-white border-amber-300 text-amber-950' :
        'bg-white border-primary-300 text-slate-900'
      ]"
    >
      <!-- Crisp SVG Icon Indicator -->
      <div
        :class="[
          'w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5',
          toast.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
          toast.type === 'error' ? 'bg-rose-100 text-rose-700' :
          toast.type === 'warning' ? 'bg-amber-100 text-amber-700' :
          'bg-primary-100 text-primary-700'
        ]"
      >
        <AppIcon
          :name="toast.type === 'success' ? 'check' : toast.type === 'error' ? 'x' : toast.type === 'warning' ? 'alert' : 'info'"
          class="w-3.5 h-3.5"
        />
      </div>

      <!-- Notification Message -->
      <div class="flex-1 text-xs font-medium leading-relaxed">
        {{ toast.message }}
      </div>

      <!-- Close Button -->
      <button
        @click="removeToast(toast.id)"
        class="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
        aria-label="Close notification"
      >
        <AppIcon name="x" class="w-3.5 h-3.5" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { toasts, removeToast } from '../../services/toastService.js'
import AppIcon from './AppIcon.vue'
</script>
