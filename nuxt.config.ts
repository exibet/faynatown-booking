import tailwindcss from '@tailwindcss/vite'
import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({

  modules: ['@primevue/nuxt-module', '@nuxtjs/i18n', '@nuxtjs/color-mode'],
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // @nuxtjs/color-mode manages `.dark` class on <html> via an inline script
  // that runs before hydration — cookie-persisted, no FOUC.
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storage: 'cookie',
    storageKey: 'faynatown-color-mode',
  },

  devServer: {
    port: 3500,
  },
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    locales: [
      { code: 'uk', name: 'Українська', file: 'uk.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'uk',
    strategy: 'no_prefix',
  },

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primevue',
            order: 'theme, base, primevue, components, utilities',
          },
        },
      },
    },
  },
})
