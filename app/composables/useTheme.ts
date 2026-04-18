import { STATE_KEY } from '#shared/state-keys'

type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'faynatown-theme'

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function systemPrefersLight(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: light)').matches
}

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref === 'system') return systemPrefersLight() ? 'light' : 'dark'
  return pref
}

/**
 * Theme composable — exposes `resolved` (light|dark) plus `set`/`toggle` for
 * the UI toggle button. `init()` is consumed exclusively by
 * `plugins/theme.client.ts` at boot; components do not call it.
 *
 * Persistence: localStorage only ('system' is not stored — we just omit the
 * key, so the inline script in `<head>` (public/theme-init.js) can fall back
 * to OS default before hydration without a FOUC.)
 */
export function useTheme() {
  const preference = useState<ThemePreference>(STATE_KEY.THEME_PREF, () => 'system')
  const resolved = useState<ResolvedTheme>(STATE_KEY.THEME_RESOLVED, () => 'dark')

  function applyDom(value: ResolvedTheme): void {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', value)
  }

  function persist(value: ThemePreference): void {
    if (typeof localStorage === 'undefined') return
    if (value === 'system') {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, value)
  }

  function set(value: ThemePreference): void {
    preference.value = value
    const next = resolve(value)
    resolved.value = next
    applyDom(next)
    persist(value)
  }

  function toggle(): void {
    set(resolved.value === 'dark' ? 'light' : 'dark')
  }

  function init(): void {
    if (typeof window === 'undefined') return
    const stored: unknown = localStorage.getItem(STORAGE_KEY)
    const initial: ThemePreference = isPreference(stored) ? stored : 'system'
    preference.value = initial
    const next = resolve(initial)
    resolved.value = next
    applyDom(next)

    // Live-track OS preference while the user is in 'system' mode.
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener('change', () => {
      if (preference.value !== 'system') return
      const r: ResolvedTheme = mq.matches ? 'light' : 'dark'
      resolved.value = r
      applyDom(r)
    })
  }

  return {
    resolved: readonly(resolved),
    set,
    toggle,
    init,
  }
}
