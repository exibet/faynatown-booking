import { beforeEach, describe, expect, it } from 'vitest'
import { STATE_KEY } from '#shared/state-keys'
import { addDays, sameDay, todayLocal } from '#shared/utils/datetime'

describe('useMobileDayNav', () => {
  beforeEach(() => {
    useState(STATE_KEY.WEEK_ANCHOR).value = todayLocal()
    useState(STATE_KEY.MOBILE_DAY_OFFSET).value = 0
  })

  it('currentDate mirrors weekAnchor + dayOffset', () => {
    useState<number>(STATE_KEY.MOBILE_DAY_OFFSET).value = 3
    const nav = useMobileDayNav()
    expect(nav.currentDate.value.getTime()).toBe(addDays(todayLocal(), 3).getTime())
  })

  it('selectDay() moves the offset to a future day', () => {
    const nav = useMobileDayNav()
    nav.selectDay(4)
    expect(nav.dayOffset.value).toBe(4)
    expect(nav.currentDate.value.getTime()).toBe(addDays(todayLocal(), 4).getTime())
  })

  it('selectDay() rejects offsets that land on a past date', () => {
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), -1)
    useState<number>(STATE_KEY.MOBILE_DAY_OFFSET).value = 2
    const nav = useMobileDayNav()
    nav.selectDay(0)
    // Rejected — offset unchanged at its prior value.
    expect(nav.dayOffset.value).toBe(2)
  })

  it('nextWeek() shifts anchor +7 days and resets offset to 0', () => {
    useState<number>(STATE_KEY.MOBILE_DAY_OFFSET).value = 3
    const nav = useMobileDayNav()
    nav.nextWeek()
    const anchor = useState<Date>(STATE_KEY.WEEK_ANCHOR).value
    expect(sameDay(anchor, addDays(todayLocal(), 7))).toBe(true)
    expect(nav.dayOffset.value).toBe(0)
    expect(sameDay(nav.currentDate.value, addDays(todayLocal(), 7))).toBe(true)
  })

  it('prevWeek() is a no-op when current week already starts on today', () => {
    useState<number>(STATE_KEY.MOBILE_DAY_OFFSET).value = 2
    const nav = useMobileDayNav()
    // Anchor == today → canPrevWeek false; nothing should change.
    nav.prevWeek()
    expect(useState<Date>(STATE_KEY.WEEK_ANCHOR).value.getTime()).toBe(todayLocal().getTime())
    expect(nav.dayOffset.value).toBe(2)
  })

  it('prevWeek() shifts anchor -7 days and resets offset to 0 when future', () => {
    // Put anchor one week ahead, simulating user having navigated forward.
    useState<Date>(STATE_KEY.WEEK_ANCHOR).value = addDays(todayLocal(), 7)
    useState<number>(STATE_KEY.MOBILE_DAY_OFFSET).value = 4
    const nav = useMobileDayNav()
    nav.prevWeek()
    const anchor = useState<Date>(STATE_KEY.WEEK_ANCHOR).value
    expect(sameDay(anchor, todayLocal())).toBe(true)
    expect(nav.dayOffset.value).toBe(0)
    expect(sameDay(nav.currentDate.value, todayLocal())).toBe(true)
  })
})
