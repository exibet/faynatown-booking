import { AUTH_COOKIE_NAME } from '#shared/constants'
import { STATE_KEY } from '#shared/state-keys'

/**
 * Route guard. Redirects unauthenticated users to /login while preserving
 * the originally requested path as a `redirect` query parameter.
 *
 * Two-source check, in order:
 * 1. `useState(IS_LOGGED_IN)` — set by `useAuth().login()` after a successful
 *    server response. This works on the client even when the cookie is
 *    httpOnly (which it is — see server/api/auth/login.post.ts).
 * 2. `useCookie(AUTH_COOKIE_NAME)` — used on SSR where event.headers.cookie
 *    is readable. On the client this returns null for httpOnly cookies, but
 *    that's fine because the state above will be set.
 *
 * Without source #1, a SPA navigation right after login would bounce back to
 * /login because the client cannot see the freshly set httpOnly cookie.
 */
export default defineNuxtRouteMiddleware((to) => {
  const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN, () => false)
  if (isLoggedIn.value) return

  const token = useCookie<string | null>(AUTH_COOKIE_NAME).value
  if (token) {
    isLoggedIn.value = true
    return
  }

  return navigateTo({
    path: '/login',
    query: to.path === '/' ? undefined : { redirect: to.fullPath },
  })
})
