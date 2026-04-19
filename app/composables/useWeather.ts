import { API } from '#shared/api'
import { WEATHER_FORECAST_DAYS } from '#shared/constants'
import { FETCH_KEY } from '#shared/fetch-keys'
import type { WeatherDay, WeatherForecast } from '#shared/types'
import { addDays, formatLocalDate, todayLocal } from '#shared/utils/datetime'
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
 * (alongside the other `*Sync` composables).
 *
 * Fetches the full 14-day Open-Meteo window in one shot and keeps it in the
 * Nuxt payload for the whole session — week navigation does NOT re-query.
 * Open-Meteo accuracy drops sharply past 14 days and the server route
 * clamps the window to `[today, today + WEATHER_FORECAST_DAYS - 1]` anyway,
 * so there's nothing useful to refetch when the user pages forward.
 */
export function useWeatherSync() {
  const api = createApi()
  const today = todayLocal()
  const start = formatLocalDate(today)
  const end = formatLocalDate(addDays(today, WEATHER_FORECAST_DAYS - 1))

  return useAsyncData<WeatherForecast>(
    FETCH_KEY.WEATHER,
    () => api<WeatherForecast>(API.WEATHER, {
      query: { start, end },
    }),
    {
      default: () => [],
      getCachedData: initialOnlyCache,
    },
  )
}
