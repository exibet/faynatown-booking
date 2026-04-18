import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import { STATE_KEY } from '#shared/state-keys'
import type { BookingTypeParam } from '#shared/constants'
import type { CalendarWeek } from '#shared/types'
import { addDays, formatLocalDate, parseLocalDate, todayLocal } from '~/utils/datetime'

const DEFAULT_TYPE: BookingTypeParam = 'Paddle_Tennis'

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
  const weekAnchor = useState<Date>(STATE_KEY.WEEK_ANCHOR, () => todayLocal())
  const selectedType = useState<BookingTypeParam>(STATE_KEY.SELECTED_TYPE, () => DEFAULT_TYPE)
  const pending = useState<boolean>('cal:pending', () => false)
  const lastUpdated = useState<Date | null>('cal:last-updated', () => null)
  const refreshTrigger = useState<number>('cal:refresh-tick', () => 0)

  const nuxtData = useNuxtData<CalendarWeek>(FETCH_KEY.CALENDAR)
  const week = computed<CalendarWeek>(() => nuxtData.data.value ?? [])

  const weekStartIso = computed(() => formatLocalDate(weekAnchor.value))
  const weekDates = computed<Date[]>(() => {
    const start = weekAnchor.value
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  })

  // Past dates are read-only (the API doesn't expose them anyway). Allow
  // navigating back only if the previous week still lands on today or later.
  const canPrevWeek = computed(() => {
    return addDays(weekAnchor.value, -7).getTime() >= todayLocal().getTime()
  })

  function prevWeek(): void {
    if (!canPrevWeek.value) return
    weekAnchor.value = addDays(weekAnchor.value, -7)
  }

  function nextWeek(): void {
    weekAnchor.value = addDays(weekAnchor.value, 7)
  }

  function goToToday(): void {
    weekAnchor.value = todayLocal()
  }

  function setType(type: BookingTypeParam): void {
    selectedType.value = type
  }

  function setAnchor(date: Date): void {
    weekAnchor.value = date
  }

  function refresh(): void {
    refreshTrigger.value += 1
  }

  return {
    weekAnchor: readonly(weekAnchor),
    weekStartIso: readonly(weekStartIso),
    weekDates: readonly(weekDates),
    selectedType: readonly(selectedType),
    week,
    pending: readonly(pending),
    lastUpdated: readonly(lastUpdated),
    refreshTrigger: readonly(refreshTrigger),
    canPrevWeek,
    prevWeek,
    nextWeek,
    goToToday,
    setType,
    setAnchor,
    refresh,
  }
}

/**
 * Calendar DATA SYNC — registers the `useAsyncData` fetch. MUST be called
 * exactly once per page (in `DesktopApp` / `MobileApp` setup), otherwise
 * each call would queue its own request and Nuxt's dedupe wouldn't kick in
 * reliably across separate component setups.
 */
export function useCalendarSync() {
  const api = createApi()
  const weekAnchor = useState<Date>(STATE_KEY.WEEK_ANCHOR, () => todayLocal())
  const selectedType = useState<BookingTypeParam>(STATE_KEY.SELECTED_TYPE, () => DEFAULT_TYPE)
  const refreshTrigger = useState<number>('cal:refresh-tick', () => 0)
  const pending = useState<boolean>('cal:pending', () => false)
  const lastUpdated = useState<Date | null>('cal:last-updated', () => null)

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
      watch: [weekStartIso, selectedType, refreshTrigger],
      // Only reuse the cached value on the very first request (SSR → client
      // hydration). For watch-triggered refetches (type/week changed), force
      // a real network call — otherwise the cache short-circuits the request
      // and the UI stays on the old data.
      getCachedData: (key, nuxtApp, ctx) => {
        if (ctx.cause === 'initial') return nuxtApp.payload.data[key]
        return undefined
      },
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

/** Parse a YYYY-MM-DD weekStart-style string into a Date (local). */
export function parseWeekStart(iso: string): Date {
  return parseLocalDate(iso)
}
