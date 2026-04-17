type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'faynatown:theme'

function readStored(): ThemeMode {
  if (import.meta.server) return 'system'
  const value = window.localStorage.getItem(STORAGE_KEY)
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return 'system'
}

function systemPrefersDark(): boolean {
  if (import.meta.server) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const mode = useState<ThemeMode>('theme:mode', readStored)
  // Reactive mirror of system preference so computed `isDark` tracks it.
  const systemDark = useState<boolean>('theme:system-dark', systemPrefersDark)
  const isDark = computed(() => mode.value === 'dark' || (mode.value === 'system' && systemDark.value))

  function apply(darkValue: boolean) {
    if (import.meta.server) return
    document.documentElement.classList.toggle('dark', darkValue)
  }

  function setMode(value: ThemeMode) {
    mode.value = value
    if (import.meta.client) window.localStorage.setItem(STORAGE_KEY, value)
    apply(isDark.value)
  }

  function cycle() {
    const next: ThemeMode = mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'system' : 'light'
    setMode(next)
  }

  if (import.meta.client) {
    onMounted(() => {
      apply(isDark.value)
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        systemDark.value = e.matches
        if (mode.value === 'system') apply(isDark.value)
      }
      mq.addEventListener('change', handler)
    })
  }

  return { mode: readonly(mode), isDark, setMode, cycle }
}
