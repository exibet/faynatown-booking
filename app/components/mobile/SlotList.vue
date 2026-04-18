<script setup lang="ts">
import type { CalendarDay, CalendarSlot, SlotState } from '#shared/types'
import { typeIdOf } from '#shared/constants'
import { isPastDay, parseLocalDate } from '#shared/utils/datetime'
import { useToday } from '~/utils/datetime'
import { computeSlotState } from '~/utils/slot-state'

const props = defineProps<{
  day: CalendarDay | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'slot-click', cell: CalendarSlot): void
}>()

const { t } = useI18n()
const calendar = useCalendar()
const bookings = useBookings()
const today = useToday()

const typeId = computed(() => typeIdOf(calendar.selectedType.value))

interface DayMeta {
  date: Date
  isPast: boolean
}

const dayMeta = computed<DayMeta | null>(() => {
  if (!props.day) return null
  const date = parseLocalDate(props.day.date)
  return {
    date,
    isPast: isPastDay(date, today.value),
  }
})

function slotState(slot: CalendarSlot): SlotState {
  if (!dayMeta.value) return 'busy'
  return computeSlotState({
    isPast: dayMeta.value.isPast,
    isYours: bookings.isSlotYours(dayMeta.value.date, slot.startHour, slot.endHour, typeId.value),
    available: slot.available,
  })
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
