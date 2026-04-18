/**
 * Fires `fn` every `ms` milliseconds between mount and unmount.
 * Centralises the `setInterval` + `clearInterval` teardown pattern that
 * several components inlined; guarantees no timer leaks.
 */
export function useInterval(fn: () => void, ms: number): void {
  let timer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    timer = setInterval(fn, ms)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })
}
