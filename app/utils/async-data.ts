import type { NuxtApp } from 'nuxt/app'

/**
 * `getCachedData` helper for `useAsyncData`. Reuse the Nuxt payload **only**
 * on the initial hydration request. For watch-triggered refetches (week/type
 * change, manual refresh) we must hit the network; without this the cache
 * short-circuits and the UI would stay on the stale data.
 *
 * The payload store is typed `Record<string, unknown>` by Nuxt — the generic
 * `T` is a trust-boundary asserted by the caller (the same T is what
 * `useAsyncData<T>` just fetched and what Nuxt serialised into the payload).
 * This single `as` cast is unavoidable without adding a full runtime schema.
 */
export function initialOnlyCache<T>(
  key: string,
  nuxtApp: NuxtApp,
  ctx: { cause: 'initial' | 'refresh:hook' | 'refresh:manual' | 'watch' },
): T | undefined {
  if (ctx.cause !== 'initial') return undefined
  const value: unknown = nuxtApp.payload.data[key]
  if (value === undefined) return undefined
  return value as T
}
