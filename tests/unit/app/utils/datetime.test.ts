import { describe, expect, it } from 'vitest'
import { addDays } from '#shared/utils/datetime'
import {
  dayLongName,
  dayRelation,
  dayShortName,
  fmtDayDot,
  fmtMonthDay,
  fmtTimeHHMM,
} from '~/utils/datetime'

describe('utils/datetime (UI)', () => {
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

  it('dayLongName returns localized weekday name', () => {
    const tue = new Date(2026, 3, 21) // Tuesday
    expect(dayLongName(tue, 'uk')).toBe('Вівторок')
    expect(dayLongName(tue, 'en')).toBe('Tuesday')
  })

  it('dayRelation detects today / tomorrow / other', () => {
    const today = new Date(2026, 3, 18)
    expect(dayRelation(today, today)).toBe('today')
    expect(dayRelation(addDays(today, 1), today)).toBe('tomorrow')
    expect(dayRelation(addDays(today, 3), today)).toBe(null)
    expect(dayRelation(addDays(today, -1), today)).toBe(null)
  })
})
