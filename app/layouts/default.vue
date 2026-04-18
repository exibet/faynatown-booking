<script setup lang="ts">
// Layout is intentionally bare — calendar pages own their full-viewport shell
// (.ft-app for desktop, .mob for mobile). Wrapped in a div so Vue's
// no-multiple-template-root rule allows the slot.
</script>

<template>
  <div>
    <slot />
  </div>
</template>
