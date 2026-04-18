export const FETCH_KEY = {
  CALENDAR: 'calendar',
  BOOKINGS: 'bookings',
  FLATS: 'flats',
} as const

export type FetchKey = typeof FETCH_KEY[keyof typeof FETCH_KEY]
