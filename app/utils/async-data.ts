import type { NuxtApp } from 'nuxt/app'

/**
 * `getCachedData` helper for `useAsyncData`. Reuse the Nuxt payload **only**
 * on the initial hydration request. For watch-triggered refetches (week/type
 * change, manual refresh) we must hit the network; without this the cache
 * short-circuits and the UI would stay on the stale data.
 */
export function initialOnlyCache<T>(
  key: string,
  nuxtApp: NuxtApp,
  ctx: { cause: 'initial' | 'refresh:hook' | 'refresh:manual' | 'watch' },
): T | undefined {
  if (ctx.cause === 'initial') return nuxtApp.payload.data[key] as T | undefined
  return undefined
}
