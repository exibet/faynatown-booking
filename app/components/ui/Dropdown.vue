<script setup lang="ts" generic="T extends string | number">
/**
 * Generic dropdown menu. Anchored to its parent container — caller wraps
 * the trigger (.ft-pill, .ft-icon-btn, etc.) and toggles `open` themselves.
 * Click-outside auto-close is wired here so consumers don't reimplement it.
 */
interface Option {
  value: T
  label: string
  meta?: string
}

const props = defineProps<{
  open: boolean
  options: Option[]
  selectedValue?: T | null
}>()

const emit = defineEmits<{
  (e: 'select', value: T): void
  (e: 'close'): void
}>()

const root = ref<HTMLElement | null>(null)

function onClickOutside(event: MouseEvent) {
  if (!props.open) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (root.value?.contains(target)) return
  emit('close')
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<template>
  <div
    v-if="open"
    ref="root"
    class="ft-menu"
    role="menu"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="['ft-menu-item', { 'is-active': option.value === selectedValue }]"
      role="menuitemradio"
      :aria-checked="option.value === selectedValue"
      @click="emit('select', option.value)"
    >
      <span>{{ option.label }}</span>
      <span
        v-if="option.meta"
        class="ft-menu-meta"
      >{{ option.meta }}</span>
    </button>
  </div>
</template>
