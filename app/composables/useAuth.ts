import { API } from '#shared/api'
import { AUTH_COOKIE_NAME } from '#shared/constants'
import { STATE_KEY } from '#shared/state-keys'

interface LoginResponse {
  ok: boolean
  token: string
}

export function useAuth() {
  const cookie = useCookie<string | null>(AUTH_COOKIE_NAME)
  // Default false — the cookie is httpOnly and may be present-but-stale.
  // The auth middleware promotes this to true after verifying the cookie
  // exists on SSR; explicit `login()` also sets it. This avoids login.vue
  // bouncing the user to / based on a dead cookie (would loop with /api 401).
  const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN, () => false)
  // JWT mirror for client-side Authorization: Bearer — see STATE_KEY comment.
  const token = useState<string | null>(STATE_KEY.TOKEN, () => null)

  async function login(phoneNumber: string, password: string) {
    const response = await $fetch<LoginResponse>(API.AUTH_LOGIN, {
      method: 'POST',
      body: { phoneNumber, password },
    })
    token.value = response.token
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
    token.value = null
    cookie.value = null
    await navigateTo('/login')
  }

  return {
    isLoggedIn: readonly(isLoggedIn),
    login,
    logout,
  }
}
