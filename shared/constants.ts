/**
 * Booking types — the canonical list ships from upstream `/api/booking/types`,
 * but the IDs and `param` strings never change so we hardcode them here for
 * type-safety. `i18nKey` indexes into `i18n/locales/<lang>.json#types`.
 *
 * `unitLabel` controls how UI labels individual zones — courts (Майданчик 1)
 * vs. zones (Бесідка 1). `slotMinutes` is the upstream slot length used for
 * positional grid math (top/height calculations).
 */
// `unitCount` — hardcoded number of physical units (courts/gazebos) per
// booking type. Pulled from the upstream zones endpoint sample in
// docs/API.md; approximate for types we haven't observed yet (Basketball /
// Volleyball / Football → assume single court). Update when upstream
// expands or shrinks the property.
export const BOOKING_TYPES = [
  { id: 1, i18nKey: 'BBQ', param: 'BBQ', unitLabel: 'zone', slotMinutes: 240, unitCount: 16 },
  { id: 2, i18nKey: 'Tennis', param: 'Tennis', unitLabel: 'court', slotMinutes: 60, unitCount: 1 },
  { id: 3, i18nKey: 'Basketball', param: 'Basketball', unitLabel: 'court', slotMinutes: 60, unitCount: 1 },
  { id: 4, i18nKey: 'Volleyball', param: 'Volleyball', unitLabel: 'court', slotMinutes: 60, unitCount: 1 },
  { id: 5, i18nKey: 'Football', param: 'Football', unitLabel: 'court', slotMinutes: 60, unitCount: 2 },
  { id: 6, i18nKey: 'Paddle_Tennis', param: 'Paddle_Tennis', unitLabel: 'court', slotMinutes: 60, unitCount: 2 },
] as const

export type BookingTypeParam = typeof BOOKING_TYPES[number]['param']
export type BookingTypeId = typeof BOOKING_TYPES[number]['id']
export type BookingUnitLabel = typeof BOOKING_TYPES[number]['unitLabel']

// Tuple (not array) so Zod's `z.enum` accepts it without a cast.
export const BOOKING_TYPE_PARAMS = [
  'BBQ',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Football',
  'Paddle_Tennis',
] as const satisfies readonly BookingTypeParam[]

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

// Type IDs that the UI dropdown skips. Tennis (2) physically shares the
// court with Volleyball (4); Volleyball is the canonical filter so users
// only see one option.
export const HIDDEN_TYPE_IDS: readonly BookingTypeId[] = [2]

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

// Public link to the official KAN mobile app — popover/sheet CTAs route the
// user there because /booking/bookZone requires reCAPTCHA bound to the
// mobile app bundle (web cannot create bookings, see docs/API.md).
export const KAN_APP_URL_IOS = 'https://apps.apple.com/ua/app/kan-developer/id1525116681'
export const KAN_APP_URL_ANDROID = 'https://play.google.com/store/apps/details?id=com.kandevelopment.Kan'
