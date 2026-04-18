import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import type { BookingTypeId } from '#shared/constants'
import type { BookingItem } from '#shared/types'
import { filterBookingsForSlot } from '~/utils/booking-overlap'
import { parseArea, parseUnitNumber } from '~/utils/zone-grouping'
import { initialOnlyCache } from '~/utils/async-data'

// Local state keys — not surfaced on the public `STATE_KEY` registry because
// nothing outside this file touches them. Grouping here prevents typos across
// useBookings() and useBookingsSync() creating a second state cell.
const K = {
  PENDING: 'bookings:pending',
  REFRESH_TICK: 'bookings:refresh-tick',
} as const

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

  const pending = useState<boolean>(K.PENDING, () => false)
  const refreshTick = useState<number>(K.REFRESH_TICK, () => 0)

  const nuxtData = useNuxtData<BookingItem[]>(FETCH_KEY.BOOKINGS)
  const bookings = computed<BookingItem[]>(() => nuxtData.data.value ?? [])

  const upcoming = computed<BookingItem[]>(() => bookings.value.filter(b => b.isActive))
  const past = computed<BookingItem[]>(() => bookings.value.filter(b => !b.isActive))
  const upcomingCount = computed(() => upcoming.value.length)

  function isSlotYours(date: Date, startHour: number, endHour: number, typeId: BookingTypeId): boolean {
    return filterBookingsForSlot(bookings.value, { date, startHour, endHour, typeId }).length > 0
  }

  /**
   * Returns the set of `area-unit` keys (e.g. "1-3", "2-5") the user has
   * booked for this (date, hour-range, type). Comparing parsed numbers
   * instead of raw zoneName avoids whitespace / dash mismatches between the
   * `userBookings` and `zones` endpoints.
   */
  function myUnitKeysForSlot(date: Date, startHour: number, endHour: number, typeId: BookingTypeId): Set<string> {
    const matches = filterBookingsForSlot(bookings.value, { date, startHour, endHour, typeId })
    const keys = new Set<string>()
    for (const b of matches) {
      keys.add(`${parseArea(b.zoneName)}-${parseUnitNumber(b.zoneName)}`)
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

  /**
   * Prompts the user via a styled confirm dialog, then cancels on OK.
   * Both desktop sidebar and mobile bookings-sheet share this flow.
   */
  async function cancelWithConfirm(id: number): Promise<boolean> {
    const confirm = useConfirm()
    const ok = await confirm.ask({
      title: t('bookings.cancelTitle'),
      confirmLabel: t('bookings.cancelConfirm'),
      cancelLabel: t('bookings.keep'),
      variant: 'danger',
    })
    if (!ok) return false
    return cancel(id)
  }

  return {
    bookings,
    upcoming,
    past,
    upcomingCount,
    pending: readonly(pending),
    isSlotYours,
    myUnitKeysForSlot,
    cancel,
    cancelWithConfirm,
  }
}

/** Bookings DATA SYNC — call ONCE per page. */
export function useBookingsSync() {
  const api = createApi()
  const refreshTick = useState<number>(K.REFRESH_TICK, () => 0)
  const pending = useState<boolean>(K.PENDING, () => false)

  const result = useAsyncData<BookingItem[]>(
    FETCH_KEY.BOOKINGS,
    () => api<BookingItem[]>(API.BOOKINGS),
    {
      default: () => [],
      watch: [refreshTick],
      getCachedData: initialOnlyCache,
    },
  )

  watchSyncEffect(() => {
    pending.value = result.pending.value
  })

  return result
}
