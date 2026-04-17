import { describe, expect, it } from 'vitest'
import {
  BOOKING_TYPES,
  BOOKING_TYPE_PARAMS,
  SLOT_DURATION_HOURS,
  OPERATING_HOURS,
  UNAVAILABLE_SUFFIXES,
  FAYNATOWN_API_VERSION,
  FAYNATOWN_BASE_URL,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_SECONDS,
} from '#shared/constants'

describe('shared/constants', () => {
  it('exports all 6 booking types', () => {
    expect(BOOKING_TYPES).toHaveLength(6)
    expect(BOOKING_TYPES.map(t => t.id)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('BOOKING_TYPE_PARAMS is in sync with BOOKING_TYPES', () => {
    expect(BOOKING_TYPE_PARAMS).toEqual(BOOKING_TYPES.map(t => t.param))
  })

  it('SLOT_DURATION_HOURS has entry for every booking type', () => {
    for (const type of BOOKING_TYPES) {
      expect(SLOT_DURATION_HOURS[type.param]).toBeGreaterThan(0)
    }
  })

  it('BBQ has 4-hour slots, sports have 1-hour slots', () => {
    expect(SLOT_DURATION_HOURS.BBQ).toBe(4)
    expect(SLOT_DURATION_HOURS.Paddle_Tennis).toBe(1)
    expect(SLOT_DURATION_HOURS.Tennis).toBe(1)
  })

  it('OPERATING_HOURS has valid range for every booking type', () => {
    for (const type of BOOKING_TYPES) {
      const hours = OPERATING_HOURS[type.param]
      expect(hours.start).toBeLessThan(hours.end)
      expect(hours.start).toBeGreaterThanOrEqual(0)
      expect(hours.end).toBeLessThanOrEqual(24)
    }
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

  it('auth cookie max age is under JWT 90-day lifetime', () => {
    const ninetyDays = 60 * 60 * 24 * 90
    expect(AUTH_COOKIE_MAX_AGE_SECONDS).toBeLessThan(ninetyDays)
    expect(AUTH_COOKIE_NAME).toBe('faynatown_token')
  })
})
