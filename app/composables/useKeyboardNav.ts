/**
 * Wires a window `keydown` listener that dispatches keys against a map of
 * handlers. Skips events originating from text inputs so the user can type
 * freely in forms. Auto-cleans on unmount.
 */
export function useKeyboardNav(map: Record<string, () => void>): void {
  function onKey(event: KeyboardEvent): void {
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
    const handler = map[event.key]
    if (handler) handler()
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
}
