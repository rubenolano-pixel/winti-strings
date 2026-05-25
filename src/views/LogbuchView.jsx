import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

const TYPE_STYLES = {
  'Polyester':     'bg-blue-50 text-blue-700',
  'Monofilament':  'bg-purple-50 text-purple-700',
  'Multifilament': 'bg-emerald-50 text-emerald-700',
  'Natural Gut':   'bg-amber-50 text-amber-700',
  'Synthetic Gut': 'bg-orange-50 text-orange-700',
  'Hybrid':        'bg-pink-50 text-pink-700',
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`text-sm ${s <= rating ? 'text-[#f4c430]' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

function StringingCard({ s }) {
  const date = new Date(s.date)
  const day = date.toLocaleDateString('de-CH', { day: 'numeric', month: 'short' })
  const year = date.getFullYear()
  const weekday = date.toLocaleDateString('de-CH', { weekday: 'short' })

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-[#0f7c3a]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Links: Datum + Name */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{weekday}, {day} {year}</p>
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{s.string_name}</h3>
          </div>

          {/* Rechts: Spannung */}
          <div className="text-right flex-shrink-0">
            {s.tension_main ? (
              <>
                <span className="text-xl font-extrabold text-[#0f7c3a] leading-none">
                  {s.tension_main}
                  {s.tension_cross && parseFloat(s.tension_cross) !== parseFloat(s.tension_main)
                    ? `/${s.tension_cross}` : ''}
                </span>
                <span className="text-xs text-gray-400 block">kg</span>
              </>
            ) : (
              <span className="text-gray-300 text-sm">–</span>
            )}
          </div>
        </div>

        {/* Tags: Typ + Rating */}
        {(s.string_type || s.rating) && (
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {s.string_type && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLES[s.string_type] || 'bg-gray-100 text-gray-600'}`}>
                {s.string_type}
              </span>
            )}
            {s.rating && <StarRating rating={s.rating} />}
          </div>
        )}

        {/* Notiz */}
        {s.note && (
          <p className="mt-2.5 text-sm text-gray-500 italic leading-relaxed border-t border-gray-50 pt-2.5">
            „{s.note}"
          </p>
        )}
      </div>
    </div>
  )
}

export default function LogbuchView({ user, profile, isAdmin, view, setView, onLogout }) {
  const [stringings, setStringings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(null)

  useEffect(() => {
    fetchStringings()
  }, [])

  const fetchStringings = async () => {
    const { data } = await supabase
      .from('stringings')
      .select('*')
      .eq('customer_id', user.id)
      .order('date', { ascending: false })

    if (data) {
      setStringings(data)
      if (data.length > 0) {
        setSelectedYear(new Date(data[0].date).getFullYear())
      }
    }
    setLoading(false)
  }

  const years = [...new Set(stringings.map(s => new Date(s.date).getFullYear()))].sort((a, b) => b - a)

  const filtered = selectedYear
    ? stringings.filter(s => new Date(s.date).getFullYear() === selectedYear)
    : stringings

  return (
    <div className="min-h-screen bg-[#fafaf7] pb-24">
      {/* Header */}
      <div className="bg-[#0f7c3a] text-white px-4 pt-14 pb-8">
        <div className="max-w-md mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Logbuch</h1>
            <p className="text-green-200 text-sm mt-0.5">
              {stringings.length} Bespannung{stringings.length !== 1 ? 'en' : ''} total
            </p>
          </div>
          <button onClick={onLogout} className="text-green-200 hover:text-white text-xs font-medium mt-1.5">
            Abmelden
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Jahr-Filter */}
        {years.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedYear(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                selectedYear === null
                  ? 'bg-[#0f7c3a] text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Alle
            </button>
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  selectedYear === y
                    ? 'bg-[#0f7c3a] text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {/* Jahres-Header bei Einzeljahr */}
        {selectedYear && years.length > 1 && (
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-1">
            {filtered.length} Bespannung{filtered.length !== 1 ? 'en' : ''} in {selectedYear}
          </p>
        )}

        {loading ? (
          <div className="mt-12 text-center">
            <div className="text-4xl animate-bounce">🎾</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 text-sm font-medium">
              {stringings.length === 0
                ? 'Noch keine Bespannungen vorhanden.'
                : 'Keine Einträge in diesem Jahr.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map(s => (
              <StringingCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>

      <BottomNav view={view} setView={setView} isAdmin={isAdmin} />
    </div>
  )
}
