/**
 * Initialises theme state on the client: reads localStorage, resolves `system`
 * against the current OS preference, wires the `prefers-color-scheme` listener
 * that tracks OS changes live while the user is in system mode.
 *
 * A tiny inline script in `<head>` (public/theme-init.js) already sets the
 * `data-theme` attribute before hydration to avoid FOUC. This plugin syncs
 * the reactive state after hydration so the in-UI toggle has a consistent
 * starting value.
 */
export default defineNuxtPlugin(() => {
  const theme = useTheme()
  theme.init()
})
