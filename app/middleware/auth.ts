import { STATE_KEY } from '#shared/state-keys'

/**
 * Route guard. Redirects unauthenticated users to /login while preserving
 * the originally requested path as a `redirect` query parameter.
 *
 * Sole source of truth: `useState(IS_LOGGED_IN)`. Seeded on client boot by
 * `plugins/auth-token.client.ts` from localStorage, and by `useAuth.login()`
 * after a successful auth call. No cookie fallback — the app is Bearer-only
 * on the wire and runs as SPA (`ssr: false`), so every auth decision lives
 * on the client.
 */
export default defineNuxtRouteMiddleware((to) => {
  const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN, () => false)
  if (isLoggedIn.value) return

  return navigateTo({
    path: '/login',
    query: to.path === '/' ? undefined : { redirect: to.fullPath },
  })
})
