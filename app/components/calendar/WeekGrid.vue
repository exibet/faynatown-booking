<script setup lang="ts">
import type { CalendarSlot, CalendarWeek, SlotState } from '#shared/types'
import { OPERATING_HOURS } from '#shared/constants'
import type { BookingTypeId, BookingTypeParam } from '#shared/constants'
import { parseLocalDate, sameDay } from '#shared/utils/datetime'
import { dayShortName, fmtDayDot, useToday } from '~/utils/datetime'
import { computeSlotState } from '~/utils/slot-state'

const props = defineProps<{
  week: CalendarWeek
  type: BookingTypeParam
  typeId: BookingTypeId
  loading: boolean
  isSlotYours: (date: Date, startHour: number, endHour: number, typeId: BookingTypeId) => boolean
}>()

const emit = defineEmits<{
  (e: 'slot-click', payload: { cell: CalendarSlot, date: string, anchor: DOMRect }): void
}>()

const appLocale = useAppLocale()
const today = useToday()

// Exclusive end — `OPERATING_HOURS.end = 22` means the day STOPS at 22:00,
// so the last visible row is 21:00–22:00. Adding 22:00 as its own row would
// show an empty hour after the last bookable slot.
const hours = computed(() => {
  const range = OPERATING_HOURS[props.type]
  const result: number[] = []
  for (let h = range.start; h < range.end; h++) result.push(h)
  return result
})

// Adaptive row height — fits all hours into the visible viewport (no scroll).
// Falls back to 64px ("normal" density) on SSR where the viewport is
// unknown; ResizeObserver upscales to roomy as soon as the client measures
// real available space. The jump is brief and only happens once per mount.
const MIN_ROW_H = 44
const FALLBACK_ROW_H = 80
const body = useTemplateRef<HTMLElement>('body')
const rowH = ref(FALLBACK_ROW_H)
const pxPerMin = computed(() => rowH.value / 60)

function recompute(): void {
  if (!body.value) return
  const available = body.value.clientHeight
  if (available <= 0) return
  const next = Math.max(MIN_ROW_H, Math.floor(available / hours.value.length))
  rowH.value = next
}

let observer: ResizeObserver | null = null

onMounted(() => {
  // Pre-paint sync: measure once before the browser renders so the cards
  // start at the correct size. ResizeObserver picks up later changes.
  recompute()
  if (!body.value || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(() => recompute())
  observer.observe(body.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(hours, () => recompute(), { flush: 'post' })

const startHour = computed(() => OPERATING_HOURS[props.type].start)

interface DayColumn {
  iso: string
  date: Date
  isToday: boolean
  isPast: boolean
  slots: CalendarSlot[]
}

const days = computed<DayColumn[]>(() => {
  return props.week.map((day) => {
    const date = parseLocalDate(day.date)
    return {
      iso: day.date,
      date,
      isToday: sameDay(date, today.value),
      isPast: date < today.value && !sameDay(date, today.value),
      slots: day.slots,
    }
  })
})

function slotState(day: DayColumn, slot: CalendarSlot): SlotState {
  return computeSlotState({
    isPast: day.isPast,
    isYours: props.isSlotYours(day.date, slot.startHour, slot.endHour, props.typeId),
    available: slot.available,
  })
}

function onSlotClick(day: DayColumn, payload: { cell: CalendarSlot, anchor: DOMRect }) {
  emit('slot-click', { cell: payload.cell, date: day.iso, anchor: payload.anchor })
}
</script>

<template>
  <div
    class="ft-cal"
    :class="{ 'ft-cal-stale': loading && week.length > 0 }"
  >
    <div
      v-if="loading"
      class="ft-cal-progress"
    />
    <div class="ft-cal-head">
      <div class="ft-cal-corner" />
      <div
        v-for="day in days"
        :key="day.iso"
        :class="['ft-dayhead', { 'is-today': day.isToday }]"
      >
        <span class="ft-dayhead-name">{{ dayShortName(day.date, appLocale) }}</span>
        <span class="ft-dayhead-date">{{ fmtDayDot(day.date) }}</span>
      </div>
    </div>

    <div
      ref="body"
      class="ft-cal-body"
      :style="{ '--row-h': `${rowH}px` }"
    >
      <div class="ft-cal-times">
        <div
          v-for="h in hours"
          :key="h"
          class="ft-timerow"
        >
          <span class="ft-timelabel">{{ String(h).padStart(2, '0') }}:00</span>
        </div>
      </div>

      <div
        v-for="day in days"
        :key="day.iso"
        :class="['ft-daycol', { 'is-today': day.isToday }]"
      >
        <div
          v-for="h in hours"
          :key="h"
          class="ft-hourline"
        />
        <SlotButton
          v-for="slot in day.slots"
          :key="`${day.iso}-${slot.startHour}`"
          :cell="slot"
          :state="slotState(day, slot)"
          :px-per-min="pxPerMin"
          :start-hour="startHour"
          @click="onSlotClick(day, $event)"
        />
        <CurrentTimeIndicator
          v-if="day.isToday"
          :px-per-min="pxPerMin"
          :start-hour="startHour"
        />
      </div>
    </div>
  </div>
</template>
