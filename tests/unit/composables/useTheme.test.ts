import { beforeEach, describe, expect, it, vi } from 'vitest'

type ThemeMode = 'light' | 'dark' | 'system'

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    // Reset shared useState between tests (useState caches initializer result).
    useState<ThemeMode>('theme:mode').value = 'system'
    useState<boolean>('theme:system-dark').value = false
    vi.restoreAllMocks()
  })

  it('defaults to system mode', () => {
    const { mode } = useTheme()
    expect(mode.value).toBe('system')
  })

  it('setMode updates state, storage, and html class', () => {
    const { setMode } = useTheme()
    setMode('dark')
    expect(window.localStorage.getItem('faynatown:theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setMode light removes dark class from html', () => {
    document.documentElement.classList.add('dark')
    const { setMode } = useTheme()
    setMode('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('cycle goes light → dark → system → light', () => {
    const { setMode, cycle, mode } = useTheme()
    setMode('light')
    cycle()
    expect(mode.value).toBe('dark')
    cycle()
    expect(mode.value).toBe('system')
    cycle()
    expect(mode.value).toBe('light')
  })

  it('isDark reflects system preference when mode is system', () => {
    useState<boolean>('theme:system-dark').value = true
    const { setMode, isDark } = useTheme()
    setMode('system')
    expect(isDark.value).toBe(true)
  })
})
