/**
 * Client-side date / time helpers.
 *
 * Faynatown API returns timestamps without a timezone (`2026-04-17T00:00:00`).
 * We treat them as local time exclusively — never `new Date(string)` on those,
 * always `parseLocal*` so JS doesn't silently coerce to UTC.
 */

import type { CalendarSlot } from '#shared/types'

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

/** Today at 00:00 local time (no timezone shift). */
export function todayLocal(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * SSR-safe `today` — caches the SSR-computed date in `useState` so client
 * renders the same value (avoids hydration mismatches when server/client
 * timezones differ). Trade-off: the value doesn't auto-update at midnight
 * for users with very long-lived tabs; acceptable for a booking app.
 */
export function useToday() {
  return useState<Date>('app:today', () => todayLocal())
}

/** Add `n` calendar days (preserves DST-safe local time). */
export function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

/** Format a Date as `YYYY-MM-DD` in local time (matches server expectation). */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse a `YYYY-MM-DD` string as local Date at 00:00 (never as UTC). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(p => Number.parseInt(p, 10))
  if (!y || !m || !d) throw new Error(`Invalid date: ${iso}`)
  return new Date(y, m - 1, d)
}

/** Parse a `YYYY-MM-DDTHH:MM:SS` (no timezone) as local DateTime. */
export function parseLocalDateTime(iso: string): Date {
  const [datePart, timePart = '00:00:00'] = iso.split('T')
  if (!datePart) throw new Error(`Invalid datetime: ${iso}`)
  const [y, mo, d] = datePart.split('-').map(p => Number.parseInt(p, 10))
  const [h = 0, mi = 0, s = 0] = timePart.split(':').map(p => Number.parseInt(p, 10))
  if (!y || !mo || !d) throw new Error(`Invalid datetime: ${iso}`)
  return new Date(y, mo - 1, d, h, mi, s)
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

export function dayLongName(date: Date, locale: Locale): string {
  const names = locale === 'uk' ? DAY_NAMES_LONG_UK : DAY_NAMES_LONG_EN
  return names[date.getDay()] ?? ''
}

export function dayTitle(date: Date, locale: Locale, today: Date = todayLocal()): string {
  if (sameDay(date, today)) return locale === 'uk' ? 'Сьогодні' : 'Today'
  if (sameDay(date, addDays(today, 1))) return locale === 'uk' ? 'Завтра' : 'Tomorrow'
  return dayLongName(date, locale)
}

/** Slot start/end in minutes-from-midnight (used by absolute-positioned grid). */
export function slotMinutes(slot: CalendarSlot): { startMin: number, endMin: number } {
  return {
    startMin: slot.startHour * 60,
    endMin: slot.endHour * 60,
  }
}

/** Current local time as minutes-from-midnight (for the "now" indicator). */
export function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}
