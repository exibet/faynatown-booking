<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import { typeIdOf } from '#shared/constants'
import { STATE_KEY } from '#shared/state-keys'

type Sheet = 'type' | 'bookings' | 'slot' | null

// Sync composables are owned by pages/index.vue (called once for both layouts).
const calendar = useCalendar()
const bookings = useBookings()

const { dayOffset, currentDate, currentDay, canPrevDay, selectDay, nextDay, prevDay } = useMobileDayNav()

const openSheet = useState<Sheet>(STATE_KEY.MOBILE_SHEET, () => null)
const popSlot = ref<{ cell: CalendarSlot, date: string } | null>(null)

const currentTypeId = computed(() => typeIdOf(calendar.selectedType.value))

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
