/**
 * Pre-hydration theme bootstrap. Runs synchronously in <head> so the very
 * first paint already has the right [data-theme] attribute set on <html>.
 * Lookup order: explicit user choice → OS preference → 'dark' fallback.
 */
(function () {
  try {
    var stored = localStorage.getItem('faynatown-theme')
    var explicit = stored === 'light' || stored === 'dark' ? stored : null
    var systemLight = window.matchMedia
      && window.matchMedia('(prefers-color-scheme: light)').matches
    var theme = explicit || (systemLight ? 'light' : 'dark')
    document.documentElement.setAttribute('data-theme', theme)
  }
  catch (e) {
    var fallbackLight = window.matchMedia
      && window.matchMedia('(prefers-color-scheme: light)').matches
    document.documentElement.setAttribute('data-theme', fallbackLight ? 'light' : 'dark')
  }
})()
