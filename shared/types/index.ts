// ---------------------------------------------------------------------------
// Faynatown API response types
//
// Preserve API quirks exactly — do NOT rename `isAvaliable` (typo is real).
// Dates come as `2026-04-17T00:00:00` (no timezone) — parse as local time.
// ---------------------------------------------------------------------------

export interface Flat {
  flatId: string
  complexId: number
  address: string
  gekaNumber: string
  validationMessage?: string
  isAvaliable?: boolean
}

export interface BookingTypeResponse {
  id: number
  description: string
  validationMessage: string
}

export interface DateSlotResponse {
  id?: number
  date: string
  dateValidated: string
  isAvaliable?: boolean
}

export interface TimeSlotResponse {
  slotValidated: string
  isAvaliable?: boolean
}

export interface ZoneResponse {
  id: number
  name: string
  isAvaliable?: boolean
}

export interface BookingResponse {
  id: number
  zoneName: string
  complexName: string
  bookingStart: string
  bookingEnd: string
  bookingStartStr: string
  bookingDetails: string
  allowDelete?: boolean
  showDeleteButton?: boolean
  type: number
  typeIconName: string
  statusColor: string
  deleteIconName: string
  isActive?: boolean
  isNotActive?: boolean
  notAllowDelete?: boolean
}

// ---------------------------------------------------------------------------
// Aggregated types for our calendar (produced by server routes)
// ---------------------------------------------------------------------------

export interface CalendarSlot {
  time: string
  startHour: number
  endHour: number
  available: boolean
  rawLabel: string
}

export interface CalendarDay {
  date: string
  slots: CalendarSlot[]
}

export type CalendarWeek = CalendarDay[]

/** One of the four states a calendar slot can be rendered in. */
export type SlotState = 'free' | 'busy' | 'past' | 'yours'

export interface ZoneItem {
  id: number
  name: string
  available: boolean
}

/**
 * Client-facing booking shape. Produced by `server/api/bookings.get.ts` from
 * `BookingResponse` — boolean-nullable flags (`isActive?`, `allowDelete?`) are
 * normalised to strict booleans there so the client can rely on them.
 */
export interface BookingItem {
  id: number
  zoneName: string
  complexName: string
  start: string
  end: string
  details: string
  typeId: number
  isActive: boolean
  canCancel: boolean
}
