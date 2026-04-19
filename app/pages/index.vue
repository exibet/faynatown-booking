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
/* Layout is chosen by orientation + width, not width alone — iPhone 12
   Pro landscape (844×390) and iPad portrait (834×1194) have almost the
   same width but opposite aspect ratios. Rules:
   - Portrait + narrow (<1024px): mobile single-day list (phones and
     tablets in portrait)
   - Landscape (any width) OR wide (≥1024px): desktop week-grid
   On phone landscape the grid is cramped vertically but now scrolls
   thanks to `.ft-cal-body { overflow-y: auto }`. */
@media (orientation: portrait) and (max-width: 1023px) {
  .layout-desktop { display: none; }
}
@media (orientation: landscape), (min-width: 1024px) {
  .layout-mobile { display: none; }
}
</style>
