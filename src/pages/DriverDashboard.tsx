import React, { useState } from 'react'
import { useApp } from '../store/AppContext'
import { DummyMap } from '../components/DummyMap'
import { BinCard } from '../components/BinCard'
import { formatDate } from '../lib/utils'
import type { CollectionStatus } from '../types'
import {
  Truck,
  Bell,
  CheckCircle2,
  Clock,
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  AlertTriangle,
  BellOff
} from 'lucide-react'

export function DriverDashboard() {
  const { state, dispatch, addToast } = useApp()
  const driver = state.currentUser!
  const [tab, setTab] = useState<'requests' | 'notifications'>('requests')
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  const myRoutes = state.routes
    .filter(r => r.driverId === driver.id)
    .sort((a, b) => {
      const pri = { high: 0, medium: 1, low: 2 }
      return (pri[a.priority || 'low'] - pri[b.priority || 'low']) ||
        (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })

  const myNotifs = state.notifications.filter(n => n.userId === driver.id)
  const unread = myNotifs.filter(n => !n.read).length

  const updateStatus = (routeId: string, status: CollectionStatus) => {
    if (status === 'completed') {
      dispatch({ type: 'COMPLETE_COLLECTION', routeId })
      const route = state.routes.find(r => r.id === routeId)
      if (route) {
        // Notify officer
        dispatch({
          type: 'ADD_NOTIFICATION', payload: {
            id: 'NOT-' + Date.now(), userId: route.officerId,
            title: 'Collection Completed',
            message: `Driver ${driver.name} completed route ${routeId}. All bins reset to nominal level.`,
            type: 'success', read: false, createdAt: new Date().toISOString()
          }
        })
      }
      addToast('Collection Completed', 'All target bins emptied. Fill levels reset to 5%. Dashboards synchronized.', 'success')
    } else {
      dispatch({ type: 'UPDATE_ROUTE', id: routeId, status })
      if (status === 'in_progress') {
        // Notify users whose bins are in this route
        const route = state.routes.find(r => r.id === routeId)
        if (route) {
          const affectedUsers = state.bins
            .filter(b => route.binIds.includes(b.id) && b.assignedUserId)
            .map(b => b.assignedUserId!)
          affectedUsers.forEach(uid => {
            dispatch({
              type: 'ADD_NOTIFICATION', payload: {
                id: 'NOT-' + Date.now() + uid, userId: uid,
                title: 'Driver En Route',
                message: `Driver ${driver.name} has begun transit towards your bin. Approximate arrival: ~20 mins.`,
                type: 'info', read: false, createdAt: new Date().toISOString()
              }
            })
          })
        }
        addToast('Trip Started', 'Route marked In Progress. Assigned residents notified.', 'info')
      } else {
        addToast('Status Updated', `Route ${routeId} status set to "${status}".`, 'info')
      }
    }
  }

  const statusBadge = (s: CollectionStatus) => {
    const configs: Record<CollectionStatus, { color: string; label: string }> = {
      pending: { color: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Accepted' },
      in_progress: { color: 'bg-amber-100 text-amber-800 border-amber-300', label: 'In Progress' },
      completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Completed' },
    }
    const c = configs[s]
    return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${c.color}`}>{c.label}</span>
  }

  const priorityBadge = (p?: string) => {
    if (!p) return null
    const configs: Record<string, string> = {
      high: 'bg-rose-100 text-rose-800 border-rose-300',
      medium: 'bg-amber-100 text-amber-800 border-amber-300',
      low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    }
    return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${configs[p] || 'bg-slate-100 text-slate-600'}`}>{p.toUpperCase()}</span>
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/95 to-indigo-950/95 backdrop-blur-md rounded-2xl p-6 text-white shadow-xl border border-indigo-700/40">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/10 rounded-lg">
                  <Truck className="w-5 h-5 text-indigo-300" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">Driver Fleet Console</h2>
              </div>
              <p className="text-indigo-200/90 text-sm mt-1">{driver.name} &bull; Contact: {driver.phone}</p>
            </div>
            <div className="flex gap-2 text-sm flex-wrap">
              <span className="bg-white/15 backdrop-blur-sm rounded-lg px-3.5 py-1.5 text-xs font-medium border border-white/10">
                Active Itineraries: {myRoutes.filter(r => r.status !== 'completed').length}
              </span>
              <span className="bg-white/15 backdrop-blur-sm rounded-lg px-3.5 py-1.5 text-xs font-medium border border-white/10">
                Completed: {myRoutes.filter(r => r.status === 'completed').length}
              </span>
              {unread > 0 && (
                <span className="bg-rose-500 rounded-lg px-3 py-1.5 font-bold text-xs flex items-center gap-1 shadow-md">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{unread} unread</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20 w-fit">
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              tab === 'requests'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Assigned Routes
          </button>
          <button
            onClick={() => setTab('notifications')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              tab === 'notifications'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {unread > 0 ? `Notifications (${unread})` : 'Notifications'}
          </button>
        </div>

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div className="space-y-5">
            {myRoutes.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-12 text-center text-slate-500 shadow-xl border border-white/40">
                <Truck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No Active Dispatches</h3>
                <p className="text-xs text-slate-500 mt-1">Pending route assignments from municipal logistics will appear here.</p>
              </div>
            ) : (
              myRoutes.map(route => {
                const routeBins = state.bins.filter(b => route.binIds.includes(b.id))
                const isExpanded = selectedRoute === route.id
                return (
                  <div key={route.id} className={`bg-white/95 backdrop-blur-md rounded-2xl border-2 overflow-hidden shadow-xl transition-all ${
                    route.priority === 'high' ? 'border-rose-300' : route.priority === 'medium' ? 'border-amber-300' : 'border-emerald-300'
                  }`}>
                    {/* Card header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-slate-50/70 transition-colors"
                      onClick={() => setSelectedRoute(isExpanded ? null : route.id)}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-base">{route.id}</span>
                            {statusBadge(route.status)}
                            {priorityBadge(route.priority)}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Dispatched: {formatDate(route.createdAt)}</p>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">Waypoints: {route.binIds.join(' → ')}</p>
                          {route.note && <p className="text-xs text-indigo-900 mt-1.5 italic bg-indigo-50/80 rounded-lg px-2.5 py-1 border border-indigo-200">Officer Note: "{route.note}"</p>}
                        </div>
                        <div className="flex gap-2 items-center">
                          {route.status === 'accepted' && (
                            <button
                              onClick={e => { e.stopPropagation(); updateStatus(route.id, 'in_progress') }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Start Collection</span>
                            </button>
                          )}
                          {route.status === 'in_progress' && (
                            <button
                              onClick={e => { e.stopPropagation(); updateStatus(route.id, 'completed') }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors animate-pulse"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Complete</span>
                            </button>
                          )}
                          <span className="text-slate-400 p-1">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 p-5 space-y-5 bg-slate-50/60">
                        {/* Bin cards */}
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-3">Target Smart Bins ({routeBins.length})</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {routeBins.map(bin => <BinCard key={bin.id} bin={bin} compact />)}
                          </div>
                        </div>

                        {/* Turn-by-turn directions */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span>Turn-by-Turn Navigation Guide</span>
                          </h4>
                          <div className="space-y-2">
                            {route.directions.map((dir, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                                <p className="text-xs sm:text-sm text-slate-700">{dir}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <h4 className="font-bold text-slate-800 text-sm mb-2">Simulated GPS Trajectory</h4>
                          <DummyMap
                            bins={routeBins}
                            routes={[{ points: route.routePoints, label: 'Optimized Path' }]}
                            highlightBinIds={route.binIds}
                            showDepot
                            height={280}
                          />
                        </div>

                        {/* Status update buttons */}
                        {route.status !== 'completed' && (
                          <div className="flex gap-3 flex-wrap">
                            {route.status === 'accepted' && (
                              <button
                                onClick={() => updateStatus(route.id, 'in_progress')}
                                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-sm"
                              >
                                <Play className="w-4 h-4" />
                                <span>Start Collection Route</span>
                              </button>
                            )}
                            {route.status === 'in_progress' && (
                              <button
                                onClick={() => updateStatus(route.id, 'completed')}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Mark Route as Completed</span>
                              </button>
                            )}
                          </div>
                        )}

                        {route.status === 'completed' && (
                          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                            <p className="font-bold text-emerald-900">Collection Mission Accomplished</p>
                            <p className="text-xs text-emerald-700 mt-0.5">All units evacuated & sensor telemetry reset to nominal 5%.</p>
                            <p className="text-[11px] text-emerald-600 mt-1 font-mono">Completed: {route.completedAt ? formatDate(route.completedAt) : 'Recent'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Driver Dispatch Notifications</span>
            </h3>
            {myNotifs.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <BellOff className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>No dispatch notifications</p>
              </div>
            ) : (
              myNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id })}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    n.read
                      ? 'bg-white border-slate-200 opacity-75'
                      : 'bg-indigo-50/80 border-indigo-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
