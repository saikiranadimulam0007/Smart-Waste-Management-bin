import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function getFillColor(level: number): string {
  if (level >= 90) return '#ef4444'     // red - overflowing
  if (level >= 70) return '#f97316'     // orange - nearly full
  if (level >= 40) return '#eab308'     // yellow - medium
  return '#22c55e'                       // green - low
}

export function getFillStatus(level: number): string {
  if (level >= 90) return 'Overflowing'
  if (level >= 70) return 'Nearly Full'
  if (level >= 40) return 'Medium'
  return 'Low'
}

export function getFillBadgeClass(level: number): string {
  if (level >= 90) return 'bg-red-100 text-red-700 border-red-300'
  if (level >= 70) return 'bg-orange-100 text-orange-700 border-orange-300'
  if (level >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
  return 'bg-green-100 text-green-700 border-green-300'
}

export function getFillBorderClass(level: number): string {
  if (level >= 90) return 'border-red-500'
  if (level >= 70) return 'border-orange-500'
  if (level >= 40) return 'border-yellow-500'
  return 'border-green-500'
}

export function classifyWaste(item: string): 'WET' | 'DRY' | 'UNKNOWN' {
  const lower = item.toLowerCase()
  const wetKeywords = ['banana', 'apple', 'food', 'vegetable', 'fruit', 'peel', 'leaf', 'leaves', 'meat', 'fish', 'egg', 'rice', 'bread', 'organic', 'rotten', 'vegetable', 'carrot', 'potato', 'onion', 'tomato', 'mango', 'orange', 'waste food', 'leftover', 'curry', 'coffee', 'tea']
  const dryKeywords = ['plastic', 'bottle', 'paper', 'can', 'cardboard', 'glass', 'metal', 'tin', 'wrapper', 'bag', 'carton', 'box', 'foam', 'rubber', 'wire', 'electronic', 'cloth', 'fabric', 'wood', 'ceramic', 'aluminum', 'steel', 'copper', 'newspaper', 'magazine']

  if (wetKeywords.some(k => lower.includes(k))) return 'WET'
  if (dryKeywords.some(k => lower.includes(k))) return 'DRY'
  return 'UNKNOWN'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
