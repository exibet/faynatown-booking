import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { STATE_KEY } from '#shared/state-keys'

const { mockFetch, mockNavigateTo, mockCookie } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockNavigateTo: vi.fn(),
  mockCookie: vi.fn(() => ({ value: null as string | null })),
}))

vi.stubGlobal('$fetch', mockFetch)
mockNuxtImport('navigateTo', () => mockNavigateTo)
mockNuxtImport('useCookie', () => mockCookie)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookie.mockReturnValue({ value: null })
    useState<boolean>(STATE_KEY.IS_LOGGED_IN).value = false
  })

  it('starts with isLoggedIn = false when no cookie', () => {
    const { isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(false)
  })

  it('sets isLoggedIn on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const { login, isLoggedIn } = useAuth()
    await login('380123456789', 'pw')
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: { phoneNumber: '380123456789', password: 'pw' },
    }))
    expect(isLoggedIn.value).toBe(true)
  })

  it('rethrows when login fails and leaves isLoggedIn false', async () => {
    mockFetch.mockRejectedValueOnce(new Error('bad creds'))
    const { login, isLoggedIn } = useAuth()
    await expect(login('380123456789', 'wrong')).rejects.toThrow('bad creds')
    expect(isLoggedIn.value).toBe(false)
  })

  it('clears state, cookie and navigates on logout', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const cookieRef = { value: 'valid.jwt.token' as string | null }
    mockCookie.mockReturnValue(cookieRef)
    useState<boolean>(STATE_KEY.IS_LOGGED_IN).value = true
    const { logout, isLoggedIn } = useAuth()
    await logout()
    expect(isLoggedIn.value).toBe(false)
    expect(cookieRef.value).toBeNull()
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })

  it('clears state even when logout request fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'))
    useState<boolean>(STATE_KEY.IS_LOGGED_IN).value = true
    const { logout, isLoggedIn } = useAuth()
    await logout()
    expect(isLoggedIn.value).toBe(false)
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })
})
