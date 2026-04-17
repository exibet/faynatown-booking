import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: false,
      quotes: 'single',
    },
    tooling: true,
  },
}).override('nuxt/rules', {
  rules: {
    'no-console': 'error',
    'vue/max-len': ['error', { code: 120 }],
  },
})
