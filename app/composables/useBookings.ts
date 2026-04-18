import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import type { BookingTypeId } from '#shared/constants'
import type { BookingItem } from '#shared/types'
import { parseLocalDateTime, sameDay } from '~/utils/datetime'
import { parseArea, parseUnitNumber } from '~/utils/zone-grouping'

/**
 * Bookings composable — state + cancel + helpers. Pair with `useBookingsSync`
 * (called ONCE in the page root) to actually populate `bookings` from the
 * server. Reads data directly from the shared async-data ref via
 * `useNuxtData` so SSR values are visible during the first render (a
 * useState mirror via watchEffect would only sync post-setup → hydration
 * mismatch).
 */
export function useBookings() {
  const api = createApi()
  const toast = useToast()
  const { t } = useI18n()

  const pending = useState<boolean>('bookings:pending', () => false)
  const refreshTick = useState<number>('bookings:refresh-tick', () => 0)

  const nuxtData = useNuxtData<BookingItem[]>(FETCH_KEY.BOOKINGS)
  const bookings = computed<BookingItem[]>(() => nuxtData.data.value ?? [])

  const upcoming = computed<BookingItem[]>(() => bookings.value.filter(b => b.isActive))
  const past = computed<BookingItem[]>(() => bookings.value.filter(b => !b.isActive))
  const upcomingCount = computed(() => upcoming.value.length)

  function isSlotYours(date: Date, startHour: number, endHour: number, typeId: BookingTypeId): boolean {
    return bookings.value.some((b) => {
      if (b.typeId !== typeId) return false
      const start = parseLocalDateTime(b.start)
      const end = parseLocalDateTime(b.end)
      if (!sameDay(start, date)) return false
      const slotEndHour = end.getHours() === 0 && end.getMinutes() === 0
        ? 24
        : end.getHours() + (end.getMinutes() > 0 ? 1 : 0)
      return start.getHours() < endHour && slotEndHour > startHour
    })
  }

  /**
   * Returns the set of `area-unit` keys (e.g. "1-3", "2-5") the user has
   * booked for this (date, hour-range, type). Comparing parsed numbers
   * instead of raw zoneName avoids whitespace / dash mismatches between the
   * `userBookings` and `zones` endpoints.
   */
  function myUnitKeysForSlot(date: Date, startHour: number, endHour: number, typeId: BookingTypeId): Set<string> {
    const keys = new Set<string>()
    for (const b of bookings.value) {
      if (b.typeId !== typeId) continue
      const start = parseLocalDateTime(b.start)
      const end = parseLocalDateTime(b.end)
      if (!sameDay(start, date)) continue
      const slotEndHour = end.getHours() === 0 && end.getMinutes() === 0
        ? 24
        : end.getHours() + (end.getMinutes() > 0 ? 1 : 0)
      if (start.getHours() < endHour && slotEndHour > startHour) {
        keys.add(`${parseArea(b.zoneName)}-${parseUnitNumber(b.zoneName)}`)
      }
    }
    return keys
  }

  async function cancel(id: number): Promise<boolean> {
    try {
      await api(`${API.BOOKINGS}/${id}`, { method: 'DELETE' })
      refreshTick.value += 1
      toast.show(t('bookings.cancelled'))
      return true
    }
    catch {
      toast.error(t('bookings.cancelFailed'))
      return false
    }
  }

  return {
    bookings,
    upcoming,
    past,
    upcomingCount,
    pending: readonly(pending),
    refreshTick: readonly(refreshTick),
    isSlotYours,
    myUnitKeysForSlot,
    cancel,
  }
}

/** Bookings DATA SYNC — call ONCE per page. */
export function useBookingsSync() {
  const api = createApi()
  const refreshTick = useState<number>('bookings:refresh-tick', () => 0)
  const pending = useState<boolean>('bookings:pending', () => false)

  const result = useAsyncData<BookingItem[]>(
    FETCH_KEY.BOOKINGS,
    () => api<BookingItem[]>(API.BOOKINGS),
    {
      default: () => [],
      watch: [refreshTick],
      getCachedData: (key, nuxtApp, ctx) => {
        if (ctx.cause === 'initial') return nuxtApp.payload.data[key]
        return undefined
      },
    },
  )

  watchSyncEffect(() => {
    pending.value = result.pending.value
  })

  return result
}
