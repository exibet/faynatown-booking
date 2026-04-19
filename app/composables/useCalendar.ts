import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import { STATE_KEY } from '#shared/state-keys'
import { DEFAULT_BOOKING_TYPE } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'
import type { CalendarWeek } from '#shared/types'
import { addDays, formatLocalDate, todayLocal } from '#shared/utils/datetime'
import { initialOnlyCache } from '~/utils/async-data'
import { getStoredBookingType, setStoredBookingType } from '~/utils/booking-type-storage'

// Forward navigation cap: current week + this many windows ahead = the full
// horizon the user can see. Enforced by `canNextWeek` / `nextWeek`. Bumping
// this is a UX decision, not an API one — the fetch endpoint is week-scoped
// and has no upstream horizon of its own.
const MAX_WEEKS_AHEAD = 2

// Private state keys shared between useCalendar() and useCalendarSync().
// Grouped here so a typo creates a compile error instead of a silent second
// state instance.
const K = {
  WEEK_ANCHOR: STATE_KEY.WEEK_ANCHOR,
  SELECTED_TYPE: STATE_KEY.SELECTED_TYPE,
  PENDING: 'cal:pending',
  LAST_UPDATED: 'cal:last-updated',
  REFRESH_TICK: 'cal:refresh-tick',
} as const

function calendarState() {
  const weekAnchor = useState<Date>(K.WEEK_ANCHOR, () => todayLocal())
  const selectedType = useState<BookingTypeParam>(
    K.SELECTED_TYPE,
    () => getStoredBookingType() ?? DEFAULT_BOOKING_TYPE,
  )
  const pending = useState<boolean>(K.PENDING, () => false)
  const lastUpdated = useState<Date | null>(K.LAST_UPDATED, () => null)
  const refreshTick = useState<number>(K.REFRESH_TICK, () => 0)
  return { weekAnchor, selectedType, pending, lastUpdated, refreshTick }
}

/**
 * Calendar STATE accessor — returns reactive state and navigation actions
 * but does NOT register a `useAsyncData` fetch. Multiple components can call
 * this freely (header, grid, sidebar) without each one queueing a network
 * request.
 *
 * Data is read directly from the shared async-data ref via `useNuxtData` so
 * SSR-fetched values are visible synchronously during the SSR render —
 * a `useState` mirror copied through `watchEffect` would only land after
 * setup, causing hydration mismatches between SSR and client.
 */
export function useCalendar() {
  const { weekAnchor, selectedType, pending, lastUpdated, refreshTick } = calendarState()

  const nuxtData = useNuxtData<CalendarWeek>(FETCH_KEY.CALENDAR)
  const week = computed<CalendarWeek>(() => nuxtData.data.value ?? [])

  const weekDates = computed<Date[]>(() => {
    const start = weekAnchor.value
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  })

  // Past dates are read-only (the API doesn't expose them anyway). Allow
  // navigating back only if the previous week still lands on today or later.
  const canPrevWeek = computed(() => {
    return addDays(weekAnchor.value, -7).getTime() >= todayLocal().getTime()
  })

  // Forward cap: user sees the current week + `MAX_WEEKS_AHEAD` further
  // windows. Beyond that the upstream data is both uninteresting (bookings
  // open on a rolling window) and an unbounded-request invitation — this
  // keeps the data envelope to 3 weeks no matter how long the user holds
  // the arrow.
  const canNextWeek = computed(() => {
    const maxAnchor = addDays(todayLocal(), 7 * MAX_WEEKS_AHEAD)
    return addDays(weekAnchor.value, 7).getTime() <= maxAnchor.getTime()
  })

  function prevWeek(): void {
    if (!canPrevWeek.value) return
    weekAnchor.value = addDays(weekAnchor.value, -7)
  }

  function nextWeek(): void {
    if (!canNextWeek.value) return
    weekAnchor.value = addDays(weekAnchor.value, 7)
  }

  function goToToday(): void {
    weekAnchor.value = todayLocal()
  }

  function setType(type: BookingTypeParam): void {
    selectedType.value = type
    setStoredBookingType(type)
  }

  function refresh(): void {
    refreshTick.value += 1
  }

  return {
    weekAnchor: readonly(weekAnchor),
    weekDates: readonly(weekDates),
    selectedType: readonly(selectedType),
    week,
    pending: readonly(pending),
    lastUpdated: readonly(lastUpdated),
    canPrevWeek,
    canNextWeek,
    prevWeek,
    nextWeek,
    goToToday,
    setType,
    refresh,
  }
}

/**
 * Calendar DATA SYNC — registers the `useAsyncData` fetch. MUST be called
 * exactly once per page (in `pages/index.vue` setup), otherwise each call
 * would queue its own request and Nuxt's dedupe wouldn't kick in reliably
 * across separate component setups.
 */
export function useCalendarSync() {
  const api = createApi()
  const { weekAnchor, selectedType, refreshTick, pending, lastUpdated } = calendarState()
  const weekStartIso = computed(() => formatLocalDate(weekAnchor.value))

  const result = useAsyncData<CalendarWeek>(
    FETCH_KEY.CALENDAR,
    async () => {
      const data = await api<CalendarWeek>(API.CALENDAR, {
        query: {
          type: selectedType.value,
          weekStart: weekStartIso.value,
        },
      })
      lastUpdated.value = new Date()
      return data
    },
    {
      default: () => [],
      watch: [weekStartIso, selectedType, refreshTick],
      getCachedData: initialOnlyCache,
    },
  )

  // Sync flush so the mirror updates *during* setup before SSR render and
  // before the Nuxt payload is serialised. SSR's Suspense awaits useAsyncData
  // to resolve, so pending is false at render time; client-side refetches
  // (type/week change) flip pending → true so WeekGrid's progress bar and
  // .ft-cal-stale overlay can dim the previous data.
  watchSyncEffect(() => {
    pending.value = result.pending.value
  })

  return result
}
