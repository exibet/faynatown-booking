import { STATE_KEY } from '#shared/state-keys'
import { clearAuthToken } from '~/utils/auth-storage'

interface ApiErrorShape {
  statusCode?: number
  statusMessage?: string
  message?: string
  data?: { message?: string }
}

function isApiError(value: unknown): value is ApiErrorShape {
  return typeof value === 'object' && value !== null
}

/**
 * Pre-configured `$fetch` instance with global error handling.
 *
 * Auth: attaches `Authorization: Bearer <jwt>` from `useState(TOKEN)` on every
 * request. That state is seeded on client boot by `plugins/auth-token.client`
 * (from localStorage) and updated by `useAuth.login()`. No cookie forwarding
 * — the app is Bearer-only since the iOS cookie-drop cleanup; the homepage
 * is SPA (`routeRules.ssr=false`) so there's no SSR auth path either.
 *
 * On 401 from upstream we clear the in-memory state + localStorage mirror
 * and navigate to /login via the captured Nuxt context.
 *
 * Called from each composable's setup — `useI18n()` and `useToast()` require
 * component setup context, so we can't hoist this into a Nuxt plugin.
 * `$fetch.create()` is cheap; the cost of one extra factory call per
 * composable invocation is not worth the complexity of threading the instance
 * through a plugin that only works on first call.
 */
export function createApi() {
  const toast = useToast()
  const { t } = useI18n()
  const nuxtApp = useNuxtApp()

  const token = useState<string | null>(STATE_KEY.TOKEN, () => null)

  return $fetch.create({
    onRequest({ options }) {
      const headers = new Headers(options.headers)
      if (token.value) headers.set('authorization', `Bearer ${token.value}`)
      options.headers = headers
    },

    onResponseError({ response }) {
      const payload: unknown = response?._data
      const error = isApiError(payload) ? payload : {}
      const statusCode = error.statusCode ?? response?.status

      if (statusCode === 401) {
        const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN)
        isLoggedIn.value = false
        token.value = null
        // Drop the localStorage mirror too — otherwise the auth-token plugin
        // would re-seed a dead JWT on the next boot and we'd loop back here.
        clearAuthToken()
        toast.error(t('auth.sessionExpired'))
        nuxtApp.runWithContext(() => navigateTo('/login'))
        return
      }

      const detail = error.statusMessage || error.message || error.data?.message || t('errors.generic')
      toast.error(detail)
    },

    onRequestError() {
      toast.error(t('errors.network'))
    },
  })
}
