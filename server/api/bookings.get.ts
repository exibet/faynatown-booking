import type { BookingItem, BookingResponse } from '#shared/types'

/**
 * Returns the user's bookings (all types, active + past) in a trimmed
 * client-friendly shape. UI flags like icon filenames / hex colors are dropped
 * — the client derives those from `typeId` and `isActive`.
 */
export default defineEventHandler(async (event): Promise<BookingItem[]> => {
  requireAuth(event)

  const bookings = await $faynatown<BookingResponse[]>(event, '/booking/userBookings', {
    query: { getBBQOnly: 'False' },
  })

  return bookings.map(mapBooking)
})

function mapBooking(b: BookingResponse): BookingItem {
  return {
    id: b.id,
    zoneName: b.zoneName,
    start: b.bookingStart,
    end: b.bookingEnd,
    typeId: b.type,
    isActive: !!b.isActive,
    canCancel: !!b.allowDelete && !b.notAllowDelete,
  }
}
