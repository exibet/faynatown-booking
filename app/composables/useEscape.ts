/**
 * Wires a window `keydown` listener that invokes `callback` on Escape.
 * Auto-cleans up on unmount. Four components used to inline this pattern —
 * centralising it here avoids listener leaks and keeps behaviour consistent.
 */
export function useEscape(callback: () => void): void {
  function onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') callback()
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
}
