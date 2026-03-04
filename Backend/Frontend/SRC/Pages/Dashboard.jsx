import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import SparklineChart from '../components/SparklineChart'
import AnomalyIndicator from '../components/AnomalyIndicator'
import { Zap, Gauge, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 5000)
    return () => clearInterval(interval)
  }, [selectedMachine])

  const loadDashboardData = async () => {
    try {
      // 1. Fetch real machines from DB
      const machinesList = await api.getMachines()

      // If no machines in DB, fallback to empty or handle gracefully
      // For now, we use the fetched list. 
      // If the list is empty, we can't show much, but at least it matches the Machines page.

      const now = Date.now()
      // Generate mock power history
      const powerHistory = Array.from({ length: 30 }).map((_, idx) => ({
        time: now - (29 - idx) * 60 * 1000,
        value: 4000 + Math.random() * 3000
      }))

      const voltage = 220 + Math.random() * 15
      const current = 15 + Math.random() * 8
      const power = voltage * current

      // 2. Fetch real alerts
      const alertsList = await api.getAlerts()

      setData({
        voltage,
        current,
        power,
        powerHistory,
        anomalyDetected: Math.random() > 0.85,
        machines: machinesList,
      })
      setAlerts(alertsList)
      setLoading(false)
    } catch (e) {
      console.error("Dashboard load failed", e)
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  // Generate sparkline data
  const sparklineData = data.powerHistory.slice(-20).map((item, idx) => ({
    value: item.value,
    time: idx
  }))

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={18} className="text-red-500" />
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-500" />
      case 'info':
        return <CheckCircle size={18} className="text-blue-500" />
      default:
        return <AlertTriangle size={18} />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800'
    }
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time power monitoring</p>
          </div>

          {/* Machine Selector */}
          {isAdmin() && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Machine:</label>
              <select
                value={selectedMachine || ''}
                onChange={(e) => setSelectedMachine(e.target.value || null)}
                className="input-field w-auto"
              >
                <option value="">All Machines</option>
                {data.machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name} ({machine.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Power Graph first */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Power Consumption Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.powerHistory}>
              <defs>
                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                stroke="#6b7280"
              />
              <YAxis
                label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
                stroke="#6b7280"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelFormatter={(time) => new Date(time).toLocaleString()}
                formatter={(value) => [`${(value / 1000).toFixed(2)} kW`, 'Power']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorPower)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts next */}
        <div className="card border-l-4 border-primary-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <AlertTriangle className="text-primary-600" size={24} />
              Recent Alerts
            </h2>
            <Link to="/alerts" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold">
              View All →
            </Link>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p>No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{alert.type}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${alert.severity === 'critical'
                          ? 'bg-red-500 text-white'
                          : alert.severity === 'warning'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                          }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.machine} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anomaly Indicator */}
        <AnomalyIndicator detected={data.anomalyDetected} />

        {/* Real-time Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Voltage Card */}
          <div className="card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Gauge className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Voltage</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {data.voltage.toFixed(1)} V
                  </p>
                </div>
              </div>
            </div>
            <SparklineChart data={sparklineData} color="#3b82f6" />
          </div>

          {/* Current Card */}
          <div className="card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Activity className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {data.current.toFixed(1)} A
                  </p>
                </div>
              </div>
            </div>
            <SparklineChart data={sparklineData} color="#10b981" />
          </div>

          {/* Power Card */}
          <div className="card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Zap className="text-yellow-600 dark:text-yellow-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Power</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {(data.power / 1000).toFixed(1)} kW
                  </p>
                </div>
              </div>
            </div>
            <SparklineChart data={sparklineData} color="#f59e0b" />
          </div>
        </div>
      </div>
    </Layout>
  )
}

