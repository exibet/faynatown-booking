import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import { STATE_KEY } from '#shared/state-keys'
import type { Flat } from '#shared/types'
import { initialOnlyCache } from '~/utils/async-data'

/**
 * Flat STATE accessor. Reads data via `useNuxtData` so the SSR-fetched flats
 * are available synchronously during the first render (no watchEffect sync
 * lag → no hydration mismatch in the header pill).
 *
 * Pair with `useFlatSync()` once in the page root to actually load.
 */
export function useFlat() {
  const selectedFlatId = useState<string | null>(STATE_KEY.SELECTED_FLAT, () => null)

  const nuxtData = useNuxtData<Flat[]>(FETCH_KEY.FLATS)
  const flats = computed<Flat[]>(() => nuxtData.data.value ?? [])

  const selectedFlat = computed<Flat | null>(() => {
    const id = selectedFlatId.value ?? flats.value[0]?.flatId ?? null
    return flats.value.find(f => f.flatId === id) ?? null
  })

  const hasMultiple = computed(() => flats.value.length > 1)

  function select(flatId: string): void {
    if (flats.value.some(f => f.flatId === flatId)) {
      selectedFlatId.value = flatId
    }
  }

  return {
    flats,
    selectedFlat,
    hasMultiple,
    select,
  }
}

/** Flat DATA SYNC — call ONCE per page. */
export function useFlatSync() {
  const api = createApi()

  return useAsyncData<Flat[]>(
    FETCH_KEY.FLATS,
    () => api<Flat[]>(API.FLATS),
    {
      default: () => [],
      getCachedData: initialOnlyCache,
    },
  )
}
