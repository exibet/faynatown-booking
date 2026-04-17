import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockFetch, mockNavigateTo } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockNavigateTo: vi.fn(),
}))

vi.stubGlobal('$fetch', mockFetch)
mockNuxtImport('navigateTo', () => mockNavigateTo)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useState<boolean>('auth:is-logged-in').value = false
  })

  it('starts with isLoggedIn = false', () => {
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

  it('clears state and navigates on logout', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    useState<boolean>('auth:is-logged-in').value = true
    const { logout, isLoggedIn } = useAuth()
    await logout()
    expect(isLoggedIn.value).toBe(false)
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })

  it('clears state even when logout request fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'))
    useState<boolean>('auth:is-logged-in').value = true
    const { logout, isLoggedIn } = useAuth()
    await logout()
    expect(isLoggedIn.value).toBe(false)
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })
})
