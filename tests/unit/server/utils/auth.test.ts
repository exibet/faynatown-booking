import { describe, expect, it } from 'vitest'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { requireAuth } from '~~/server/utils/auth'
import { VALID_JWT } from '../../../helpers/fixtures'

describe('requireAuth', () => {
  it('returns token when context has it (set by Bearer middleware)', () => {
    setupServerMocks()
    const event = createMockEvent({ token: VALID_JWT })
    expect(requireAuth(event)).toBe(VALID_JWT)
  })

  it('throws 401 when context has no token', () => {
    setupServerMocks()
    const event = createMockEvent()
    expectHttpError(() => Promise.resolve(requireAuth(event)), 401)
  })
})
