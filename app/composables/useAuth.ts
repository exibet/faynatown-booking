import { API } from '#shared/api'
import { AUTH_COOKIE_NAME } from '#shared/constants'
import { STATE_KEY } from '#shared/state-keys'

export function useAuth() {
  const cookie = useCookie<string | null>(AUTH_COOKIE_NAME)
  // Initialise from the cookie so SSR renders the authenticated UI when the
  // user already has a valid session. `useState` shares the value between
  // server and client, so hydration stays consistent.
  const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN, () => !!cookie.value)

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
    cookie.value = null
    await navigateTo('/login')
  }

  return {
    isLoggedIn: readonly(isLoggedIn),
    login,
    logout,
  }
}
