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
    useState<string | null>(STATE_KEY.TOKEN).value = null
  })

  it('starts with isLoggedIn = false when no cookie', () => {
    const { isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(false)
  })

  it('sets isLoggedIn and mirrors JWT into state on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, token: 'eyJhbGciOi.test.jwt' })
    const { login, isLoggedIn } = useAuth()
    await login('380123456789', 'pw')
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: { phoneNumber: '380123456789', password: 'pw' },
    }))
    expect(isLoggedIn.value).toBe(true)
    // Client mirror used by createApi to attach Authorization: Bearer.
    expect(useState<string | null>(STATE_KEY.TOKEN).value).toBe('eyJhbGciOi.test.jwt')
  })

  it('rethrows when login fails and leaves state clean', async () => {
    mockFetch.mockRejectedValueOnce(new Error('bad creds'))
    const { login, isLoggedIn } = useAuth()
    await expect(login('380123456789', 'wrong')).rejects.toThrow('bad creds')
    expect(isLoggedIn.value).toBe(false)
    expect(useState<string | null>(STATE_KEY.TOKEN).value).toBeNull()
  })

  it('clears state, token, cookie and navigates on logout', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const cookieRef = { value: 'valid.jwt.token' as string | null }
    mockCookie.mockReturnValue(cookieRef)
    useState<boolean>(STATE_KEY.IS_LOGGED_IN).value = true
    useState<string | null>(STATE_KEY.TOKEN).value = 'valid.jwt.token'
    const { logout, isLoggedIn } = useAuth()
    await logout()
    expect(isLoggedIn.value).toBe(false)
    expect(useState<string | null>(STATE_KEY.TOKEN).value).toBeNull()
    expect(cookieRef.value).toBeNull()
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })

  it('clears state even when logout request fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'))
    useState<boolean>(STATE_KEY.IS_LOGGED_IN).value = true
    useState<string | null>(STATE_KEY.TOKEN).value = 'valid.jwt.token'
    const { logout, isLoggedIn } = useAuth()
    await logout()
    expect(isLoggedIn.value).toBe(false)
    expect(useState<string | null>(STATE_KEY.TOKEN).value).toBeNull()
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })
})
