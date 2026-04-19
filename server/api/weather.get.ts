import { z } from 'zod'
import type { WeatherDay, WeatherForecast } from '#shared/types'
import {
  FAYNATOWN_COORDS,
  OPEN_METEO_FORECAST_URL,
  WEATHER_FORECAST_DAYS,
} from '#shared/constants'
import { addDays, formatLocalDate, parseLocalDate, todayLocal } from '#shared/utils/datetime'

const QuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
})

interface OpenMeteoResponse {
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
  }
}

/**
 * Clamp the requested window to `[today, today + WEATHER_FORECAST_DAYS - 1]`.
 * Open-Meteo doesn't serve past dates through the forecast endpoint and its
 * accuracy drops sharply beyond two weeks, so we never ask for dates outside
 * that band. When the entire requested week is in the past the upstream call
 * is skipped and we return `[]` so the client hides the row silently.
 */
function clampRange(start: string, end: string): { from: Date, to: Date } | null {
  const today = todayLocal()
  const max = addDays(today, WEATHER_FORECAST_DAYS - 1)
  const reqStart = parseLocalDate(start)
  const reqEnd = parseLocalDate(end)
  const from = reqStart < today ? today : reqStart
  const to = reqEnd > max ? max : reqEnd
  if (from > to) return null
  return { from, to }
}

export default defineEventHandler(async (event): Promise<WeatherForecast> => {
  requireAuth(event)

  const query = getQuery(event)
  const parsed = QuerySchema.safeParse(query)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid query' })
  }

  const clamped = clampRange(parsed.data.start, parsed.data.end)
  if (!clamped) return []

  const upstream = await $fetch<OpenMeteoResponse>(OPEN_METEO_FORECAST_URL, {
    query: {
      latitude: FAYNATOWN_COORDS.latitude,
      longitude: FAYNATOWN_COORDS.longitude,
      timezone: FAYNATOWN_COORDS.timezone,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      start_date: formatLocalDate(clamped.from),
      end_date: formatLocalDate(clamped.to),
    },
  })

  const daily = upstream.daily
  if (!daily?.time || !daily.weather_code || !daily.temperature_2m_max || !daily.temperature_2m_min) {
    return []
  }

  const days: WeatherDay[] = []
  for (let i = 0; i < daily.time.length; i++) {
    const date = daily.time[i]
    const code = daily.weather_code[i]
    const tMax = daily.temperature_2m_max[i]
    const tMin = daily.temperature_2m_min[i]
    if (!date || code == null || tMax == null || tMin == null) continue
    days.push({
      date,
      code,
      tempMaxC: Math.round(tMax),
      tempMinC: Math.round(tMin),
    })
  }
  return days
})
