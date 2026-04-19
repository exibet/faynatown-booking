import { LoginSchema } from '~~/server/schemas/auth'
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from '#shared/constants'

/**
 * Authenticates user against Faynatown API. Upstream response is a plain-text
 * JWT (not JSON). On success, stores the token in an httpOnly cookie so the
 * browser never has direct access to it.
 *
 * The upstream sometimes returns the JWT wrapped in JSON quotes ("eyJ...")
 * depending on Content-Type negotiation, so we strip surrounding quotes and
 * whitespace before validating the prefix.
 */
export default defineEventHandler(async (event) => {
  const { phoneNumber, password } = await validateBody(event, LoginSchema)

  const raw = await $faynatown<string>(event, '/auth/login', {
    method: 'POST',
    body: { PhoneNumber: phoneNumber, Password: password },
    skipAuth: true,
    asText: true,
  })

  const token = raw?.trim().replace(/^"|"$/g, '') ?? ''

  if (!token.startsWith('eyJ')) {
    if (import.meta.dev) {
      // Surface unexpected upstream payloads in dev so we can recognise new
      // failure shapes (the API has been observed returning bare strings,
      // JSON-wrapped JWTs, and plain JSON errors). Truncated to avoid
      // dumping credentials/PII to logs.
      // eslint-disable-next-line no-console
      console.warn('[auth/login] non-JWT upstream response:', JSON.stringify(raw).slice(0, 200))
    }
    throw createError({ statusCode: 401, statusMessage: 'loginError' })
  }

  // `secure` is gated by both signals because `import.meta.dev` may be
  // tree-shaken/replaced at build time and isn't always reliable inside Nitro
  // runtime. Without this we'd set Secure on http://localhost in dev and the
  // browser would silently drop the cookie → infinite /login redirects.
  const isProd = !import.meta.dev && process.env.NODE_ENV === 'production'

  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  })

  // Also return the JWT in the response body so the client can mirror it in
  // `useState(STATE_KEY.TOKEN)` and attach `Authorization: Bearer` on every
  // request. Necessary because iOS Safari/ITP on *.vercel.app silently drops
  // our cookie between SSR and the first client-side XHR (see commit message
  // of this change / auth middleware comment for the full story).
  return { ok: true, token }
})
