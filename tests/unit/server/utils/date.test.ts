import { describe, expect, it } from 'vitest'
import {
  formatLocalDate,
  mondayOf,
  parseLocalDate,
  toUpstreamBookingDate,
  weekDates,
} from '~~/server/utils/date'

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

  it('throws on invalid input', () => {
    expect(() => parseLocalDate('not-a-date')).toThrow()
  })
})

describe('mondayOf', () => {
  it('returns same date when given a Monday', () => {
    // 2026-04-20 is a Monday
    const monday = mondayOf(new Date(2026, 3, 20))
    expect(formatLocalDate(monday)).toBe('2026-04-20')
  })

  it('returns previous Monday when given a Wednesday', () => {
    // 2026-04-22 is a Wednesday
    const monday = mondayOf(new Date(2026, 3, 22))
    expect(formatLocalDate(monday)).toBe('2026-04-20')
  })

  it('returns previous Monday when given a Sunday', () => {
    // 2026-04-26 is a Sunday
    const monday = mondayOf(new Date(2026, 3, 26))
    expect(formatLocalDate(monday)).toBe('2026-04-20')
  })
})

describe('weekDates', () => {
  it('returns 7 consecutive dates starting from weekStart', () => {
    const dates = weekDates('2026-04-20')
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
    const dates = weekDates('2026-04-27')
    expect(dates[6]).toBe('2026-05-03')
  })
})

describe('toUpstreamBookingDate', () => {
  it('appends T00:00:00Z as upstream expects', () => {
    expect(toUpstreamBookingDate('2026-04-17')).toBe('2026-04-17T00:00:00Z')
  })
})
