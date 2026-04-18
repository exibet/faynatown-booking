import { describe, expect, it } from 'vitest'
import { computeSlotState } from '~/utils/slot-state'

describe('computeSlotState', () => {
  it('past overrides yours / busy / free', () => {
    expect(computeSlotState({ isPast: true, isYours: true, available: true })).toBe('past')
    expect(computeSlotState({ isPast: true, isYours: false, available: false })).toBe('past')
  })

  it('yours overrides busy / free when not past', () => {
    expect(computeSlotState({ isPast: false, isYours: true, available: true })).toBe('yours')
    expect(computeSlotState({ isPast: false, isYours: true, available: false })).toBe('yours')
  })

  it('busy when neither past nor yours nor available', () => {
    expect(computeSlotState({ isPast: false, isYours: false, available: false })).toBe('busy')
  })

  it('free when available and not past / yours', () => {
    expect(computeSlotState({ isPast: false, isYours: false, available: true })).toBe('free')
  })
})
