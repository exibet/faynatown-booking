# Tests

## Структура

```
tests/
├── helpers/                 ← Shared infrastructure (DO NOT skip)
│   ├── server.ts            ← Mocks for h3 + Nitro auto-imports + $faynatown
│   └── fixtures.ts          ← Shared IDs and tokens
├── unit/
│   ├── server/              ← API routes + utils  (node env, COVERAGE)
│   ├── app/utils/           ← Pure functions      (node env, COVERAGE)
│   ├── shared/              ← Constants, helpers  (node env, COVERAGE)
│   ├── composables/         ← Composables         (nuxt env)
│   └── middleware/          ← Route middleware    (nuxt env)
├── components/              ← Vue SFC tests       (nuxt env)
└── e2e/                     ← Playwright end-to-end
```

## Two-config split

`vitest.config.ts` defines two projects:

| Project | Env | Coverage | Tests |
|---------|-----|----------|-------|
| `node` | node | ✓ enabled | server/api, server/utils, app/utils, shared |
| `nuxt` | nuxt + happy-dom | ✗ blocked by @nuxt/test-utils | composables, middleware, components |

**Why split:** Nuxt env breaks coverage output for both v8 and istanbul providers (known limitation). Node env tests measure honest coverage; Nuxt env tests run but don't count toward gate.

## Running

```bash
npm test                 # all tests, watch mode
npm run test:run         # all tests, single run
npm run test:coverage    # node project + coverage gate (used by pre-commit)
npm run test:nuxt        # nuxt project only
npm run test:e2e         # playwright e2e
```

## Pre-commit gate

`.husky/pre-commit` runs:
1. `lint-staged` (eslint --fix)
2. `npm run typecheck`
3. `npm run test:coverage` — fails commit if coverage drops below threshold

Coverage thresholds (in `vitest.config.ts`):
- lines / functions / statements: 70%
- branches: 65%

## Network safety

`stubFetchGuard()` (called inside `setupServerMocks()`) replaces `fetch` and `$fetch` with throwing stubs. Any accidental real HTTP call fails loudly with `REAL NETWORK CALL BLOCKED: <url>`.

Server handlers never reach the real Faynatown API in tests — `$faynatown()` is stubbed via `setupServerMocks({ faynatown: vi.fn().mockResolvedValue(...) })`.

## Patterns

### Server route test

```ts
import { describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { VALID_JWT, VALID_FLAT_ID } from '../../../helpers/fixtures'

describe('GET /api/calendar', () => {
  it('rejects unauthenticated', async () => {
    setupServerMocks({ token: null })
    const { default: handler } = await import('~~/server/api/calendar.get')
    await expectHttpError(() => handler(createMockEvent()), 401)
  })

  it('returns aggregated week', async () => {
    const faynatown = vi.fn()
      .mockResolvedValueOnce([{ flatId: VALID_FLAT_ID, complexId: 1 }])
      .mockResolvedValue([{ slotValidated: 'з 07:00 по 08:00', isAvaliable: true }])

    setupServerMocks({ token: VALID_JWT, faynatown })

    const { default: handler } = await import('~~/server/api/calendar.get')
    const result = await handler(createMockEvent({
      query: { type: 'Paddle_Tennis', weekStart: '2026-04-21' },
    }))

    expect(result).toHaveLength(7)
  })
})
```

### Composable test (Nuxt env)

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockApi } = vi.hoisted(() => ({ mockApi: vi.fn() }))

vi.stubGlobal('$api', mockApi)
mockNuxtImport('$api', () => mockApi)

describe('useCalendar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches week data', async () => {
    mockApi.mockResolvedValue([])
    const { calendarData } = useCalendar()
    await calendarData.refresh?.()
    expect(mockApi).toHaveBeenCalled()
  })
})
```

### Component test (Nuxt env)

```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WeekView from '~/components/calendar/WeekView.vue'

describe('WeekView', () => {
  it('renders week grid', async () => {
    const wrapper = await mountSuspended(WeekView, { props: { week: [] } })
    expect(wrapper.exists()).toBe(true)
  })
})
```

**Always use `mountSuspended` (not `mount`)** — components that use PrimeVue or Nuxt auto-imports need the Nuxt context that `mountSuspended` provides.

## What we test vs skip

### Tested (high ROI)
- **Server routes** — auth, validation, Faynatown API quirks (`isAvaliable`, `(недоступно)` parsing, `version: 45` header)
- **App utils** — pure logic (date parsing, slot parsing, URL encoding)
- **Composables** — state machines, mutations, error handling
- **Calendar cell logic** — availability rendering, booking overlay

### Skipped (low ROI)
- **Pure presentation components** — icons, avatars, simple wrappers
- **Pages** — integration territory, covered by E2E
