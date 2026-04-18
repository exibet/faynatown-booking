<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import { fmtTimeHHMM } from '~/utils/datetime'

type SlotState = 'free' | 'busy' | 'past' | 'yours'

const props = defineProps<{
  cell: CalendarSlot
  state: SlotState
}>()

const emit = defineEmits<{
  (e: 'click', cell: CalendarSlot): void
}>()

const { t } = useI18n()

const isInteractive = computed(() => props.state === 'free' || props.state === 'yours')

const startStr = computed(() => fmtTimeHHMM(props.cell.startHour * 60))
const endStr = computed(() => fmtTimeHHMM(props.cell.endHour * 60))

const label = computed(() => {
  switch (props.state) {
    case 'free': return t('calendar.available')
    case 'busy': return t('calendar.allOccupied')
    case 'yours': return t('calendar.mine')
    case 'past': return t('calendar.unavailable')
  }
  return ''
})

const cta = computed(() => {
  if (props.state === 'free') return t('app.choose')
  if (props.state === 'yours') return t('bookings.cancel')
  return ''
})
</script>

<template>
  <button
    type="button"
    :class="['mc', `is-${state}`]"
    :disabled="!isInteractive"
    @click="emit('click', cell)"
  >
    <div class="mc-time">
      <span>{{ startStr }}</span>
      <span class="mc-time-end">{{ endStr }}</span>
    </div>
    <div class="mc-body">
      <span class="mc-label">{{ label }}</span>
    </div>
    <span
      v-if="cta"
      class="mc-cta"
    >{{ cta }}</span>
  </button>
</template>
