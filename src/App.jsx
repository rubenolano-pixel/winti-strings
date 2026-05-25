import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoginView    from './views/LoginView'
import PendingView  from './views/PendingView'
import DashboardView from './views/DashboardView'
import LogbuchView  from './views/LogbuchView'
import AdminView    from './views/AdminView'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

const ADMIN_EMAIL = 'ruben.olano@hotmail.com'

export default function App() {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)   // customers-Zeile oder null
  const [loading, setLoading]   = useState(true)
  const [view,    setView]      = useState('dashboard')

  // Auth-State initialisieren + auf Änderungen hören
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) fetchProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    setLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .maybeSingle()          // null statt Error wenn kein Eintrag
    setProfile(data ?? null)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setView('dashboard')
  }

  // ── Guards ────────────────────────────────────────────────
  if (loading)   return <LoadingSpinner />
  if (!session)  return <LoginView />

  const isAdmin = session.user.email === ADMIN_EMAIL

  // Nicht-Admin ohne aktives Profil → Pending-Flow
  if (!isAdmin && (!profile || profile.status !== 'active')) {
    return (
      <PendingView
        user={session.user}
        profile={profile}
        onProfileCreated={() => fetchProfile(session.user.id)}
        onLogout={handleLogout}
      />
    )
  }

  // ── Props für alle Views ──────────────────────────────────
  const shared = {
    user: session.user,
    profile,
    isAdmin,
    view,
    setView,
    onLogout: handleLogout,
  }

  // ── State-basiertes Routing ───────────────────────────────
  if (view === 'logbuch') return <LogbuchView  {...shared} />
  if (view === 'admin')   return isAdmin ? <AdminView {...shared} /> : <DashboardView {...shared} />
  return <DashboardView {...shared} />
}
