import type { H3Event } from 'h3'
import type { Flat } from '#shared/types'

/**
 * Resolves the user's default flat (first flat returned by upstream).
 * Multi-flat support is out of scope for now — this centralises the 404 path
 * for users who authenticate successfully but have no flats attached.
 *
 * Per-request memoised on `event.context.flatId` so SSR renders that call
 * multiple routes (`/api/calendar`, `/api/zones`, `/api/flats`) share a
 * single upstream `/booking/flats` round-trip. `H3EventContext` is typed as
 * `Record<string, any>` by h3; the `typeof … === 'string'` guard narrows it
 * without a cast.
 *
 * Uses `$faynatown` via Nitro auto-import so tests stub it at the global level.
 */
export async function getDefaultFlatId(event: H3Event): Promise<string> {
  const cached = event.context.flatId
  if (typeof cached === 'string') return cached

  const flats = await $faynatown<Flat[]>(event, '/booking/flats')
  const flatId = flats[0]?.flatId
  if (!flatId) {
    throw createError({ statusCode: 404, statusMessage: 'No flats found' })
  }
  event.context.flatId = flatId
  return flatId
}
