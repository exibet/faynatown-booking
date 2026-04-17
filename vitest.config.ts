import { resolve } from 'node:path'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary'],
      // Coverage runs only via `--project node`. Include only what node
      // project actually tests: server + app/utils + shared.
      // Composables/components are tested in nuxt project (no coverage —
      // known @nuxt/test-utils limitation).
      include: ['server/**/*.ts', 'app/utils/**/*.ts', 'shared/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/types/**',
        'app/utils/api.ts',
        'server/schemas/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'tests/unit/server/**/*.test.ts',
            'tests/unit/app/utils/**/*.test.ts',
            'tests/unit/shared/**/*.test.ts',
          ],
          alias: {
            '#shared': resolve(__dirname, 'shared'),
            '~~': resolve(__dirname),
            '~/utils': resolve(__dirname, 'app/utils'),
          },
        },
      },
      await defineVitestProject({
        extends: true,
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: [
            'tests/unit/composables/**/*.test.ts',
            'tests/unit/middleware/**/*.test.ts',
            'tests/components/**/*.test.ts',
          ],
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
            },
          },
        },
      }),
    ],
  },
})
