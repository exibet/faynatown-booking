import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockNavigateTo, mockState } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
  mockState: vi.fn(),
}))

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

  it('redirects to /login when isLoggedIn state is false', async () => {
    mockState.mockReturnValue({ value: false })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/bookings'), route('/'))
    expect(mockNavigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/bookings' },
    })
  })

  it('does not pass redirect query when coming from root', async () => {
    mockState.mockReturnValue({ value: false })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/'), route('/'))
    expect(mockNavigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: undefined,
    })
  })

  it('allows navigation when isLoggedIn state is set (seeded by auth-token plugin)', async () => {
    mockState.mockReturnValue({ value: true })
    const { default: middleware } = await import('~/middleware/auth')
    middleware(route('/'), route('/'))
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})
