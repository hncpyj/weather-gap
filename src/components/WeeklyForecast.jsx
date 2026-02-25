import { getWeatherInfo, formatTemp, getDayName } from '../utils/weatherCode'

export default function WeeklyForecast({ daily }) {
  if (!daily?.length) return null

  const maxTemp = Math.max(...daily.map(d => d.tempMax))
  const minTemp = Math.min(...daily.map(d => d.tempMin))
  const range = maxTemp - minTemp || 1

  return (
    <div className="mx-4 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
          📅 7-Day Forecast
        </h2>
      </div>

      {daily.map((day, i) => {
        const info = getWeatherInfo(day.weatherCode)
        const barLeft = ((day.tempMin - minTemp) / range) * 100
        const barWidth = ((day.tempMax - day.tempMin) / range) * 100

        return (
          <div
            key={day.date}
            className="flex items-center gap-3 px-4 py-3 border-t border-white/5"
          >
            {/* Day name */}
            <div className="w-20 flex-shrink-0">
              <p className="text-white text-sm font-medium">
                {getDayName(day.date)}
              </p>
              {day.precipProbMax > 20 && (
                <p className="text-sky-400 text-xs">{day.precipProbMax}%</p>
              )}
            </div>

            {/* Emoji */}
            <span className="text-xl flex-shrink-0">{info.emoji}</span>

            {/* Temp range bar */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-white/40 text-sm w-7 text-right flex-shrink-0">
                {formatTemp(day.tempMin)}
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${barLeft}%`,
                    width: `${Math.max(barWidth, 5)}%`,
                    background: 'linear-gradient(to right, #38bdf8, #fb923c)',
                  }}
                />
              </div>
              <span className="text-white text-sm w-7 flex-shrink-0">
                {formatTemp(day.tempMax)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
