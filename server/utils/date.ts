/**
 * Faynatown returns dates without timezone (`2026-04-17T00:00:00`).
 * We treat them as local time exclusively — never add `Z` or parse as UTC.
 */

/**
 * Formats a Date as a `YYYY-MM-DD` string (local time).
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses `YYYY-MM-DD` as a local Date at 00:00.
 * Never use `new Date(string)` — that treats plain dates as UTC.
 */
export function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(p => Number.parseInt(p, 10))
  if (!year || !month || !day) {
    throw new Error(`Invalid date: ${isoDate}`)
  }
  return new Date(year, month - 1, day)
}

/**
 * Returns the Monday of the ISO week containing `date` (local time).
 * Used to compute weekStart from today or an arbitrary input date.
 */
export function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = d.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  d.setDate(d.getDate() - daysFromMonday)
  return d
}

/**
 * Returns 7 consecutive `YYYY-MM-DD` strings starting from `weekStart`.
 */
export function weekDates(weekStart: string): string[] {
  const start = parseLocalDate(weekStart)
  const result: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    result.push(formatLocalDate(d))
  }
  return result
}

/**
 * Converts a `YYYY-MM-DD` date into the upstream API's `bookingDate` format:
 * `2026-04-20T00:00:00Z` — yes, with `Z`, that's what the API expects.
 * (The timezone marker is ignored upstream — our internal dates stay local.)
 */
export function toUpstreamBookingDate(isoDate: string): string {
  return `${isoDate}T00:00:00Z`
}
