import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { VALID_FLAT_ID, VALID_JWT } from '../../../helpers/fixtures'

describe('GET /api/zones', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('rejects unauthenticated', async () => {
    const { default: handler } = await import('~~/server/api/zones.get')
    await expectHttpError(() => handler(createMockEvent()), 401)
  })

  it('rejects invalid query', async () => {
    setupServerMocks({ token: VALID_JWT, faynatown: vi.fn() })
    const { default: handler } = await import('~~/server/api/zones.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { type: 'BBQ', date: 'bad', slot: 'z' },
    })
    await expectHttpError(() => handler(event), 400)
  })

  it('returns zones with stripped suffixes and correct availability', async () => {
    const faynatown = vi.fn()
      .mockResolvedValueOnce([{ flatId: VALID_FLAT_ID, complexId: 1, address: 'x', gekaNumber: '1' }])
      .mockResolvedValueOnce([
        { id: 2, name: 'Бесідка 1 (зайнято)' },
        { id: 5, name: 'Бесідка 3', isAvaliable: true },
      ])
    setupServerMocks({ token: VALID_JWT, faynatown })

    const { default: handler } = await import('~~/server/api/zones.get')
    const event = createMockEvent({
      token: VALID_JWT,
      query: { type: 'BBQ', date: '2026-04-20', slot: 'з 09:00 по 13:00' },
    })

    const result = await handler(event)
    expect(result).toEqual([
      { id: 2, name: 'Бесідка 1', available: false },
      { id: 5, name: 'Бесідка 3', available: true },
    ])
  })
})
