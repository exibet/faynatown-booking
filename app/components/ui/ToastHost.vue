<script setup lang="ts">
import type { ToastItem } from '~/composables/useToast'

const { items, dismiss } = useToast()

function variantClass(item: ToastItem): string {
  return item.variant === 'error' ? 'is-error' : ''
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="ft-toast-host">
        <div
          v-for="item in items"
          :key="item.id"
          :class="['ft-toast', variantClass(item)]"
          role="status"
          aria-live="polite"
          @click="dismiss(item.id)"
        >
          {{ item.message }}
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>
