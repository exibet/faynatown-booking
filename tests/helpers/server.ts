import type { H3Event } from 'h3'
import { vi } from 'vitest'

// ---------------------------------------------------------------------------
// H3 event mock
// ---------------------------------------------------------------------------

export interface MockEventOptions {
  token?: string | null
  query?: Record<string, unknown>
  body?: unknown
  params?: Record<string, string>
  method?: string
  cookies?: Record<string, string>
}

export function createMockEvent(opts: MockEventOptions = {}): H3Event {
  const event = {
    context: {
      token: opts.token ?? null,
      getToken: vi.fn(() => opts.token ?? null),
      params: opts.params ?? {},
    },
    method: opts.method ?? 'GET',
    _query: opts.query ?? {},
    _body: opts.body ?? null,
    _cookies: opts.cookies ?? {},
    node: { req: {}, res: {} },
  } as unknown as H3Event
  return event
}

// ---------------------------------------------------------------------------
// Guards — fail loudly if a real network call is attempted
// ---------------------------------------------------------------------------

function stubFetchGuard() {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    throw new Error(`REAL NETWORK CALL BLOCKED: ${url}`)
  }))
  vi.stubGlobal('$fetch', vi.fn((url: string) => {
    throw new Error(`REAL $fetch CALL BLOCKED: ${url}`)
  }))
}

// ---------------------------------------------------------------------------
// H3 + Nitro globals and server auto-imports
// ---------------------------------------------------------------------------

function createHttpError(opts: { statusCode: number, message?: string, statusMessage?: string }) {
  const message = opts.message ?? opts.statusMessage ?? ''
  const err = new Error(message) as Error & {
    statusCode: number
    statusMessage?: string
  }
  err.statusCode = opts.statusCode
  err.statusMessage = opts.statusMessage ?? opts.message
  return err
}

export interface ServerStubOptions {
  /** If provided, requireAuth returns this token; otherwise throws 401. */
  token?: string | null
  /** Mock implementation for $faynatown() util. */
  faynatown?: ReturnType<typeof vi.fn>
}

function stubServerGlobals(opts: ServerStubOptions = {}) {
  // H3 handler wrappers — identity
  vi.stubGlobal('defineEventHandler', (fn: unknown) => fn)
  vi.stubGlobal('defineCachedEventHandler', (fn: unknown, _config?: unknown) => fn)

  // H3 request helpers
  vi.stubGlobal('createError', createHttpError)
  vi.stubGlobal('getQuery', (event: { _query: unknown }) => event._query)
  vi.stubGlobal('readBody', (event: { _body: unknown }) => Promise.resolve(event._body))
  vi.stubGlobal('getRouterParam', (event: { context: { params: Record<string, string> } }, name: string) =>
    event.context.params[name],
  )
  vi.stubGlobal('getCookie', (event: { _cookies: Record<string, string> }, name: string) =>
    event._cookies[name],
  )
  vi.stubGlobal('setCookie', vi.fn())
  vi.stubGlobal('deleteCookie', vi.fn())

  // Project auto-imports (match production signatures — requireAuth is sync)
  vi.stubGlobal('requireAuth', (event: { context: { token: string | null } }) => {
    const token = opts.token ?? event.context.token
    if (token) return token
    throw createHttpError({ statusCode: 401, statusMessage: 'Unauthorized' })
  })
  vi.stubGlobal('validateBody', async (
    event: { _body: unknown },
    schema: { safeParse: (input: unknown) => {
      success: boolean
      data?: unknown
      error?: { issues: { path: (string | number)[], message: string }[] }
    } },
  ) => {
    const result = schema.safeParse(event._body)
    if (!result.success) {
      const first = result.error?.issues[0]
      const path = first?.path.join('.') || 'body'
      const message = first?.message || 'Invalid request'
      throw createHttpError({ statusCode: 400, statusMessage: `${path}: ${message}` })
    }
    return result.data
  })
  vi.stubGlobal('$faynatown', opts.faynatown ?? vi.fn())
}

// ---------------------------------------------------------------------------
// Composite setup — one-call bootstrap for server-route tests
// ---------------------------------------------------------------------------

/**
 * Wires all guards and globals in one call.
 *
 * Usage:
 * ```
 * beforeEach(() => { setupServerMocks({ token: VALID_JWT }) })
 * ```
 */
export function setupServerMocks(opts: ServerStubOptions = {}) {
  stubFetchGuard()
  stubServerGlobals(opts)
}

// ---------------------------------------------------------------------------
// Assertion helper
// ---------------------------------------------------------------------------

export async function expectHttpError(fn: () => Promise<unknown>, statusCode: number, messageMatch?: string | RegExp) {
  try {
    await fn()
    throw new Error(`Expected handler to throw ${statusCode}, but it resolved`)
  }
  catch (e) {
    const err = e as Error & { statusCode?: number }
    if (err.statusCode !== statusCode) {
      throw new Error(`Expected statusCode ${statusCode}, got ${err.statusCode}. Message: ${err.message}`)
    }
    if (messageMatch) {
      const matches = typeof messageMatch === 'string'
        ? err.message.includes(messageMatch)
        : messageMatch.test(err.message)
      if (!matches) {
        throw new Error(`Expected message to match ${messageMatch}, got: ${err.message}`)
      }
    }
  }
}
