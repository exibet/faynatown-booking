import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatLocalDate,
  isPastDay,
  parseLocalDate,
  parseLocalDateTime,
  sameDay,
  todayLocal,
  weekDateStrings,
} from '#shared/utils/datetime'

describe('todayLocal', () => {
  it('returns midnight of today (no timezone shift)', () => {
    const t = todayLocal()
    expect(t.getHours()).toBe(0)
    expect(t.getMinutes()).toBe(0)
    expect(t.getSeconds()).toBe(0)
  })
})

describe('addDays', () => {
  it('preserves local time (Saturday + 7 = next Saturday)', () => {
    const d = new Date(2026, 3, 18)
    const next = addDays(d, 7)
    expect(next.getDate()).toBe(25)
    expect(next.getMonth()).toBe(3)
  })
})

describe('sameDay', () => {
  it('ignores time-of-day', () => {
    const a = new Date(2026, 3, 18, 9, 30)
    const b = new Date(2026, 3, 18, 22, 15)
    expect(sameDay(a, b)).toBe(true)
    expect(sameDay(a, addDays(a, 1))).toBe(false)
  })
})

describe('isPastDay', () => {
  const today = new Date(2026, 3, 18)

  it('returns false for today even if time-of-day is different', () => {
    expect(isPastDay(new Date(2026, 3, 18, 0, 0), today)).toBe(false)
  })

  it('returns true for yesterday', () => {
    expect(isPastDay(addDays(today, -1), today)).toBe(true)
  })

  it('returns false for tomorrow', () => {
    expect(isPastDay(addDays(today, 1), today)).toBe(false)
  })
})

describe('formatLocalDate', () => {
  it('formats as YYYY-MM-DD with zero-padding', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(formatLocalDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('parseLocalDate', () => {
  it('parses as local midnight (not UTC)', () => {
    const d = parseLocalDate('2026-04-17')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(3)
    expect(d.getDate()).toBe(17)
    expect(d.getHours()).toBe(0)
  })

  it('roundtrips with formatLocalDate', () => {
    const d = new Date(2026, 3, 18)
    expect(sameDay(parseLocalDate(formatLocalDate(d)), d)).toBe(true)
  })

  it('throws on invalid input', () => {
    expect(() => parseLocalDate('not-a-date')).toThrow()
    expect(() => parseLocalDate('')).toThrow()
  })
})

describe('parseLocalDateTime', () => {
  it('parses no-timezone ISO as local time', () => {
    const dt = parseLocalDateTime('2026-04-28T16:30:00')
    expect(dt.getFullYear()).toBe(2026)
    expect(dt.getMonth()).toBe(3)
    expect(dt.getDate()).toBe(28)
    expect(dt.getHours()).toBe(16)
    expect(dt.getMinutes()).toBe(30)
  })

  it('handles bare date (no T)', () => {
    const dt = parseLocalDateTime('2026-04-28')
    expect(dt.getHours()).toBe(0)
    expect(dt.getMinutes()).toBe(0)
  })

  it('throws on invalid input', () => {
    expect(() => parseLocalDateTime('bad')).toThrow()
  })
})

describe('weekDateStrings', () => {
  it('returns 7 consecutive dates starting from weekStart', () => {
    const dates = weekDateStrings('2026-04-20')
    expect(dates).toEqual([
      '2026-04-20',
      '2026-04-21',
      '2026-04-22',
      '2026-04-23',
      '2026-04-24',
      '2026-04-25',
      '2026-04-26',
    ])
  })

  it('handles month boundaries', () => {
    const dates = weekDateStrings('2026-04-27')
    expect(dates[6]).toBe('2026-05-03')
  })
})
