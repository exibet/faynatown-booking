import { STATE_KEY } from '#shared/state-keys'

interface ConfirmOptions {
  title: string
  confirmLabel: string
  cancelLabel: string
  variant?: 'default' | 'danger'
}

interface ConfirmDialogState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

/**
 * Promise-based confirm dialog — replaces native `window.confirm` with a
 * styled modal driven by <ConfirmHost>. Single-instance: opening a new
 * confirm cancels (resolves false) any in-flight one.
 */
export function useConfirm() {
  const state = useState<ConfirmDialogState | null>(STATE_KEY.CONFIRM_DIALOG, () => null)

  function ask(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (state.value) state.value.resolve(false)
      state.value = { ...options, variant: options.variant ?? 'default', resolve }
    })
  }

  function answer(value: boolean): void {
    if (!state.value) return
    state.value.resolve(value)
    state.value = null
  }

  return {
    state: readonly(state),
    ask,
    answer,
  }
}
