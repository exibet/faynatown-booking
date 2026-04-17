import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../../helpers/server'
import { VALID_JWT } from '../../../../helpers/fixtures'

describe('DELETE /api/bookings/:id', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('rejects unauthenticated', async () => {
    const { default: handler } = await import('~~/server/api/bookings/[id].delete')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: '42' } })),
      401,
    )
  })

  it('rejects invalid id', async () => {
    setupServerMocks({ token: VALID_JWT, faynatown: vi.fn() })
    const { default: handler } = await import('~~/server/api/bookings/[id].delete')
    await expectHttpError(
      () => handler(createMockEvent({ token: VALID_JWT, params: { id: 'not-a-number' } })),
      400,
    )
  })

  it('rejects negative id', async () => {
    setupServerMocks({ token: VALID_JWT, faynatown: vi.fn() })
    const { default: handler } = await import('~~/server/api/bookings/[id].delete')
    await expectHttpError(
      () => handler(createMockEvent({ token: VALID_JWT, params: { id: '-1' } })),
      400,
    )
  })

  it('returns ok and calls /booking/remove with BookingId', async () => {
    const faynatown = vi.fn().mockResolvedValueOnce(true)
    setupServerMocks({ token: VALID_JWT, faynatown })

    const { default: handler } = await import('~~/server/api/bookings/[id].delete')
    const event = createMockEvent({ token: VALID_JWT, params: { id: '42' } })
    const result = await handler(event)

    expect(result).toEqual({ ok: true })
    expect(faynatown).toHaveBeenCalledWith(event, '/booking/remove', {
      method: 'POST',
      body: { BookingId: 42 },
    })
  })
})
