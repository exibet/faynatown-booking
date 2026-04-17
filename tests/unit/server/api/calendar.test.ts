import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { VALID_FLAT_ID, VALID_JWT } from '../../../helpers/fixtures'

describe('GET /api/calendar', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('rejects unauthenticated requests', async () => {
    const { default: handler } = await import('~~/server/api/calendar.get')
    const event = createMockEvent({
      query: { type: 'Paddle_Tennis', weekStart: '2026-04-20' },
    })
    await expectHttpError(() => handler(event), 401)
  })

  it('rejects invalid weekStart format', async () => {
    setupServerMocks({ token: VALID_JWT, faynatown: vi.fn() })
    const { default: handler } = await import('~~/server/api/calendar.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { type: 'Paddle_Tennis', weekStart: '20-04-2026' },
    })
    await expectHttpError(() => handler(event), 400)
  })

  it('rejects unknown booking type', async () => {
    setupServerMocks({ token: VALID_JWT, faynatown: vi.fn() })
    const { default: handler } = await import('~~/server/api/calendar.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { type: 'Hockey', weekStart: '2026-04-20' },
    })
    await expectHttpError(() => handler(event), 400)
  })

  it('returns 7-day week with parsed slots', async () => {
    const slots = [
      { slotValidated: 'з 07:00 по 08:00', isAvaliable: true },
      { slotValidated: 'з 08:00 по 09:00 (недоступно)' },
    ]
    const faynatown = vi.fn()
      .mockResolvedValueOnce([{ flatId: VALID_FLAT_ID, complexId: 1, address: 'x', gekaNumber: '1' }])
      .mockResolvedValue(slots)
    setupServerMocks({ token: VALID_JWT, faynatown })

    const { default: handler } = await import('~~/server/api/calendar.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { type: 'Paddle_Tennis', weekStart: '2026-04-20' },
    })

    const result = await handler(event)
    expect(result).toHaveLength(7)
    expect(result[0]?.date).toBe('2026-04-20')
    expect(result[6]?.date).toBe('2026-04-26')
    expect(result[0]?.slots[0]?.available).toBe(true)
    expect(result[0]?.slots[1]?.available).toBe(false)
    // 1 flats call + 7 slots calls = 8
    expect(faynatown).toHaveBeenCalledTimes(8)
  })

  it('throws 404 when user has no flats', async () => {
    const faynatown = vi.fn().mockResolvedValueOnce([])
    setupServerMocks({ token: VALID_JWT, faynatown })
    const { default: handler } = await import('~~/server/api/calendar.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { type: 'Paddle_Tennis', weekStart: '2026-04-20' },
    })
    await expectHttpError(() => handler(event), 404)
  })
})
