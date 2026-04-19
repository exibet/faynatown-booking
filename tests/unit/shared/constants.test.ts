import { describe, expect, it } from 'vitest'
import {
  AUTH_STORAGE_KEY,
  BOOKING_TYPES,
  BOOKING_TYPE_PARAMS,
  DEFAULT_BOOKING_TYPE,
  FAYNATOWN_API_VERSION,
  FAYNATOWN_BASE_URL,
  OPERATING_HOURS,
  UNAVAILABLE_SUFFIXES,
  findBookingType,
  typeIdOf,
} from '#shared/constants'

describe('shared/constants', () => {
  it('exports all 6 booking types', () => {
    expect(BOOKING_TYPES).toHaveLength(6)
    expect(BOOKING_TYPES.map(t => t.id)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('BOOKING_TYPE_PARAMS is in sync with BOOKING_TYPES', () => {
    expect(BOOKING_TYPE_PARAMS).toEqual(BOOKING_TYPES.map(t => t.param))
  })

  it('every booking type declares positive slotMinutes', () => {
    for (const type of BOOKING_TYPES) {
      expect(type.slotMinutes).toBeGreaterThan(0)
    }
  })

  it('BBQ has 4-hour slots, sports have 1-hour slots', () => {
    const bbq = findBookingType('BBQ')
    const paddle = findBookingType('Paddle_Tennis')
    const tennis = findBookingType('Tennis')
    expect(bbq?.slotMinutes).toBe(240)
    expect(paddle?.slotMinutes).toBe(60)
    expect(tennis?.slotMinutes).toBe(60)
  })

  it('OPERATING_HOURS has valid range for every booking type', () => {
    for (const type of BOOKING_TYPES) {
      const hours = OPERATING_HOURS[type.param]
      expect(hours.start).toBeLessThan(hours.end)
      expect(hours.start).toBeGreaterThanOrEqual(0)
      expect(hours.end).toBeLessThanOrEqual(24)
    }
  })

  it('Tennis is the only hidden type (shares court with Volleyball)', () => {
    const hidden = BOOKING_TYPES.filter(b => !b.visible)
    expect(hidden).toHaveLength(1)
    expect(hidden[0]?.param).toBe('Tennis')
  })

  it('findBookingType returns the matching meta or undefined', () => {
    expect(findBookingType('BBQ')?.id).toBe(1)
    expect(findBookingType('Paddle_Tennis')?.id).toBe(6)
  })

  it('typeIdOf returns the id for a known type', () => {
    expect(typeIdOf('BBQ')).toBe(1)
    expect(typeIdOf(DEFAULT_BOOKING_TYPE)).toBe(6)
  })

  it('UNAVAILABLE_SUFFIXES contains both Ukrainian suffixes', () => {
    expect(UNAVAILABLE_SUFFIXES).toContain('(недоступно)')
    expect(UNAVAILABLE_SUFFIXES).toContain('(зайнято)')
  })

  it('API version is 45 (required header, otherwise 400)', () => {
    expect(FAYNATOWN_API_VERSION).toBe(45)
  })

  it('base URL points to Faynatown webapi', () => {
    expect(FAYNATOWN_BASE_URL).toBe('https://webapi.faynatown.com.ua/api')
  })

  it('auth storage key is namespaced', () => {
    expect(AUTH_STORAGE_KEY).toBe('faynatown:token')
  })
})
