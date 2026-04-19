import { API } from '#shared/api'
import { STATE_KEY } from '#shared/state-keys'
import { clearAuthToken, setAuthToken } from '~/utils/auth-storage'

interface LoginResponse {
  ok: boolean
  token: string
}

export function useAuth() {
  // `isLoggedIn` is the single source of truth for the UI. Seeded by
  // `plugins/auth-token.client.ts` from localStorage on boot; set by
  // `login()` on successful auth; cleared on logout or 401.
  const isLoggedIn = useState<boolean>(STATE_KEY.IS_LOGGED_IN, () => false)
  // JWT mirror for client-side Authorization: Bearer — read by `createApi`.
  const token = useState<string | null>(STATE_KEY.TOKEN, () => null)

  async function login(phoneNumber: string, password: string) {
    const response = await $fetch<LoginResponse>(API.AUTH_LOGIN, {
      method: 'POST',
      body: { phoneNumber, password },
    })
    token.value = response.token
    isLoggedIn.value = true
    // Persist so the JWT survives iOS tab-kill / swipe-up (in-memory
    // state dies with the tab, cookies get dropped by ITP on *.vercel.app).
    setAuthToken(response.token)
  }

  async function logout() {
    isLoggedIn.value = false
    token.value = null
    clearAuthToken()
    await navigateTo('/login')
  }

  return {
    isLoggedIn: readonly(isLoggedIn),
    login,
    logout,
  }
}
