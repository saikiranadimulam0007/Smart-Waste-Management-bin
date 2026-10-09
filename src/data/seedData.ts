import type { AppState, Bin, User, CollectionRoute, Complaint, Notification, Alert, WasteScan } from '../types'

const now = new Date().toISOString()
const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString()

export const SEED_BINS: Bin[] = [
  {
    id: 'BIN-001', name: 'Central Park Bin', location: 'Central Park, North Gate', zone: 'Zone A',
    fillLevel: 92, maxCapacity: 150, currentWeight: 138, status: 'overflowing',
    lastUpdated: ago(0.5), latitude: 180, longitude: 120, assignedUserId: 'USR-002'
  },
  {
    id: 'BIN-002', name: 'Market Street Bin', location: 'Market Street, Block 4', zone: 'Zone B',
    fillLevel: 78, maxCapacity: 100, currentWeight: 78, status: 'nearly_full',
    lastUpdated: ago(1), latitude: 320, longitude: 200, assignedUserId: undefined
  },
  {
    id: 'BIN-003', name: 'Riverside Bin', location: 'Riverside Road, Gate 2', zone: 'Zone A',
    fillLevel: 36, maxCapacity: 150, currentWeight: 54, status: 'medium',
    lastUpdated: ago(2), latitude: 120, longitude: 300, assignedUserId: undefined
  },
  {
    id: 'BIN-004', name: 'School Zone Bin', location: 'GK Nagar School, Front', zone: 'Zone C',
    fillLevel: 55, maxCapacity: 120, currentWeight: 66, status: 'medium',
    lastUpdated: ago(3), latitude: 450, longitude: 150, assignedUserId: undefined
  },
  {
    id: 'BIN-005', name: 'Hospital Bin', location: 'City Hospital, Entrance', zone: 'Zone B',
    fillLevel: 95, maxCapacity: 200, currentWeight: 190, status: 'overflowing',
    lastUpdated: ago(0.2), latitude: 380, longitude: 320, assignedUserId: undefined
  },
  {
    id: 'BIN-006', name: 'Bus Stand Bin', location: 'Old Bus Stand, Platform 1', zone: 'Zone D',
    fillLevel: 22, maxCapacity: 100, currentWeight: 22, status: 'low',
    lastUpdated: ago(4), latitude: 240, longitude: 380, assignedUserId: undefined
  },
  {
    id: 'BIN-007', name: 'IT Park Bin', location: 'Tech Park, Tower B', zone: 'Zone C',
    fillLevel: 68, maxCapacity: 150, currentWeight: 102, status: 'medium',
    lastUpdated: ago(1.5), latitude: 500, longitude: 250, assignedUserId: undefined
  },
  {
    id: 'BIN-008', name: 'Residential Bin', location: 'Sukh Sagar Colony, Sector 7', zone: 'Zone D',
    fillLevel: 15, maxCapacity: 80, currentWeight: 12, status: 'low',
    lastUpdated: ago(5), latitude: 150, longitude: 430, assignedUserId: undefined
  },
]

export const SEED_USERS: User[] = [
  {
    id: 'USR-001', role: 'officer', name: 'Officer Ramesh Kumar', email: 'officer@waste.gov',
    password: 'officer123', phone: '9876543210', address: 'Municipal Office, Main Road',
    status: 'approved', createdAt: ago(720),
  },
  {
    id: 'USR-002', role: 'user', name: 'Priya Sharma', email: 'user@demo.com',
    password: 'user123', phone: '9123456780', address: '14, Rose Garden, Sector 5',
    status: 'approved', assignedBinId: 'BIN-001', createdAt: ago(168),
  },
  {
    id: 'USR-003', role: 'user', name: 'Pending Applicant', email: 'pending@demo.com',
    password: 'pending123', phone: '9000000001', address: '22, New Colony, Ward 3',
    status: 'pending', createdAt: ago(2),
  },
  {
    id: 'USR-004', role: 'driver', name: 'Driver Suresh Babu', email: 'driver1@waste.gov',
    password: 'driver123', phone: '9876500001', address: 'Depot A, Municipal Yard',
    status: 'approved', createdAt: ago(500),
  },
  {
    id: 'USR-005', role: 'driver', name: 'Driver Anand Raj', email: 'driver2@waste.gov',
    password: 'driver456', phone: '9876500002', address: 'Depot B, Industrial Area',
    status: 'approved', createdAt: ago(400),
  },
]

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-001', userId: 'USR-002', binId: 'BIN-001',
    title: 'Bin overflowing for 2 days', description: 'The bin near Central Park North Gate has been overflowing since Saturday. Waste is spilling onto the footpath.',
    status: 'under_review', createdAt: ago(48), updatedAt: ago(24), officerNote: 'Noted. Collection scheduled.'
  },
  {
    id: 'CMP-002', userId: 'USR-002', binId: 'BIN-001',
    title: 'Bad odour from bin', description: 'Strong smell is coming from the bin area especially in the morning.',
    status: 'submitted', createdAt: ago(6), updatedAt: ago(6)
  },
]

export const SEED_ROUTES: CollectionRoute[] = [
  {
    id: 'RTE-001', officerId: 'USR-001', driverId: 'USR-004',
    binIds: ['BIN-001', 'BIN-005', 'BIN-002'],
    routePoints: [
      { x: 60, y: 440, label: 'Depot', type: 'depot' },
      { x: 180, y: 120, label: 'BIN-001\nCentral Park', type: 'bin', binId: 'BIN-001' },
      { x: 380, y: 320, label: 'BIN-005\nHospital', type: 'bin', binId: 'BIN-005' },
      { x: 320, y: 200, label: 'BIN-002\nMarket St', type: 'bin', binId: 'BIN-002' },
    ],
    status: 'accepted',
    priority: 'high',
    note: 'Urgent: Bins BIN-001 and BIN-005 are critically overflowing.',
    createdAt: ago(2),
    updatedAt: ago(1),
    directions: [
      'Start from Municipal Depot (Depot A)',
      'Head North on Main Road (~1.2 km)',
      'Turn Left onto Central Park Avenue',
      'Collect from BIN-001 (Central Park, North Gate) — OVERFLOWING',
      'Head East on Park Road (~2.1 km)',
      'Turn Right at City Hospital Junction',
      'Collect from BIN-005 (City Hospital, Entrance) — OVERFLOWING',
      'Return West on Market Road (~1.5 km)',
      'Collect from BIN-002 (Market Street, Block 4) — NEARLY FULL',
      'Return to Depot via Ring Road (~3 km)',
    ]
  },
]

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOT-001', userId: 'USR-002', title: 'Critical Alert: Bin Overflowing',
    message: 'Your assigned bin BIN-001 at Central Park is overflowing (92%). Collection has been scheduled.',
    type: 'error', read: false, createdAt: ago(1)
  },
  {
    id: 'NOT-002', userId: 'USR-002', title: 'Driver En Route',
    message: 'Driver Suresh Babu is on the way to collect from BIN-001. Expected arrival: 30 mins.',
    type: 'info', read: false, createdAt: ago(0.5)
  },
  {
    id: 'NOT-003', userId: 'USR-004', title: 'New Collection Assignment',
    message: 'You have been assigned Route RTE-001. Bins: BIN-001, BIN-005, BIN-002. Priority: HIGH.',
    type: 'warning', read: false, createdAt: ago(1)
  },
]

export const SEED_ALERTS: Alert[] = [
  {
    id: 'ALT-001', binId: 'BIN-001', type: 'overflowing',
    message: 'BIN-001 at Central Park is at 92% capacity. Immediate collection required.',
    acknowledged: false, createdAt: ago(1)
  },
  {
    id: 'ALT-002', binId: 'BIN-005', type: 'overflowing',
    message: 'BIN-005 at City Hospital is at 95% capacity. Immediate collection required.',
    acknowledged: false, createdAt: ago(0.5)
  },
  {
    id: 'ALT-003', binId: 'BIN-002', type: 'nearly_full',
    message: 'BIN-002 at Market Street is at 78% capacity. Schedule collection soon.',
    acknowledged: true, createdAt: ago(2)
  },
]

export const SEED_SCANS: WasteScan[] = [
  {
    id: 'SCN-001', userId: 'USR-002', binId: 'BIN-001', item: 'Banana peel',
    wasteType: 'WET', fillIncrease: 3, scannedAt: ago(2)
  },
  {
    id: 'SCN-002', userId: 'USR-002', binId: 'BIN-001', item: 'Plastic bottle',
    wasteType: 'DRY', fillIncrease: 2, scannedAt: ago(4)
  },
]

export function getSeedState(): AppState {
  return {
    currentUser: null,
    users: SEED_USERS,
    bins: SEED_BINS,
    scans: SEED_SCANS,
    complaints: SEED_COMPLAINTS,
    routes: SEED_ROUTES,
    notifications: SEED_NOTIFICATIONS,
    alerts: SEED_ALERTS,
    toasts: [],
  }
}
