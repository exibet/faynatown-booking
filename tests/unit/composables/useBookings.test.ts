import { describe, expect, it } from 'vitest'
import type { BookingItem } from '#shared/types'
import { _internal } from '~/composables/useBookings'

const { filterBookingsForSlot, slotEndHourFromDateTime } = _internal

function mkBooking(overrides: Partial<BookingItem> = {}): BookingItem {
  return {
    id: 1,
    zoneName: 'Майданчик 1 – Падл корт 1',
    complexName: 'Файна Таун',
    start: '2026-04-20T09:00:00',
    end: '2026-04-20T10:00:00',
    details: 'з 09:00 по 10:00',
    typeId: 6,
    isActive: true,
    canCancel: true,
    ...overrides,
  }
}

describe('slotEndHourFromDateTime', () => {
  it('returns the hour when minutes are zero', () => {
    expect(slotEndHourFromDateTime(new Date(2026, 3, 20, 10, 0))).toBe(10)
  })

  it('rounds up when minutes are non-zero (booking ends mid-hour)', () => {
    expect(slotEndHourFromDateTime(new Date(2026, 3, 20, 10, 30))).toBe(11)
  })

  it('returns 24 for midnight (spills into next day)', () => {
    expect(slotEndHourFromDateTime(new Date(2026, 3, 21, 0, 0))).toBe(24)
  })
})

describe('filterBookingsForSlot', () => {
  const date = new Date(2026, 3, 20)

  it('returns bookings that overlap the slot hour range', () => {
    const bookings = [
      mkBooking({ id: 1, start: '2026-04-20T09:00:00', end: '2026-04-20T10:00:00' }),
    ]
    const matches = filterBookingsForSlot(bookings, {
      date,
      startHour: 9,
      endHour: 10,
      typeId: 6,
    })
    expect(matches.map(m => m.id)).toEqual([1])
  })

  it('excludes bookings of a different type', () => {
    const bookings = [
      mkBooking({ id: 1, typeId: 1, start: '2026-04-20T09:00:00', end: '2026-04-20T13:00:00' }),
    ]
    const matches = filterBookingsForSlot(bookings, {
      date,
      startHour: 9,
      endHour: 10,
      typeId: 6,
    })
    expect(matches).toHaveLength(0)
  })

  it('excludes bookings on a different day', () => {
    const bookings = [
      mkBooking({ id: 1, start: '2026-04-21T09:00:00', end: '2026-04-21T10:00:00' }),
    ]
    const matches = filterBookingsForSlot(bookings, {
      date,
      startHour: 9,
      endHour: 10,
      typeId: 6,
    })
    expect(matches).toHaveLength(0)
  })

  it('partial overlap: booking starts before slot but ends inside', () => {
    const bookings = [
      mkBooking({ id: 1, start: '2026-04-20T08:30:00', end: '2026-04-20T09:30:00' }),
    ]
    const matches = filterBookingsForSlot(bookings, {
      date,
      startHour: 9,
      endHour: 10,
      typeId: 6,
    })
    expect(matches).toHaveLength(1)
  })

  it('non-overlap: booking ends exactly at slot start', () => {
    const bookings = [
      mkBooking({ id: 1, start: '2026-04-20T08:00:00', end: '2026-04-20T09:00:00' }),
    ]
    const matches = filterBookingsForSlot(bookings, {
      date,
      startHour: 9,
      endHour: 10,
      typeId: 6,
    })
    expect(matches).toHaveLength(0)
  })

  it('BBQ 4-hour booking covers multiple 1-hour slots', () => {
    const bookings = [
      mkBooking({ id: 1, typeId: 1, start: '2026-04-20T09:00:00', end: '2026-04-20T13:00:00' }),
    ]
    const match10 = filterBookingsForSlot(bookings, {
      date,
      startHour: 10,
      endHour: 11,
      typeId: 1,
    })
    const match14 = filterBookingsForSlot(bookings, {
      date,
      startHour: 14,
      endHour: 15,
      typeId: 1,
    })
    expect(match10).toHaveLength(1)
    expect(match14).toHaveLength(0)
  })

  it('midnight-end booking is handled correctly', () => {
    const bookings = [
      mkBooking({ id: 1, typeId: 1, start: '2026-04-20T21:00:00', end: '2026-04-21T00:00:00' }),
    ]
    const match = filterBookingsForSlot(bookings, {
      date,
      startHour: 22,
      endHour: 23,
      typeId: 1,
    })
    expect(match).toHaveLength(1)
  })
})
