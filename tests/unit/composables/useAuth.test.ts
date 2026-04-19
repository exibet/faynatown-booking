import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { AUTH_STORAGE_KEY } from '#shared/constants'
import { STATE_KEY } from '#shared/state-keys'

const { mockFetch, mockNavigateTo } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockNavigateTo: vi.fn(),
}))

vi.stubGlobal('$fetch', mockFetch)
mockNuxtImport('navigateTo', () => mockNavigateTo)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useState<boolean>(STATE_KEY.IS_LOGGED_IN).value = false
    useState<string | null>(STATE_KEY.TOKEN).value = null
    localStorage.clear()
  })

  it('starts with isLoggedIn = false', () => {
    const { isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(false)
  })

  it('sets isLoggedIn, mirrors JWT into state AND localStorage on login', async () => {
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
    // Persisted so iOS tab-kill/swipe-up survives (cookie would be dropped).
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe('eyJhbGciOi.test.jwt')
  })

  it('rethrows when login fails and leaves state + storage clean', async () => {
    mockFetch.mockRejectedValueOnce(new Error('bad creds'))
    const { login, isLoggedIn } = useAuth()
    await expect(login('380123456789', 'wrong')).rejects.toThrow('bad creds')
    expect(isLoggedIn.value).toBe(false)
    expect(useState<string | null>(STATE_KEY.TOKEN).value).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('clears state, token, localStorage and navigates on logout (no server call)', async () => {
    useState<boolean>(STATE_KEY.IS_LOGGED_IN).value = true
    useState<string | null>(STATE_KEY.TOKEN).value = 'valid.jwt.token'
    localStorage.setItem(AUTH_STORAGE_KEY, 'valid.jwt.token')
    const { logout, isLoggedIn } = useAuth()
    await logout()
    expect(isLoggedIn.value).toBe(false)
    expect(useState<string | null>(STATE_KEY.TOKEN).value).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
    // Logout is pure client-side cleanup — no wire call.
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
