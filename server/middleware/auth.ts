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
  // TEMP diagnostic — verifies the dual-storage fix on iOS. Shows whether
  // the token arrived via Authorization header or cookie (or not at all).
  // Remove once we've seen a successful production run on iPhone.
  if (event.path?.startsWith('/api/') && !event.path.startsWith('/api/auth/')) {
    const source = bearer ? 'bearer' : (getCookie(event, AUTH_COOKIE_NAME) ? 'cookie' : 'none')
    const ua = getHeader(event, 'user-agent')?.slice(0, 40) ?? ''
    // eslint-disable-next-line no-console
    console.warn(`[auth-diag] path=${event.path} source=${source} ua=${ua}`)
  }
})
