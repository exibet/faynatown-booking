import { AUTH_COOKIE_NAME } from '#shared/constants'

/**
 * Reads the Faynatown JWT from the httpOnly cookie on every request and
 * exposes it at `event.context.token`. Routes call `requireAuth(event)`
 * to enforce auth — this middleware only loads the token.
 */
export default defineEventHandler((event) => {
  const token = getCookie(event, AUTH_COOKIE_NAME)
  if (token) event.context.token = token
  // TEMP diagnostic — iOS Safari logs user out after first request.
  // Distinguish "no cookie at all" from "cookie present but upstream rejects".
  // Remove once root cause is confirmed.
  if (event.path?.startsWith('/api/') && !event.path.startsWith('/api/auth/')) {
    const cookieHeader = getHeader(event, 'cookie') ?? ''
    const ua = getHeader(event, 'user-agent')?.slice(0, 40) ?? ''
    // eslint-disable-next-line no-console
    console.warn(
      `[auth-diag] path=${event.path} hasCookie=${!!token} `
      + `cookieHeaderLen=${cookieHeader.length} ua=${ua}`,
    )
  }
})
