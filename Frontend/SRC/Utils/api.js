// Mock API with shared random values across the app (no backend needed)

const randomBetween = (min, max) => min + Math.random() * (max - min)

// Delete function to be added to api object
const deleteMachineApi = async (machineId) => {
  const token = localStorage.getItem('token')
  if (!token) return { success: false, message: 'Not authenticated' }
  try {
    const response = await fetch(`http://localhost:5000/api/machines/${machineId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) return { success: false, message: 'Failed to delete' }
    return { success: true }
  } catch (err) {
    return { success: false, message: 'Network error' }
  }
}

const mockMachines = [
  { id: 1, name: 'Machine A', status: 'active' },
  { id: 2, name: 'Machine B', status: 'active' },
  { id: 3, name: 'Machine C', status: 'maintenance' },
]

const generatePowerHistory = () => {
  const now = Date.now()
  return Array.from({ length: 30 }).map((_, idx) => ({
    time: now - (29 - idx) * 60 * 1000,
    value: randomBetween(4000, 7000),
  }))
}

const generateAlerts = () => {
  const severities = ['critical', 'warning', 'info']
  return Array.from({ length: 5 }).map((_, idx) => ({
    id: idx + 1,
    machine: mockMachines[Math.floor(Math.random() * mockMachines.length)].name,
    alert_type: 'Anomaly detected',
    severity: severities[Math.floor(Math.random() * severities.length)],
    timestamp: new Date(Date.now() - idx * 5 * 60 * 1000).toISOString(),
    acknowledged: false,
    message: 'Threshold exceeded',
  }))
}

export const api = {
  getCurrentUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return { success: false }
    }
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        return { success: false }
      }
      const user = await response.json()
      return { success: true, user }
    } catch (err) {
      return { success: false }
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (!response.ok) {
        return { success: false, error: data.error }
      }
      return { success: true, user: data.user, token: data.token }
    } catch (err) {
      return { success: false, error: 'Server error' }
    }
  },

  signup: async (name, email, password, role = 'operator') => {
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      })
      const data = await response.json()
      if (!response.ok) {
        return { success: false, error: data.error }
      }
      return { success: true, user: data }
    } catch (err) {
      return { success: false, error: 'Server error' }
    }
  },

  getDashboardData: async () => {
    const voltage = randomBetween(220, 235)
    const current = randomBetween(15, 23)
    const power = voltage * current
    return {
      voltage,
      current,
      power,
      powerHistory: generatePowerHistory(),
      anomalyDetected: Math.random() > 0.85,
      machines: mockMachines,
    }
  },

  getHistoricalData: async () => {
    const now = Date.now()
    const data = Array.from({ length: 50 }).map((_, idx) => ({
      timestamp: new Date(now - idx * 10 * 60 * 1000).toISOString(),
      voltage: randomBetween(220, 235),
      current: randomBetween(15, 23),
      power: randomBetween(4000, 7000),
      value: randomBetween(4000, 7000),
    })).reverse()
    const voltages = data.map(d => d.voltage)
    const currents = data.map(d => d.current)
    const powers = data.map(d => d.power)
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
    return { success: true, data, statistics: { voltage: { avg: avg(voltages) }, current: { avg: avg(currents) }, power: { avg: avg(powers) } } }
  },

  getMachines: async () => {
    const token = localStorage.getItem('token')
    if (!token) return []
    try {
      const response = await fetch('http://localhost:5000/api/machines', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) return []
      return await response.json()
    } catch (err) {
      return []
    }
  },

  createMachine: async (machineData) => {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: 'Not authenticated' }
    try {
      const response = await fetch('http://localhost:5000/api/machines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(machineData)
      })
      const data = await response.json()
      if (!response.ok) return { success: false, message: data.error || 'Failed to create' }
      return { success: true, machine: { ...machineData, id: data.machineId } }
    } catch (err) {
      return { success: false, message: 'Network error' }
    }
  },

  deleteMachine: deleteMachineApi,

  getMachineDetails: async (machineId) => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      // 1. Get Machine Info
      const response = await fetch(`http://localhost:5000/api/machines/${machineId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) return null
      const machine = await response.json()

      // 2. Generate Mock Telemetry (since backend doesn't have telemetry history yet)
      const telemetry = {
        voltage: randomBetween(220, 235),
        current: randomBetween(15, 23),
        power: randomBetween(4000, 7000),
        temperature: randomBetween(40, 60),
        humidity: randomBetween(40, 60),
      }

      return {
        id: machine.id,
        name: machine.name,
        status: machine.status,
        specifications: {
          maxVoltage: 240,
          maxCurrent: 25,
          maxPower: 8000,
          efficiency: 0.92,
          manufacturer: 'Unknown', // Not in DB
          model: machine.model || 'Standard',
          installationDate: machine.created_at,
        },
        telemetry,
        healthScore: machine.status === 'active' ? 95 : 50,
        maintenanceLogs: [],
      }
    } catch (err) {
      return null
    }
  },

  getAlerts: async () => {
    const token = localStorage.getItem('token')
    if (!token) return []
    try {
      const response = await fetch('http://localhost:5000/api/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) return []
      return await response.json()
    } catch (err) {
      return []
    }
  },

  acknowledgeAlert: async () => ({ success: true }),

  generateReport: async (type, startDate, endDate) => ({
    type,
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
    data: {
      totalPower: randomBetween(100000, 500000),
      averageVoltage: randomBetween(220, 240),
      averageCurrent: randomBetween(10, 50),
      alerts: Math.floor(randomBetween(0, 20)),
    },
  }),

  getUsers: async () => ([
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Operator One', email: 'op1@example.com', role: 'operator', status: 'active' },
  ]),

  createUser: async ({ name, email, role = 'operator', status = 'active' }) => ({
    success: true,
    user: { id: Date.now(), name, email, role, status },
  }),

  updateUser: async (userId, payload) => ({ success: true, user: { id: userId, ...payload } }),

  deleteUser: async () => ({ success: true }),

  getSettings: async () => ({
    thresholds: {
      voltage: { min: 200, max: 250 },
      current: { min: 5, max: 60 },
      power: { min: 1000, max: 15000 },
    },
    alertRules: [],
    apiKeys: [],
  }),
}

