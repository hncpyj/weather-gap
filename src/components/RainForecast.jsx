export default function RainForecast({ rainAlert }) {
  if (!rainAlert) return null

  const { message, stopping } = rainAlert

  return (
    <div className={`mx-4 px-4 py-3 rounded-2xl flex items-center gap-3 ${
      stopping
        ? 'bg-blue-900/40 border border-blue-700/40'
        : 'bg-blue-800/50 border border-blue-600/40'
    }`}>
      <span className="text-2xl">
        {stopping ? '🌤️' : '🌧️'}
      </span>
      <p className="text-white/90 text-sm font-medium">{message}</p>
    </div>
  )
}
