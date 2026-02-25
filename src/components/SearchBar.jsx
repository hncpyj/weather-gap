import { useState, useRef, useEffect } from 'react'
import { searchLocations } from '../api/weather'

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timer = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchLocations(query)
        setResults(res)
        setOpen(res.length > 0)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [query])

  function handleSelect(loc) {
    onSelect({
      lat: loc.latitude,
      lon: loc.longitude,
      name: loc.name,
      country: loc.country,
      admin1: loc.admin1,
    })
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-3">
        <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search city..."
          className="bg-transparent text-white placeholder-white/40 text-sm flex-1 outline-none"
        />
        {searching && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
        )}
        {query && !searching && (
          <button onClick={() => { setQuery(''); setOpen(false) }} className="text-white/40 hover:text-white/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-xl z-50">
          {results.map((loc, i) => (
            <button
              key={i}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
            >
              <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="text-white text-sm font-medium">{loc.name}</div>
                <div className="text-white/40 text-xs">{[loc.admin1, loc.country].filter(Boolean).join(', ')}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
