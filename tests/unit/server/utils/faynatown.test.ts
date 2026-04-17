import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { VALID_JWT } from '../../../helpers/fixtures'
import { $faynatown } from '~~/server/utils/faynatown'

function mockFetch(response: { ok: boolean, status?: number, body: string | object }) {
  const fetchMock = vi.fn(() => Promise.resolve({
    ok: response.ok,
    status: response.status ?? 200,
    statusText: response.ok ? 'OK' : 'Error',
    text: () => Promise.resolve(typeof response.body === 'string' ? response.body : JSON.stringify(response.body)),
    json: () => Promise.resolve(response.body),
  } as Response))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('$faynatown', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('throws 401 when called without token (and skipAuth not set)', async () => {
    const event = createMockEvent()
    await expectHttpError(() => $faynatown(event, '/booking/flats'), 401)
  })

  it('adds version: 45 and Bearer header on authenticated calls', async () => {
    const fetchMock = mockFetch({ ok: true, body: [] })
    const event = createMockEvent({ token: VALID_JWT })

    await $faynatown(event, '/booking/flats')

    const [, init] = fetchMock.mock.calls[0] ?? []
    const headers = (init as { headers: Record<string, string> }).headers
    expect(headers.version).toBe('45')
    expect(headers.Authorization).toBe(`Bearer ${VALID_JWT}`)
  })

  it('uses base URL and appends query params', async () => {
    const fetchMock = mockFetch({ ok: true, body: [] })
    const event = createMockEvent({ token: VALID_JWT })

    await $faynatown(event, '/booking/slots', {
      query: { flatId: 'abc', bookingType: 'BBQ' },
    })

    const url = fetchMock.mock.calls[0]?.[0] as string
    expect(url).toContain('https://webapi.faynatown.com.ua/api/booking/slots')
    expect(url).toContain('flatId=abc')
    expect(url).toContain('bookingType=BBQ')
  })

  it('returns parsed JSON by default', async () => {
    mockFetch({ ok: true, body: [{ flatId: 'x' }] })
    const event = createMockEvent({ token: VALID_JWT })
    const result = await $faynatown<{ flatId: string }[]>(event, '/booking/flats')
    expect(result).toEqual([{ flatId: 'x' }])
  })

  it('returns plain text when asText is true (login flow)', async () => {
    mockFetch({ ok: true, body: 'eyJhbGciOi.....' })
    const event = createMockEvent()
    const token = await $faynatown(event, '/auth/login', {
      method: 'POST',
      body: { PhoneNumber: '380123456789', Password: 'x' },
      skipAuth: true,
      asText: true,
    })
    expect(token).toMatch(/^eyJ/)
  })

  it('skips Bearer header when skipAuth is true', async () => {
    const fetchMock = mockFetch({ ok: true, body: 'token' })
    const event = createMockEvent()
    await $faynatown(event, '/auth/login', {
      method: 'POST',
      body: {},
      skipAuth: true,
      asText: true,
    })
    const [, init] = fetchMock.mock.calls[0] ?? []
    const headers = (init as { headers: Record<string, string> }).headers
    expect(headers.Authorization).toBeUndefined()
  })

  it('re-throws upstream errors with status preserved', async () => {
    mockFetch({ ok: false, status: 400, body: { error: 'bad request' } })
    const event = createMockEvent({ token: VALID_JWT })
    await expectHttpError(() => $faynatown(event, '/booking/flats'), 400)
  })
})
