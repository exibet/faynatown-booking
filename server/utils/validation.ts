import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

/**
 * Parses request body against the provided Zod schema.
 * Throws 400 with the first Zod error message when validation fails.
 */
export async function validateBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    const first = result.error.issues[0]
    const path = first?.path.join('.') || 'body'
    const message = first?.message || 'Invalid request'
    throw createError({
      statusCode: 400,
      statusMessage: `${path}: ${message}`,
    })
  }
  return result.data
}
