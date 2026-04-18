/**
 * Shared keys for `useState(...)` — centralising them prevents typos that
 * would silently create separate state instances across files.
 */
export const STATE_KEY = {
  IS_LOGGED_IN: 'auth:is-logged-in',
  THEME_PREF: 'theme:preference',
  THEME_RESOLVED: 'theme:resolved',
  TOASTS: 'ui:toasts',
  WEEK_ANCHOR: 'cal:week-anchor',
  SELECTED_TYPE: 'cal:type',
  SELECTED_FLAT: 'cal:flat',
  POPOVER: 'cal:popover',
  CONFIRM_DIALOG: 'ui:confirm-dialog',
  MOBILE_DAY_OFFSET: 'mob:day-offset',
  MOBILE_SHEET: 'mob:sheet',
} as const

export type StateKey = typeof STATE_KEY[keyof typeof STATE_KEY]
