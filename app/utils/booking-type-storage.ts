import { BOOKING_TYPE_PARAMS, BOOKING_TYPE_STORAGE_KEY } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'

/**
 * Persistent store for the last-picked booking type. Mirrors the contract of
 * `auth-storage.ts` — `import.meta.client` + `try/catch` so SSR and Safari
 * private mode degrade silently to the in-memory default.
 *
 * Reads are validated against `BOOKING_TYPE_PARAMS` so a stale / hand-edited
 * localStorage value can never smuggle an unknown string into state; an
 * unknown value is treated as absent and the caller falls back to the default.
 */

function isBookingTypeParam(value: string): value is BookingTypeParam {
  return (BOOKING_TYPE_PARAMS as readonly string[]).includes(value)
}

export function getStoredBookingType(): BookingTypeParam | null {
  if (!import.meta.client) return null
  try {
    const v = localStorage.getItem(BOOKING_TYPE_STORAGE_KEY)
    return v && isBookingTypeParam(v) ? v : null
  }
  catch {
    return null
  }
}

export function setStoredBookingType(type: BookingTypeParam): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(BOOKING_TYPE_STORAGE_KEY, type)
  }
  catch {
    // best-effort — see auth-storage module doc
  }
}
