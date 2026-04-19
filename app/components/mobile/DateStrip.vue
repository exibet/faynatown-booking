<script setup lang="ts">
import { formatLocalDate, isPastDay } from '#shared/utils/datetime'
import { describeWeatherCode } from '#shared/utils/weather'
import type { WeatherIconName } from '#shared/utils/weather'
import { dayShortName, useToday } from '~/utils/datetime'

const props = defineProps<{
  weekDates: readonly Date[]
  selectedIndex: number
  canPrev: boolean
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
  (e: 'prev' | 'next'): void
}>()

const { t } = useI18n()
const appLocale = useAppLocale()
const today = useToday()
const weather = useWeather()

interface DayCell {
  index: number
  date: Date
  name: string
  num: string
  isPast: boolean
  isActive: boolean
  weatherIcon: WeatherIconName | null
}

const cells = computed<DayCell[]>(() => {
  return props.weekDates.map((d, idx) => {
    const past = isPastDay(d, today.value)
    const w = past ? undefined : weather.forDate(formatLocalDate(d))
    return {
      index: idx,
      date: d,
      name: dayShortName(d, appLocale.value),
      num: String(d.getDate()).padStart(2, '0'),
      isPast: past,
      isActive: idx === props.selectedIndex,
      weatherIcon: w ? describeWeatherCode(w.code).icon : null,
    }
  })
})
</script>

<template>
  <div class="ms">
    <button
      type="button"
      class="ms-nav"
      :aria-label="t('calendar.prev')"
      :disabled="!canPrev"
      @click="emit('prev')"
    >
      <Icon name="chevron-left" />
    </button>
    <div class="ms-days">
      <button
        v-for="cell in cells"
        :key="cell.index"
        type="button"
        :class="['ms-day', { 'is-past': cell.isPast, 'is-active': cell.isActive }]"
        :disabled="cell.isPast"
        @click="emit('select', cell.index)"
      >
        <span class="ms-day-name">{{ cell.name }}</span>
        <span class="ms-day-num">{{ cell.num }}</span>
        <Icon
          v-if="cell.weatherIcon"
          :name="cell.weatherIcon"
          class="ms-day-wx"
        />
      </button>
    </div>
    <button
      type="button"
      class="ms-nav"
      :aria-label="t('calendar.next')"
      @click="emit('next')"
    >
      <Icon name="chevron-right" />
    </button>
  </div>
</template>
