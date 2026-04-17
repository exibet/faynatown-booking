/**
 * Shared keys for `useState(...)` — centralising them prevents typos that
 * would silently create separate state instances across files.
 */
export const STATE_KEY = {
  IS_LOGGED_IN: 'auth:is-logged-in',
} as const

export type StateKey = typeof STATE_KEY[keyof typeof STATE_KEY]
