function DetailCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
      <p className="text-white/40 text-xs uppercase tracking-wider flex items-center gap-1.5">
        <span>{icon}</span>
        {label}
      </p>
      <p className="text-white text-2xl font-semibold">{value}</p>
      {sub && <p className="text-white/40 text-xs">{sub}</p>}
    </div>
  )
}

function getHumidityDesc(h) {
  if (h < 30) return 'Dry'
  if (h < 50) return 'Comfortable'
  if (h < 70) return 'Moderate'
  if (h < 85) return 'Humid'
  return 'Very humid'
}

function getWindDesc(kmh) {
  if (kmh < 5) return 'Calm'
  if (kmh < 20) return 'Light breeze'
  if (kmh < 40) return 'Moderate wind'
  if (kmh < 60) return 'Strong wind'
  return 'Very strong'
}

export default function WeatherDetails({ current, todayDaily }) {
  if (!current) return null

  const humidity = current.relative_humidity_2m
  const wind = current.wind_speed_10m
  const precip = current.precipitation

  return (
    <div className="mx-4">
      <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
        🌡️ Current Conditions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <DetailCard
          icon="💧"
          label="Humidity"
          value={`${humidity}%`}
          sub={getHumidityDesc(humidity)}
        />
        <DetailCard
          icon="💨"
          label="Wind"
          value={`${Math.round(wind)} km/h`}
          sub={getWindDesc(wind)}
        />
        <DetailCard
          icon="🌧️"
          label="Precipitation"
          value={`${precip} mm`}
          sub="Last hour"
        />
        {todayDaily && (
          <DetailCard
            icon="☔"
            label="Rain chance"
            value={`${todayDaily.precipProbMax ?? 0}%`}
            sub={`${todayDaily.precipSum ?? 0} mm today`}
          />
        )}
      </div>
    </div>
  )
}
