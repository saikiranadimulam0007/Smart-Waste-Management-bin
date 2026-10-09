import React from 'react'
import { cn } from '../lib/utils'
import type { Bin } from '../types'
import { getFillColor, getFillStatus, getFillBadgeClass, getFillBorderClass } from '../lib/utils'
import { Trash2, Scale, Clock } from 'lucide-react'

interface BinCardProps {
  bin: Bin
  compact?: boolean
  onClick?: () => void
}

export function BinCard({ bin, compact = false, onClick }: BinCardProps) {
  const fillColor = getFillColor(bin.fillLevel)
  const statusLabel = getFillStatus(bin.fillLevel)
  const badgeClass = getFillBadgeClass(bin.fillLevel)
  const borderClass = getFillBorderClass(bin.fillLevel)

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white/95 backdrop-blur-sm rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md',
        borderClass,
        onClick && 'cursor-pointer hover:scale-[1.01]',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-slate-100 text-slate-700">
              <Trash2 className="w-4 h-4" />
            </span>
            <h3 className={cn('font-bold text-gray-800', compact ? 'text-sm' : 'text-base')}>{bin.id}</h3>
          </div>
          <p className={cn('text-gray-500 mt-0.5', compact ? 'text-xs' : 'text-sm')}>{bin.location}</p>
        </div>
        {/* Fill percentage badge — matches progress bar exactly */}
        <span className={cn('font-bold border rounded-full px-2 py-0.5 text-xs', badgeClass)}>
          {bin.fillLevel.toFixed(1)}%
        </span>
      </div>

      {/* Zone */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 font-medium">
          {bin.zone}
        </span>
        <span className={cn('text-xs border rounded px-1.5 py-0.5 font-medium', badgeClass)}>
          {statusLabel}
        </span>
      </div>

      {/* Fill Level Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Fill Level</span>
          <span className="font-medium" style={{ color: fillColor }}>{bin.fillLevel.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${bin.fillLevel}%`, backgroundColor: fillColor }}
          />
        </div>
      </div>

      {/* Weight */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-slate-500" />
          <span>Weight (Load Cell)</span>
        </span>
        <span className="font-semibold text-gray-800">
          {bin.currentWeight.toFixed(1)} / {bin.maxCapacity} kg
        </span>
      </div>

      {/* Weight progress */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${(bin.currentWeight / bin.maxCapacity) * 100}%` }}
        />
      </div>

      {/* Footer */}
      {!compact && (
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Last Updated: {new Date(bin.lastUpdated).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
      )}

      {/* Overflow pulse indicator */}
      {bin.fillLevel >= 90 && (
        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 pulse-ring" />
      )}
    </div>
  )
}
