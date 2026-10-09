// ─── Types ─────────────────────────────────────────────────────────────────

export type Role = 'user' | 'officer' | 'driver'

export type UserStatus = 'pending' | 'approved' | 'rejected'
export type BinStatus = 'low' | 'medium' | 'nearly_full' | 'overflowing'
export type ComplaintStatus = 'submitted' | 'under_review' | 'resolved'
export type CollectionStatus = 'pending' | 'accepted' | 'in_progress' | 'completed'
export type WasteType = 'WET' | 'DRY' | 'UNKNOWN'

export interface User {
  id: string
  role: Role
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  status: UserStatus
  assignedBinId?: string
  createdAt: string
  avatar?: string
}

export interface Bin {
  id: string
  name: string
  location: string
  zone: string
  fillLevel: number       // 0-100 percent
  maxCapacity: number     // kg
  currentWeight: number   // kg
  status: BinStatus
  lastUpdated: string
  latitude: number        // map coords (virtual)
  longitude: number       // map coords (virtual)
  assignedUserId?: string
}

export interface WasteScan {
  id: string
  userId: string
  binId: string
  item: string
  wasteType: WasteType
  fillIncrease: number
  scannedAt: string
}

export interface Complaint {
  id: string
  userId: string
  binId: string
  title: string
  description: string
  status: ComplaintStatus
  createdAt: string
  updatedAt: string
  officerNote?: string
}

export interface CollectionRoute {
  id: string
  officerId: string
  driverId?: string
  binIds: string[]
  routePoints: RoutePoint[]
  status: CollectionStatus
  priority: 'high' | 'medium' | 'low'
  note?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  directions: string[]
}

export interface RoutePoint {
  x: number
  y: number
  label: string
  type: 'depot' | 'bin' | 'waypoint'
  binId?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
}

export interface Alert {
  id: string
  binId: string
  type: 'overflowing' | 'nearly_full' | 'collection_complete' | 'driver_en_route'
  message: string
  acknowledged: boolean
  createdAt: string
}

export interface AppState {
  currentUser: User | null
  users: User[]
  bins: Bin[]
  scans: WasteScan[]
  complaints: Complaint[]
  routes: CollectionRoute[]
  notifications: Notification[]
  alerts: Alert[]
  toasts: Toast[]
}

export interface Toast {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}
