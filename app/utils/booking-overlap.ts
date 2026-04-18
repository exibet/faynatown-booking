import type { BookingTypeId } from '#shared/constants'
import type { BookingItem } from '#shared/types'
import { parseLocalDateTime, sameDay } from '#shared/utils/datetime'

/**
 * Booking / calendar-slot overlap math. Pulled out of `useBookings` so the
 * helpers are unit-testable without stubbing Nuxt composables and so the
 * composable itself stays under 100 LoC.
 */

/**
 * Converts a booking's end-datetime into an integer hour suitable for
 * overlap arithmetic against a slot's `[startHour, endHour)` range. `24:00`
 * sentinel handles bookings that end exactly at midnight (API returns
 * `T00:00:00` on the next day, which we treat as 24h on the calendar day).
 */
export function slotEndHourFromDateTime(end: Date): number {
  if (end.getHours() === 0 && end.getMinutes() === 0) return 24
  return end.getHours() + (end.getMinutes() > 0 ? 1 : 0)
}

export interface SlotScope {
  date: Date
  startHour: number
  endHour: number
  typeId: BookingTypeId
}

/**
 * Returns bookings that overlap the given (date, hour-range, type).
 * Shared helper behind `isSlotYours` and `myUnitKeysForSlot` — both needed
 * the same (typeId + sameDay + hour-overlap) filter.
 */
export function filterBookingsForSlot(
  bookings: readonly BookingItem[],
  scope: SlotScope,
): BookingItem[] {
  return bookings.filter((b) => {
    if (b.typeId !== scope.typeId) return false
    const start = parseLocalDateTime(b.start)
    const end = parseLocalDateTime(b.end)
    if (!sameDay(start, scope.date)) return false
    const slotEndHour = slotEndHourFromDateTime(end)
    return start.getHours() < scope.endHour && slotEndHour > scope.startHour
  })
}
