import { STATE_KEY } from '#shared/state-keys'

/**
 * Seeds the client-side JWT mirror from the server.
 *
 * Runs on SSR only (`*.server.ts`). Reads the token that `server/middleware/
 * auth.ts` already placed on `event.context.token` (from the httpOnly cookie),
 * mirrors it into `useState(STATE_KEY.TOKEN)`. Nuxt serialises that state into
 * the SSR payload, so after hydration the client has the JWT in memory and
 * `createApi` can attach `Authorization: Bearer` to every XHR — independent
 * of whether the browser still holds the cookie.
 *
 * Does nothing when the user is not logged in (no token on the event). The
 * mirror also never leaves memory: no localStorage, no document.cookie write.
 */
export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  const token = event?.context.token
  if (typeof token !== 'string' || !token) return

  const state = useState<string | null>(STATE_KEY.TOKEN, () => null)
  state.value = token
})
