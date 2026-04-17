import type { H3Event } from 'h3'
import { AUTH_COOKIE_NAME } from '#shared/constants'

/**
 * Requires the caller to be authenticated. Reads JWT from the httpOnly
 * cookie and sets it on `event.context.token`. Throws 401 otherwise.
 *
 * Returns the token so routes can use it directly if needed.
 */
export function requireAuth(event: H3Event): string {
  const token = event.context.token ?? getCookie(event, AUTH_COOKIE_NAME)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  event.context.token = token
  return token
}
