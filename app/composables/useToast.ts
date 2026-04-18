import { STATE_KEY } from '#shared/state-keys'

export type ToastVariant = 'info' | 'error'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

const DEFAULT_TTL_MS = 2400

/**
 * Lightweight global toast stack. Replaces the PrimeVue useToast() that
 * existed in Phase 4. Renders via <ToastHost> (mounted from app.vue).
 */
export function useToast() {
  const items = useState<ToastItem[]>(STATE_KEY.TOASTS, () => [])

  function show(message: string, variant: ToastVariant = 'info', ttlMs: number = DEFAULT_TTL_MS): void {
    if (!message) return
    const id = Date.now() + Math.random()
    items.value = [...items.value, { id, message, variant }]
    if (typeof window === 'undefined') return
    window.setTimeout(() => dismiss(id), ttlMs)
  }

  function error(message: string, ttlMs: number = DEFAULT_TTL_MS * 2): void {
    show(message, 'error', ttlMs)
  }

  function dismiss(id: number): void {
    items.value = items.value.filter(t => t.id !== id)
  }

  return {
    items: readonly(items),
    show,
    error,
    dismiss,
  }
}
