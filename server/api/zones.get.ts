import { z } from 'zod'
import { BOOKING_TYPE_PARAMS } from '#shared/constants'
import type { ZoneItem, ZoneResponse } from '#shared/types'
import { stripUnavailableSuffix } from '~~/server/utils/slot-parser'
import { toUpstreamBookingDate } from '~~/server/utils/date'
import { getDefaultFlatId } from '~~/server/utils/flats'

const QuerySchema = z.object({
  type: z.enum(BOOKING_TYPE_PARAMS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  slot: z.string().min(1),
})

/**
 * Returns available zones (courts/gazebos) for a specific day+time slot.
 *
 * IMPORTANT: the upstream `slot` parameter is Ukrainian text (`з 07:00 по 08:00`).
 * It must be passed WITHOUT the `(недоступно)` suffix and URL-encoded — `fetch`
 * URL construction handles that automatically via URLSearchParams.
 */
export default defineEventHandler(async (event): Promise<ZoneItem[]> => {
  requireAuth(event)

  const query = getQuery(event)
  const parsed = QuerySchema.safeParse(query)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid query' })
  }
  const { type, date, slot } = parsed.data

  const flatId = await getDefaultFlatId(event)

  const zones = await $faynatown<ZoneResponse[]>(event, '/booking/zones', {
    query: {
      flatId,
      bookingType: type,
      bookingDate: toUpstreamBookingDate(date),
      slot,
    },
  })

  return zones.map(mapZone)
})

function mapZone(z: ZoneResponse): ZoneItem {
  return {
    id: z.id,
    name: stripUnavailableSuffix(z.name),
    available: !!z.isAvaliable,
  }
}
