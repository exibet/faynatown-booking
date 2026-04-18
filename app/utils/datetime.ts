/**
 * Client-side date / time helpers — UI formatting + locale handling.
 *
 * Pure date math (todayLocal, parseLocal*, addDays, sameDay, formatLocalDate)
 * lives in `#shared/utils/datetime` — app code imports those directly from
 * there to avoid Nuxt auto-import collisions. This file hosts only:
 *   - UI-only formatters (month/day names, time-of-day labels)
 *   - `useToday()` which depends on Nuxt's `useState`
 *   - `fmtBookingWhen` which depends on `BookingItem`
 */

import type { BookingItem } from '#shared/types'
import {
  addDays,
  parseLocalDateTime,
  sameDay,
  todayLocal,
} from '#shared/utils/datetime'

const MONTHS_SHORT_UK = [
  'січ.', 'лют.', 'бер.', 'квіт.', 'трав.', 'черв.',
  'лип.', 'серп.', 'вер.', 'жовт.', 'лист.', 'груд.',
]
const MONTHS_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const DAY_NAMES_UK = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_LONG_UK = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота']
const DAY_NAMES_LONG_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export type Locale = 'uk' | 'en'

/**
 * SSR-safe `today` — caches the SSR-computed date in `useState` so client
 * renders the same value (avoids hydration mismatches when server/client
 * timezones differ). Trade-off: the value doesn't auto-update at midnight
 * for users with very long-lived tabs; acceptable for a booking app.
 */
export function useToday() {
  return useState<Date>('app:today', () => todayLocal())
}

export function fmtMonthDay(date: Date, locale: Locale): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const months = locale === 'uk' ? MONTHS_SHORT_UK : MONTHS_SHORT_EN
  return `${dd} ${months[date.getMonth()]}`
}

export function fmtDayDot(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}`
}

export function fmtTimeHHMM(minutesFromMidnight: number): string {
  const h = Math.floor(minutesFromMidnight / 60)
  const m = minutesFromMidnight % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function dayShortName(date: Date, locale: Locale): string {
  const names = locale === 'uk' ? DAY_NAMES_UK : DAY_NAMES_EN
  return names[date.getDay()] ?? ''
}

function dayLongName(date: Date, locale: Locale): string {
  const names = locale === 'uk' ? DAY_NAMES_LONG_UK : DAY_NAMES_LONG_EN
  return names[date.getDay()] ?? ''
}

export function dayTitle(date: Date, locale: Locale, today: Date = todayLocal()): string {
  if (sameDay(date, today)) return locale === 'uk' ? 'Сьогодні' : 'Today'
  if (sameDay(date, addDays(today, 1))) return locale === 'uk' ? 'Завтра' : 'Tomorrow'
  return dayLongName(date, locale)
}

/** Current local time as minutes-from-midnight (for the "now" indicator). */
export function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

/** Short `DD MMM · HH:MM–HH:MM` label used on booking cards/sheets. */
export function fmtBookingWhen(booking: BookingItem, locale: Locale): string {
  const start = parseLocalDateTime(booking.start)
  const end = parseLocalDateTime(booking.end)
  const dateStr = fmtMonthDay(start, locale)
  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMin = end.getHours() * 60 + end.getMinutes()
  return `${dateStr} · ${fmtTimeHHMM(startMin)}–${fmtTimeHHMM(endMin)}`
}
