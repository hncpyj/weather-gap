import { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { formatTemp } from '../utils/weatherCode'

const LINES = [
  { key: 'yesterday', label: 'Yesterday', color: '#64748b', dash: '5 4',  width: 1.5, defaultOn: true  },
  { key: 'today',     label: 'Today',     color: '#38bdf8', dash: null,   width: 2.5, defaultOn: true  },
  { key: 'tomorrow',  label: 'Tomorrow',  color: '#fb923c', dash: '6 3',  width: 1.5, defaultOn: false },
]

function ToggleButton({ line, active, onToggle }) {
  return (
    <button
      onClick={() => onToggle(line.key)}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        active
          ? 'bg-white/10 text-white'
          : 'bg-transparent text-white/30'
      }`}
    >
      {/* Line preview */}
      <svg width="18" height="10" viewBox="0 0 18 10">
        {line.dash ? (
          <line
            x1="0" y1="5" x2="18" y2="5"
            stroke={active ? line.color : '#475569'}
            strokeWidth="2"
            strokeDasharray={line.dash}
          />
        ) : (
          <line
            x1="0" y1="5" x2="18" y2="5"
            stroke={active ? line.color : '#475569'}
            strokeWidth="2.5"
          />
        )}
      </svg>
      {line.label}
    </button>
  )
}

function CustomTooltip({ active, payload, label, visible }) {
  if (!active || !payload?.length) return null

  const entries = LINES
    .filter(l => visible[l.key])
    .map(l => ({ ...l, entry: payload.find(p => p.dataKey === l.key) }))
    .filter(l => l.entry?.value != null)

  if (!entries.length) return null

  return (
    <div className="bg-slate-800/95 border border-white/10 rounded-xl px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-white/50 text-xs mb-1.5">{label}:00</p>
      {entries.map(l => (
        <p key={l.key} className="text-sm font-medium" style={{ color: l.color }}>
          {l.label} {formatTemp(l.entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function HourlyChart({ todayHours, yesterdayHours, tomorrowHours }) {
  const currentHour = new Date().getHours()

  const [visible, setVisible] = useState(() =>
    Object.fromEntries(LINES.map(l => [l.key, l.defaultOn]))
  )

  function toggle(key) {
    setVisible(v => ({ ...v, [key]: !v[key] }))
  }

  // Merge all three days by hour (0–23)
  const data = Array.from({ length: 24 }, (_, i) => {
    const t = todayHours?.find(h => h.hour === i)
    const y = yesterdayHours?.find(h => h.hour === i)
    const tm = tomorrowHours?.find(h => h.hour === i)
    return {
      hour: i,
      label: `${i}`,
      today:     t?.temp  ?? null,
      yesterday: y?.temp  ?? null,
      tomorrow:  tm?.temp ?? null,
      precipProb: t?.precipProb ?? 0,
    }
  })

  // Y-axis domain: only include temps from visible lines
  const allTemps = data.flatMap(d =>
    LINES.filter(l => visible[l.key]).map(l => d[l.key])
  ).filter(v => v != null)

  const minTemp = allTemps.length ? Math.floor(Math.min(...allTemps)) - 2 : 0
  const maxTemp = allTemps.length ? Math.ceil(Math.max(...allTemps))  + 2 : 30

  return (
    <div className="mx-4 bg-white/5 border border-white/10 rounded-3xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
          Hourly Temperature
        </h2>
      </div>

      {/* Toggle pills */}
      <div className="flex items-center gap-1 mb-3">
        {LINES.map(line => (
          <ToggleButton
            key={line.key}
            line={line}
            active={visible[line.key]}
            onToggle={toggle}
          />
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={2}
            tickFormatter={v => `${v}h`}
          />

          <YAxis
            domain={[minTemp, maxTemp]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}°`}
            width={36}
          />

          <Tooltip content={<CustomTooltip visible={visible} />} />

          {/* Current time reference line */}
          <ReferenceLine
            x={String(currentHour)}
            stroke="rgba(255,255,255,0.25)"
            strokeDasharray="4 4"
            label={{ value: 'Now', position: 'top', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
          />

          {/* Yesterday (gray dashed) */}
          {visible.yesterday && (
            <Line
              type="monotone"
              dataKey="yesterday"
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 3, fill: '#64748b' }}
              connectNulls
            />
          )}

          {/* Tomorrow (orange dashed) — rendered before today so today is on top */}
          {visible.tomorrow && (
            <Line
              type="monotone"
              dataKey="tomorrow"
              stroke="#fb923c"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 3, fill: '#fb923c' }}
              connectNulls
            />
          )}

          {/* Today (blue solid) — always on top */}
          {visible.today && (
            <Line
              type="monotone"
              dataKey="today"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Precipitation probability bar */}
      <div className="mt-2 px-1">
        <div className="flex items-end gap-px h-6">
          {data.map(d => (
            <div
              key={d.hour}
              className="flex-1 rounded-sm"
              style={{
                height: `${((d.precipProb ?? 0) / 100) * 24}px`,
                backgroundColor: d.precipProb >= 50
                  ? 'rgba(56, 189, 248, 0.5)'
                  : 'rgba(56, 189, 248, 0.15)',
                minHeight: 2,
              }}
              title={`${d.hour}h: ${d.precipProb ?? 0}% rain`}
            />
          ))}
        </div>
        <p className="text-white/30 text-xs mt-1">Precipitation probability</p>
      </div>
    </div>
  )
}
