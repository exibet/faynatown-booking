import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../../helpers/server'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('rejects invalid phone number format', async () => {
    const { default: handler } = await import('~~/server/api/auth/login.post')
    const event = createMockEvent({ body: { phoneNumber: '123', password: 'x' } })
    await expectHttpError(() => handler(event), 400, /phoneNumber/)
  })

  it('rejects missing password', async () => {
    const { default: handler } = await import('~~/server/api/auth/login.post')
    const event = createMockEvent({ body: { phoneNumber: '380123456789', password: '' } })
    await expectHttpError(() => handler(event), 400, /password/)
  })

  it('throws 401 when upstream returns non-JWT text', async () => {
    const faynatown = vi.fn().mockResolvedValueOnce('INVALID_LOGIN_ATTEMPT')
    setupServerMocks({ faynatown })
    const { default: handler } = await import('~~/server/api/auth/login.post')
    const event = createMockEvent({ body: { phoneNumber: '380123456789', password: 'x' } })
    await expectHttpError(() => handler(event), 401)
  })

  it('returns ok when upstream returns a JWT', async () => {
    const faynatown = vi.fn().mockResolvedValueOnce('eyJhbGciOi.test.jwt')
    setupServerMocks({ faynatown })
    const { default: handler } = await import('~~/server/api/auth/login.post')
    const event = createMockEvent({ body: { phoneNumber: '380123456789', password: 'x' } })
    const result = await handler(event)
    expect(result).toEqual({ ok: true })
  })
})
