/**
 * Loads the Faynatown JWT into `event.context.token` on every request.
 *
 * Source: `Authorization: Bearer <jwt>` header, attached by the client
 * `createApi` helper on every XHR. The JWT lives in localStorage on the
 * client and is mirrored into `useState(STATE_KEY.TOKEN)` by the auth-token
 * plugin — iOS Safari's cookie drop on *.vercel.app made httpOnly cookies
 * unreliable, so Bearer is the single wire channel.
 *
 * Routes call `requireAuth(event)` to enforce auth — this middleware only
 * loads the token.
 */
export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (bearer) event.context.token = bearer
})
