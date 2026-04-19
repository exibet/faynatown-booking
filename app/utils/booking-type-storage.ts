import { BOOKING_TYPE_PARAMS, BOOKING_TYPE_STORAGE_KEY } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'
import { createSafeStorage } from '~/utils/safe-storage'

/**
 * Persistent store for the last-picked booking type. SSR + private-mode
 * guards come from `createSafeStorage`; this module layers the domain
 * validation on top — a stale / hand-edited localStorage value is treated
 * as absent so `useCalendar` falls back to `DEFAULT_BOOKING_TYPE` instead
 * of smuggling an unknown string into state.
 */

const store = createSafeStorage(BOOKING_TYPE_STORAGE_KEY)

function isBookingTypeParam(value: string): value is BookingTypeParam {
  return (BOOKING_TYPE_PARAMS as readonly string[]).includes(value)
}

export function getStoredBookingType(): BookingTypeParam | null {
  const v = store.get()
  return v && isBookingTypeParam(v) ? v : null
}

export function setStoredBookingType(type: BookingTypeParam): void {
  store.set(type)
}
