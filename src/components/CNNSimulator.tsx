import React, { useState, useRef } from 'react'
import { useApp } from '../store/AppContext'
import { classifyWaste, generateId } from '../lib/utils'
import type { WasteScan } from '../types'
import { Cpu, Camera, Search, Droplets, Recycle, HelpCircle, CheckCircle2, RotateCw } from 'lucide-react'

interface Props {
  userId: string
  binId: string
}

type ScanPhase = 'idle' | 'scanning' | 'result'

export function CNNSimulator({ userId, binId }: Props) {
  const { dispatch, addToast } = useApp()
  const [item, setItem] = useState('')
  const [phase, setPhase] = useState<ScanPhase>('idle')
  const [result, setResult] = useState<'WET' | 'DRY' | 'UNKNOWN' | null>(null)
  const [flapOpen, setFlapOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleScan = () => {
    if (!item.trim()) {
      addToast('Input Required', 'Please enter an item name to scan.', 'error')
      inputRef.current?.focus()
      return
    }
    setPhase('scanning')
    setFlapOpen(false)
    setResult(null)

    setTimeout(() => {
      const classification = classifyWaste(item)
      setResult(classification)
      setPhase('result')
      setFlapOpen(true)

      if (classification !== 'UNKNOWN') {
        const fillIncrease = Math.round((Math.random() * 3 + 1.5) * 10) / 10
        const scan: WasteScan = {
          id: 'SCN-' + generateId(),
          userId,
          binId,
          item: item.trim(),
          wasteType: classification,
          fillIncrease,
          scannedAt: new Date().toISOString()
        }
        dispatch({ type: 'ADD_SCAN', payload: scan })
        addToast(
          classification === 'WET' ? 'Wet Waste Classified' : 'Dry Waste Classified',
          `"${item}" classified as ${classification} WASTE. Bin fill increased by ~${fillIncrease}%.`,
          'success'
        )
      }
    }, 2000)
  }

  const handleReset = () => {
    setPhase('idle')
    setResult(null)
    setFlapOpen(false)
    setItem('')
  }

  return (
    <div className="bg-gradient-to-br from-blue-50/95 to-indigo-50/95 backdrop-blur-md border-2 border-blue-200/90 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-blue-900 font-bold text-base">AI Wet/Dry Segregation Simulator</h2>
          <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
            Simulate placing an item in front of the smart bin camera. The{' '}
            <strong>Convolutional Neural Network (CNN)</strong> classifies the material and signals{' '}
            the servo motors to open the respective flap.{' '}
            <span className="italic opacity-75">[Simulated sensor feed]</span>
          </p>
        </div>
      </div>

      {/* Camera + Bin visual */}
      <div className="flex gap-4 items-start mb-4">
        {/* Camera view */}
        <div className="relative flex-1 bg-gray-900 rounded-xl overflow-hidden aspect-video max-h-32 flex items-center justify-center">
          {phase === 'idle' && (
            <div className="text-center text-gray-400">
              <Camera className="w-8 h-8 mx-auto mb-1 text-gray-400" />
              <p className="text-xs">Camera Sensor Ready</p>
            </div>
          )}
          {phase === 'scanning' && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              {/* Scan line */}
              <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 opacity-80 scan-line" />
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,255,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.3) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-emerald-400 text-xs font-mono animate-pulse">CNN PROCESSING...</span>
              </div>
            </>
          )}
          {phase === 'result' && result && (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center ${
                result === 'WET'
                  ? 'bg-blue-950/85'
                  : result === 'DRY'
                  ? 'bg-amber-950/85'
                  : 'bg-gray-800/85'
              }`}
            >
              <div className="mb-1">
                {result === 'WET' ? (
                  <Droplets className="w-7 h-7 text-blue-300" />
                ) : result === 'DRY' ? (
                  <Recycle className="w-7 h-7 text-amber-300" />
                ) : (
                  <HelpCircle className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <span
                className={`text-sm font-bold ${
                  result === 'WET'
                    ? 'text-blue-300'
                    : result === 'DRY'
                    ? 'text-amber-300'
                    : 'text-gray-300'
                }`}
              >
                {result} WASTE
              </span>
              <span className="text-white text-xs mt-0.5 opacity-75">Classification Verified</span>
            </div>
          )}
        </div>

        {/* Bin visual */}
        <div className="relative flex-shrink-0 w-24">
          <div className="text-center text-xs text-gray-500 mb-1 font-medium">Smart Bin</div>
          <div className="relative mx-auto w-16 h-20 bg-gray-200 rounded-b-lg border-2 border-gray-400">
            {/* Wet flap */}
            <div
              className={`absolute top-0 left-0 w-1/2 h-4 bg-blue-500 border-r border-gray-400 rounded-tl origin-top transition-transform duration-600 ${
                flapOpen && result === 'WET' ? 'flap-open' : ''
              }`}
            >
              <span className="text-[8px] text-white font-bold flex items-center justify-center h-full">W</span>
            </div>
            {/* Dry flap */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-4 bg-amber-500 border-l border-gray-400 rounded-tr origin-top transition-transform duration-600 ${
                flapOpen && result === 'DRY' ? 'flap-open' : ''
              }`}
            >
              <span className="text-[8px] text-white font-bold flex items-center justify-center h-full">D</span>
            </div>
            {/* Bin content level */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-emerald-400 rounded-b-md opacity-60 transition-all duration-700"
              style={{ height: '30%' }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-[9px] text-gray-600 font-mono">Servo</span>
            </div>
          </div>
          <div className="text-center mt-1">
            <span
              className={`text-[10px] font-bold ${
                flapOpen
                  ? result === 'WET'
                    ? 'text-blue-600'
                    : 'text-amber-600'
                  : 'text-gray-400'
              }`}
            >
              {flapOpen ? (result === 'WET' ? 'Wet Flap Open' : 'Dry Flap Open') : 'Flap Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={item}
          onChange={e => setItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && phase === 'idle' && handleScan()}
          placeholder="e.g. Banana peel, Plastic bottle..."
          disabled={phase === 'scanning'}
          className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
        {phase === 'idle' && (
          <button
            onClick={handleScan}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Item</span>
          </button>
        )}
        {phase === 'result' && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Scan Again</span>
          </button>
        )}
      </div>

      {/* Result banner */}
      {phase === 'result' && result && (
        <div
          className={`mt-3 rounded-lg p-3 border ${
            result === 'WET'
              ? 'bg-blue-100 border-blue-300'
              : result === 'DRY'
              ? 'bg-amber-100 border-amber-300'
              : 'bg-gray-100 border-gray-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">
              {result === 'WET' ? (
                <Droplets className="w-5 h-5 text-blue-700" />
              ) : result === 'DRY' ? (
                <Recycle className="w-5 h-5 text-amber-700" />
              ) : (
                <HelpCircle className="w-5 h-5 text-gray-700" />
              )}
            </div>
            <div>
              <p
                className={`font-bold text-sm ${
                  result === 'WET'
                    ? 'text-blue-800'
                    : result === 'DRY'
                    ? 'text-amber-800'
                    : 'text-gray-700'
                }`}
              >
                {result === 'UNKNOWN' ? 'Could not classify item' : `${result} WASTE detected`}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {result === 'WET' && 'Servo actuator triggered Blue (Wet) compartment flap.'}
                {result === 'DRY' && 'Servo actuator triggered Yellow (Dry) compartment flap.'}
                {result === 'UNKNOWN' && 'Object unclassified. Please input standard material keywords.'}
              </p>
              {result !== 'UNKNOWN' && (
                <p className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bin weight & fill telemetry updated</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scanning indicator */}
      {phase === 'scanning' && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-blue-700 text-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Running CNN inference... Analyzing pixel features...
          </div>
        </div>
      )}
    </div>
  )
}
