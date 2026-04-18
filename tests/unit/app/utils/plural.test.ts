import { describe, expect, it } from 'vitest'
import { pluralUk } from '~/utils/plural'

describe('pluralUk', () => {
  it('uses the "one" form for 1, 21, 31 (but not 11)', () => {
    expect(pluralUk(1, 'одна', 'дві', 'пʼять')).toBe('одна')
    expect(pluralUk(21, 'одна', 'дві', 'пʼять')).toBe('одна')
    expect(pluralUk(101, 'одна', 'дві', 'пʼять')).toBe('одна')
    // 11 is the exception — belongs to "many".
    expect(pluralUk(11, 'одна', 'дві', 'пʼять')).toBe('пʼять')
  })

  it('uses the "few" form for 2–4, 22–24 (but not 12–14)', () => {
    expect(pluralUk(2, 'одна', 'дві', 'пʼять')).toBe('дві')
    expect(pluralUk(4, 'одна', 'дві', 'пʼять')).toBe('дві')
    expect(pluralUk(22, 'одна', 'дві', 'пʼять')).toBe('дві')
    // 12–14 fall to "many".
    expect(pluralUk(12, 'одна', 'дві', 'пʼять')).toBe('пʼять')
    expect(pluralUk(14, 'одна', 'дві', 'пʼять')).toBe('пʼять')
  })

  it('uses the "many" form for 0, 5–20, 25–30', () => {
    expect(pluralUk(0, 'одна', 'дві', 'пʼять')).toBe('пʼять')
    expect(pluralUk(5, 'одна', 'дві', 'пʼять')).toBe('пʼять')
    expect(pluralUk(20, 'одна', 'дві', 'пʼять')).toBe('пʼять')
    expect(pluralUk(25, 'одна', 'дві', 'пʼять')).toBe('пʼять')
  })

  it('treats negative counts symmetrically', () => {
    expect(pluralUk(-1, 'одна', 'дві', 'пʼять')).toBe('одна')
    expect(pluralUk(-3, 'одна', 'дві', 'пʼять')).toBe('дві')
    expect(pluralUk(-11, 'одна', 'дві', 'пʼять')).toBe('пʼять')
  })
})
