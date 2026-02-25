// WMO Weather Interpretation Codes
// https://open-meteo.com/en/docs#weathervariables

const WMO = {
  0:  { label: 'Clear sky',           emoji: '☀️' },
  1:  { label: 'Mainly clear',        emoji: '🌤️' },
  2:  { label: 'Partly cloudy',       emoji: '⛅' },
  3:  { label: 'Overcast',            emoji: '☁️' },
  45: { label: 'Fog',                 emoji: '🌫️' },
  48: { label: 'Icy fog',             emoji: '🌫️' },
  51: { label: 'Light drizzle',       emoji: '🌦️' },
  53: { label: 'Drizzle',             emoji: '🌦️' },
  55: { label: 'Heavy drizzle',       emoji: '🌧️' },
  61: { label: 'Light rain',          emoji: '🌧️' },
  63: { label: 'Rain',                emoji: '🌧️' },
  65: { label: 'Heavy rain',          emoji: '🌧️' },
  66: { label: 'Freezing rain',       emoji: '🌨️' },
  67: { label: 'Heavy freezing rain', emoji: '🌨️' },
  71: { label: 'Light snow',          emoji: '🌨️' },
  73: { label: 'Snow',                emoji: '❄️' },
  75: { label: 'Heavy snow',          emoji: '❄️' },
  77: { label: 'Snow grains',         emoji: '🌨️' },
  80: { label: 'Light showers',       emoji: '🌦️' },
  81: { label: 'Showers',             emoji: '🌧️' },
  82: { label: 'Heavy showers',       emoji: '⛈️' },
  85: { label: 'Snow showers',        emoji: '🌨️' },
  86: { label: 'Heavy snow showers',  emoji: '🌨️' },
  95: { label: 'Thunderstorm',        emoji: '⛈️' },
  96: { label: 'Thunderstorm + hail', emoji: '⛈️' },
  99: { label: 'Thunderstorm + hail', emoji: '⛈️' },
}

export function getWeatherInfo(code) {
  return WMO[code] ?? { label: 'Unknown', emoji: '🌡️' }
}

export function isRainy(code) {
  return [51,53,55,61,63,65,66,67,80,81,82,95,96,99].includes(code)
}

export function formatTemp(val) {
  if (val == null) return '--'
  return `${Math.round(val)}°`
}

export function formatTime(isoString) {
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatHour(isoString) {
  const d = new Date(isoString)
  return d.getHours()
}

export function getDayName(dateString, short = false) {
  const d = new Date(dateString + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: short ? 'short' : 'long' })
}
