/**
 * SSR-safe reactive media query.
 *
 * Returns `false` on SSR / initial client render. Use only when you genuinely
 * need a JS-side reactive boolean — for layout switching, prefer CSS @media
 * queries (see `pages/index.vue`) so SSR renders both trees and CSS hides
 * the inactive one without flicker or UA sniffing.
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)

  if (typeof window === 'undefined') {
    return readonly(matches)
  }

  const mql = window.matchMedia(query)

  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  onMounted(() => {
    matches.value = mql.matches
    mql.addEventListener('change', onChange)
  })

  onBeforeUnmount(() => {
    mql.removeEventListener('change', onChange)
  })

  return readonly(matches)
}
