import { API } from '#shared/api'
import type { BookingTypeParam } from '#shared/constants'
import type { ZoneItem } from '#shared/types'

interface ZonesQuery {
  type: BookingTypeParam
  date: string
  slot: string
}

/**
 * Lazy zone fetch. Used by the booking popover / mobile slot sheet — we
 * deliberately don't pre-fetch zones for the whole week (would be 100+
 * requests; see docs/PLAN.md), only on demand when the user clicks a slot.
 *
 * Each call is keyed by `type|date|slot`, so re-clicking the same slot
 * doesn't re-hit the API in the same session.
 */
export function useZones() {
  const api = createApi()

  const cache = useState<Record<string, ZoneItem[]>>('zones-cache', () => ({}))

  async function fetchZones(q: ZonesQuery): Promise<ZoneItem[]> {
    const k = `${q.type}|${q.date}|${q.slot}`
    const cached = cache.value[k]
    if (cached) return cached

    const zones = await api<ZoneItem[]>(API.ZONES, {
      query: { type: q.type, date: q.date, slot: q.slot },
    })
    cache.value = { ...cache.value, [k]: zones }
    return zones
  }

  return { fetchZones }
}
