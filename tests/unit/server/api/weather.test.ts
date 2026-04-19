import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { VALID_JWT } from '../../../helpers/fixtures'

const FAKE_TODAY = new Date(2026, 3, 19) // 2026-04-19 local

describe('GET /api/weather', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FAKE_TODAY)
    setupServerMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects unauthenticated requests', async () => {
    const { default: handler } = await import('~~/server/api/weather.get')
    const event = createMockEvent({ query: { start: '2026-04-19', end: '2026-04-25' } })
    await expectHttpError(() => handler(event), 401)
  })

  it('rejects invalid date format', async () => {
    setupServerMocks({ token: VALID_JWT })
    const { default: handler } = await import('~~/server/api/weather.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { start: '19-04-2026', end: '2026-04-25' },
    })
    await expectHttpError(() => handler(event), 400)
  })

  it('returns [] and skips upstream when entire range is in the past', async () => {
    const $fetch = vi.fn()
    setupServerMocks({ token: VALID_JWT })
    vi.stubGlobal('$fetch', $fetch)

    const { default: handler } = await import('~~/server/api/weather.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { start: '2026-04-10', end: '2026-04-18' },
    })

    const result = await handler(event)
    expect(result).toEqual([])
    expect($fetch).not.toHaveBeenCalled()
  })

  it('clamps past dates and calls Open-Meteo with the forecast window', async () => {
    const $fetch = vi.fn().mockResolvedValue({
      daily: {
        time: ['2026-04-19', '2026-04-20', '2026-04-21'],
        weather_code: [0, 3, 61],
        temperature_2m_max: [16.4, 12.8, 9.1],
        temperature_2m_min: [6.2, 4.7, 3.0],
      },
    })
    setupServerMocks({ token: VALID_JWT })
    vi.stubGlobal('$fetch', $fetch)

    const { default: handler } = await import('~~/server/api/weather.get')
    const event = createMockEvent({
      token: VALID_JWT,
      // Range starts before today — server should clamp to 2026-04-19.
      query: { start: '2026-04-17', end: '2026-04-21' },
    })

    const result = await handler(event)

    expect($fetch).toHaveBeenCalledTimes(1)
    const [, opts] = $fetch.mock.calls[0]!
    expect(opts.query.start_date).toBe('2026-04-19')
    expect(opts.query.end_date).toBe('2026-04-21')
    expect(opts.query.daily).toContain('weather_code')

    expect(result).toEqual([
      { date: '2026-04-19', code: 0, tempMaxC: 16, tempMinC: 6 },
      { date: '2026-04-20', code: 3, tempMaxC: 13, tempMinC: 5 },
      { date: '2026-04-21', code: 61, tempMaxC: 9, tempMinC: 3 },
    ])
  })

  it('clamps end date beyond the 14-day forecast window', async () => {
    const $fetch = vi.fn().mockResolvedValue({
      daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [] },
    })
    setupServerMocks({ token: VALID_JWT })
    vi.stubGlobal('$fetch', $fetch)

    const { default: handler } = await import('~~/server/api/weather.get')
    const event = createMockEvent({
      token: VALID_JWT,
      // End is way beyond 14 days from FAKE_TODAY (2026-04-19 + 13 = 2026-05-02).
      query: { start: '2026-04-19', end: '2026-06-01' },
    })

    await handler(event)
    const [, opts] = $fetch.mock.calls[0]!
    expect(opts.query.end_date).toBe('2026-05-02')
  })

  it('returns [] when upstream omits the daily block', async () => {
    const $fetch = vi.fn().mockResolvedValue({})
    setupServerMocks({ token: VALID_JWT })
    vi.stubGlobal('$fetch', $fetch)

    const { default: handler } = await import('~~/server/api/weather.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { start: '2026-04-19', end: '2026-04-25' },
    })

    const result = await handler(event)
    expect(result).toEqual([])
  })
})
