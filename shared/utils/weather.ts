/**
 * WMO Weather interpretation code → internal icon + i18n key.
 *
 * Table follows Open-Meteo docs (https://open-meteo.com/en/docs) — codes are
 * coarse buckets (drizzle vs rain vs snow), so we collapse them further into
 * the seven icons our `Icon.vue` sprite carries: sun, cloud-sun, cloud,
 * cloud-fog, cloud-rain, cloud-snow, cloud-lightning.
 *
 * `i18nKey` indexes into `i18n/locales/<lang>.json#weather` — ONE label per
 * bucket, not per raw code: users don't care whether drizzle was "light" vs
 * "dense", the weather widget only has space for one word anyway.
 */

export type WeatherIconName
  = | 'w-sun'
    | 'w-cloud-sun'
    | 'w-cloud'
    | 'w-cloud-fog'
    | 'w-cloud-rain'
    | 'w-cloud-snow'
    | 'w-cloud-lightning'

export interface WeatherDescriptor {
  icon: WeatherIconName
  i18nKey: string
}

/**
 * Map a WMO code to an icon + i18n key. Unknown codes fall back to `cloud`
 * with a generic `unknown` label — Open-Meteo could introduce new codes in
 * future API versions, so we degrade gracefully instead of throwing.
 */
export function describeWeatherCode(code: number): WeatherDescriptor {
  if (code === 0) return { icon: 'w-sun', i18nKey: 'clear' }
  if (code === 1) return { icon: 'w-cloud-sun', i18nKey: 'mainlyClear' }
  if (code === 2) return { icon: 'w-cloud-sun', i18nKey: 'partlyCloudy' }
  if (code === 3) return { icon: 'w-cloud', i18nKey: 'overcast' }
  if (code === 45 || code === 48) return { icon: 'w-cloud-fog', i18nKey: 'fog' }
  if (code >= 51 && code <= 57) return { icon: 'w-cloud-rain', i18nKey: 'drizzle' }
  if (code >= 61 && code <= 67) return { icon: 'w-cloud-rain', i18nKey: 'rain' }
  if (code >= 71 && code <= 77) return { icon: 'w-cloud-snow', i18nKey: 'snow' }
  if (code >= 80 && code <= 82) return { icon: 'w-cloud-rain', i18nKey: 'showers' }
  if (code === 85 || code === 86) return { icon: 'w-cloud-snow', i18nKey: 'snowShowers' }
  if (code >= 95 && code <= 99) return { icon: 'w-cloud-lightning', i18nKey: 'thunderstorm' }
  return { icon: 'w-cloud', i18nKey: 'unknown' }
}
