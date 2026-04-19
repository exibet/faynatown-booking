import { LoginSchema } from '~~/server/schemas/auth'

/**
 * Authenticates user against Faynatown API. Upstream response is a plain-text
 * JWT (not JSON). On success, returns the JWT in the body so the client can
 * persist it in localStorage + `useState(STATE_KEY.TOKEN)` and attach
 * `Authorization: Bearer` on every subsequent XHR.
 *
 * No server-set cookie: iOS Safari on *.vercel.app drops httpOnly cookies on
 * tab-kill, and the app runs as SPA (`ssr: false` in nuxt.config) so there's
 * no SSR auth path that needs a cookie — Bearer is the single wire channel.
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

  return { ok: true, token }
})
