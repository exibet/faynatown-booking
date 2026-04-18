<script setup lang="ts">
import type { CalendarDay, CalendarSlot } from '#shared/types'
import type { BookingTypeId } from '#shared/constants'
import { parseLocalDate, sameDay, useToday } from '~/utils/datetime'

const props = defineProps<{
  day: CalendarDay | null
  loading: boolean
  typeId: BookingTypeId
  isSlotYours: (date: Date, startHour: number, endHour: number, typeId: BookingTypeId) => boolean
}>()

const emit = defineEmits<{
  (e: 'slot-click', cell: CalendarSlot): void
}>()

const { t } = useI18n()

interface DayMeta {
  date: Date
  isPast: boolean
}

const today = useToday()
const dayMeta = computed<DayMeta | null>(() => {
  if (!props.day) return null
  const date = parseLocalDate(props.day.date)
  return {
    date,
    isPast: date < today.value && !sameDay(date, today.value),
  }
})

function slotState(slot: CalendarSlot): 'free' | 'busy' | 'past' | 'yours' {
  if (!dayMeta.value) return 'busy'
  if (dayMeta.value.isPast) return 'past'
  if (props.isSlotYours(dayMeta.value.date, slot.startHour, slot.endHour, props.typeId)) return 'yours'
  if (!slot.available) return 'busy'
  return 'free'
}
</script>

<template>
  <div :class="['ml-wrap', { 'is-stale': loading && day }]">
    <div
      v-if="loading"
      class="ml-progress"
    />
    <div class="ml">
      <template v-if="loading && !day">
        <div
          v-for="n in 6"
          :key="n"
          class="ft-skel mc-skel"
        />
      </template>

      <div
        v-else-if="!day || day.slots.length === 0"
        class="ml-empty"
      >
        {{ t('calendar.noSlots') }}
      </div>

      <SlotCard
        v-for="slot in day?.slots"
        v-else
        :key="slot.startHour"
        :cell="slot"
        :state="slotState(slot)"
        @click="emit('slot-click', $event)"
      />
    </div>
  </div>
</template>
