import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createMockEvent, expectHttpError, setupServerMocks } from '../../../helpers/server'
import { validateBody } from '~~/server/utils/validation'

const Schema = z.object({
  name: z.string().min(1),
  count: z.number().int().positive(),
})

describe('validateBody', () => {
  it('returns parsed data on valid body', async () => {
    setupServerMocks()
    const event = createMockEvent({ body: { name: 'x', count: 5 } })
    const result = await validateBody(event, Schema)
    expect(result).toEqual({ name: 'x', count: 5 })
  })

  it('throws 400 with first issue path + message', async () => {
    setupServerMocks()
    const event = createMockEvent({ body: { name: '', count: -1 } })
    await expectHttpError(() => validateBody(event, Schema), 400, /name/)
  })

  it('throws 400 on wrong type', async () => {
    setupServerMocks()
    const event = createMockEvent({ body: { name: 'x', count: 'nope' } })
    await expectHttpError(() => validateBody(event, Schema), 400, /count/)
  })
})
