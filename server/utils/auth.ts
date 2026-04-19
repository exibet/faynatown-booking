import type { H3Event } from 'h3'

/**
 * Requires the caller to be authenticated. Reads the JWT that
 * `server/middleware/auth.ts` extracted from the `Authorization: Bearer`
 * header and placed on `event.context.token`. Throws 401 otherwise.
 *
 * Returns the token so routes can use it directly if needed.
 */
export function requireAuth(event: H3Event): string {
  const token = event.context.token
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return token
}
