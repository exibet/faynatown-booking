import { AUTH_COOKIE_NAME } from '#shared/constants'

export default defineEventHandler((event) => {
  deleteCookie(event, AUTH_COOKIE_NAME, { path: '/' })
  return { ok: true }
})
