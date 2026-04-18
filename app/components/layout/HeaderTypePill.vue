<script setup lang="ts">
import { BOOKING_TYPES } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle' | 'close'): void
}>()

const { t } = useI18n()
const calendar = useCalendar()
const bookingTypeLabel = useBookingTypeLabel()

const typeOptions = computed(() => BOOKING_TYPES
  .filter(b => b.visible)
  .map((b) => {
    const unitsLabel = b.unitLabel === 'court' ? t('types.courts') : t('types.zones')
    return {
      value: b.param,
      label: t(`types.${b.i18nKey}`),
      meta: `${b.unitCount} ${unitsLabel}`,
    }
  }))

const selectedLabel = computed(() => bookingTypeLabel(calendar.selectedType.value))

function onSelect(value: BookingTypeParam) {
  calendar.setType(value)
  emit('close')
}
</script>

<template>
  <div
    class="ft-pill"
    @click="emit('toggle')"
  >
    <span class="ft-pill-label">{{ t('header.type') }}</span>
    <span class="ft-pill-value">{{ selectedLabel }}</span>
    <Icon
      name="chevron-down"
      class="ft-pill-chev"
      :size="12"
    />
    <Dropdown
      :open="open"
      :options="typeOptions"
      :selected-value="calendar.selectedType.value"
      @select="onSelect"
      @close="emit('close')"
    />
  </div>
</template>
