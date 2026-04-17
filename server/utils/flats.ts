import type { H3Event } from 'h3'
import type { Flat } from '#shared/types'

/**
 * Resolves the user's default flat (first flat returned by upstream).
 * Multi-flat support is out of scope for now — this centralises the 404 path
 * for users who authenticate successfully but have no flats attached.
 *
 * Uses `$faynatown` via Nitro auto-import so tests stub it at the global level.
 */
export async function getDefaultFlatId(event: H3Event): Promise<string> {
  const flats = await $faynatown<Flat[]>(event, '/booking/flats')
  const flatId = flats[0]?.flatId
  if (!flatId) {
    throw createError({ statusCode: 404, statusMessage: 'No flats found' })
  }
  return flatId
}
