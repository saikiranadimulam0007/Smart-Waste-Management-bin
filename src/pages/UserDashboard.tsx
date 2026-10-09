import React, { useState } from 'react'
import { useApp } from '../store/AppContext'
import { BinCard } from '../components/BinCard'
import { CNNSimulator } from '../components/CNNSimulator'
import { DummyMap } from '../components/DummyMap'
import type { Complaint } from '../types'
import { generateId, formatDate } from '../lib/utils'
import {
  User,
  MapPin,
  Bell,
  Clock,
  XCircle,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Recycle,
  Activity,
  Inbox,
  BellOff
} from 'lucide-react'

export function UserDashboard() {
  const { state, dispatch, addToast } = useApp()
  const user = state.currentUser!
  const assignedBin = state.bins.find(b => b.id === user.assignedBinId)
  const myNotifs = state.notifications.filter(n => n.userId === user.id)
  const myComplaints = state.complaints.filter(c => c.userId === user.id)

  const [tab, setTab] = useState<'overview' | 'complaints' | 'notifications'>('overview')
  const [compTitle, setCompTitle] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const unreadCount = myNotifs.filter(n => !n.read).length

  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault()
    if (!compTitle.trim() || !compDesc.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      const c: Complaint = {
        id: 'CMP-' + generateId(),
        userId: user.id,
        binId: user.assignedBinId || 'UNASSIGNED',
        title: compTitle.trim(),
        description: compDesc.trim(),
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_COMPLAINT', payload: c })
      dispatch({
        type: 'ADD_NOTIFICATION', payload: {
          id: 'NOT-' + generateId(), userId: 'USR-001',
          title: 'New Complaint Filed',
          message: `${user.name} filed: "${compTitle.trim()}"`,
          type: 'warning', read: false, createdAt: new Date().toISOString()
        }
      })
      addToast('Complaint Submitted', 'Your grievance has been dispatched to the municipal officer.', 'success')
      setCompTitle(''); setCompDesc('')
      setSubmitting(false)
    }, 800)
  }

  const markRead = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', id })

  const statusBadge = (s: Complaint['status']) => {
    const map: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      under_review: 'bg-amber-100 text-amber-700 border-amber-200',
      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    const labels: Record<string, string> = { submitted: 'Submitted', under_review: 'Under Review', resolved: 'Resolved' }
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${map[s]}`}>{labels[s]}</span>
  }

  if (user.status === 'pending') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Pending Approval</h2>
          <p className="text-slate-600 mb-4 text-sm leading-relaxed">
            Your verification documents have been submitted. An authorized officer will review and approve your account, after which your local bin will be connected.
          </p>
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 text-left space-y-1">
            <p className="font-semibold text-xs uppercase tracking-wider text-amber-800">Account Details</p>
            <p><span className="text-slate-500">Name:</span> {user.name}</p>
            <p><span className="text-slate-500">Email:</span> {user.email}</p>
            <p><span className="text-slate-500">Phone:</span> {user.phone}</p>
          </div>
        </div>
      </div>
    )
  }

  if (user.status === 'rejected') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-rose-200">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-rose-800 mb-2">Registration Rejected</h2>
          <p className="text-slate-600 text-sm">
            Your verification request was rejected by municipal operations. Please contact the municipal office or register with verified credentials.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-800/95 to-teal-900/95 backdrop-blur-md rounded-2xl p-6 text-white shadow-xl border border-emerald-600/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/10 rounded-lg">
                  <User className="w-5 h-5 text-emerald-300" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}</h2>
              </div>
              <p className="text-emerald-200/90 text-sm mt-1">
                Resident Portal &bull; {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2 text-sm flex-wrap">
              <span className="bg-white/15 backdrop-blur-sm rounded-lg px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-medium border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{assignedBin?.location || 'No bin assigned'}</span>
              </span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 rounded-lg px-3 py-1.5 font-bold flex items-center gap-1.5 text-xs shadow-md">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{unreadCount} unread</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20 w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'complaints', label: 'Complaints' },
            { id: 'notifications', label: unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white text-emerald-800 shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Assigned bin */}
            {assignedBin ? (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-xl space-y-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Your Assigned Smart Bin</span>
                </h3>
                <BinCard bin={assignedBin} />
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-md">
                <Inbox className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-slate-700">No bin assigned currently</p>
                <p className="text-xs text-slate-500 mt-1">Municipal management will bind an IoT unit to your registered address.</p>
              </div>
            )}

            {/* CNN Simulator */}
            {assignedBin && (
              <div className="shadow-xl rounded-2xl">
                <CNNSimulator userId={user.id} binId={assignedBin.id} />
              </div>
            )}

            {/* Map */}
            {assignedBin && (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-xl space-y-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Bin Geographical Location</span>
                </h3>
                <DummyMap
                  bins={[assignedBin]}
                  highlightBinIds={[assignedBin.id]}
                  height={260}
                />
              </div>
            )}

            {/* Recent scans */}
            {state.scans.filter(s => s.userId === user.id).length > 0 && (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-xl space-y-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Recent Waste Scans Log</span>
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {state.scans.filter(s => s.userId === user.id).slice(0, 5).map(scan => (
                    <div key={scan.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`p-2 rounded-lg ${scan.wasteType === 'WET' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {scan.wasteType === 'WET' ? <Droplets className="w-4 h-4" /> : <Recycle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{scan.item}</p>
                        <p className="text-xs text-slate-500">{formatDate(scan.scannedAt)}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${scan.wasteType === 'WET' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {scan.wasteType}
                      </span>
                      <span className="text-xs text-emerald-700 font-semibold">+{scan.fillIncrease}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {tab === 'complaints' && (
          <div className="space-y-6">
            {/* Submit form */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
              <h3 className="font-bold text-slate-900 mb-4 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Submit Grievance / Complaint</span>
              </h3>
              <form onSubmit={submitComplaint} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                  <input
                    value={compTitle} onChange={e => setCompTitle(e.target.value)} required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Overflowing bin on sidewalk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={compDesc} onChange={e => setCompDesc(e.target.value)} required rows={3}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="Provide specific details about the condition..."
                  />
                </div>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors shadow-md">
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Complaint'}</span>
                </button>
              </form>
            </div>

            {/* Existing complaints */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Filed Grievances</h3>
              {myComplaints.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>No grievances filed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myComplaints.map(c => (
                    <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{c.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatDate(c.createdAt)}</p>
                        </div>
                        {statusBadge(c.status)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{c.description}</p>
                      {c.officerNote && (
                        <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900">
                          <span className="font-bold">Officer Resolution Note: </span>{c.officerNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>System Notifications</span>
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => myNotifs.forEach(n => !n.read && markRead(n.id))}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {myNotifs.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <BellOff className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>No notifications on record</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${
                      n.read
                        ? 'bg-white border-slate-200 opacity-75'
                        : 'bg-blue-50/80 border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDate(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
