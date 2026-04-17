import { AUTH_COOKIE_NAME } from '#shared/constants'

/**
 * Route guard. Redirects unauthenticated users to /login while preserving
 * the originally requested path as a `redirect` query parameter.
 *
 * Reads auth state from the cookie (works on both SSR and client) rather
 * than relying on `useAuth().isLoggedIn`, which is only populated after
 * at least one API call.
 */
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>(AUTH_COOKIE_NAME).value
  if (!token) {
    return navigateTo({
      path: '/login',
      query: to.path === '/' ? undefined : { redirect: to.fullPath },
    })
  }
})
