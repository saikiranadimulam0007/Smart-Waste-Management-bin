import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { AppState, User, Bin, Complaint, CollectionRoute, Notification, Alert, WasteScan, Toast, CollectionStatus, ComplaintStatus, UserStatus } from '../types'
import { getSeedState } from '../data/seedData'

const STORAGE_KEY = 'swm_app_state_v2'

// ─── Actions ───────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_USER'; payload: User }
  | { type: 'APPROVE_USER'; userId: string; binId?: string }
  | { type: 'REJECT_USER'; userId: string }
  | { type: 'UPDATE_BIN'; payload: Partial<Bin> & { id: string } }
  | { type: 'ADD_SCAN'; payload: WasteScan }
  | { type: 'ADD_COMPLAINT'; payload: Complaint }
  | { type: 'UPDATE_COMPLAINT'; id: string; status: ComplaintStatus; officerNote?: string }
  | { type: 'ADD_ROUTE'; payload: CollectionRoute }
  | { type: 'UPDATE_ROUTE'; id: string; status: CollectionStatus; driverId?: string }
  | { type: 'COMPLETE_COLLECTION'; routeId: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'ACK_ALERT'; id: string }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'RESET_DEMO' }

function getBinStatus(level: number): Bin['status'] {
  if (level >= 90) return 'overflowing'
  if (level >= 70) return 'nearly_full'
  if (level >= 40) return 'medium'
  return 'low'
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE': return action.payload

    case 'LOGIN': return { ...state, currentUser: action.payload }

    case 'LOGOUT': return { ...state, currentUser: null }

    case 'REGISTER_USER':
      return { ...state, users: [...state.users, action.payload] }

    case 'APPROVE_USER': {
      const users = state.users.map(u =>
        u.id === action.userId
          ? { ...u, status: 'approved' as UserStatus, assignedBinId: action.binId || u.assignedBinId }
          : u
      )
      const bins = action.binId
        ? state.bins.map(b => b.id === action.binId ? { ...b, assignedUserId: action.userId } : b)
        : state.bins
      return { ...state, users, bins }
    }

    case 'REJECT_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.userId ? { ...u, status: 'rejected' as UserStatus } : u)
      }

    case 'UPDATE_BIN': {
      const bins = state.bins.map(b => {
        if (b.id !== action.payload.id) return b
        const updated = { ...b, ...action.payload }
        updated.status = getBinStatus(updated.fillLevel)
        updated.lastUpdated = new Date().toISOString()
        return updated
      })
      return { ...state, bins }
    }

    case 'ADD_SCAN': {
      const bins = state.bins.map(b => {
        if (b.id !== action.payload.binId) return b
        const newLevel = Math.min(100, b.fillLevel + action.payload.fillIncrease)
        const newWeight = Math.min(b.maxCapacity, b.currentWeight + (action.payload.fillIncrease / 100) * b.maxCapacity * 0.3)
        return {
          ...b,
          fillLevel: Math.round(newLevel * 10) / 10,
          currentWeight: Math.round(newWeight * 10) / 10,
          status: getBinStatus(newLevel),
          lastUpdated: new Date().toISOString()
        }
      })
      return { ...state, bins, scans: [action.payload, ...state.scans] }
    }

    case 'ADD_COMPLAINT':
      return { ...state, complaints: [action.payload, ...state.complaints] }

    case 'UPDATE_COMPLAINT':
      return {
        ...state,
        complaints: state.complaints.map(c =>
          c.id === action.id
            ? { ...c, status: action.status, officerNote: action.officerNote ?? c.officerNote, updatedAt: new Date().toISOString() }
            : c
        )
      }

    case 'ADD_ROUTE':
      return { ...state, routes: [action.payload, ...state.routes] }

    case 'UPDATE_ROUTE':
      return {
        ...state,
        routes: state.routes.map(r =>
          r.id === action.id
            ? { ...r, status: action.status, driverId: action.driverId ?? r.driverId, updatedAt: new Date().toISOString() }
            : r
        )
      }

    case 'COMPLETE_COLLECTION': {
      const route = state.routes.find(r => r.id === action.routeId)
      if (!route) return state
      // Reset all collected bins
      const bins = state.bins.map(b => {
        if (!route.binIds.includes(b.id)) return b
        return {
          ...b,
          fillLevel: 5,
          currentWeight: Math.round(b.maxCapacity * 0.05 * 10) / 10,
          status: 'low' as Bin['status'],
          lastUpdated: new Date().toISOString()
        }
      })
      // Mark route complete
      const routes = state.routes.map(r =>
        r.id === action.routeId
          ? { ...r, status: 'completed' as CollectionStatus, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : r
      )
      // Add completion notifications for assigned users
      const affectedUsers = bins
        .filter(b => route.binIds.includes(b.id) && b.assignedUserId)
        .map(b => b.assignedUserId!)
      const newNotifs: Notification[] = affectedUsers.map(uid => ({
        id: 'NOT-' + Date.now() + uid,
        userId: uid,
        title: 'Bin Collection Complete',
        message: `Your bin has been emptied by the driver. Fill level reset to 5%.`,
        type: 'success' as const,
        read: false,
        createdAt: new Date().toISOString()
      }))
      // Resolve related alerts
      const alerts = state.alerts.map(a =>
        route.binIds.includes(a.binId) ? { ...a, acknowledged: true } : a
      )
      return { ...state, bins, routes, alerts, notifications: [...newNotifs, ...state.notifications] }
    }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n)
      }

    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] }

    case 'ACK_ALERT':
      return { ...state, alerts: state.alerts.map(a => a.id === action.id ? { ...a, acknowledged: true } : a) }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }

    case 'RESET_DEMO':
      return getSeedState()

    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────────────────────────
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  login: (email: string, password: string) => boolean
  logout: () => void
  addToast: (title: string, message: string, type?: Toast['type']) => void
  refreshData: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AppState
        return { ...parsed, currentUser: null, toasts: [] }
      }
    } catch { /* ignore */ }
    return getSeedState()
  })

  // Persist to localStorage on every state change
  useEffect(() => {
    const { toasts: _, ...persistable } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  }, [state])

  const login = useCallback((email: string, password: string): boolean => {
    const user = state.users.find(u => u.email === email && u.password === password)
    if (!user) return false
    dispatch({ type: 'LOGIN', payload: user })
    return true
  }, [state.users])

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), [])

  const addToast = useCallback((title: string, message: string, type: Toast['type'] = 'info') => {
    const id = 'TST-' + Date.now()
    dispatch({ type: 'ADD_TOAST', payload: { id, title, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 4000)
  }, [])

  const refreshData = useCallback(() => {
    // Simulate IoT sensor refresh — slightly randomize non-critical bins
    state.bins.forEach(bin => {
      if (bin.fillLevel < 90) {
        const delta = Math.random() * 2
        dispatch({
          type: 'UPDATE_BIN',
          payload: {
            id: bin.id,
            fillLevel: Math.min(99, Math.round((bin.fillLevel + delta) * 10) / 10),
            currentWeight: Math.min(bin.maxCapacity, Math.round((bin.currentWeight + delta * 0.5) * 10) / 10),
          }
        })
      }
    })
    addToast('Data Refreshed', 'Sensor data updated from IoT bins (simulated).', 'success')
  }, [state.bins, addToast])

  return (
    <AppContext.Provider value={{ state, dispatch, login, logout, addToast, refreshData }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
