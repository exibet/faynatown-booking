/**
 * Shared keys for `useState(...)` — centralising them prevents typos that
 * would silently create separate state instances across files.
 */
export const STATE_KEY = {
  IS_LOGGED_IN: 'auth:is-logged-in',
  // JWT mirror for client-side XHR. Bearer-only auth (no cookie): iOS Safari
  // on *.vercel.app drops cookies on tab-kill. Seeded on client boot by
  // `plugins/auth-token.client.ts` (from localStorage — survives tab-kill)
  // and by `useAuth.login()` on fresh auth. `createApi` reads this to attach
  // `Authorization: Bearer` to every XHR.
  TOKEN: 'auth:token',
  THEME_PREF: 'theme:preference',
  THEME_RESOLVED: 'theme:resolved',
  TOASTS: 'ui:toasts',
  WEEK_ANCHOR: 'cal:week-anchor',
  SELECTED_TYPE: 'cal:type',
  SELECTED_FLAT: 'cal:flat',
  POPOVER: 'cal:popover',
  SLOT_SELECTION: 'cal:slot-selection',
  CONFIRM_DIALOG: 'ui:confirm-dialog',
  MOBILE_DAY_OFFSET: 'mob:day-offset',
  MOBILE_SHEET: 'mob:sheet',
} as const

export type StateKey = typeof STATE_KEY[keyof typeof STATE_KEY]
