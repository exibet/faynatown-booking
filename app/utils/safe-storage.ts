/**
 * Client-side `localStorage` wrapper scoped to a single key.
 *
 * Guards:
 * - `import.meta.client` — composable callers are dual-bundled for SSR; on
 *   the server `localStorage` is undefined and any reference throws
 *   ReferenceError at eval time.
 * - `try/catch` — Safari private mode / storage-quota / cookie-blocked states
 *   make `localStorage` operations throw. We degrade silently to in-memory
 *   (returns `null` on read, swallows writes/removes).
 *
 * Returned object closes over the key via arrow-fn closures, so destructuring
 * callers (`const { get, set } = createSafeStorage(...)`) don't need to worry
 * about `this` binding.
 */

export interface SafeStorage {
  get: () => string | null
  set: (value: string) => void
  remove: () => void
}

export function createSafeStorage(key: string): SafeStorage {
  return {
    get: () => {
      if (!import.meta.client) return null
      try {
        return localStorage.getItem(key)
      }
      catch {
        return null
      }
    },
    set: (value: string) => {
      if (!import.meta.client) return
      try {
        localStorage.setItem(key, value)
      }
      catch {
        // best-effort — see module doc
      }
    },
    remove: () => {
      if (!import.meta.client) return
      try {
        localStorage.removeItem(key)
      }
      catch {
        // best-effort — see module doc
      }
    },
  }
}
