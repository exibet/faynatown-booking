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
        const isLoggedIn = useState<boolean>('auth:is-logged-in')
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
