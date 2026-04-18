import { describe, expect, it } from 'vitest'
import {
  addDays,
  dayShortName,
  dayTitle,
  fmtDayDot,
  fmtMonthDay,
  fmtTimeHHMM,
  formatLocalDate,
  parseLocalDate,
  parseLocalDateTime,
  sameDay,
  todayLocal,
} from '~/utils/datetime'

describe('utils/datetime', () => {
  it('todayLocal returns midnight of today (no timezone shift)', () => {
    const t = todayLocal()
    expect(t.getHours()).toBe(0)
    expect(t.getMinutes()).toBe(0)
    expect(t.getSeconds()).toBe(0)
  })

  it('addDays preserves local time', () => {
    const d = new Date(2026, 3, 18) // Apr 18, 2026
    const next = addDays(d, 7)
    expect(next.getDate()).toBe(25)
    expect(next.getMonth()).toBe(3)
  })

  it('sameDay ignores time-of-day', () => {
    const a = new Date(2026, 3, 18, 9, 30)
    const b = new Date(2026, 3, 18, 22, 15)
    expect(sameDay(a, b)).toBe(true)
    expect(sameDay(a, addDays(a, 1))).toBe(false)
  })

  it('formatLocalDate / parseLocalDate roundtrip', () => {
    const d = new Date(2026, 3, 18)
    const iso = formatLocalDate(d)
    expect(iso).toBe('2026-04-18')
    expect(sameDay(parseLocalDate(iso), d)).toBe(true)
  })

  it('parseLocalDate rejects invalid input', () => {
    expect(() => parseLocalDate('bad')).toThrow()
    expect(() => parseLocalDate('')).toThrow()
  })

  it('parseLocalDateTime parses no-timezone ISO as local time', () => {
    const dt = parseLocalDateTime('2026-04-28T16:30:00')
    expect(dt.getFullYear()).toBe(2026)
    expect(dt.getMonth()).toBe(3)
    expect(dt.getDate()).toBe(28)
    expect(dt.getHours()).toBe(16)
    expect(dt.getMinutes()).toBe(30)
  })

  it('parseLocalDateTime handles bare date (no T)', () => {
    const dt = parseLocalDateTime('2026-04-28')
    expect(dt.getHours()).toBe(0)
    expect(dt.getMinutes()).toBe(0)
  })

  it('parseLocalDateTime rejects invalid input', () => {
    expect(() => parseLocalDateTime('bad')).toThrow()
  })

  it('fmtMonthDay formats Ukrainian / English short months', () => {
    const d = new Date(2026, 3, 18)
    expect(fmtMonthDay(d, 'uk')).toBe('18 квіт.')
    expect(fmtMonthDay(d, 'en')).toBe('18 Apr')
  })

  it('fmtDayDot formats DD.MM with zero padding', () => {
    expect(fmtDayDot(new Date(2026, 3, 18))).toBe('18.04')
    expect(fmtDayDot(new Date(2026, 0, 1))).toBe('01.01')
  })

  it('fmtTimeHHMM converts minutes-from-midnight', () => {
    expect(fmtTimeHHMM(0)).toBe('00:00')
    expect(fmtTimeHHMM(7 * 60)).toBe('07:00')
    expect(fmtTimeHHMM(7 * 60 + 30)).toBe('07:30')
    expect(fmtTimeHHMM(22 * 60)).toBe('22:00')
  })

  it('dayShortName returns localized 2-letter weekday', () => {
    const sat = new Date(2026, 3, 18) // Saturday
    expect(dayShortName(sat, 'uk')).toBe('СБ')
    expect(dayShortName(sat, 'en')).toBe('Sat')
  })

  it('dayTitle uses "today/tomorrow" labels relative to anchor', () => {
    const today = new Date(2026, 3, 18)
    expect(dayTitle(today, 'uk', today)).toBe('Сьогодні')
    expect(dayTitle(addDays(today, 1), 'uk', today)).toBe('Завтра')
    expect(dayTitle(addDays(today, 1), 'en', today)).toBe('Tomorrow')
    // For other days falls back to weekday name
    expect(dayTitle(addDays(today, 3), 'uk', today)).toBe('Вівторок')
  })
})
