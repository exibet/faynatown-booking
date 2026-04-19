/**
 * Shared keys for `useState(...)` — centralising them prevents typos that
 * would silently create separate state instances across files.
 */
export const STATE_KEY = {
  IS_LOGGED_IN: 'auth:is-logged-in',
  // JWT mirror for client-side XHR. Mirrors the httpOnly cookie because iOS
  // Safari/ITP can drop the cookie between SSR and client fetches on
  // *.vercel.app (Public Suffix List domain). Source of truth remains the
  // cookie for SSR/navigation; this state is seeded from the server via a
  // Nuxt plugin so client requests can attach Authorization: Bearer headers.
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
