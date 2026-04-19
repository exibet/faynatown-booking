<script setup lang="ts">
import { formatLocalDate, isPastDay } from '#shared/utils/datetime'
import { describeWeatherCode } from '#shared/utils/weather'
import { dayLongName, dayRelation, fmtMonthDay, useToday } from '~/utils/datetime'

const props = defineProps<{
  date: Date
}>()

const { t } = useI18n()
const appLocale = useAppLocale()
const today = useToday()
const weather = useWeather()

const title = computed(() => {
  const relation = dayRelation(props.date)
  if (relation === 'today') return t('calendar.today')
  if (relation === 'tomorrow') return t('calendar.tomorrow')
  return dayLongName(props.date, appLocale.value)
})
const dateStr = computed(() => fmtMonthDay(props.date, appLocale.value))

const wx = computed(() => {
  if (isPastDay(props.date, today.value)) return null
  const day = weather.forDate(formatLocalDate(props.date))
  if (!day) return null
  const descriptor = describeWeatherCode(day.code)
  return {
    icon: descriptor.icon,
    label: t(`weather.${descriptor.i18nKey}`),
    range: t('weather.tempRange', { min: day.tempMinC, max: day.tempMaxC }),
  }
})
</script>

<template>
  <div class="mt">
    <h1>{{ title }}</h1>
    <span class="mt-date">{{ dateStr }}</span>
    <span
      v-if="wx"
      class="mt-wx"
      :aria-label="`${wx.label} ${wx.range}`"
    >
      <Icon :name="wx.icon" />
      <span class="mt-wx-range">{{ wx.range }}</span>
    </span>
  </div>
</template>
