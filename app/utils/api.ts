import { useToast } from 'primevue/usetoast'

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
 * Pre-configured `$fetch` instance with a global error handler so components
 * don't repeat `try/catch → toast` at every call site. Used by composables
 * in Phase 5 (calendar/bookings/zones).
 */
export function createApi() {
  const toast = useToast()
  const { t } = useI18n()

  return $fetch.create({
    onResponseError({ response }) {
      const payload: unknown = response?._data
      const error = isApiError(payload) ? payload : {}
      const statusCode = error.statusCode ?? response?.status

      if (statusCode === 401) {
        toast.add({
          severity: 'warn',
          summary: t('errors.unauthorized'),
          life: 3000,
        })
        return
      }

      const detail = error.statusMessage || error.message || error.data?.message || t('errors.generic')
      toast.add({
        severity: 'error',
        summary: t('errors.generic'),
        detail,
        life: 5000,
      })
    },

    onRequestError() {
      toast.add({
        severity: 'error',
        summary: t('errors.network'),
        life: 5000,
      })
    },
  })
}
