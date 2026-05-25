import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginView() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center p-4">
      {/* Hintergrund-Dekoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#0f7c3a] opacity-5" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#f4c430] opacity-10" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0f7c3a] rounded-3xl shadow-lg mb-4">
            <span className="text-4xl">🎾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Winti Strings</h1>
          <p className="text-gray-500 text-sm mt-1">Tennis Besaitungs-Service Winterthur</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {sent ? (
            <div className="text-center py-2">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Link unterwegs!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Check dein Postfach für{' '}
                <span className="font-medium text-gray-700">{email}</span>
                {' '}und klick den Link um dich anzumelden.
              </p>
              <div className="mt-5 p-3 bg-[#e8f5ee] rounded-xl">
                <p className="text-xs text-[#0a5a29]">
                  💡 Kein Mail? Schau im Spam-Ordner oder warte 1–2 Minuten.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-5 text-sm text-[#0f7c3a] font-medium hover:underline"
              >
                Andere E-Mail verwenden
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Anmelden</h2>
              <p className="text-gray-500 text-sm mb-5">
                Gib deine E-Mail ein – du erhältst einen Magic Link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.ch"
                    required
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a] focus:border-transparent transition-shadow"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#0f7c3a] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0a5a29] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Senden…
                    </span>
                  ) : (
                    'Magic Link senden ✉️'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Nur für Kunden von Winti Strings · Winterthur
        </p>
      </div>
    </div>
  )
}
