import { AUTH_STORAGE_KEY } from '#shared/constants'
import { createSafeStorage } from '~/utils/safe-storage'

/**
 * Persistent client-side store for the Faynatown JWT.
 *
 * Thin domain wrapper over `createSafeStorage` — the SSR + private-mode
 * guards live in that helper so every storage key in the app degrades
 * identically. Single source of truth for `AUTH_STORAGE_KEY` means callers
 * stay clean of the constant and the boilerplate.
 */

const store = createSafeStorage(AUTH_STORAGE_KEY)

export const getAuthToken = store.get
export const setAuthToken = store.set
export const clearAuthToken = store.remove
