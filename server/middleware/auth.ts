import { AUTH_COOKIE_NAME } from '#shared/constants'

/**
 * Loads the Faynatown JWT into `event.context.token` on every request.
 *
 * Two sources in priority order:
 *   1. `Authorization: Bearer <jwt>` header (client-side XHR path)
 *   2. `faynatown_token` httpOnly cookie (SSR / top-level navigation path)
 *
 * Why both: iOS Safari and ITP can silently drop our cookie between SSR and
 * the first client-side fetch on *.vercel.app (Public Suffix List). The
 * client keeps a mirror of the JWT in `useState(STATE_KEY.TOKEN)` seeded by
 * `plugins/auth-token.server.ts` and attaches it as a Bearer header via
 * `createApi`, which survives regardless of cookie jar behaviour.
 *
 * Routes call `requireAuth(event)` to enforce auth — this middleware only
 * loads the token.
 */
export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = bearer || getCookie(event, AUTH_COOKIE_NAME)
  if (token) event.context.token = token
  // TEMP diagnostic — iOS Safari logs user out after first request.
  // Distinguish "no cookie at all" from "cookie present but upstream rejects".
  // Remove once root cause is confirmed.
  if (event.path?.startsWith('/api/') && !event.path.startsWith('/api/auth/')) {
    const cookieHeader = getHeader(event, 'cookie') ?? ''
    const ua = getHeader(event, 'user-agent')?.slice(0, 40) ?? ''
    const names = cookieHeader
      .split(';')
      .map(s => s.trim().split('=')[0])
      .filter(Boolean)
      .join(',')
    // eslint-disable-next-line no-console
    console.warn(
      `[auth-diag] path=${event.path} hasCookie=${!!token} `
      + `cookieHeaderLen=${cookieHeader.length} names=[${names}] ua=${ua}`,
    )
  }
})
