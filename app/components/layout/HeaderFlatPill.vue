<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle' | 'close'): void
}>()

const { t } = useI18n()
const flat = useFlat()

const flatOptions = computed(() => flat.flats.value.map(f => ({
  value: f.flatId,
  label: f.address,
})))

function onSelect(value: string) {
  flat.select(value)
  emit('close')
}

function onClick() {
  if (!flat.hasMultiple.value) return
  emit('toggle')
}
</script>

<template>
  <div
    v-if="flat.selectedFlat.value"
    class="ft-pill ft-pill-flat"
    :style="!flat.hasMultiple.value ? { cursor: 'default' } : undefined"
    @click="onClick"
  >
    <span class="ft-pill-label">{{ t('header.flat') }}</span>
    <span class="ft-pill-value">{{ flat.selectedFlat.value.address }}</span>
    <Icon
      v-if="flat.hasMultiple.value"
      name="chevron-down"
      class="ft-pill-chev"
      :size="12"
    />
    <Dropdown
      :open="open"
      :options="flatOptions"
      :selected-value="flat.selectedFlat.value.flatId"
      @select="onSelect"
      @close="emit('close')"
    />
  </div>
</template>
