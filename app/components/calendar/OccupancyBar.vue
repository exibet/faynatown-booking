<script setup lang="ts">
import type { CalendarWeek } from '#shared/types'
import { parseLocalDate } from '#shared/utils/datetime'
import { dayShortName } from '~/utils/datetime'

interface DayStat {
  busyPct: number
  label: string
}

const props = defineProps<{
  week: CalendarWeek
}>()

const { t } = useI18n()
const appLocale = useAppLocale()

/**
 * Heatmap shows per-day busyness derived from boolean availability counts.
 * Real per-zone counts would require N×slots×7 extra requests, which is
 * out of scope (see decisions in PLAN.md / chat). This boolean-based score
 * is a reasonable proxy.
 */
const stats = computed<DayStat[]>(() => {
  return props.week.map((day) => {
    if (!day || day.slots.length === 0) {
      return { busyPct: 0, label: '' }
    }
    const date = parseLocalDate(day.date)
    const total = day.slots.length
    const free = day.slots.filter(s => s.available).length
    const busyPct = total === 0 ? 0 : 1 - free / total
    return {
      busyPct,
      label: dayShortName(date, appLocale.value),
    }
  })
})
</script>

<template>
  <div
    class="ft-occbar"
    :title="t('calendar.occupancy')"
  >
    <span class="ft-occbar-label">{{ t('calendar.occupancy') }}</span>
    <div class="ft-occbar-cells">
      <div
        v-for="(stat, i) in stats"
        :key="i"
        class="ft-occbar-cell"
        :style="{ '--busy-pct': stat.busyPct }"
        :title="`${Math.round(stat.busyPct * 100)}%`"
      >
        <span>{{ stat.label }}</span>
      </div>
    </div>
  </div>
</template>
