import { STATE_KEY } from '#shared/state-keys'

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
 * Pre-configured `$fetch` instance with global error handling and SSR
 * cookie/header forwarding.
 *
 * Why we forward `cookie` manually: during SSR our composables call
 * `/api/calendar`, `/api/bookings`, etc. via `$fetch`. Without an explicit
 * cookie header, those requests reach our own Nitro server with no auth
 * context — server middleware sees no token, the route returns 401, and the
 * page renders empty. `useRequestHeaders(['cookie'])` reads the original
 * browser cookie sent to SSR and re-attaches it to the internal call.
 *
 * On 401 from upstream we clear the in-memory `isLoggedIn` state (the
 * server has already deleted the httpOnly cookie inside `$faynatown`) and
 * navigate to /login via the captured Nuxt context.
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
  const ssrHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  return $fetch.create({
    onRequest({ options }) {
      if (ssrHeaders?.cookie) {
        const headers = new Headers(options.headers)
        headers.set('cookie', ssrHeaders.cookie)
        options.headers = headers
      }
    },

    onResponseError({ response }) {
      const payload: unknown = response?._data
      const error = isApiError(payload) ? payload : {}
      const statusCode = error.statusCode ?? response?.status

      if (statusCode === 401) {
        const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN)
        isLoggedIn.value = false
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
