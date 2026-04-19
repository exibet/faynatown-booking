<script setup lang="ts">
import type { CalendarSlot, SlotState, WeatherDay } from '#shared/types'
import { OPERATING_HOURS, typeIdOf } from '#shared/constants'
import { isPastDay, parseLocalDate, sameDay } from '#shared/utils/datetime'
import { describeWeatherCode } from '#shared/utils/weather'
import { dayShortName, fmtDayDot, useToday } from '~/utils/datetime'
import { computeSlotState } from '~/utils/slot-state'

const emit = defineEmits<{
  (e: 'slot-click', payload: { cell: CalendarSlot, date: string, anchor: DOMRect }): void
}>()

const calendar = useCalendar()
const bookings = useBookings()
const weather = useWeather()
const appLocale = useAppLocale()
const today = useToday()
const { t } = useI18n()

const currentType = computed(() => calendar.selectedType.value)
const currentTypeId = computed(() => typeIdOf(currentType.value))
const currentWeek = computed(() => calendar.week.value)
const loading = computed(() => calendar.pending.value)

// Exclusive end — `OPERATING_HOURS.end = 22` means the day STOPS at 22:00,
// so the last visible row is 21:00–22:00. Adding 22:00 as its own row would
// show an empty hour after the last bookable slot.
const hours = computed(() => {
  const range = OPERATING_HOURS[currentType.value]
  const result: number[] = []
  for (let h = range.start; h < range.end; h++) result.push(h)
  return result
})

const body = useTemplateRef<HTMLElement>('body')
const rowH = useAdaptiveRowHeight(body, computed(() => hours.value.length))
const pxPerMin = computed(() => rowH.value / 60)

const startHour = computed(() => OPERATING_HOURS[currentType.value].start)

interface DayWeatherView {
  iconName: ReturnType<typeof describeWeatherCode>['icon']
  tempMin: number
  tempMax: number
  title: string
}

interface DayColumn {
  iso: string
  date: Date
  isToday: boolean
  isPast: boolean
  slots: CalendarSlot[]
  weather: DayWeatherView | null
}

function buildWeatherView(day: WeatherDay): DayWeatherView {
  const descriptor = describeWeatherCode(day.code)
  const label = t(`weather.${descriptor.i18nKey}`)
  const range = t('weather.tempRange', { min: day.tempMinC, max: day.tempMaxC })
  return {
    iconName: descriptor.icon,
    tempMin: day.tempMinC,
    tempMax: day.tempMaxC,
    title: `${label} · ${range}`,
  }
}

const days = computed<DayColumn[]>(() => {
  return currentWeek.value.map((day) => {
    const date = parseLocalDate(day.date)
    const past = isPastDay(date, today.value)
    const wx = past ? undefined : weather.forDate(day.date)
    return {
      iso: day.date,
      date,
      isToday: sameDay(date, today.value),
      isPast: past,
      slots: day.slots,
      weather: wx ? buildWeatherView(wx) : null,
    }
  })
})

function slotState(day: DayColumn, slot: CalendarSlot): SlotState {
  return computeSlotState({
    isPast: day.isPast,
    isYours: bookings.isSlotYours(day.date, slot.startHour, slot.endHour, currentTypeId.value),
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
    :class="{ 'ft-cal-stale': loading && currentWeek.length > 0 }"
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
        <div class="ft-dayhead-main">
          <span class="ft-dayhead-name">{{ dayShortName(day.date, appLocale) }}</span>
          <span class="ft-dayhead-date">{{ fmtDayDot(day.date) }}</span>
        </div>
        <span
          v-if="day.weather"
          class="ft-dayhead-weather"
          :title="day.weather.title"
        >
          <Icon :name="day.weather.iconName" />
          <span class="ft-dayhead-temp">
            <span class="ft-dayhead-temp-min">{{ day.weather.tempMin }}°</span>
            <span class="ft-dayhead-temp-max">{{ day.weather.tempMax }}°</span>
          </span>
        </span>
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
