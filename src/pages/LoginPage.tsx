import React, { useState } from 'react'
import { useApp } from '../store/AppContext'
import type { User } from '../types'
import { generateId } from '../lib/utils'
import { ShieldCheck, UserCheck, Truck, Clock, Sparkles, Check, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const { login, state, dispatch, addToast } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  // Registration form
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const ok = login(email, password)
      if (!ok) {
        setError('Invalid credentials. Check the demo accounts below.')
      }
      setLoading(false)
    }, 600)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword || !regPhone || !regAddress) {
      setError('All fields are required.')
      return
    }
    const exists = state.users.find(u => u.email === regEmail)
    if (exists) { setError('Email already registered.'); return }
    const newUser: User = {
      id: 'USR-' + generateId(),
      role: 'user',
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      address: regAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'REGISTER_USER', payload: newUser })
    // Notify officer
    dispatch({
      type: 'ADD_NOTIFICATION', payload: {
        id: 'NOT-' + generateId(), userId: 'USR-001',
        title: 'New User Registration',
        message: `${regName} has registered and is awaiting approval.`,
        type: 'info', read: false, createdAt: new Date().toISOString()
      }
    })
    addToast('Registration Submitted', 'Your application is pending officer approval.', 'success')
    setIsRegister(false)
    setRegName(''); setRegPhone(''); setRegAddress(''); setRegEmail(''); setRegPassword('')
  }

  const demoAccounts = [
    { role: 'Municipal Officer', email: 'officer@waste.gov', password: 'officer123', icon: <ShieldCheck className="w-4 h-4 text-blue-600" /> },
    { role: 'Resident User', email: 'user@demo.com', password: 'user123', icon: <UserCheck className="w-4 h-4 text-emerald-600" /> },
    { role: 'Driver 1', email: 'driver1@waste.gov', password: 'driver123', icon: <Truck className="w-4 h-4 text-amber-600" /> },
    { role: 'Driver 2', email: 'driver2@waste.gov', password: 'driver456', icon: <Truck className="w-4 h-4 text-amber-600" /> },
    { role: 'Pending User', email: 'pending@demo.com', password: 'pending123', icon: <Clock className="w-4 h-4 text-slate-500" /> },
  ]

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden">
      {/* Background with user uploaded theme */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/dashboard-bg.jpg')` }}
      />
      <div className="fixed inset-0 z-0 bg-slate-950/65 backdrop-blur-[2px]" />

      {/* Top Header */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/60 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Smart Waste Management Dashboard</h1>
              <p className="text-xs text-slate-300">Live monitoring of IoT smart bins &bull; Front-End Simulation</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IoT Systems Active</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8">
          {/* Login / Register form */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {isRegister ? 'Register New User' : 'Sign In'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {isRegister ? 'Submit a registration request. Officer will review and approve.' : 'Select a demo credential below or enter your login details.'}
              </p>
            </div>

            {!isRegister ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="officer@waste.gov"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
                {error && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-md"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                {[
                  { label: 'Full Name', value: regName, set: setRegName, placeholder: 'e.g. Ravi Kumar', type: 'text' },
                  { label: 'Email', value: regEmail, set: setRegEmail, placeholder: 'ravi@email.com', type: 'email' },
                  { label: 'Password', value: regPassword, set: setRegPassword, placeholder: '••••••••', type: 'password' },
                  { label: 'Phone Number', value: regPhone, set: setRegPhone, placeholder: '9876543210', type: 'tel' },
                  { label: 'Address', value: regAddress, set: setRegAddress, placeholder: '14, Gandhi Nagar, Ward 5', type: 'text' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                    <input
                      type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div className="flex gap-2 items-center text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <span className="font-semibold text-slate-700">Identity Verification:</span>
                  <span>Document check (simulated proof-of-residence upload)</span>
                </div>
                {error && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm shadow-md">
                  Submit Registration
                </button>
              </form>
            )}

            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="mt-4 text-sm text-emerald-700 hover:text-emerald-800 font-semibold w-full text-center hover:underline"
            >
              {isRegister ? 'Back to Sign In' : 'Register as new user'}
            </button>
          </div>

          {/* Demo Accounts Panel */}
          <div className="space-y-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
              <h3 className="font-bold text-slate-900 mb-1 text-base">Demo Credentials</h3>
              <p className="text-xs text-slate-500 mb-4">Click any account to auto-fill credentials instantly</p>
              <div className="space-y-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => { setEmail(acc.email); setPassword(acc.password); setIsRegister(false) }}
                    className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/70 transition-all group bg-white/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {acc.icon}
                        <span className="font-semibold text-sm text-slate-800">{acc.role}</span>
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-emerald-600 font-medium flex items-center gap-1">
                        Use <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono ml-6">{acc.email} / {acc.password}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature highlights */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-white rounded-2xl p-6 shadow-2xl">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Ecosystem Features</span>
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  'AI CNN Wet and Dry Segregation Simulator',
                  'IoT Bin Fill Level & Load Cell Telemetry',
                  'Simulated City Vector Map with Turn Directions',
                  'Synchronized Cross-Role Communication Matrix',
                  'Officer Real-Time Analytics (Donut, Bar, Line)',
                  'AI Dynamic Route Generation & Driver Dispatch',
                  'Citizen Complaints & Life Cycle Tracking',
                  'Multi-Role Instant Notification System',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-slate-300 text-xs sm:text-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
