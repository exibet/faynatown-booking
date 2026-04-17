import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockCookie, mockNavigateTo } = vi.hoisted(() => ({
  mockCookie: vi.fn(),
  mockNavigateTo: vi.fn(),
}))

mockNuxtImport('useCookie', () => mockCookie)
mockNuxtImport('navigateTo', () => mockNavigateTo)

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

  it('redirects to /login when cookie is missing', async () => {
    mockCookie.mockReturnValue({ value: null })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/bookings'), route('/'))
    expect(mockNavigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/bookings' },
    })
  })

  it('does not pass redirect query when coming from root', async () => {
    mockCookie.mockReturnValue({ value: null })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/'), route('/'))
    expect(mockNavigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: undefined,
    })
  })

  it('allows navigation when cookie is present', async () => {
    mockCookie.mockReturnValue({ value: 'valid.jwt.token' })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/bookings'), route('/'))
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})
