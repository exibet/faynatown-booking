import { LoginSchema } from '~~/server/schemas/auth'
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from '#shared/constants'

/**
 * Authenticates user against Faynatown API. Upstream response is a plain-text
 * JWT (not JSON). On success, stores the token in an httpOnly cookie so the
 * browser never has direct access to it.
 */
export default defineEventHandler(async (event) => {
  const { phoneNumber, password } = await validateBody(event, LoginSchema)

  const token = await $faynatown<string>(event, '/auth/login', {
    method: 'POST',
    body: { PhoneNumber: phoneNumber, Password: password },
    skipAuth: true,
    asText: true,
  })

  if (!token || !token.startsWith('eyJ')) {
    throw createError({ statusCode: 401, statusMessage: 'loginError' })
  }

  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  })

  return { ok: true }
})
