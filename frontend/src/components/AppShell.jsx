import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: '◫' },
  { to: '/topics', label: 'Topics', icon: '◌' },
  { to: '/problems', label: 'Problems', icon: '⌁' },
  { to: '/profile', label: 'Profile', icon: '◉' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

function Navigation({ onNavigate }) {
  const { endSession } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await endSession()
    onNavigate?.()
    navigate('/login')
  }

  return (
    <nav className="flex h-full flex-col">
      <NavLink to="/dashboard" onClick={onNavigate} className="mb-9 flex items-center gap-3 px-2 text-slate-950">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-200">P</span>
        <span className="text-base font-bold tracking-tight">PrepPilot <span className="text-violet-600">AI</span></span>
      </NavLink>
      <div className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <span className="w-4 text-center text-base">{item.icon}</span>{item.label}
          </NavLink>
        ))}
      </div>
      <button type="button" onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
        <span className="w-4 text-center">↪</span>Logout
      </button>
    </nav>
  )
}

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <Navigation />
      </aside>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Open navigation">☰</button>
        <NavLink to="/dashboard" className="text-sm font-bold tracking-tight text-slate-900">PrepPilot <span className="text-violet-600">AI</span></NavLink>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onMouseDown={() => setMenuOpen(false)}>
          <aside className="h-full w-72 bg-white p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <Navigation onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-7 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  )
}
