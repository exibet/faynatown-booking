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
}).append({
  // CLI scripts print progress to stdout — console.log is the intended
  // output channel there, not a debugging leftover.
  files: ['scripts/**/*.{mjs,ts}'],
  rules: {
    'no-console': 'off',
  },
})
