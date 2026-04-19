import { STATE_KEY } from '#shared/state-keys'
import { getAuthToken } from '~/utils/auth-storage'

/**
 * Restores the JWT mirror from localStorage on client boot.
 *
 * Runs before route middleware and component setup, so by the time
 * `app/middleware/auth.ts` reads `useState(IS_LOGGED_IN)` and `createApi`
 * reads `useState(TOKEN)` to attach `Authorization: Bearer`, both are
 * already populated if localStorage has a token.
 *
 * Why localStorage and not the httpOnly cookie: iOS Safari on *.vercel.app
 * (Public Suffix List) drops our cookie when the user swipes up to kill the
 * tab. localStorage survives that lifecycle, so it's the only persistent
 * store we can rely on for the JWT. The app runs as SPA (`ssr: false`) so
 * this plugin fully owns the auth-boot path on every page load.
 */
export default defineNuxtPlugin(() => {
  const token = useState<string | null>(STATE_KEY.TOKEN, () => null)
  const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN, () => false)

  // Already seeded (e.g. by useAuth.login() earlier in the same session).
  if (token.value) return

  const stored = getAuthToken()
  if (!stored) return

  token.value = stored
  isLoggedIn.value = true
})
