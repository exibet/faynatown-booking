import { describe, expect, it } from 'vitest'
import { parseTimeSlot, stripUnavailableSuffix } from '~~/server/utils/slot-parser'

describe('parseTimeSlot', () => {
  it('parses an available 1h slot', () => {
    const result = parseTimeSlot({ slotValidated: 'з 07:00 по 08:00', isAvaliable: true })
    expect(result).toEqual({
      time: '07:00-08:00',
      startHour: 7,
      endHour: 8,
      available: true,
      rawLabel: 'з 07:00 по 08:00',
    })
  })

  it('parses a 4h BBQ slot', () => {
    const result = parseTimeSlot({ slotValidated: 'з 09:00 по 13:00', isAvaliable: true })
    expect(result?.time).toBe('09:00-13:00')
    expect(result?.startHour).toBe(9)
    expect(result?.endHour).toBe(13)
    expect(result?.available).toBe(true)
  })

  it('marks slot unavailable when isAvaliable is absent', () => {
    const result = parseTimeSlot({ slotValidated: 'з 09:00 по 10:00 (недоступно)' })
    expect(result?.available).toBe(false)
  })

  it('strips the suffix from rawLabel for display', () => {
    const result = parseTimeSlot({ slotValidated: 'з 09:00 по 10:00 (недоступно)' })
    expect(result?.rawLabel).toBe('з 09:00 по 10:00')
  })

  it('returns null for unparseable input', () => {
    expect(parseTimeSlot({ slotValidated: 'garbage' })).toBeNull()
  })

  it('preserves original rawLabel when no suffix', () => {
    const result = parseTimeSlot({ slotValidated: 'з 15:00 по 16:00', isAvaliable: true })
    expect(result?.rawLabel).toBe('з 15:00 по 16:00')
  })
})

describe('stripUnavailableSuffix', () => {
  it('removes (недоступно)', () => {
    expect(stripUnavailableSuffix('з 07:00 по 08:00 (недоступно)')).toBe('з 07:00 по 08:00')
  })

  it('removes (зайнято)', () => {
    expect(stripUnavailableSuffix('Бесідка 5 (зайнято)')).toBe('Бесідка 5')
  })

  it('returns input unchanged when no suffix', () => {
    expect(stripUnavailableSuffix('Бесідка 1')).toBe('Бесідка 1')
  })
})
