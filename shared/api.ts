export const API = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  CALENDAR: '/api/calendar',
  BOOKINGS: '/api/bookings',
  ZONES: '/api/zones',
  FLATS: '/api/flats',
  WEATHER: '/api/weather',
} as const

export type ApiRoute = typeof API[keyof typeof API]
