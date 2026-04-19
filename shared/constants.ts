/**
 * Booking types — the canonical list ships from upstream `/api/booking/types`,
 * but the IDs and `param` strings never change so we hardcode them here for
 * type-safety. `i18nKey` indexes into `i18n/locales/<lang>.json#types`.
 *
 * `unitLabel` controls how UI labels individual zones — courts (Майданчик 1)
 * vs. zones (Бесідка 1). `slotMinutes` is the upstream slot length used for
 * positional grid math (top/height calculations). `unitCount` is the number
 * of physical units (courts/gazebos) per booking type — pulled from the
 * upstream zones endpoint sample in docs/API.md; approximate for types
 * we haven't observed (Basketball / Volleyball → assume single court).
 * `visible` controls whether the type appears in the UI dropdown/sheet:
 * Tennis (2) physically shares the court with Volleyball (4), so Volleyball
 * is the canonical filter and Tennis is hidden — users only see one option.
 */
export const BOOKING_TYPES = [
  {
    id: 1,
    i18nKey: 'BBQ',
    param: 'BBQ',
    unitLabel: 'zone',
    slotMinutes: 240,
    unitCount: 16,
    visible: true,
  },
  {
    id: 2,
    i18nKey: 'Tennis',
    param: 'Tennis',
    unitLabel: 'court',
    slotMinutes: 60,
    unitCount: 1,
    visible: false,
  },
  {
    id: 3,
    i18nKey: 'Basketball',
    param: 'Basketball',
    unitLabel: 'court',
    slotMinutes: 60,
    unitCount: 1,
    visible: true,
  },
  {
    id: 4,
    i18nKey: 'Volleyball',
    param: 'Volleyball',
    unitLabel: 'court',
    slotMinutes: 60,
    unitCount: 1,
    visible: true,
  },
  {
    id: 5,
    i18nKey: 'Football',
    param: 'Football',
    unitLabel: 'court',
    slotMinutes: 60,
    unitCount: 2,
    visible: true,
  },
  {
    id: 6,
    i18nKey: 'Paddle_Tennis',
    param: 'Paddle_Tennis',
    unitLabel: 'court',
    slotMinutes: 60,
    unitCount: 2,
    visible: true,
  },
] as const

export type BookingType = typeof BOOKING_TYPES[number]
export type BookingTypeParam = BookingType['param']
export type BookingTypeId = BookingType['id']
export type BookingUnitLabel = BookingType['unitLabel']

/**
 * Default type when user state is empty — first item of the type list,
 *  matching the first chip the user sees in the picker. Overridden on the
 *  client by the last-remembered type from `BOOKING_TYPE_STORAGE_KEY`.
 */
export const DEFAULT_BOOKING_TYPE: BookingTypeParam = BOOKING_TYPES[0].param

// Tuple (not array) so Zod's `z.enum` accepts it without a cast.
export const BOOKING_TYPE_PARAMS = [
  'BBQ',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Football',
  'Paddle_Tennis',
] as const satisfies readonly BookingTypeParam[]

/** Look up a booking type by its `param` string. */
export function findBookingType(param: BookingTypeParam): BookingType | undefined {
  return BOOKING_TYPES.find(b => b.param === param)
}

/**
 * Returns the id for a booking-type param. `BookingTypeParam` is the exact
 * union of `BOOKING_TYPES[n].param` literals, so the lookup is guaranteed at
 * compile time — the runtime throw is a defensive guard for callers that
 * smuggle an unknown string past the types (e.g. from upstream JSON).
 */
export function typeIdOf(param: BookingTypeParam): BookingTypeId {
  const found = findBookingType(param)
  if (!found) throw new Error(`Unknown booking type: ${param}`)
  return found.id
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

// localStorage key for the JWT on the client. Primary (and only) persistent
// auth store: iOS Safari on *.vercel.app (Public Suffix List) drops cookies
// on tab-kill, so we standardised on Bearer-only auth with localStorage as
// the persistence layer. Written by `useAuth.login`, read by
// `plugins/auth-token.client.ts` to seed the in-memory state before the auth
// middleware runs. Cleared on logout or upstream 401.
export const AUTH_STORAGE_KEY = 'faynatown:token'

// localStorage key for the last-picked booking type. Persisted so a user who
// mostly uses, say, Paddle Tennis doesn't have to re-select it on every visit.
// Read at `useState` init time by `useCalendar`, written on each `setType()`.
export const BOOKING_TYPE_STORAGE_KEY = 'faynatown:booking-type'

// Suffixes the API appends to text fields when an item is unavailable.
// We detect both and strip them when rendering.
export const UNAVAILABLE_SUFFIXES = ['(недоступно)', '(зайнято)'] as const

// Faynatown residential complex coordinates (Kyiv).
// Used as a fixed location for the Open-Meteo weather forecast — every user
// sees the same forecast regardless of where they currently are.
export const FAYNATOWN_COORDS = {
  latitude: 50.4700198,
  longitude: 30.3989502,
  timezone: 'Europe/Kyiv',
} as const

// Open-Meteo returns 16-day forecasts but accuracy past ~14 days drops
// sharply. Clamp the window so we don't render numbers we don't trust.
export const WEATHER_FORECAST_DAYS = 14

export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
