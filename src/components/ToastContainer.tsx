import React, { useEffect } from 'react'
import { useApp } from '../store/AppContext'
import type { Toast } from '../types'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const icons: Record<Toast['type'], React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  }

  const colors: Record<Toast['type'], string> = {
    success: 'border-emerald-300 bg-emerald-50/95',
    error: 'border-rose-300 bg-rose-50/95',
    warning: 'border-amber-300 bg-amber-50/95',
    info: 'border-blue-300 bg-blue-50/95',
  }

  const textColors: Record<Toast['type'], string> = {
    success: 'text-emerald-900',
    error: 'text-rose-900',
    warning: 'text-amber-900',
    info: 'text-blue-900',
  }

  return (
    <div className={`toast-enter flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md max-w-sm ${colors[toast.type]}`}>
      <span className="flex-shrink-0 mt-0.5">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${textColors[toast.type]}`}>{toast.title}</p>
        <p className={`text-xs mt-0.5 ${textColors[toast.type]} opacity-80`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-0.5 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { state, dispatch } = useApp()

  const dismiss = (id: string) => dispatch({ type: 'REMOVE_TOAST', id })

  if (state.toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="region" aria-label="Notifications">
      {state.toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
