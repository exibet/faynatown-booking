<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: false,
})

// Title comes from `app.vue`'s `titleTemplate` fallback — no per-page `useHead`.

// Sync composables run ONCE here, not inside DesktopApp / MobileApp — both
// layouts render simultaneously (CSS hides the inactive one), so registering
// useAsyncData per layout would fire each request twice.
useCalendarSync()
useBookingsSync()
useFlatSync()
useWeatherSync()

// Both layouts render and CSS hides the inactive one — no flicker on mobile
// (UA detection is unreliable through devtools emulation; viewport-based
// CSS @media queries are deterministic on both SSR and client).
</script>

<template>
  <div class="app-shell">
    <DesktopApp class="layout-desktop" />
    <MobileApp class="layout-mobile" />
  </div>
</template>

<style scoped>
.app-shell { height: 100vh; }
@media (max-width: 799px) {
  .layout-desktop { display: none; }
}
@media (min-width: 800px) {
  .layout-mobile { display: none; }
}
</style>
