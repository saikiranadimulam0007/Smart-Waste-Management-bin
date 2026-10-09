import React from 'react'
import type { Bin } from '../types'
import { getFillColor } from '../lib/utils'
import { MapPin } from 'lucide-react'

interface Props {
  bins: Bin[]
  routes?: Array<{ points: Array<{ x: number; y: number }>; label: string }>
  highlightBinIds?: string[]
  showDepot?: boolean
  height?: number
}

const MAP_W = 600
const MAP_H = 480

// Decorative road network
const ROADS = [
  // Horizontal roads
  { x1: 0, y1: 80, x2: 600, y2: 80 },
  { x1: 0, y1: 200, x2: 600, y2: 200 },
  { x1: 0, y1: 320, x2: 600, y2: 320 },
  { x1: 0, y1: 420, x2: 600, y2: 420 },
  // Vertical roads
  { x1: 100, y1: 0, x2: 100, y2: 480 },
  { x1: 250, y1: 0, x2: 250, y2: 480 },
  { x1: 400, y1: 0, x2: 400, y2: 480 },
  { x1: 530, y1: 0, x2: 530, y2: 480 },
]

// Zone labels
const ZONES = [
  { x: 10, y: 20, label: 'Zone A', color: '#dcfce7' },
  { x: 260, y: 20, label: 'Zone B', color: '#dbeafe' },
  { x: 410, y: 20, label: 'Zone C', color: '#fef9c3' },
  { x: 10, y: 340, label: 'Zone D', color: '#fce7f3' },
]

// Zone background rects
const ZONE_RECTS = [
  { x: 0, y: 0, w: 250, h: 200, color: '#f0fdf4' },
  { x: 250, y: 0, w: 150, h: 320, color: '#eff6ff' },
  { x: 400, y: 0, w: 200, h: 480, color: '#fefce8' },
  { x: 0, y: 320, w: 250, h: 160, color: '#fdf2f8' },
]

const DEPOT = { x: 60, y: 440, label: 'Depot' }

export function DummyMap({ bins, routes = [], highlightBinIds = [], showDepot = false, height = 340 }: Props) {
  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-sm">
      <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-blue-600" />
        <span>Simulated City Telemetry Map</span>
      </div>

      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        width="100%"
        style={{ height }}
        className="block"
        aria-label="Simulated city map with bin markers"
      >
        {/* Zone backgrounds */}
        {ZONE_RECTS.map((z, i) => (
          <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} />
        ))}

        {/* Zone labels */}
        {ZONES.map((z, i) => (
          <text key={i} x={z.x + 8} y={z.y + 18} fontSize="11" fontWeight="600" fill="#6b7280" opacity="0.8">{z.label}</text>
        ))}

        {/* Roads */}
        {ROADS.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#cbd5e1" strokeWidth="8" />
        ))}
        {/* Road center lines */}
        {ROADS.map((r, i) => (
          <line key={`c${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#ffffff" strokeWidth="1" strokeDasharray="12 8" />
        ))}

        {/* City blocks (decorative) */}
        {[
          [110, 90, 130, 100], [110, 210, 130, 100], [260, 90, 130, 100],
          [260, 210, 130, 100], [410, 90, 110, 100],
          [110, 330, 130, 80], [260, 330, 130, 80], [410, 210, 110, 100],
        ].map(([x, y, w, h], i) => (
          <rect key={`blk${i}`} x={x} y={y} width={w} height={h} fill="white" stroke="#e2e8f0" strokeWidth="1" rx="4" />
        ))}

        {/* Route polylines */}
        {routes.map((route, ri) => (
          <g key={ri}>
            <polyline
              points={route.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="route-path"
              strokeDasharray="10 5"
            />
            {/* Arrow markers */}
            {route.points.slice(0, -1).map((p, pi) => {
              const next = route.points[pi + 1]
              const mx = (p.x + next.x) / 2
              const my = (p.y + next.y) / 2
              const angle = Math.atan2(next.y - p.y, next.x - p.x) * 180 / Math.PI
              return (
                <g key={pi} transform={`translate(${mx},${my}) rotate(${angle})`}>
                  <polygon points="0,-4 8,0 0,4" fill="#4f46e5" opacity="0.9" />
                </g>
              )
            })}
            {/* Route label */}
            <text x={route.points[0].x} y={route.points[0].y - 16} fontSize="10" fill="#4f46e5" fontWeight="700">
              {route.label}
            </text>
          </g>
        ))}

        {/* Bin markers */}
        {bins.map(bin => {
          const color = getFillColor(bin.fillLevel)
          const isHighlighted = highlightBinIds.includes(bin.id)
          return (
            <g key={bin.id} transform={`translate(${bin.latitude},${bin.longitude})`}>
              {/* Pulse ring for critical bins */}
              {bin.fillLevel >= 90 && (
                <circle r="18" fill="none" stroke={color} strokeWidth="2" opacity="0.4">
                  <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Highlight ring */}
              {isHighlighted && (
                <circle r="16" fill="none" stroke="#4f46e5" strokeWidth="3" opacity="0.8" />
              )}
              {/* Bin circle */}
              <circle r="12" fill={color} stroke="white" strokeWidth="2.5" />
              {/* Clean geometric bin icon representation */}
              <rect x="-4" y="-4.5" width="8" height="9" rx="1.5" fill="white" />
              <line x1="-5.5" y1="-4.5" x2="5.5" y2="-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              {/* Bin ID label */}
              <text y="22" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#1e293b">
                {bin.id}
              </text>
              {/* Fill % */}
              <text y="32" textAnchor="middle" fontSize="7.5" fill={color} fontWeight="700">
                {bin.fillLevel.toFixed(0)}%
              </text>
            </g>
          )
        })}

        {/* Depot marker */}
        {showDepot && (
          <g transform={`translate(${DEPOT.x},${DEPOT.y})`}>
            <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#1e3a8a" stroke="white" strokeWidth="2.5" />
            <polygon points="-6,6 0,-6 6,6" fill="white" />
            <text y="24" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#1e3a8a">DEPOT</text>
          </g>
        )}

        {/* Legend */}
        <g transform="translate(10, 450)">
          {[
            { color: '#22c55e', label: 'Low (<40%)' },
            { color: '#eab308', label: 'Medium (40-69%)' },
            { color: '#f97316', label: 'Nearly Full (70-89%)' },
            { color: '#ef4444', label: 'Overflowing (>=90%)' },
          ].map((l, i) => (
            <g key={i} transform={`translate(${i * 125}, 0)`}>
              <circle r="5" fill={l.color} cx="6" cy="6" />
              <text x="16" y="10" fontSize="8.5" fill="#475569" fontWeight="500">{l.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
