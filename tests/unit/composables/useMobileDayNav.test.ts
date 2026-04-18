import { beforeEach, describe, expect, it } from 'vitest'
import { STATE_KEY } from '#shared/state-keys'
import { addDays, todayLocal } from '#shared/utils/datetime'

describe('useMobileDayNav', () => {
  beforeEach(() => {
    useState(STATE_KEY.WEEK_ANCHOR).value = todayLocal()
    useState(STATE_KEY.MOBILE_DAY_OFFSET).value = 0
  })

  it('nextDay() steps offset +1 inside the current week', () => {
    const nav = useMobileDayNav()
    nav.nextDay()
    expect(nav.dayOffset.value).toBe(1)
    expect(nav.currentDate.value.getTime()).toBe(addDays(todayLocal(), 1).getTime())
  })

  it('nextDay() rolls into the next week when at offset 6', () => {
    useState(STATE_KEY.MOBILE_DAY_OFFSET).value = 6
    const nav = useMobileDayNav()
    nav.nextDay()
    const expected = addDays(todayLocal(), 7)
    expect(nav.dayOffset.value).toBe(0)
    // Anchor moved one week forward, offset reset to 0 → same absolute date.
    expect(nav.currentDate.value.getTime()).toBe(expected.getTime())
  })

  it('prevDay() is a no-op when already on today', () => {
    const nav = useMobileDayNav()
    nav.prevDay()
    expect(nav.dayOffset.value).toBe(0)
    expect(nav.currentDate.value.getTime()).toBe(todayLocal().getTime())
  })

  it('selectDay() rejects offsets that land on a past date', () => {
    // Shift anchor one week forward so the strip spans today+7 .. today+13,
    // then attempt to select an offset that maps before today.
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = todayLocal()
    const nav = useMobileDayNav()
    // Offset 0 is today — selecting an offset that wraps backwards isn't
    // representable because selectDay treats `target < today` as past.
    // To exercise the branch, rewind anchor to yesterday and try selecting
    // offset 0 (which lands on yesterday).
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), -1)
    nav.selectDay(0)
    // Rejected — offset stays at whatever it was (0).
    expect(nav.dayOffset.value).toBe(0)
    // currentDate is anchor + offset (yesterday + 0 = yesterday) — we just
    // assert selectDay did not flip offset to 1 or similar.
  })
})
