import { AUTH_STORAGE_KEY } from '#shared/constants'

/**
 * Persistent client-side store for the Faynatown JWT.
 *
 * Wraps `localStorage` with two guards:
 * - `import.meta.client` — the composable callers (`useAuth`, `createApi`) are
 *   dual-bundled for SSR; on the server `localStorage` is undefined and any
 *   reference throws ReferenceError at eval time.
 * - `try/catch` — Safari private mode / storage-quota / cookie-blocked states
 *   make localStorage writes throw. We degrade silently to in-memory-only
 *   auth for the current session; the user has to re-login after tab kill.
 *
 * Single source of truth for the storage key — callers stay clean of the
 * `AUTH_STORAGE_KEY` constant and the boilerplate.
 */

export function getAuthToken(): string | null {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  }
  catch {
    return null
  }
}

export function setAuthToken(token: string): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
  }
  catch {
    // best-effort — see module doc
  }
}

export function clearAuthToken(): void {
  if (!import.meta.client) return
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
  catch {
    // best-effort — see module doc
  }
}
