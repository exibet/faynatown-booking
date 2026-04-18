import { STATE_KEY } from '#shared/state-keys'
import { addDays, sameDay } from '#shared/utils/datetime'
import { useToday } from '~/utils/datetime'

/**
 * Encapsulates mobile day-strip navigation: which day is selected, whether
 * prev/next should be enabled, and anchor-shifting when stepping outside the
 * current 7-day window. Extracted from MobileApp.vue so the shell component
 * stays purely declarative.
 */
export function useMobileDayNav() {
  const calendar = useCalendar()
  const today = useToday()
  const dayOffset = useState<number>(STATE_KEY.MOBILE_DAY_OFFSET, () => 0)

  // Initial alignment: centre the strip on today (if anchor is today).
  onMounted(() => {
    const anchor = calendar.weekAnchor.value
    if (sameDay(anchor, today.value)) {
      dayOffset.value = 0
      return
    }
    const idx = calendar.weekDates.value.findIndex(d => sameDay(d, today.value))
    dayOffset.value = idx >= 0 ? idx : 0
  })

  const currentDate = computed(() => addDays(calendar.weekAnchor.value, dayOffset.value))
  const canPrevDay = computed(() => currentDate.value.getTime() > today.value.getTime())
  const currentDay = computed(() => calendar.week.value?.[dayOffset.value] ?? null)

  function selectDay(idx: number): void {
    const target = addDays(calendar.weekAnchor.value, idx)
    if (target.getTime() < today.value.getTime()) return // past — disabled
    dayOffset.value = idx
  }

  function nextDay(): void {
    if (dayOffset.value < 6) {
      dayOffset.value += 1
      return
    }
    calendar.nextWeek()
    dayOffset.value = 0
  }

  function prevDay(): void {
    if (!canPrevDay.value) return
    if (dayOffset.value > 0) {
      dayOffset.value -= 1
      return
    }
    if (!calendar.canPrevWeek.value) return
    calendar.prevWeek()
    dayOffset.value = 6
  }

  return {
    dayOffset,
    currentDate,
    currentDay,
    canPrevDay,
    selectDay,
    nextDay,
    prevDay,
  }
}
