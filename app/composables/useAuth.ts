import { API } from '#shared/api'

export function useAuth() {
  const isLoggedIn = useState<boolean>('auth:is-logged-in', () => false)

  async function login(phoneNumber: string, password: string) {
    await $fetch(API.AUTH_LOGIN, {
      method: 'POST',
      body: { phoneNumber, password },
    })
    isLoggedIn.value = true
  }

  async function logout() {
    // Best-effort — cookie cleanup and navigation happen regardless of
    // upstream response. A failed logout call shouldn't trap the user.
    try {
      await $fetch(API.AUTH_LOGOUT, { method: 'POST' })
    }
    catch {
      // swallow — nothing actionable for the user
    }
    isLoggedIn.value = false
    await navigateTo('/login')
  }

  return {
    isLoggedIn: readonly(isLoggedIn),
    login,
    logout,
  }
}
