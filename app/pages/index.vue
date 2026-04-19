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
/* `100dvh` = dynamic viewport height; accounts for iOS Safari's collapsing
   URL bar whereas `100vh` locks to the post-collapse height and overflows
   on load. */
.app-shell { height: 100dvh; }
/* Desktop week-grid is designed for mouse hover + keyboard nav with all
   15 hourly rows fitting into viewport (see `useAdaptiveRowHeight`). On
   touch devices, single-day focus + natural scroll is a better UX —
   route iPad portrait (834px) and smaller into the mobile layout by
   flipping the breakpoint to the iPad-landscape boundary (1024px). */
@media (max-width: 1023px) {
  .layout-desktop { display: none; }
}
@media (min-width: 1024px) {
  .layout-mobile { display: none; }
}
</style>
