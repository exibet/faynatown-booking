<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import { typeIdOf } from '#shared/constants'
import { STATE_KEY } from '#shared/state-keys'

interface PopoverPayload {
  cell: CalendarSlot
  date: string
  anchor: DOMRect
}

// Sync composables are owned by pages/index.vue (called once for both layouts).
// We just consume the shared state here.
const calendar = useCalendar()
const bookings = useBookings()

const popover = useState<PopoverPayload | null>(STATE_KEY.POPOVER, () => null)
const currentTypeId = computed(() => typeIdOf(calendar.selectedType.value))

function onSlotClick(payload: PopoverPayload) {
  popover.value = payload
}

function closePopover() {
  popover.value = null
}

// Keyboard nav (desktop) — Escape handled globally, arrows / h / l / t only
// trigger when focus isn't in a text field.
function onKey(event: KeyboardEvent) {
  const target = event.target
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
  switch (event.key) {
    case 'ArrowLeft':
    case 'h':
      calendar.prevWeek()
      break
    case 'ArrowRight':
    case 'l':
      calendar.nextWeek()
      break
    case 't':
      calendar.goToToday()
      break
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

useEscape(closePopover)
</script>

<template>
  <div class="ft-app">
    <AppHeader :week="calendar.week.value ?? []" />
    <div class="ft-main">
      <WeekGrid
        :week="calendar.week.value ?? []"
        :type="calendar.selectedType.value"
        :type-id="currentTypeId"
        :loading="calendar.pending.value"
        :is-slot-yours="bookings.isSlotYours"
        @slot-click="onSlotClick"
      />
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
