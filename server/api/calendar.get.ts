import { z } from 'zod'
import { BOOKING_TYPE_PARAMS } from '#shared/constants'
import type {
  CalendarDay,
  CalendarWeek,
  TimeSlotResponse,
} from '#shared/types'
import { parseTimeSlot } from '~~/server/utils/slot-parser'
import { toUpstreamBookingDate, weekDates } from '~~/server/utils/date'
import { getDefaultFlatId } from '~~/server/utils/flats'

const QuerySchema = z.object({
  type: z.enum(BOOKING_TYPE_PARAMS),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
})

/**
 * Aggregates a week of availability by firing 7 parallel `/booking/slots`
 * requests (one per day). Returns a 7-element `CalendarWeek`.
 *
 * The upstream flatId is fetched lazily on every request — there's no user
 * storage for it in Phase 3. Multi-flat support is out of scope for now; we
 * use the first flat returned by `/booking/flats`.
 */
export default defineEventHandler(async (event): Promise<CalendarWeek> => {
  requireAuth(event)

  const query = getQuery(event)
  const parsed = QuerySchema.safeParse(query)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid query' })
  }
  const { type, weekStart } = parsed.data

  const flatId = await getDefaultFlatId(event)
  const dates = weekDates(weekStart)

  const daySlots = await Promise.all(
    dates.map(async (date): Promise<CalendarDay> => {
      const rawSlots = await $faynatown<TimeSlotResponse[]>(event, '/booking/slots', {
        query: {
          flatId,
          bookingType: type,
          bookingDate: toUpstreamBookingDate(date),
        },
      })
      const slots = rawSlots
        .map(parseTimeSlot)
        .filter((s): s is NonNullable<typeof s> => s !== null)
      return { date, slots }
    }),
  )

  return daySlots
})
