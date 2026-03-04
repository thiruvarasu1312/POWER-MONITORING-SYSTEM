import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { AlertTriangle, CheckCircle, XCircle, Filter, Check, Download } from 'lucide-react'

export default function Alerts() {
  const { isAdmin } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [filteredAlerts, setFilteredAlerts] = useState([])
  const [filters, setFilters] = useState({
    severity: 'all',
    acknowledged: 'all'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [alerts, filters])

  const loadAlerts = async () => {
    try {
      const result = await api.getAlerts()
      setAlerts(result)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load alerts:', error)
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...alerts]

    if (filters.severity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filters.severity)
    }

    if (filters.acknowledged !== 'all') {
      const acknowledged = filters.acknowledged === 'true'
      filtered = filtered.filter(alert => alert.acknowledged === acknowledged)
    }

    setFilteredAlerts(filtered)
  }

  const handleAcknowledge = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId)
      setAlerts(alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ))
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const handleDownloadReport = () => {
    const csvContent = [
      'ID,Machine,Type,Severity,Status,Timestamp',
      ...filteredAlerts.map(alert =>
        `${alert.id},${alert.machine},${alert.type},${alert.severity},${alert.acknowledged ? 'Acknowledged' : 'Unacknowledged'},${alert.timestamp}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alerts-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
        return <CheckCircle size={20} />
      default:
        return <AlertTriangle size={20} />
    }
  }

  if (loading && alerts.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Alerts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time system alerts and notifications</p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Filters</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="input-field"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.acknowledged}
                onChange={(e) => setFilters({ ...filters, acknowledged: e.target.value })}
                className="input-field"
              >
                <option value="all">All Alerts</option>
                <option value="false">Unacknowledged</option>
                <option value="true">Acknowledged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400">No alerts found</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`card border-l-4 ${getSeverityColor(alert.severity)} transition-all duration-300 hover:shadow-xl ${alert.acknowledged ? 'opacity-75' : ''
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {alert.type}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${alert.severity === 'critical'
                          ? 'bg-red-500 text-white'
                          : alert.severity === 'warning'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                          }`}>
                          {alert.severity}
                        </span>
                        {alert.acknowledged && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Machine: <span className="font-semibold">{alert.machine}</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.acknowledged && isAdmin() && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                      <Check size={18} />
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Download Button - For Everyone */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Download size={18} />
            Download Report
          </button>
        </div>

        {/* Alert Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{alerts.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {alerts.filter(a => a.severity === 'critical').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {alerts.filter(a => a.severity === 'warning').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {alerts.filter(a => a.acknowledged).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Acknowledged</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

