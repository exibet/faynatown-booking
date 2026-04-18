import { describe, expect, it } from 'vitest'
import type { ZoneItem } from '#shared/types'
import { groupZones, parseArea, parseUnitNumber } from '~/utils/zone-grouping'

describe('parseArea', () => {
  it('returns 1 when no area suffix is present', () => {
    expect(parseArea('Майданчик 2 – Падл корт 2')).toBe(1)
  })

  it('extracts the area number from a BBQ suffix', () => {
    expect(parseArea('Бесідка 1 (зона BBQ - 2)')).toBe(2)
    expect(parseArea('Бесідка 4 (зона BBQ – 2)')).toBe(2) // em-dash
    expect(parseArea('Бесідка 6 (зона BBQ - 3 )')).toBe(3)
  })
})

describe('parseUnitNumber', () => {
  it('picks the last number in the cleaned name', () => {
    expect(parseUnitNumber('Майданчик 2 – Падл корт 2')).toBe(2)
    expect(parseUnitNumber('Бесідка 5')).toBe(5)
  })

  it('strips the area suffix before picking the unit number', () => {
    expect(parseUnitNumber('Бесідка 3 (зона BBQ - 2)')).toBe(3)
  })

  it('returns 0 when no digits are present', () => {
    expect(parseUnitNumber('Бесідка')).toBe(0)
  })
})

describe('groupZones', () => {
  function z(id: number, name: string, available = true): ZoneItem {
    return { id, name, available }
  }

  it('groups into one area when no BBQ suffix is present', () => {
    const result = groupZones([
      z(10, 'Майданчик 2 – Падл корт 2'),
      z(11, 'Майданчик 3 – Падл корт 3'),
    ])
    expect(result).toHaveLength(1)
    expect(result[0]?.area).toBe(1)
    expect(result[0]?.units.map(u => u.unit)).toEqual([2, 3])
  })

  it('splits BBQ zones into separate areas sorted by area number', () => {
    const result = groupZones([
      z(1, 'Бесідка 5'),
      z(2, 'Бесідка 3 (зона BBQ - 2)'),
      z(3, 'Бесідка 1 (зона BBQ - 2)'),
    ])
    expect(result).toHaveLength(2)
    expect(result[0]?.area).toBe(1)
    expect(result[0]?.units.map(u => u.unit)).toEqual([5])
    expect(result[1]?.area).toBe(2)
    expect(result[1]?.units.map(u => u.unit)).toEqual([1, 3])
  })

  it('units inside an area are sorted by unit number', () => {
    const result = groupZones([
      z(1, 'Бесідка 5'),
      z(2, 'Бесідка 2'),
      z(3, 'Бесідка 10'),
    ])
    const area1 = result[0]
    expect(area1?.units.map(u => u.unit)).toEqual([2, 5, 10])
  })

  it('preserves availability per unit', () => {
    const result = groupZones([
      z(1, 'Бесідка 1', true),
      z(2, 'Бесідка 2', false),
    ])
    expect(result[0]?.units[0]?.available).toBe(true)
    expect(result[0]?.units[1]?.available).toBe(false)
  })
})
