/**
 * Shared picker state for the booking selection surfaces (desktop
 * `BookingPopover` and mobile `SlotInfoSheet`). Both screens walk the user
 * through the same flow — pick a tile, press "Забронювати", see the
 * captcha-block notice — so the state lives here, not duplicated per screen.
 */
export interface PickedTile {
  area: number
  unit: number
}

export function useBookingPicker(): {
  picked: Ref<PickedTile | null>
  noticeOpen: Ref<boolean>
  pick: (tile: PickedTile) => void
  requestBooking: () => void
  reset: () => void
} {
  const picked = ref<PickedTile | null>(null)
  const noticeOpen = ref(false)

  function pick(tile: PickedTile): void {
    picked.value = tile
    noticeOpen.value = false
  }

  function requestBooking(): void {
    if (!picked.value) return
    noticeOpen.value = true
  }

  function reset(): void {
    picked.value = null
    noticeOpen.value = false
  }

  return { picked, noticeOpen, pick, requestBooking, reset }
}
