<script setup lang="ts">
import type { CalendarSlot, SlotState } from '#shared/types'
import { fmtTimeHHMM } from '~/utils/datetime'

const props = defineProps<{
  cell: CalendarSlot
  state: SlotState
  pxPerMin: number
  startHour: number
}>()

const emit = defineEmits<{
  (e: 'click', payload: { cell: CalendarSlot, anchor: DOMRect }): void
}>()

const { t } = useI18n()

const top = computed(() => (props.cell.startHour * 60 - props.startHour * 60) * props.pxPerMin)
const height = computed(() => (props.cell.endHour - props.cell.startHour) * 60 * props.pxPerMin - 2)

const label = computed(() => {
  switch (props.state) {
    case 'free': return t('calendar.available')
    case 'busy': return t('calendar.unavailable')
    case 'yours': return t('calendar.mine')
    case 'past': return ''
  }
  return ''
})

const isInteractive = computed(() => props.state === 'free' || props.state === 'yours')

const time = computed(() => `${fmtTimeHHMM(props.cell.startHour * 60)}–${fmtTimeHHMM(props.cell.endHour * 60)}`)

function onClick(event: MouseEvent) {
  if (!isInteractive.value) return
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) return
  emit('click', { cell: props.cell, anchor: target.getBoundingClientRect() })
}
</script>

<template>
  <button
    type="button"
    :class="['ft-slot', `is-${state}`]"
    :style="{ top: `${top}px`, height: `${height}px` }"
    :disabled="!isInteractive"
    @click="onClick"
  >
    <span class="ft-slot-time">{{ time }}</span>
    <span
      v-if="label"
      class="ft-slot-label"
    >{{ label }}</span>
  </button>
</template>
