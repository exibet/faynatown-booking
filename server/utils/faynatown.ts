import type { H3Event } from 'h3'
import { AUTH_COOKIE_NAME, FAYNATOWN_API_VERSION, FAYNATOWN_BASE_URL } from '#shared/constants'

interface FaynatownOptions {
  method?: 'GET' | 'POST'
  query?: Record<string, string | number | undefined>
  body?: Record<string, unknown>
  /**
   * When true, read response as plain text instead of JSON.
   * Faynatown login endpoint returns raw JWT string, not JSON.
   */
  asText?: boolean
  /**
   * Skip bearer token header (used only for /auth/login).
   */
  skipAuth?: boolean
}

/**
 * Typed upstream client for Faynatown webapi.
 *
 * Mandatory quirks (see docs/API.md):
 * - `version: 45` header on EVERY request, otherwise API returns 400
 * - `Authorization: Bearer <jwt>` from event context (cookie)
 * - Login returns plain-text JWT (not JSON) — pass `asText: true`
 *
 * On upstream 401 we proactively clear our auth cookie so the next request
 * is correctly redirected to /login by the route middleware. Without this,
 * a stale-but-present cookie can cause a redirect loop (middleware allows
 * → data 401 → redirect → middleware allows → ...).
 *
 * Throws H3Error with upstream status preserved.
 */
export async function $faynatown(
  event: H3Event,
  path: string,
  options: FaynatownOptions & { asText: true },
): Promise<string>
export async function $faynatown<T>(
  event: H3Event,
  path: string,
  options?: FaynatownOptions,
): Promise<T>
export async function $faynatown<T>(
  event: H3Event,
  path: string,
  options: FaynatownOptions = {},
): Promise<T | string> {
  const headers: Record<string, string> = {
    'version': String(FAYNATOWN_API_VERSION),
    'Content-Type': 'application/json',
    'Accept': '*/*',
  }

  if (!options.skipAuth) {
    const token = event.context.token
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    headers.Authorization = `Bearer ${token}`
  }

  const url = new URL(FAYNATOWN_BASE_URL + path)
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401 && !options.skipAuth) {
      deleteCookie(event, AUTH_COOKIE_NAME)
    }
    const errorText = await response.text().catch(() => '')
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText,
      data: errorText ? safeParseJson(errorText) : undefined,
    })
  }

  if (options.asText) return response.text()
  // Trust boundary: upstream JSON is not validated at runtime (no Zod here).
  // The generic T is asserted by the caller (server route owns the contract).
  const data: unknown = await response.json()
  return data as T
}

function safeParseJson(text: string): string | Record<string, unknown> {
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    return text
  }
  catch {
    return text
  }
}
