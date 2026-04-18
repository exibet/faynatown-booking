import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { VALID_JWT } from '../../../helpers/fixtures'

describe('GET /api/flats', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('rejects unauthenticated', async () => {
    const { default: handler } = await import('~~/server/api/flats.get')
    await expectHttpError(() => handler(createMockEvent()), 401)
  })

  it('returns the upstream flats list as-is', async () => {
    const flats = [
      { flatId: 'a', complexId: 1, address: 'Файна Таун, буд. 6, кв. 123', gekaNumber: 'G1', isAvaliable: true },
    ]
    const faynatown = vi.fn().mockResolvedValueOnce(flats)
    setupServerMocks({ token: VALID_JWT, faynatown })

    const { default: handler } = await import('~~/server/api/flats.get')
    const result = await handler(createMockEvent({ token: VALID_JWT }))

    expect(result).toEqual(flats)
    expect(faynatown).toHaveBeenCalledWith(expect.anything(), '/booking/flats')
  })
})
