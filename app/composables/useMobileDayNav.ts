import { STATE_KEY } from '#shared/state-keys'
import { addDays, sameDay } from '#shared/utils/datetime'
import { useToday } from '~/utils/datetime'

/**
 * Mobile day-strip navigation: which day within the 7-day window is selected,
 * plus week-level arrow nav with auto-reset of the selection to the first day
 * of the new window. Tapping a specific day cell stays within the current
 * week; arrows jump a full week and land on offset 0.
 *
 * Week-arrow reset rationale: on mobile users almost always want to start
 * from the beginning of a week when stepping forward — keeping the same
 * day-of-week offset tends to skip days they'd otherwise scan past. Desktop
 * uses `HeaderWeekNav` with its own logic and doesn't share this concern.
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
  const currentDay = computed(() => calendar.week.value?.[dayOffset.value] ?? null)

  function selectDay(idx: number): void {
    const target = addDays(calendar.weekAnchor.value, idx)
    if (target.getTime() < today.value.getTime()) return // past — disabled
    dayOffset.value = idx
  }

  function prevWeek(): void {
    if (!calendar.canPrevWeek.value) return
    calendar.prevWeek()
    // Safe: canPrevWeek guarantees newAnchor >= today, so offset 0 is not past.
    dayOffset.value = 0
  }

  function nextWeek(): void {
    calendar.nextWeek()
    dayOffset.value = 0
  }

  return {
    dayOffset,
    currentDate,
    currentDay,
    selectDay,
    prevWeek,
    nextWeek,
    canPrevWeek: calendar.canPrevWeek,
  }
}
