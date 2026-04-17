import { describe, expect, it } from 'vitest'

describe('smoke test', () => {
  it('passes basic assertion', () => {
    expect(true).toBe(true)
  })

  it('performs basic math', () => {
    expect(1 + 1).toBe(2)
  })
})
