import { describe, expect, it } from 'vitest'
import { describeWeatherCode } from '#shared/utils/weather'

describe('describeWeatherCode', () => {
  it.each([
    [0, 'w-sun', 'clear'],
    [1, 'w-cloud-sun', 'mainlyClear'],
    [2, 'w-cloud-sun', 'partlyCloudy'],
    [3, 'w-cloud', 'overcast'],
    [45, 'w-cloud-fog', 'fog'],
    [48, 'w-cloud-fog', 'fog'],
    [51, 'w-cloud-rain', 'drizzle'],
    [55, 'w-cloud-rain', 'drizzle'],
    [57, 'w-cloud-rain', 'drizzle'],
    [61, 'w-cloud-rain', 'rain'],
    [63, 'w-cloud-rain', 'rain'],
    [67, 'w-cloud-rain', 'rain'],
    [71, 'w-cloud-snow', 'snow'],
    [77, 'w-cloud-snow', 'snow'],
    [80, 'w-cloud-rain', 'showers'],
    [82, 'w-cloud-rain', 'showers'],
    [85, 'w-cloud-snow', 'snowShowers'],
    [86, 'w-cloud-snow', 'snowShowers'],
    [95, 'w-cloud-lightning', 'thunderstorm'],
    [99, 'w-cloud-lightning', 'thunderstorm'],
  ])('code %d → icon %s, i18n %s', (code, icon, key) => {
    const result = describeWeatherCode(code)
    expect(result.icon).toBe(icon)
    expect(result.i18nKey).toBe(key)
  })

  it('falls back to cloud/unknown for unrecognised codes', () => {
    expect(describeWeatherCode(999)).toEqual({ icon: 'w-cloud', i18nKey: 'unknown' })
    expect(describeWeatherCode(50)).toEqual({ icon: 'w-cloud', i18nKey: 'unknown' })
  })
})
