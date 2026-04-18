<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import { STATE_KEY } from '#shared/state-keys'

interface PopoverPayload {
  cell: CalendarSlot
  date: string
  anchor: DOMRect
}

// Sync composables are owned by pages/index.vue (called once for both layouts).
// We just consume the shared state here.
const calendar = useCalendar()

const popover = useState<PopoverPayload | null>(STATE_KEY.POPOVER, () => null)

function onSlotClick(payload: PopoverPayload) {
  popover.value = payload
}

function closePopover() {
  popover.value = null
}

useEscape(closePopover)
useKeyboardNav({
  ArrowLeft: calendar.prevWeek,
  h: calendar.prevWeek,
  ArrowRight: calendar.nextWeek,
  l: calendar.nextWeek,
  t: calendar.goToToday,
})
</script>

<template>
  <div class="ft-app">
    <AppHeader />
    <div class="ft-main">
      <WeekGrid @slot-click="onSlotClick" />
      <MyBookingsSidebar />
    </div>
    <BookingPopover
      v-if="popover"
      :cell="popover.cell"
      :date="popover.date"
      :type="calendar.selectedType.value"
      :anchor="popover.anchor"
      @close="closePopover"
    />
    <ConfirmHost />
  </div>
</template>
