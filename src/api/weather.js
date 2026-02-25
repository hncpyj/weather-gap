const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'relative_humidity_2m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'precipitation',
    ].join(','),
    minutely_15: [
      'precipitation',
      'precipitation_probability',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'sunrise',
      'sunset',
    ].join(','),
    past_days: 1,
    forecast_days: 8,
    timezone: 'Europe/London',
  })

  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

export async function searchLocations(query) {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    name: query,
    count: 5,
    language: 'en',
    format: 'json',
  })
  const res = await fetch(`${GEO_URL}?${params}`)
  if (!res.ok) throw new Error('Geocoding fetch failed')
  const data = await res.json()
  return data.results || []
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    count: 1,
    language: 'en',
    format: 'json',
  })
  const res = await fetch(`${GEO_URL}?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.results?.[0] || null
}
