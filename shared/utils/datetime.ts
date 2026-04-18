/**
 * Shared date helpers (pure functions, zero deps on Nuxt / Vue).
 *
 * Faynatown API returns timestamps without a timezone (`2026-04-17T00:00:00`).
 * We treat them as local time exclusively — never `new Date(string)` on those,
 * always `parseLocal*` so JS doesn't silently coerce to UTC.
 *
 * Both app/ and server/ import from here; do NOT re-implement these locally.
 */

/** Today at 00:00 local time (no timezone shift). */
export function todayLocal(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
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

/** Format a Date as `YYYY-MM-DD` in local time. */
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

/** Returns the Monday of the ISO week containing `date` (local time). */
export function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = d.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  d.setDate(d.getDate() - daysFromMonday)
  return d
}

/** Returns 7 consecutive `YYYY-MM-DD` strings starting from `weekStart`. */
export function weekDateStrings(weekStart: string): string[] {
  const start = parseLocalDate(weekStart)
  const result: string[] = []
  for (let i = 0; i < 7; i++) {
    result.push(formatLocalDate(addDays(start, i)))
  }
  return result
}

/**
 * Converts a `YYYY-MM-DD` date into the upstream API's `bookingDate` format:
 * `2026-04-20T00:00:00Z`. The timezone marker is ignored upstream — our
 * internal dates stay local.
 */
export function toUpstreamBookingDate(isoDate: string): string {
  return `${isoDate}T00:00:00Z`
}
