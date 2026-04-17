import { UNAVAILABLE_SUFFIXES } from '#shared/constants'
import type { CalendarSlot, TimeSlotResponse } from '#shared/types'

const SLOT_RE = /з (\d{2}):(\d{2}) по (\d{2}):(\d{2})/

/**
 * Parses a Faynatown `slotValidated` string like `з 07:00 по 08:00`
 * (optionally suffixed with `(недоступно)` / `(зайнято)`) into a typed
 * CalendarSlot.
 *
 * Availability rules:
 * - `isAvaliable === true` (preserve API typo) AND no unavailable suffix → available
 * - Otherwise → unavailable
 */
export function parseTimeSlot(raw: TimeSlotResponse): CalendarSlot | null {
  const match = SLOT_RE.exec(raw.slotValidated)
  if (!match || !match[1] || !match[3]) return null

  const startHour = Number.parseInt(match[1], 10)
  const startMin = Number.parseInt(match[2] ?? '0', 10)
  const endHour = Number.parseInt(match[3], 10)
  const endMin = Number.parseInt(match[4] ?? '0', 10)

  const available = raw.isAvaliable === true && !isLabelUnavailable(raw.slotValidated)

  return {
    time: `${pad(startHour)}:${pad(startMin)}-${pad(endHour)}:${pad(endMin)}`,
    startHour,
    endHour,
    available,
    rawLabel: stripUnavailableSuffix(raw.slotValidated),
  }
}

/**
 * Removes `(недоступно)` / `(зайнято)` suffix from any label text so UI can
 * render just the semantic content.
 */
export function stripUnavailableSuffix(label: string): string {
  let result = label
  for (const suffix of UNAVAILABLE_SUFFIXES) {
    result = result.replace(suffix, '').trim()
  }
  return result
}

/**
 * Checks whether a zone/slot label has an unavailable marker.
 * Used when the API omits `isAvaliable` and only signals via text.
 */
export function isLabelUnavailable(label: string): boolean {
  return UNAVAILABLE_SUFFIXES.some(s => label.includes(s))
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
