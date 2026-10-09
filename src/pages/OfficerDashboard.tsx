import React, { useState } from 'react'
import { useApp } from '../store/AppContext'
import { BinCard } from '../components/BinCard'
import { DummyMap } from '../components/DummyMap'
import { generateId, formatDate } from '../lib/utils'
import type { CollectionRoute, RoutePoint } from '../types'
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from 'recharts'
import {
  LayoutDashboard,
  Trash2,
  AlertTriangle,
  FileText,
  Users,
  Navigation,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

export function OfficerDashboard() {
  const { state, dispatch, addToast } = useApp()
  const [tab, setTab] = useState<'dashboard' | 'bins' | 'alerts' | 'complaints' | 'users' | 'routes'>('dashboard')
  const [generating, setGenerating] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<CollectionRoute | null>(null)
  const [assignDriverId, setAssignDriverId] = useState('')
  const [routeNote, setRouteNote] = useState('')
  const [complaintNote, setComplaintNote] = useState<Record<string, string>>({})
  const [approveModal, setApproveModal] = useState<string | null>(null)
  const [assignBinId, setAssignBinId] = useState('')

  // Summary stats
  const totalBins = state.bins.length
  const overflowing = state.bins.filter(b => b.fillLevel >= 90).length
  const nearlyFull = state.bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 90).length
  const medium = state.bins.filter(b => b.fillLevel >= 40 && b.fillLevel < 70).length
  const low = state.bins.filter(b => b.fillLevel < 40).length
  const pendingUsers = state.users.filter(u => u.status === 'pending').length
  const openComplaints = state.complaints.filter(c => c.status !== 'resolved').length

  // Chart data
  const donutData = [
    { name: 'Low', value: low, color: '#22c55e' },
    { name: 'Medium', value: medium, color: '#eab308' },
    { name: 'Nearly Full', value: nearlyFull, color: '#f97316' },
    { name: 'Overflowing', value: overflowing, color: '#ef4444' },
  ]

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
  const barData = zones.map(zone => {
    const zoneBins = state.bins.filter(b => b.zone === zone)
    const avg = zoneBins.length ? zoneBins.reduce((s, b) => s + b.fillLevel, 0) / zoneBins.length : 0
    return { zone, fillLevel: Math.round(avg) }
  })

  const lineData = [
    { day: 'Mon', collected: 14 }, { day: 'Tue', collected: 18 },
    { day: 'Wed', collected: 12 }, { day: 'Thu', collected: 22 },
    { day: 'Fri', collected: 19 }, { day: 'Sat', collected: 25 },
    { day: 'Sun', collected: 16 },
  ]

  // Generate AI route
  const generateRoute = () => {
    const urgentBins = state.bins
      .filter(b => b.fillLevel >= 70)
      .sort((a, b) => b.fillLevel - a.fillLevel)
      .slice(0, 4)

    if (urgentBins.length === 0) {
      addToast('No Urgent Bins', 'All bins are currently within normal capacity limits.', 'info')
      return
    }

    setGenerating(true)
    addToast('AI Route Optimization', 'Calculating shortest path based on bin capacity & telemetry...', 'info')

    setTimeout(() => {
      const routePoints: RoutePoint[] = [
        { x: 60, y: 440, label: 'Depot', type: 'depot' },
        ...urgentBins.map(b => ({
          x: b.latitude,
          y: b.longitude,
          label: b.id,
          type: 'bin' as const,
          binId: b.id
        }))
      ]

      const directions = [
        'Start from Municipal Depot (Depot A)',
        ...urgentBins.map((b, i) => `Step ${i + 1}: Collect from ${b.id} (${b.location}) — ${b.fillLevel.toFixed(0)}% full`),
        'Return to Depot via optimal perimeter highway',
      ]

      const newRoute: CollectionRoute = {
        id: 'RTE-' + generateId(),
        officerId: state.currentUser!.id,
        binIds: urgentBins.map(b => b.id),
        routePoints,
        status: 'pending',
        priority: overflowing > 0 ? 'high' : 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        directions,
      }

      dispatch({ type: 'ADD_ROUTE', payload: newRoute })
      setSelectedRoute(newRoute)
      setGenerating(false)
      setTab('routes')
      addToast('Route Generated', `Optimized collection itinerary created for ${urgentBins.length} urgent bins.`, 'success')
    }, 2500)
  }

  React.useEffect(() => {
    const handler = () => generateRoute()
    document.addEventListener('generate-route', handler)
    return () => document.removeEventListener('generate-route', handler)
  }, [state.bins, state.currentUser])

  // Assign driver
  const assignDriver = (routeId: string) => {
    if (!assignDriverId) { addToast('Select Driver', 'Please select a driver from the list.', 'error'); return }
    dispatch({ type: 'UPDATE_ROUTE', id: routeId, status: 'accepted', driverId: assignDriverId })
    const driver = state.users.find(u => u.id === assignDriverId)
    const route = state.routes.find(r => r.id === routeId)
    if (driver && route) {
      dispatch({
        type: 'ADD_NOTIFICATION', payload: {
          id: 'NOT-' + generateId(), userId: assignDriverId,
          title: 'New Collection Assignment',
          message: `You have been dispatched for Route ${routeId}. Target Bins: ${route.binIds.join(', ')}. Priority: ${route.priority?.toUpperCase()}.`,
          type: 'warning', read: false, createdAt: new Date().toISOString()
        }
      })
    }
    if (routeNote) {
      dispatch({ type: 'UPDATE_ROUTE', id: routeId, status: 'accepted', driverId: assignDriverId })
    }
    addToast('Driver Assigned', `${driver?.name || 'Driver'} dispatched to Route ${routeId}.`, 'success')
    setAssignDriverId('')
    setRouteNote('')
    setSelectedRoute(null)
  }

  const drivers = state.users.filter(u => u.role === 'driver')

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
      accepted: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      under_review: 'bg-amber-100 text-amber-700 border-amber-200',
      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${map[s] || 'bg-slate-100 text-slate-600'}`}>{s.replace('_', ' ')}</span>
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Municipal Operations Command</h2>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">IoT Bin Telemetry & Automated Fleet Logistics</p>
          </div>
          <button
            onClick={generateRoute}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm"
          >
            {generating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-200" />
            )}
            <span>{generating ? 'Calculating Route...' : 'Generate AI Route'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20 w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'bins', label: 'Bins', icon: Trash2 },
            { id: 'alerts', label: `Alerts ${state.alerts.filter(a => !a.acknowledged).length > 0 ? `(${state.alerts.filter(a => !a.acknowledged).length})` : ''}`, icon: AlertTriangle },
            { id: 'complaints', label: `Complaints ${openComplaints > 0 ? `(${openComplaints})` : ''}`, icon: FileText },
            { id: 'users', label: `Users ${pendingUsers > 0 ? `(${pendingUsers})` : ''}`, icon: Users },
            { id: 'routes', label: 'Routes', icon: Navigation },
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-white text-indigo-800 shadow-md'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Bins', value: totalBins, color: 'border-blue-200 bg-white/95 text-blue-700' },
                { label: 'Overflowing', value: overflowing, color: 'border-rose-300 bg-rose-50/90 text-rose-700' },
                { label: 'Nearly Full', value: nearlyFull, color: 'border-amber-300 bg-amber-50/90 text-amber-700' },
                { label: 'Medium', value: medium, color: 'border-yellow-200 bg-yellow-50/90 text-yellow-700' },
                { label: 'Low', value: low, color: 'border-emerald-200 bg-emerald-50/90 text-emerald-700' },
                { label: 'Pending Users', value: pendingUsers, color: 'border-purple-200 bg-purple-50/90 text-purple-700' },
                { label: 'Open Complaints', value: openComplaints, color: 'border-pink-200 bg-pink-50/90 text-pink-700' },
                { label: 'Active Routes', value: state.routes.filter(r => r.status !== 'completed').length, color: 'border-indigo-200 bg-indigo-50/90 text-indigo-700' },
              ].map(card => (
                <div key={card.label} className={`border rounded-2xl p-4.5 backdrop-blur-md shadow-md ${card.color}`}>
                  <div className="text-2xl font-black text-slate-900">{card.value}</div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Donut */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-4.5 shadow-xl">
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Bin Status Distribution</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" labelLine={false} fontSize={10}>
                      {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {donutData.map(d => (
                    <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span>{d.name} ({d.value})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Bar chart */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-4.5 shadow-xl">
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Zone Average Fill Levels</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Fill Level']} />
                    <Bar dataKey="fillLevel" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line chart */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-4.5 shadow-xl">
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Weekly Collection Volume</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={lineData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Map overview */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-xl space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-600" />
                <span>Geographic Bin Monitoring Overview</span>
              </h4>
              <DummyMap bins={state.bins} showDepot height={300} />
            </div>
          </div>
        )}

        {/* BINS TAB */}
        {tab === 'bins' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Connected IoT Bins ({state.bins.length})</h3>
              <p className="text-xs text-slate-500">Ranked by capacity urgency</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...state.bins].sort((a, b) => b.fillLevel - a.fillLevel).map(bin => (
                <BinCard key={bin.id} bin={bin} />
              ))}
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {tab === 'alerts' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Real-Time Sensor Alerts</span>
            </h3>
            {state.alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p>All bin capacities in nominal state</p>
              </div>
            ) : (
              state.alerts.map(alert => (
                <div key={alert.id} className={`rounded-xl border p-4.5 transition-all ${
                  alert.acknowledged
                    ? 'border-slate-200 bg-slate-50/80 opacity-70'
                    : alert.type === 'overflowing'
                    ? 'border-rose-300 bg-rose-50/90'
                    : 'border-amber-300 bg-amber-50/90'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {alert.type === 'overflowing' ? (
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatDate(alert.createdAt)} &bull; Unit: {alert.binId}</p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => dispatch({ type: 'ACK_ALERT', id: alert.id })}
                        className="text-xs bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-semibold text-slate-700 shadow-sm"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {tab === 'complaints' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Resident Grievance Queue ({state.complaints.length})</h3>
            {state.complaints.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p>No grievances filed</p>
              </div>
            ) : (
              state.complaints.map(c => {
                const user = state.users.find(u => u.id === c.userId)
                return (
                  <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm space-y-2.5">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{c.title}</p>
                        <p className="text-xs text-slate-500">Citizen: {user?.name || c.userId} &bull; {formatDate(c.createdAt)} &bull; Bin: {c.binId}</p>
                      </div>
                      {statusBadge(c.status)}
                    </div>
                    <p className="text-sm text-slate-700">{c.description}</p>
                    {c.status !== 'resolved' && (
                      <div className="flex gap-2 flex-wrap pt-1">
                        <input
                          value={complaintNote[c.id] || ''}
                          onChange={e => setComplaintNote(p => ({ ...p, [c.id]: e.target.value }))}
                          placeholder="Add resolution instructions..."
                          className="flex-1 min-w-[200px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button onClick={() => { dispatch({ type: 'UPDATE_COMPLAINT', id: c.id, status: 'under_review', officerNote: complaintNote[c.id] }); addToast('Updated', 'Grievance marked Under Review.', 'info') }}
                          className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-semibold">Under Review</button>
                        <button onClick={() => { dispatch({ type: 'UPDATE_COMPLAINT', id: c.id, status: 'resolved', officerNote: complaintNote[c.id] }); addToast('Resolved', 'Grievance successfully resolved.', 'success') }}
                          className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-3 py-1.5 rounded-lg font-semibold">Resolve</button>
                      </div>
                    )}
                    {c.officerNote && <p className="text-xs text-indigo-900 bg-indigo-50/80 rounded-lg p-2 border border-indigo-200"><strong>Resolution Note:</strong> {c.officerNote}</p>}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Resident Verification & Bin Assignment</h3>
            {state.users.filter(u => u.role === 'user').map(u => (
              <div key={u.id} className={`bg-white rounded-xl border p-4.5 shadow-sm ${u.status === 'pending' ? 'border-amber-300 bg-amber-50/40' : u.status === 'rejected' ? 'border-rose-300' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{u.name}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${u.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300' : u.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>{u.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{u.email} &bull; {u.phone}</p>
                    <p className="text-xs text-slate-500">{u.address}</p>
                    {u.assignedBinId && <p className="text-xs text-emerald-700 mt-1 font-semibold">Assigned Unit: {u.assignedBinId}</p>}
                  </div>
                  {u.status === 'pending' && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <select
                        value={approveModal === u.id ? assignBinId : ''}
                        onChange={e => { setApproveModal(u.id); setAssignBinId(e.target.value) }}
                        className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Bin to Bind</option>
                        {state.bins.filter(b => !b.assignedUserId).map(b => (
                          <option key={b.id} value={b.id}>{b.id} – {b.location}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          dispatch({ type: 'APPROVE_USER', userId: u.id, binId: assignBinId || undefined })
                          dispatch({ type: 'ADD_NOTIFICATION', payload: { id: 'NOT-' + generateId(), userId: u.id, title: 'Registration Approved', message: `Welcome! Your account has been verified.${assignBinId ? ` Connected to Bin ${assignBinId}.` : ''}`, type: 'success', read: false, createdAt: new Date().toISOString() } })
                          addToast('User Approved', `${u.name} approved.`, 'success')
                          setApproveModal(null); setAssignBinId('')
                        }}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold shadow-sm"
                      >Approve</button>
                      <button
                        onClick={() => { dispatch({ type: 'REJECT_USER', userId: u.id }); addToast('User Rejected', `${u.name} rejected.`, 'error') }}
                        className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1.5 rounded-lg font-medium"
                      >Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ROUTES TAB */}
        {tab === 'routes' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Fleet Route Itineraries</h3>
              <button onClick={generateRoute} disabled={generating}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md">
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Optimizing...' : 'Generate AI Route'}</span>
              </button>
            </div>

            {state.routes.map(route => {
              const driver = state.users.find(u => u.id === route.driverId)
              const routeBins = state.bins.filter(b => route.binIds.includes(b.id))
              return (
                <div key={route.id} className="bg-white rounded-xl border-2 border-indigo-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{route.id}</span>
                        {statusBadge(route.status)}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${route.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-300' : route.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
                          {route.priority?.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(route.createdAt)} &bull; Units: {route.binIds.join(', ')}</p>
                      {driver && <p className="text-xs text-blue-700 font-semibold mt-0.5">Assigned Driver: {driver.name}</p>}
                      {route.note && <p className="text-xs text-slate-600 mt-1 italic">"{route.note}"</p>}
                    </div>
                    {route.status === 'pending' && (
                      <div className="flex gap-2 items-center">
                        <select value={assignDriverId} onChange={e => setAssignDriverId(e.target.value)}
                          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white">
                          <option value="">Select Driver</option>
                          {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button onClick={() => assignDriver(route.id)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg font-bold shadow-sm">
                          Dispatch
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Directions */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-2">Turn-by-Turn Navigation Waypoints:</p>
                    <ol className="space-y-1">
                      {route.directions.map((d, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="font-mono text-slate-400 font-bold">{i + 1}.</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Mini map */}
                  <DummyMap
                    bins={routeBins}
                    routes={[{ points: route.routePoints, label: 'Simulated Route' }]}
                    highlightBinIds={route.binIds}
                    showDepot
                    height={220}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
