/**
 * Nuxt configuration.
 *
 * UI стек — pure CSS на OKLCH-токенах + Inter Tight / JetBrains Mono.
 * Theme перемикається атрибутом [data-theme="light|dark"] на <html>;
 * inline-script у <head> читає localStorage до гідратації, що уникає FOUC.
 */
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n', '@nuxtjs/google-fonts'],

  // Flatten component names — `app/components/ui/ToastHost.vue` resolves as
  // `<ToastHost>` (not `<UiToastHost>`), matching how the components were
  // referenced when written.
  components: [{ path: '~/components', pathPrefix: false }],
  devtools: { enabled: true },

  app: {
    head: {
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
