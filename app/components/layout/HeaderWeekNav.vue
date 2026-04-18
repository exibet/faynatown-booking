<script setup lang="ts">
import { addDays } from '#shared/utils/datetime'
import { fmtMonthDay } from '~/utils/datetime'

const { t } = useI18n()
const calendar = useCalendar()
const appLocale = useAppLocale()

const range = computed(() => {
  const start = calendar.weekAnchor.value
  const end = addDays(start, 6)
  return `${fmtMonthDay(start, appLocale.value)} — ${fmtMonthDay(end, appLocale.value)}`
})
</script>

<template>
  <div class="ft-header-center">
    <button
      type="button"
      class="ft-icon-btn"
      :aria-label="t('calendar.prev')"
      :disabled="!calendar.canPrevWeek.value"
      @click="calendar.prevWeek"
    >
      <Icon name="chevron-left" />
    </button>
    <button
      type="button"
      class="ft-today"
      @click="calendar.goToToday"
    >
      {{ t('calendar.today') }}
    </button>
    <button
      type="button"
      class="ft-icon-btn"
      :aria-label="t('calendar.next')"
      @click="calendar.nextWeek"
    >
      <Icon name="chevron-right" />
    </button>
    <span class="ft-range">{{ range }}</span>
    <OccupancyBar :week="calendar.week.value ?? []" />
  </div>
</template>
