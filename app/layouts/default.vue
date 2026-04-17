<script setup lang="ts">
// Default layout is currently a bare shell. Phase 5 will add AppHeader
// with calendar controls (type filter, week nav, theme toggle, logout).
</script>

<template>
  <div class="layout-root">
    <slot />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.layout-root {
  @apply min-h-screen bg-white text-zinc-900 transition-colors;
  @apply dark:bg-zinc-950 dark:text-zinc-100;
}
</style>
