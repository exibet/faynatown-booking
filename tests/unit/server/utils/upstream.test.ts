import { describe, expect, it } from 'vitest'
import { toUpstreamBookingDate } from '~~/server/utils/upstream'

describe('toUpstreamBookingDate', () => {
  it('appends T00:00:00Z as upstream expects', () => {
    expect(toUpstreamBookingDate('2026-04-17')).toBe('2026-04-17T00:00:00Z')
  })
})
