import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { VALID_JWT } from '../../../helpers/fixtures'

describe('GET /api/bookings', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('rejects unauthenticated', async () => {
    const { default: handler } = await import('~~/server/api/bookings.get')
    await expectHttpError(() => handler(createMockEvent()), 401)
  })

  it('maps upstream response to trimmed BookingItem[]', async () => {
    const faynatown = vi.fn().mockResolvedValueOnce([
      {
        id: 44794,
        zoneName: 'Падл корт 2',
        complexName: 'Файна Таун',
        bookingStart: '2026-04-28T16:00:00',
        bookingEnd: '2026-04-28T17:00:00',
        bookingStartStr: '28.04',
        bookingDetails: 'з 16:00 по 17:00',
        type: 6,
        typeIconName: 'tenis.png',
        statusColor: '#93E784',
        deleteIconName: 'bucket_active.png',
        isActive: true,
        allowDelete: true,
      },
      {
        id: 34709,
        zoneName: 'Бесідка 5',
        complexName: 'Файна Таун',
        bookingStart: '2025-11-17T09:00:00',
        bookingEnd: '2025-11-17T15:00:00',
        bookingStartStr: '17.11',
        bookingDetails: 'з 09:00 по 15:00',
        type: 1,
        typeIconName: 'bbq.png',
        statusColor: '#F2A3A3',
        deleteIconName: 'bucket_inactive.png',
        isNotActive: true,
        notAllowDelete: true,
      },
    ])
    setupServerMocks({ token: VALID_JWT, faynatown })

    const { default: handler } = await import('~~/server/api/bookings.get')
    const result = await handler(createMockEvent({ token: VALID_JWT }))

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 44794,
      zoneName: 'Падл корт 2',
      start: '2026-04-28T16:00:00',
      end: '2026-04-28T17:00:00',
      typeId: 6,
      isActive: true,
      canCancel: true,
    })
    expect(result[1]?.isActive).toBe(false)
    expect(result[1]?.canCancel).toBe(false)
  })
})
