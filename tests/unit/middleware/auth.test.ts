import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockCookie, mockNavigateTo, mockState } = vi.hoisted(() => ({
  mockCookie: vi.fn(),
  mockNavigateTo: vi.fn(),
  mockState: vi.fn(),
}))

mockNuxtImport('useCookie', () => mockCookie)
mockNuxtImport('navigateTo', () => mockNavigateTo)
mockNuxtImport('useState', () => mockState)

interface RouteLike {
  path: string
  fullPath: string
}

function route(path: string, fullPath = path): RouteLike {
  return { path, fullPath }
}

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login when neither state nor cookie indicates auth', async () => {
    mockState.mockReturnValue({ value: false })
    mockCookie.mockReturnValue({ value: null })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/bookings'), route('/'))
    expect(mockNavigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/bookings' },
    })
  })

  it('does not pass redirect query when coming from root', async () => {
    mockState.mockReturnValue({ value: false })
    mockCookie.mockReturnValue({ value: null })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/'), route('/'))
    expect(mockNavigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: undefined,
    })
  })

  it('allows navigation when cookie is present (SSR path)', async () => {
    const stateRef = { value: false }
    mockState.mockReturnValue(stateRef)
    mockCookie.mockReturnValue({ value: 'valid.jwt.token' })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/bookings'), route('/'))
    expect(mockNavigateTo).not.toHaveBeenCalled()
    // middleware also bumps the in-memory state so subsequent client navs
    // skip the cookie probe.
    expect(stateRef.value).toBe(true)
  })

  it('allows navigation when isLoggedIn state is set (post-login client nav)', async () => {
    mockState.mockReturnValue({ value: true })
    mockCookie.mockReturnValue({ value: null })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/'), route('/'))
    expect(mockNavigateTo).not.toHaveBeenCalled()
    expect(mockCookie).not.toHaveBeenCalled()
  })
})
