import { useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../utils/api'
import { Download, FileText, Calendar, Clock } from 'lucide-react'

export default function Reports() {
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState([])

  const generateReport = async (type, startDate, endDate) => {
    setLoading(true)
    try {
      const result = await api.generateReport(type, startDate, endDate)
      setReports([result, ...reports])
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (report) => {
    const content = `
Power Monitoring System - ${report.type} Report
Generated: ${new Date(report.generatedAt).toLocaleString()}
Period: ${new Date(report.startDate).toLocaleDateString()} to ${new Date(report.endDate).toLocaleDateString()}

Summary:
- Total Power: ${(report.data.totalPower / 1000).toFixed(2)} kWh
- Average Voltage: ${report.data.averageVoltage.toFixed(2)} V
- Average Current: ${report.data.averageCurrent.toFixed(2)} A
- Total Alerts: ${report.data.alerts}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `power-report-${report.type}-${report.startDate}.txt`
    a.click()
  }

  const today = new Date()
  const dailyStart = today.toISOString().split('T')[0]
  const weeklyStart = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0]
  const monthlyStart = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0]

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and export power monitoring reports</p>
        </div>

        {/* Quick Generate */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daily Report</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 24 hours</p>
              </div>
            </div>
            <button
              onClick={() => generateReport('daily', dailyStart, today.toISOString().split('T')[0])}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FileText size={18} />
                  Generate
                </>
              )}
            </button>
          </div>

          <div className="card hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Weekly Report</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</p>
              </div>
            </div>
            <button
              onClick={() => generateReport('weekly', weeklyStart, today.toISOString().split('T')[0])}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FileText size={18} />
                  Generate
                </>
              )}
            </button>
          </div>

          <div className="card hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Monthly Report</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 30 days</p>
              </div>
            </div>
            <button
              onClick={() => generateReport('monthly', monthlyStart, today.toISOString().split('T')[0])}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FileText size={18} />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Reports */}
        {reports.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Generated Reports</h2>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                          {report.type} Report
                        </h3>
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold">
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Period: {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                      </p>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Total Power</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {(report.data.totalPower / 1000).toFixed(2)} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Avg Voltage</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {report.data.averageVoltage.toFixed(2)} V
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Avg Current</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {report.data.averageCurrent.toFixed(2)} A
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Alerts</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {report.data.alerts}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExport(report)}
                      className="btn-secondary flex items-center gap-2 ml-4"
                    >
                      <Download size={18} />
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

