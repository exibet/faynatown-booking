import { beforeEach, describe, expect, it } from 'vitest'
import { STATE_KEY } from '#shared/state-keys'
import { addDays, todayLocal } from '#shared/utils/datetime'

describe('useCalendar', () => {
  beforeEach(() => {
    useState(STATE_KEY.WEEK_ANCHOR).value = todayLocal()
  })

  it('canPrevWeek is false when the anchor is today (prev would land in the past)', () => {
    const { canPrevWeek } = useCalendar()
    expect(canPrevWeek.value).toBe(false)
  })

  it('canPrevWeek is true when the anchor is 7 days in the future', () => {
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), 7)
    const { canPrevWeek } = useCalendar()
    expect(canPrevWeek.value).toBe(true)
  })

  it('prevWeek() is a no-op when anchor is today', () => {
    const { prevWeek, weekAnchor } = useCalendar()
    const before = weekAnchor.value.getTime()
    prevWeek()
    expect(weekAnchor.value.getTime()).toBe(before)
  })

  it('nextWeek() shifts anchor forward by 7 days', () => {
    const { nextWeek, weekAnchor } = useCalendar()
    const before = weekAnchor.value.getTime()
    nextWeek()
    expect(weekAnchor.value.getTime()).toBe(before + 7 * 24 * 60 * 60 * 1000)
  })

  it('canNextWeek caps forward nav at current + 2 weeks', () => {
    const { canNextWeek } = useCalendar()
    // Anchor = today → next (today+7) is still within the +2 horizon.
    expect(canNextWeek.value).toBe(true)
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), 7)
    expect(canNextWeek.value).toBe(true)
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), 14)
    // Anchor is already the furthest allowed window; one more step would
    // land at today+21, past the current+2 limit.
    expect(canNextWeek.value).toBe(false)
  })

  it('nextWeek() is a no-op once the forward cap is reached', () => {
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), 14)
    const { nextWeek, weekAnchor } = useCalendar()
    const before = weekAnchor.value.getTime()
    nextWeek()
    expect(weekAnchor.value.getTime()).toBe(before)
  })

  it('goToToday() resets anchor to today', () => {
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), 21)
    const { goToToday, weekAnchor } = useCalendar()
    goToToday()
    expect(weekAnchor.value.getTime()).toBe(todayLocal().getTime())
  })

  it('weekDates returns 7 consecutive dates starting from anchor', () => {
    const { weekDates, weekAnchor } = useCalendar()
    const dates = weekDates.value
    expect(dates).toHaveLength(7)
    expect(dates[0]?.getTime()).toBe(weekAnchor.value.getTime())
    expect(dates[6]?.getTime()).toBe(addDays(weekAnchor.value, 6).getTime())
  })
})
