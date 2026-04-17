import { AUTH_COOKIE_NAME } from '#shared/constants'

/**
 * Reads the Faynatown JWT from the httpOnly cookie on every request and
 * exposes it at `event.context.token`. Routes call `requireAuth(event)`
 * to enforce auth — this middleware only loads the token.
 */
export default defineEventHandler((event) => {
  const token = getCookie(event, AUTH_COOKIE_NAME)
  if (token) event.context.token = token
})
