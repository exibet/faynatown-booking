import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import type { WeatherDay, WeatherForecast } from '#shared/types'
import { addDays, formatLocalDate } from '#shared/utils/datetime'
import { initialOnlyCache } from '~/utils/async-data'

/**
 * Read-only accessor. Consumers (`WeekGrid`, `DateStrip`, `DayTitle`) ask
 * "do we have weather for 2026-04-20?" per cell, so we back the lookup with
 * a Map computed from the forecast array — avoids a linear scan per cell.
 * Days outside the forecast window miss from the Map and the consumer hides
 * the weather block.
 */
export function useWeather() {
  const data = useNuxtData<WeatherForecast>(FETCH_KEY.WEATHER)
  const byDate = computed<ReadonlyMap<string, WeatherDay>>(() => {
    const map = new Map<string, WeatherDay>()
    for (const day of data.data.value ?? []) map.set(day.date, day)
    return map
  })

  function forDate(iso: string): WeatherDay | undefined {
    return byDate.value.get(iso)
  }

  return { forDate }
}

/**
 * Registers the `useAsyncData` fetch. Must be called ONCE in `pages/index.vue`
 * (alongside the other `*Sync` composables) — calling it per layout would
 * queue two parallel Open-Meteo requests on every week change.
 *
 * The range covers the full visible week and watches `weekAnchor`; the server
 * route clamps past dates + the 14-day ceiling, so we don't need a client-side
 * guard here.
 */
export function useWeatherSync() {
  const api = createApi()
  const calendar = useCalendar()

  const range = computed(() => {
    const start = calendar.weekAnchor.value
    return {
      start: formatLocalDate(start),
      end: formatLocalDate(addDays(start, 6)),
    }
  })

  return useAsyncData<WeatherForecast>(
    FETCH_KEY.WEATHER,
    () => api<WeatherForecast>(API.WEATHER, {
      query: { start: range.value.start, end: range.value.end },
    }),
    {
      default: () => [],
      watch: [range],
      getCachedData: initialOnlyCache,
    },
  )
}
