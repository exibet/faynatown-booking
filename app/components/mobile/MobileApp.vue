<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import { BOOKING_TYPES } from '#shared/constants'
import type { BookingTypeId } from '#shared/constants'
import { STATE_KEY } from '#shared/state-keys'
import { addDays, sameDay, todayLocal, useToday } from '~/utils/datetime'

// Sync composables are owned by pages/index.vue (called once for both layouts).
const calendar = useCalendar()
const bookings = useBookings()

type Sheet = 'type' | 'bookings' | 'slot' | null

const dayOffset = useState<number>(STATE_KEY.MOBILE_DAY_OFFSET, () => 0)
const openSheet = useState<Sheet>(STATE_KEY.MOBILE_SHEET, () => null)
const popSlot = ref<{ cell: CalendarSlot, date: string } | null>(null)

// Initial alignment: position dayOffset so today is selected (if anchor is today).
onMounted(() => {
  const today = todayLocal()
  const anchor = calendar.weekAnchor.value
  if (sameDay(anchor, today)) {
    dayOffset.value = 0
    return
  }
  // Find today in current window — otherwise reset
  const idx = calendar.weekDates.value.findIndex(d => sameDay(d, today))
  dayOffset.value = idx >= 0 ? idx : 0
})

const today = useToday()
const currentDate = computed(() => addDays(calendar.weekAnchor.value, dayOffset.value))
const canPrevDay = computed(() => currentDate.value.getTime() > today.value.getTime())

const currentDay = computed(() => calendar.week.value?.[dayOffset.value] ?? null)

const currentTypeId = computed<BookingTypeId>(() => {
  const meta = BOOKING_TYPES.find(b => b.param === calendar.selectedType.value)
  return meta?.id ?? 6
})

function selectDay(idx: number) {
  const target = addDays(calendar.weekAnchor.value, idx)
  if (target.getTime() < today.value.getTime()) return // past — disabled
  dayOffset.value = idx
}

function nextDay() {
  if (dayOffset.value < 6) {
    dayOffset.value += 1
    return
  }
  // Past end: shift anchor forward 7 days, jump to first day
  calendar.nextWeek()
  dayOffset.value = 0
}

function prevDay() {
  if (!canPrevDay.value) return
  if (dayOffset.value > 0) {
    dayOffset.value -= 1
    return
  }
  // Only step back the week if the prior anchor still lands on today or later
  if (!calendar.canPrevWeek.value) return
  calendar.prevWeek()
  dayOffset.value = 6
}

function onSlotClick(cell: CalendarSlot) {
  if (!currentDay.value) return
  popSlot.value = { cell, date: currentDay.value.date }
  openSheet.value = 'slot'
}

function closeSheet() {
  openSheet.value = null
  if (popSlot.value) popSlot.value = null
}
</script>

<template>
  <div class="mob">
    <MobileHeader
      @open-type="openSheet = 'type'"
      @open-bookings="openSheet = 'bookings'"
    />
    <DateStrip
      :week-dates="calendar.weekDates.value"
      :selected-index="dayOffset"
      :can-prev="canPrevDay"
      @select="selectDay"
      @prev="prevDay"
      @next="nextDay"
    />
    <DayTitle :date="currentDate" />
    <SlotList
      :day="currentDay"
      :loading="calendar.pending.value"
      :type-id="currentTypeId"
      :is-slot-yours="bookings.isSlotYours"
      @slot-click="onSlotClick"
    />

    <TypePickerSheet
      :open="openSheet === 'type'"
      @close="closeSheet"
    />
    <BookingsSheet
      :open="openSheet === 'bookings'"
      @close="closeSheet"
    />
    <SlotInfoSheet
      :open="openSheet === 'slot'"
      :cell="popSlot?.cell ?? null"
      :date="popSlot?.date ?? null"
      :type="calendar.selectedType.value"
      @close="closeSheet"
    />
    <ConfirmHost />
  </div>
</template>
