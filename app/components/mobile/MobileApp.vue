<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import { STATE_KEY } from '#shared/state-keys'

type Sheet = 'type' | 'bookings' | 'slot' | null

interface SlotSelection {
  cell: CalendarSlot
  date: string
}

// Sync composables are owned by pages/index.vue (called once for both layouts).
const calendar = useCalendar()

const {
  dayOffset,
  currentDate,
  currentDay,
  selectDay,
  prevWeek,
  nextWeek,
  canPrevWeek,
  canNextWeek,
} = useMobileDayNav()

const openSheet = useState<Sheet>(STATE_KEY.MOBILE_SHEET, () => null)
// Same useState pattern as desktop popover (STATE_KEY.POPOVER) — one shape per
// layout because the payloads differ (desktop needs a DOMRect anchor), but
// both use the shared-state registry so any other composable can observe.
const slotSelection = useState<SlotSelection | null>(STATE_KEY.SLOT_SELECTION, () => null)

function onSlotClick(cell: CalendarSlot) {
  if (!currentDay.value) return
  slotSelection.value = { cell, date: currentDay.value.date }
  openSheet.value = 'slot'
}

function closeSheet() {
  openSheet.value = null
  slotSelection.value = null
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
      :can-prev="canPrevWeek"
      :can-next="canNextWeek"
      @select="selectDay"
      @prev="prevWeek"
      @next="nextWeek"
    />
    <DayTitle :date="currentDate" />
    <SlotList
      :day="currentDay"
      :loading="calendar.pending.value"
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
      :cell="slotSelection?.cell ?? null"
      :date="slotSelection?.date ?? null"
      :type="calendar.selectedType.value"
      @close="closeSheet"
    />
    <ConfirmHost />
  </div>
</template>
