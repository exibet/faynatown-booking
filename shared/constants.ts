export const BOOKING_TYPES = [
  { id: 1, i18nKey: 'BBQ', param: 'BBQ' },
  { id: 2, i18nKey: 'Tennis', param: 'Tennis' },
  { id: 3, i18nKey: 'Basketball', param: 'Basketball' },
  { id: 4, i18nKey: 'Volleyball', param: 'Volleyball' },
  { id: 5, i18nKey: 'Football', param: 'Football' },
  { id: 6, i18nKey: 'Paddle_Tennis', param: 'Paddle_Tennis' },
] as const

export type BookingTypeParam = typeof BOOKING_TYPES[number]['param']

export const BOOKING_TYPE_PARAMS: readonly BookingTypeParam[] = [
  'BBQ',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Football',
  'Paddle_Tennis',
]

// Slot duration per booking type, used to render calendar grid.
export const SLOT_DURATION_HOURS: Record<BookingTypeParam, number> = {
  BBQ: 4,
  Tennis: 1,
  Basketball: 1,
  Volleyball: 1,
  Football: 1,
  Paddle_Tennis: 1,
}

// Operating hours per booking type (inclusive start, exclusive end).
export const OPERATING_HOURS: Record<BookingTypeParam, { start: number, end: number }> = {
  BBQ: { start: 9, end: 21 },
  Tennis: { start: 7, end: 22 },
  Basketball: { start: 7, end: 22 },
  Volleyball: { start: 7, end: 22 },
  Football: { start: 7, end: 22 },
  Paddle_Tennis: { start: 7, end: 22 },
}

// Mandatory header on every upstream request — without it API returns 400.
export const FAYNATOWN_API_VERSION = 45

export const FAYNATOWN_BASE_URL = 'https://webapi.faynatown.com.ua/api'

// httpOnly cookie for storing the JWT (set server-side on login).
export const AUTH_COOKIE_NAME = 'faynatown_token'

// JWT from the Faynatown API lives ~90 days. Expire our cookie a day earlier
// so we force relogin before the token is actually rejected.
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 89

// Suffixes the API appends to text fields when an item is unavailable.
// We detect both and strip them when rendering.
export const UNAVAILABLE_SUFFIXES = ['(недоступно)', '(зайнято)'] as const
