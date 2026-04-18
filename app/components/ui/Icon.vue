<script setup lang="ts">
/**
 * Tiny inline SVG icon set. We avoid pulling Lucide/Tabler as a dependency —
 * the design only needs a handful of functional icons and shipping our own
 * keeps the bundle a few hundred KB lighter. All glyphs are 24×24 viewBox,
 * 1.5px stroke to match the design (thin-stroke).
 */
type IconName
  = | 'chevron-down'
    | 'chevron-left'
    | 'chevron-right'
    | 'close'
    | 'sun'
    | 'moon'
    | 'user'
    | 'calendar'
    | 'refresh'

defineProps<{
  name: IconName
  size?: number
}>()
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'chevron-down'">
      <polyline points="6 9 12 15 18 9" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <polyline points="15 18 9 12 15 6" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <polyline points="9 18 15 12 9 6" />
    </template>
    <template v-else-if="name === 'close'">
      <line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
      />
      <line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
      />
    </template>
    <template v-else-if="name === 'sun'">
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <line
        x1="12"
        y1="2"
        x2="12"
        y2="4"
      />
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="22"
      />
      <line
        x1="2"
        y1="12"
        x2="4"
        y2="12"
      />
      <line
        x1="20"
        y1="12"
        x2="22"
        y2="12"
      />
      <line
        x1="4.93"
        y1="4.93"
        x2="6.34"
        y2="6.34"
      />
      <line
        x1="17.66"
        y1="17.66"
        x2="19.07"
        y2="19.07"
      />
      <line
        x1="4.93"
        y1="19.07"
        x2="6.34"
        y2="17.66"
      />
      <line
        x1="17.66"
        y1="6.34"
        x2="19.07"
        y2="4.93"
      />
    </template>
    <template v-else-if="name === 'moon'">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </template>
    <template v-else-if="name === 'user'">
      <circle
        cx="12"
        cy="8"
        r="4"
      />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
      />
      <line
        x1="8"
        y1="3"
        x2="8"
        y2="7"
      />
      <line
        x1="16"
        y1="3"
        x2="16"
        y2="7"
      />
    </template>
    <template v-else-if="name === 'refresh'">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </template>
  </svg>
</template>
