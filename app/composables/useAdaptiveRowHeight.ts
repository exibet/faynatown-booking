/**
 * Measures a container's height and divides it evenly among `itemCount`
 * rows, clamped to a minimum. Tracks live resizes via ResizeObserver.
 *
 * Extracted from WeekGrid so the grid component stays purely declarative.
 */
interface Options {
  min: number
  fallback: number
}

export function useAdaptiveRowHeight(
  bodyRef: Ref<HTMLElement | null>,
  itemCount: Ref<number> | ComputedRef<number>,
  opts: Options = { min: 44, fallback: 80 },
): Ref<number> {
  const rowH = ref(opts.fallback)
  let observer: ResizeObserver | null = null

  function recompute(): void {
    const el = bodyRef.value
    if (!el) return
    const available = el.clientHeight
    if (available <= 0) return
    const count = itemCount.value
    if (count <= 0) return
    rowH.value = Math.max(opts.min, Math.floor(available / count))
  }

  onMounted(() => {
    recompute()
    const el = bodyRef.value
    if (!el || typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver(() => recompute())
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  watch(itemCount, () => recompute(), { flush: 'post' })

  return rowH
}
