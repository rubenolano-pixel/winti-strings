import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

const STRING_TYPES = ['Polyester', 'Monofilament', 'Multifilament', 'Natural Gut', 'Synthetic Gut', 'Hybrid']

const STATUS_BADGE = {
  pending:  'bg-[#fff9e6] text-amber-700',
  active:   'bg-[#e8f5ee] text-[#0f7c3a]',
  inactive: 'bg-gray-100 text-gray-500',
}
const STATUS_LABEL = { pending: 'Ausstehend', active: 'Aktiv', inactive: 'Inaktiv' }

// ── Kundenkarte ───────────────────────────────────────────
function CustomerCard({ customer, onApprove, onDeactivate }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{customer.name}</h3>
          <p className="text-sm text-gray-500 truncate">{customer.email}</p>
        </div>
        <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[customer.status]}`}>
          {STATUS_LABEL[customer.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
        {customer.club       && <span>🏟 {customer.club}</span>}
        {customer.racket_model && <span>🎾 {customer.racket_model}</span>}
        {customer.phone      && <span>📞 {customer.phone}</span>}
        <span className="text-gray-400">
          {new Date(customer.created_at).toLocaleDateString('de-CH')}
        </span>
      </div>

      {customer.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(customer.id)}
            className="flex-1 bg-[#0f7c3a] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a5a29] active:scale-[0.98] transition-all"
          >
            ✓ Freischalten
          </button>
          <button
            onClick={() => onDeactivate(customer.id)}
            className="w-12 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            ✗
          </button>
        </div>
      )}

      {customer.status === 'active' && (
        <button
          onClick={() => onDeactivate(customer.id)}
          className="text-xs text-gray-300 hover:text-red-400 transition-colors"
        >
          Deaktivieren
        </button>
      )}

      {customer.status === 'inactive' && (
        <button
          onClick={() => onApprove(customer.id)}
          className="text-xs text-[#0f7c3a] hover:underline transition-colors"
        >
          Wieder aktivieren
        </button>
      )}
    </div>
  )
}

// ── Neue Bespannung Formular ──────────────────────────────
function NewStringingForm({ customers }) {
  const emptyForm = {
    customer_id: '', date: new Date().toISOString().split('T')[0],
    string_name: '', tension_main: '', tension_cross: '',
    string_type: '', note: '', rating: 0,
  }
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error } = await supabase.from('stringings').insert({
      customer_id:  form.customer_id,
      date:         form.date,
      string_name:  form.string_name.trim(),
      tension_main: form.tension_main  ? parseFloat(form.tension_main)  : null,
      tension_cross: form.tension_cross ? parseFloat(form.tension_cross) : null,
      string_type:  form.string_type || null,
      note:         form.note.trim() || null,
      rating:       form.rating > 0 ? form.rating : null,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setForm(emptyForm)
      setTimeout(() => setSuccess(false), 4000)
    }
    setLoading(false)
  }

  const activeCustomers = customers.filter(c => c.status === 'active')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-[#e8f5ee] text-[#0a5a29] rounded-xl p-3.5 text-sm font-semibold flex items-center gap-2">
          <span>✅</span> Bespannung erfolgreich gespeichert!
        </div>
      )}

      {/* Kunde */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kunde <span className="text-red-400">*</span></label>
        <select
          value={form.customer_id}
          onChange={e => set('customer_id', e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7c3a]"
        >
          <option value="">Kunde wählen…</option>
          {activeCustomers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {activeCustomers.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">⚠️ Noch keine aktiven Kunden vorhanden.</p>
        )}
      </div>

      {/* Datum */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Datum <span className="text-red-400">*</span></label>
        <input
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a]"
        />
      </div>

      {/* Saite */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Saite <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={form.string_name}
          onChange={e => set('string_name', e.target.value)}
          placeholder="z.B. Luxilon ALU Power 1.25"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a]"
        />
      </div>

      {/* Spannungen */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Haupt (kg)</label>
          <input
            type="number" step="0.5" min="10" max="40"
            value={form.tension_main}
            onChange={e => set('tension_main', e.target.value)}
            placeholder="25"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kreuz (kg)</label>
          <input
            type="number" step="0.5" min="10" max="40"
            value={form.tension_cross}
            onChange={e => set('tension_cross', e.target.value)}
            placeholder="24"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a]"
          />
        </div>
      </div>

      {/* Typ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Saitentyp</label>
        <select
          value={form.string_type}
          onChange={e => set('string_type', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7c3a]"
        >
          <option value="">Typ wählen…</option>
          {STRING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Bewertung */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bewertung</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star} type="button"
              onClick={() => set('rating', form.rating === star ? 0 : star)}
              className={`text-3xl transition-all hover:scale-110 active:scale-95 ${
                form.rating >= star ? 'text-[#f4c430]' : 'text-gray-200 hover:text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
          {form.rating > 0 && (
            <button
              type="button" onClick={() => set('rating', 0)}
              className="text-xs text-gray-400 hover:text-gray-600 ml-1 self-center"
            >
              zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Notiz */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notiz</label>
        <textarea
          value={form.note}
          onChange={e => set('note', e.target.value)}
          placeholder="Bemerkungen zur Bespannung, Besonderheiten…"
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7c3a] resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !form.customer_id || !form.string_name.trim()}
        className="w-full bg-[#0f7c3a] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-[#0a5a29] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? '⏳ Speichern…' : '🎾 Bespannung speichern'}
      </button>
    </form>
  )
}

// ── Admin-Hauptview ───────────────────────────────────────
export default function AdminView({ user, profile, isAdmin, view, setView, onLogout }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('kunden')

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCustomers(data)
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('customers').update({ status }).eq('id', id)
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const pending  = customers.filter(c => c.status === 'pending')
  const active   = customers.filter(c => c.status === 'active')

  const TABS = [
    { id: 'kunden',    label: 'Kunden',          badge: active.length > 0 ? active.length : null },
    { id: 'ausstehend', label: 'Ausstehend',      badge: pending.length > 0 ? pending.length : null, alert: pending.length > 0 },
    { id: 'neu',       label: 'Bespannung +',     badge: null },
  ]

  return (
    <div className="min-h-screen bg-[#fafaf7] pb-24">
      {/* Header */}
      <div className="bg-[#0f7c3a] text-white px-4 pt-14 pb-8">
        <div className="max-w-md mx-auto flex justify-between items-start">
          <div>
            <p className="text-green-200 text-sm mb-0.5">Admin-Bereich</p>
            <h1 className="text-2xl font-bold">Winti Strings ⚙️</h1>
          </div>
          <button onClick={onLogout} className="text-green-200 hover:text-white text-xs font-medium mt-1.5">
            Abmelden
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Tab-Bar */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                tab === t.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.badge !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  t.alert ? 'bg-[#f4c430] text-gray-900' : 'bg-[#0f7c3a] text-white'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inhalte */}
        <div className="pb-4">
          {loading ? (
            <div className="py-16 text-center"><div className="text-4xl animate-bounce">🎾</div></div>
          ) : tab === 'kunden' ? (
            customers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500 text-sm">Noch keine Kunden registriert.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customers.map(c => (
                  <CustomerCard
                    key={c.id} customer={c}
                    onApprove={id => updateStatus(id, 'active')}
                    onDeactivate={id => updateStatus(id, 'inactive')}
                  />
                ))}
              </div>
            )
          ) : tab === 'ausstehend' ? (
            pending.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-500 text-sm font-medium">Keine ausstehenden Anfragen</p>
                <p className="text-gray-400 text-xs mt-1">Alle Kunden sind bearbeitet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(c => (
                  <CustomerCard
                    key={c.id} customer={c}
                    onApprove={id => updateStatus(id, 'active')}
                    onDeactivate={id => updateStatus(id, 'inactive')}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Neue Bespannung erfassen</h2>
              <NewStringingForm customers={customers} />
            </div>
          )}
        </div>
      </div>

      <BottomNav view={view} setView={setView} isAdmin={isAdmin} />
    </div>
  )
}
