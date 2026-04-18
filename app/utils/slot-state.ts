import type { SlotState } from '#shared/types'

/**
 * Resolves the visual state of a calendar slot from the per-slot booleans.
 * Priority mirrors the UI semantics: past > yours > busy > free.
 * Extracted because WeekGrid + SlotList had identical duplicated logic.
 */
export function computeSlotState(flags: {
  isPast: boolean
  isYours: boolean
  available: boolean
}): SlotState {
  if (flags.isPast) return 'past'
  if (flags.isYours) return 'yours'
  if (!flags.available) return 'busy'
  return 'free'
}
