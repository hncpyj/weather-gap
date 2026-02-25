import { useState, useEffect, useCallback } from 'react'
import { fetchWeather } from '../api/weather'

export function useWeather(location) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!location) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchWeather(location.lat, location.lon)
      setData(parseWeatherData(result))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [location?.lat, location?.lon])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refetch: load }
}

function parseWeatherData(raw) {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  // hourly times are like "2024-01-15T00:00"
  const hourlyTimes = raw.hourly.time
  const hourlyTemps = raw.hourly.temperature_2m
  const hourlyPrecipProb = raw.hourly.precipitation_probability
  const hourlyPrecip = raw.hourly.precipitation

  // Split hourly into yesterday (first 24) and today+future
  const yesterdayIdx = hourlyTimes.findIndex(t => t.startsWith(todayStr))
  const todayStart = yesterdayIdx === -1 ? 24 : yesterdayIdx

  const yesterdayHours = hourlyTimes.slice(todayStart - 24, todayStart).map((t, i) => ({
    hour: new Date(t).getHours(),
    temp: hourlyTemps[todayStart - 24 + i],
    label: `${new Date(t).getHours()}:00`,
  }))

  const todayHours = hourlyTimes.slice(todayStart, todayStart + 24).map((t, i) => ({
    hour: new Date(t).getHours(),
    temp: hourlyTemps[todayStart + i],
    precipProb: hourlyPrecipProb[todayStart + i],
    precip: hourlyPrecip[todayStart + i],
    label: `${new Date(t).getHours()}:00`,
  }))

  const tomorrowStart = todayStart + 24
  const tomorrowHours = hourlyTimes.slice(tomorrowStart, tomorrowStart + 24).map((t, i) => ({
    hour: new Date(t).getHours(),
    temp: hourlyTemps[tomorrowStart + i],
    precipProb: hourlyPrecipProb[tomorrowStart + i],
    label: `${new Date(t).getHours()}:00`,
  }))

  // Rain forecast from minutely_15
  const rainAlert = parseRainAlert(raw.minutely_15, now)

  // daily — skip index 0 (yesterday), start from today
  const dailyStart = raw.daily.time.findIndex(d => d === todayStr)
  const ds = dailyStart === -1 ? 0 : dailyStart
  const daily = raw.daily.time.slice(ds, ds + 7).map((date, i) => ({
    date,
    weatherCode: raw.daily.weather_code[ds + i],
    tempMax: raw.daily.temperature_2m_max[ds + i],
    tempMin: raw.daily.temperature_2m_min[ds + i],
    precipSum: raw.daily.precipitation_sum[ds + i],
    precipProbMax: raw.daily.precipitation_probability_max[ds + i],
    sunrise: raw.daily.sunrise[ds + i],
    sunset: raw.daily.sunset[ds + i],
  }))

  return {
    current: raw.current,
    todayHours,
    yesterdayHours,
    tomorrowHours,
    daily,
    rainAlert,
  }
}

function parseRainAlert(minutely15, now) {
  if (!minutely15?.time) return null

  const times = minutely15.time
  const probs = minutely15.precipitation_probability
  const precips = minutely15.precipitation

  const nowMs = now.getTime()

  // Find upcoming 15-min slots
  for (let i = 0; i < times.length; i++) {
    const slotMs = new Date(times[i]).getTime()
    if (slotMs < nowMs) continue

    const minutesAway = Math.round((slotMs - nowMs) / 60000)
    if (minutesAway > 120) break  // only look 2h ahead

    if ((probs[i] ?? 0) >= 50 || (precips[i] ?? 0) > 0.1) {
      if (minutesAway <= 5) return { message: 'Rain starting now', minutesAway: 0 }
      return { message: `Rain expected in ${minutesAway} min`, minutesAway }
    }
  }

  // Check if currently raining and when it stops
  const currentlyRaining = precips.some((p, i) => {
    const slotMs = new Date(times[i]).getTime()
    return Math.abs(slotMs - nowMs) < 15 * 60000 && (p ?? 0) > 0.1
  })

  if (currentlyRaining) {
    for (let i = 0; i < times.length; i++) {
      const slotMs = new Date(times[i]).getTime()
      if (slotMs < nowMs) continue
      const minutesAway = Math.round((slotMs - nowMs) / 60000)
      if ((precips[i] ?? 0) <= 0.1 && (probs[i] ?? 0) < 30) {
        return { message: `Rain stopping in ${minutesAway} min`, minutesAway, stopping: true }
      }
    }
  }

  return null
}
