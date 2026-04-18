import type { Flat } from '#shared/types'

/**
 * Lists flats associated with the authenticated user. The desktop header
 * uses this to render the flat-picker pill (single flat → static label,
 * multi-flat → dropdown).
 *
 * The `validationMessage` field from upstream is dropped — it's never
 * populated for residents with at least one flat.
 */
export default defineEventHandler(async (event): Promise<Flat[]> => {
  requireAuth(event)
  return $faynatown<Flat[]>(event, '/booking/flats')
})
