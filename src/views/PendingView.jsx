import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PendingView({ user, profile, onProfileCreated, onLogout }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    club: '',
    racket_model: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('customers').insert({
      id: user.id,
      name: formData.name.trim(),
      email: user.email,
      phone: formData.phone.trim() || null,
      club: formData.club.trim() || null,
      racket_model: formData.racket_model.trim() || null,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
    } else {
      onProfileCreated?.()
    }
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await onProfileCreated?.()
    setRefreshing(false)
  }

  // Profil existiert aber wartet auf Freischaltung
  if (profile && profile.status === 'pending') {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0f7c3a] rounded-2xl mb-4">
              <span className="text-3xl">🎾</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Winti Strings</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-[#fff9e6] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⏳</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Anfrage ausstehend
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Hallo <strong>{profile.name}</strong>! Dein Account wird von Ruben geprüft.
              Du erhältst eine E-Mail, sobald du freigeschaltet bist.
            </p>

            <div className="bg-[#fafaf7] rounded-xl p-3 mb-5">
              <p className="text-xs text-gray-500">Registriert mit</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">📧 {user.email}</p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full py-2.5 border border-[#0f7c3a] text-[#0f7c3a] rounded-xl text-sm font-medium hover:bg-[#e8f5ee] transition-colors disabled:opacity-50"
            >
              {refreshing ? '↻ Prüfen…' : '↻ Status aktualisieren'}
            </button>
          </div>

          <button
            onClick={onLogout}
            className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </div>
    )
  }

  // Kein Profil – Registrierungsformular
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0f7c3a] rounded-2xl mb-4">
            <span className="text-3xl">🎾</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Winti Strings</h1>
          <p className="text-gray-500 text-sm mt-1">Willkommen! Füll dein Profil aus.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Registrierung</h2>
          <p className="text-gray-500 text-sm mb-5">
            Gib deine Daten ein um Zugang zu beantragen.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vollständiger Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vorname Nachname"
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+41 79 123 45 67"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tennisclub</label>
              <input
                type="text"
                value={formData.club}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                placeholder="TC Winterthur"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Schlägermodell</label>
              <input
                type="text"
                value={formData.racket_model}
                onChange={(e) => setFormData({ ...formData, racket_model: e.target.value })}
                placeholder="Wilson Pro Staff 97"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a] focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="w-full bg-[#0f7c3a] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0a5a29] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? '⏳ Speichern…' : 'Zugang beantragen'}
            </button>
          </form>
        </div>

        <button
          onClick={onLogout}
          className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
        >
          Abmelden
        </button>
      </div>
    </div>
  )
}
