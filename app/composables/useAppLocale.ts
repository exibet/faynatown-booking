import type { Locale } from '~/utils/datetime'

/**
 * Narrows `useI18n().locale` (which ships as a wider `string`) to the
 * project's supported locales. Centralises the `=== 'uk' ? 'uk' : 'en'`
 * guard that was duplicated across 8+ components.
 */
export function useAppLocale() {
  const { locale } = useI18n()
  return computed<Locale>(() => locale.value === 'uk' ? 'uk' : 'en')
}
