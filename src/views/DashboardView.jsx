import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

// Verschleiss-Balken
function WearBar({ daysSince }) {
  const maxDays = 90
  const pct = Math.min(100, Math.round((daysSince / maxDays) * 100))

  const status = (() => {
    if (daysSince < 30) return { label: 'Gut', barColor: 'bg-[#0f7c3a]', badge: 'bg-[#e8f5ee] text-[#0f7c3a]' }
    if (daysSince < 60) return { label: 'OK', barColor: 'bg-[#f4c430]', badge: 'bg-[#fff9e6] text-amber-700' }
    if (daysSince < 90) return { label: 'Bald ersetzen', barColor: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700' }
    return { label: 'Überfällig', barColor: 'bg-red-500', badge: 'bg-red-50 text-red-700' }
  })()

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-500">Verschleiss</span>
        <span className="text-xs text-gray-400">{daysSince} Tage seit letzter Bespannung</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${status.barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.badge}`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

// Stat-Kachel
function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
      <div className="text-xl font-bold text-[#0f7c3a] truncate">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</div>
    </div>
  )
}

export default function DashboardView({ user, profile, isAdmin, view, setView, onLogout }) {
  const [lastStringing, setLastStringing] = useState(null)
  const [stats, setStats] = useState({ total: 0, favoriteString: null, avgTension: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Letzte Bespannung (immer nach eigenem user.id, auch für Admin)
    const { data: last } = await supabase
      .from('stringings')
      .select('*')
      .eq('customer_id', user.id)
      .order('date', { ascending: false })
      .limit(1)

    if (last?.length > 0) setLastStringing(last[0])

    // Stats
    const { data: all } = await supabase
      .from('stringings')
      .select('string_name, tension_main')
      .eq('customer_id', user.id)

    if (all) {
      const total = all.length
      const stringCounts = {}
      all.forEach(s => { stringCounts[s.string_name] = (stringCounts[s.string_name] || 0) + 1 })
      const favoriteString = Object.entries(stringCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

      const tensioned = all.filter(s => s.tension_main)
      const avgTension = tensioned.length
        ? (tensioned.reduce((s, r) => s + parseFloat(r.tension_main), 0) / tensioned.length).toFixed(1)
        : null

      setStats({ total, favoriteString, avgTension })
    }

    setLoading(false)
  }

  const daysSince = (() => {
    if (!lastStringing?.date) return null
    const diff = new Date() - new Date(lastStringing.date)
    return Math.max(0, Math.floor(diff / 86400000))
  })()

  const recommendation = (() => {
    if (daysSince === null) return null
    if (daysSince < 30) return { text: 'Deine Saiten sind noch in Top-Zustand! Keep playing. 💪', color: 'bg-[#e8f5ee] text-[#0a5a29]' }
    if (daysSince < 60) return { text: 'Die Saiten spielen noch gut – halte sie im Blick.', color: 'bg-[#fff9e6] text-amber-800' }
    if (daysSince < 90) return { text: 'Es wäre bald Zeit für eine neue Bespannung. 🎾', color: 'bg-orange-50 text-orange-800' }
    return { text: 'Die Saiten sind überfällig! Kontaktiere Ruben für einen Termin. 📞', color: 'bg-red-50 text-red-800' }
  })()

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })

  const firstName = profile?.name?.split(' ')[0] || (isAdmin ? 'Ruben' : 'Tennis-Fan')

  return (
    <div className="min-h-screen bg-[#fafaf7] pb-24">
      {/* Header */}
      <div className="bg-[#0f7c3a] text-white px-4 pt-14 pb-8">
        <div className="max-w-md mx-auto flex justify-between items-start">
          <div>
            <p className="text-green-200 text-sm mb-0.5">Hallo,</p>
            <h1 className="text-2xl font-bold">{firstName} 👋</h1>
          </div>
          <button
            onClick={onLogout}
            className="text-green-200 hover:text-white text-xs font-medium mt-1.5 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 -mt-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-3xl animate-bounce">🎾</div>
          </div>
        ) : lastStringing ? (
          <>
            {/* Aktuelle Bespannung */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Aktuelle Bespannung
              </p>

              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0 mr-3">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{lastStringing.string_name}</h2>
                  {lastStringing.string_type && (
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-[#e8f5ee] text-[#0f7c3a] text-xs font-semibold rounded-full">
                      {lastStringing.string_type}
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-extrabold text-[#0f7c3a] leading-none">
                    {lastStringing.tension_main}
                    {lastStringing.tension_cross &&
                      parseFloat(lastStringing.tension_cross) !== parseFloat(lastStringing.tension_main) &&
                      `/${lastStringing.tension_cross}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">kg</div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                📅 Bespannt am {formatDate(lastStringing.date)}
              </p>

              {daysSince !== null && <WearBar daysSince={daysSince} />}

              {lastStringing.note && (
                <p className="mt-3 text-sm text-gray-500 italic border-t border-gray-50 pt-3">
                  „{lastStringing.note}"
                </p>
              )}
            </div>

            {/* Empfehlung */}
            {recommendation && (
              <div className={`rounded-2xl p-4 ${recommendation.color}`}>
                <p className="text-sm font-medium leading-relaxed">{recommendation.text}</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-3">🎾</div>
            <p className="text-gray-500 text-sm font-medium">Noch keine Bespannungen erfasst</p>
            <p className="text-gray-400 text-xs mt-1">
              {isAdmin ? 'Erfasse die erste Bespannung im Admin-Bereich.' : 'Ruben wird deine Bespannungen hier eintragen.'}
            </p>
          </div>
        )}

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={stats.total} label="Bespannungen" />
            <StatCard value={stats.avgTension ? `${stats.avgTension}` : '–'} label="Ø Spannung kg" />
            <StatCard
              value={stats.favoriteString ? stats.favoriteString.split(' ')[0] : '–'}
              label="Top-Saite"
            />
          </div>
        )}

        {/* Admin-Shortcut */}
        {isAdmin && (
          <button
            onClick={() => setView('admin')}
            className="w-full bg-[#f4c430] text-gray-900 font-bold py-3.5 rounded-2xl text-sm hover:bg-yellow-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>⚙️</span> Admin-Bereich öffnen
          </button>
        )}
      </div>

      <BottomNav view={view} setView={setView} isAdmin={isAdmin} />
    </div>
  )
}
