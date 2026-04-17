/**
 * Cancels an existing booking via `POST /booking/remove` upstream
 * (upstream uses POST despite the semantic being a delete).
 */
export default defineEventHandler(async (event) => {
  requireAuth(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number.parseInt(idParam ?? '', 10)
  if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid booking id' })
  }

  await $faynatown<boolean>(event, '/booking/remove', {
    method: 'POST',
    body: { BookingId: id },
  })

  return { ok: true }
})
