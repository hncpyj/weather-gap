import { getWeatherInfo, formatTemp } from '../utils/weatherCode'

export default function CurrentWeather({ current, daily, locationName }) {
  const info = getWeatherInfo(current.weather_code)
  const today = daily?.[0]

  return (
    <div className="text-center pt-4 pb-2">
      <p className="text-white/60 text-sm font-medium tracking-wide mb-1">
        {locationName || 'My Location'}
      </p>
      <div className="text-8xl font-thin text-white leading-none mb-2">
        {formatTemp(current.temperature_2m)}
      </div>
      <p className="text-white/80 text-lg mb-1">{info.emoji} {info.label}</p>
      <p className="text-white/50 text-sm">
        Feels like {formatTemp(current.apparent_temperature)}
        {today && (
          <span> · H:{formatTemp(today.tempMax)} L:{formatTemp(today.tempMin)}</span>
        )}
      </p>
    </div>
  )
}
