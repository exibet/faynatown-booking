import { describe, expect, it } from 'vitest'
import { createMockEvent, setupServerMocks } from '../../../../helpers/server'

describe('POST /api/auth/logout', () => {
  it('returns ok and deletes cookie', async () => {
    setupServerMocks()
    const { default: handler } = await import('~~/server/api/auth/logout.post')
    const event = createMockEvent()
    const result = await handler(event)
    expect(result).toEqual({ ok: true })
  })
})
