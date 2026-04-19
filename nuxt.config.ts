/**
 * Nuxt configuration.
 *
 * UI стек — pure CSS на OKLCH-токенах + Inter Tight / JetBrains Mono.
 * Theme перемикається атрибутом [data-theme="light|dark"] на <html>;
 * inline-script у <head> читає localStorage до гідратації, що уникає FOUC.
 *
 * Head meta/link tags split:
 * - Static (favicons, manifest, theme-color, viewport, apple-web-app) live
 *   here so they render into the initial HTML shell without waiting on the
 *   app bundle (even in SPA mode, Nuxt emits the head chunk server-side).
 * - Dynamic OG / title / description live in `app.vue` via `useSeoMeta` so
 *   they stay reactive to locale changes.
 */
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n', '@nuxtjs/google-fonts'],

  // SPA mode (no SSR). The app is a residents-only tool — no SEO, no
  // anonymous browsing surface, all data is per-user. SSR added complexity
  // (cookie-dropped-by-iOS-ITP auth path, SPA↔SSR mode-switching on nav)
  // without any user-visible benefit: the calendar and bookings fetch
  // client-side via Bearer XHR regardless of render mode. `/login` is also
  // SPA, so top-level navigation between the two routes is natural.
  // Nitro still runs — server routes (`/api/*`) continue to work as a
  // proxy layer that injects `version: 45` and the Bearer from request
  // context into upstream Faynatown calls.
  ssr: false,

  // Flatten component names — `app/components/ui/ToastHost.vue` resolves as
  // `<ToastHost>` (not `<UiToastHost>`), matching how the components were
  // referenced when written.
  components: [{ path: '~/components', pathPrefix: false }],
  devtools: { enabled: true },

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        // `maximum-scale=1` + `user-scalable=no` disable pinch-zoom — the
        // calendar grid is tuned for fixed breakpoints and pinch-zoomed
        // layouts overflow. System-level text zoom (iOS Accessibility) still
        // works, so low-vision users aren't locked out.
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, '
            + 'user-scalable=no, viewport-fit=cover',
        },
        // Matches --bg in dark theme; inline theme-init.js sets [data-theme]
        // before hydration so the browser chrome colour-matches the app.
        { name: 'theme-color', content: '#1A1D20', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#FAFAFA', media: '(prefers-color-scheme: light)' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Booking' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        // Stop iOS Safari from linkifying phone-number-like digits inside
        // slot time labels ("07:00–08:00") — the parser occasionally decides
        // those are phone numbers and renders them as tappable <a>.
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/icon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      script: [
        // Theme bootstrap runs before hydration so the first paint already
        // matches user preference. Source in /public/theme-init.js.
        { src: '/theme-init.js', tagPosition: 'head' },
      ],
    },
  },

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/desktop.css',
    '~/assets/css/mobile.css',
  ],

  devServer: {
    port: 3500,
  },
  compatibilityDate: '2025-07-15',

  googleFonts: {
    families: {
      'Inter Tight': [400, 500, 600],
      'JetBrains Mono': [400, 500],
    },
    display: 'swap',
    download: true,
    preconnect: true,
  },

  i18n: {
    locales: [
      { code: 'uk', name: 'Українська', file: 'uk.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'uk',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'faynatown-locale',
      redirectOn: 'root',
    },
  },
})
