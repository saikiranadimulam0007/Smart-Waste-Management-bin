import React from 'react'
import { useApp } from './store/AppContext'
import { LoginPage } from './pages/LoginPage'
import { UserDashboard } from './pages/UserDashboard'
import { OfficerDashboard } from './pages/OfficerDashboard'
import { DriverDashboard } from './pages/DriverDashboard'
import { ToastContainer } from './components/ToastContainer'
import {
  RotateCw,
  Sparkles,
  Trash2,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Truck,
  AlertCircle
} from 'lucide-react'

function Header() {
  const { state, logout, refreshData, dispatch } = useApp()
  const user = state.currentUser

  const roleColors: Record<string, string> = {
    officer: 'bg-blue-600',
    user: 'bg-emerald-600',
    driver: 'bg-indigo-600',
  }

  const roleLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    officer: { label: 'Officer', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    user: { label: 'Resident', icon: <UserIcon className="w-3.5 h-3.5" /> },
    driver: { label: 'Driver', icon: <Truck className="w-3.5 h-3.5" /> },
  }

  const roleInfo = user ? roleLabels[user.role] : null

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/60 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight tracking-tight">
              Smart Waste Management Dashboard
            </h1>
            <p className="text-xs text-slate-300 hidden sm:block">
              Live monitoring of IoT smart bins
              <span className="ml-2 text-amber-400 font-semibold">[Front-End Simulation]</span>
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role badge */}
            <span className={`text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm ${roleColors[user.role] || 'bg-slate-700'}`}>
              {roleInfo?.icon}
              <span>{roleInfo?.label || user.role}</span>
            </span>

            {/* User name */}
            <span className="text-sm font-medium text-slate-200 hidden md:block">
              {user.name}
            </span>

            {/* Refresh button */}
            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-medium rounded-lg transition-colors"
              title="Simulate telemetry ping from sensor network"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Refresh Telemetry</span>
            </button>

            {/* AI Route button - Officer only */}
            {user.role === 'officer' && (
              <button
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('generate-route'))
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Generate AI Route</span>
              </button>
            )}

            {/* Reset Demo */}
            <button
              onClick={() => {
                if (confirm('Reset all demo data to default baseline?')) {
                  dispatch({ type: 'RESET_DEMO' })
                }
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-medium rounded-lg transition-colors"
              title="Reset state to default baseline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-medium rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function SimulationBanner() {
  return (
    <div className="bg-amber-950/80 backdrop-blur-md border-b border-amber-600/40 px-4 py-2 text-center relative z-20">
      <div className="flex items-center justify-center gap-2 text-amber-200 text-xs">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          <strong>Simulation Environment:</strong> All CNN classifications, IoT sensor feeds, route optimizations, and real-time dispatches are simulated client-side. Data persists in localStorage.
        </span>
      </div>
    </div>
  )
}

function App() {
  const { state } = useApp()
  const user = state.currentUser

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden">
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/dashboard-bg.jpg')` }}
      />
      {/* Semi-transparent dark overlay for readability */}
      <div className="fixed inset-0 z-0 bg-slate-950/60 backdrop-blur-[2px]" />

      {!user ? (
        <div className="relative z-10 flex-1 flex flex-col">
          <LoginPage />
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col">
          <Header />
          <SimulationBanner />
          <main className="flex-1 flex flex-col">
            {user.role === 'user' && <UserDashboard />}
            {user.role === 'officer' && <OfficerDashboard />}
            {user.role === 'driver' && <DriverDashboard />}
          </main>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

export default App
