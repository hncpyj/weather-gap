import { useState, useEffect } from 'react'
import { useWeather } from './hooks/useWeather'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyChart from './components/HourlyChart'
import RainForecast from './components/RainForecast'
import WeeklyForecast from './components/WeeklyForecast'
import WeatherDetails from './components/WeatherDetails'

export default function App() {
  const [location, setLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [gpsError, setGpsError] = useState(false)

  const { data, loading, error } = useWeather(location)

  // Try to get GPS location on first load
  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback to London
      setLocation({ lat: 51.5074, lon: -0.1278 })
      setLocationName('London')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      () => {
        setGpsError(true)
        setLocation({ lat: 51.5074, lon: -0.1278 })
        setLocationName('London')
      },
      { timeout: 8000 }
    )
  }, [])

  function handleSelectLocation(loc) {
    setLocation({ lat: loc.lat, lon: loc.lon })
    setLocationName([loc.name, loc.admin1, loc.country].filter(Boolean).join(', '))
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 max-w-lg mx-auto">
      {/* Safe area top padding for iPhone notch */}
      <div className="pt-safe-top" />

      {/* Header / Search */}
      <div className="px-4 pt-4 pb-2">
        <SearchBar onSelect={handleSelectLocation} />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-sky-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading weather...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mx-4 mt-8 bg-red-900/30 border border-red-700/40 rounded-2xl p-4 text-center">
          <p className="text-red-300 text-sm">⚠️ {error}</p>
          <p className="text-white/40 text-xs mt-1">Check your connection and try again</p>
        </div>
      )}

      {/* No location yet */}
      {!location && !loading && (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">📍 Detecting your location...</p>
        </div>
      )}

      {/* Main content */}
      {data && !loading && (
        <div className="flex flex-col gap-5 pb-10">
          {/* Current weather */}
          <CurrentWeather
            current={data.current}
            daily={data.daily}
            locationName={locationName}
          />

          {/* Rain forecast banner */}
          <RainForecast rainAlert={data.rainAlert} />

          {/* Hourly temp chart — core feature */}
          <HourlyChart
            todayHours={data.todayHours}
            yesterdayHours={data.yesterdayHours}
            tomorrowHours={data.tomorrowHours}
          />

          {/* 7-day forecast */}
          <WeeklyForecast daily={data.daily} />

          {/* Detail cards */}
          <WeatherDetails
            current={data.current}
            todayDaily={data.daily?.[0]}
          />

          {gpsError && (
            <p className="text-white/20 text-xs text-center px-4">
              📍 GPS unavailable — showing London. Search for your city above.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
