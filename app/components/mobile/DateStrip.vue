<script setup lang="ts">
import { dayShortName, sameDay, useToday } from '~/utils/datetime'

const props = defineProps<{
  weekDates: readonly Date[]
  selectedIndex: number
  canPrev: boolean
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
  (e: 'prev' | 'next'): void
}>()

const { t, locale } = useI18n()
const today = useToday()

interface DayCell {
  index: number
  date: Date
  name: string
  num: string
  isPast: boolean
  isActive: boolean
}

const cells = computed<DayCell[]>(() => {
  return props.weekDates.map((d, idx) => ({
    index: idx,
    date: d,
    name: dayShortName(d, locale.value === 'uk' ? 'uk' : 'en'),
    num: String(d.getDate()).padStart(2, '0'),
    isPast: d < today.value && !sameDay(d, today.value),
    isActive: idx === props.selectedIndex,
  }))
})
</script>

<template>
  <div class="ms">
    <button
      type="button"
      class="ms-nav"
      :aria-label="t('calendar.prevDay')"
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
      </button>
    </div>
    <button
      type="button"
      class="ms-nav"
      :aria-label="t('calendar.nextDay')"
      @click="emit('next')"
    >
      <Icon name="chevron-right" />
    </button>
  </div>
</template>
