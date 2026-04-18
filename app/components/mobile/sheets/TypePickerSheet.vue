<script setup lang="ts">
import { BOOKING_TYPES } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const calendar = useCalendar()

const visibleTypes = computed(() => BOOKING_TYPES.filter(b => b.visible))

function pick(type: BookingTypeParam) {
  calendar.setType(type)
  emit('close')
}
</script>

<template>
  <BottomSheet
    :open="open"
    :title="t('header.type')"
    @close="emit('close')"
  >
    <button
      v-for="meta in visibleTypes"
      :key="meta.id"
      type="button"
      :class="['sh-item', { 'is-active': calendar.selectedType.value === meta.param }]"
      @click="pick(meta.param)"
    >
      <span class="sh-item-title">{{ t(`types.${meta.i18nKey}`) }}</span>
      <span class="sh-item-meta">
        {{ meta.unitCount }} {{ meta.unitLabel === 'court' ? t('types.courts') : t('types.zones') }}
      </span>
    </button>
  </BottomSheet>
</template>
