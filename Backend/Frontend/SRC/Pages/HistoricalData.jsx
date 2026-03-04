import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Calendar, AlertCircle } from 'lucide-react'

export default function HistoricalData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [chartType, setChartType] = useState('line')

  // Generate mock historical data
  const generateMockData = () => {
    const result = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      for (let hour = 0; hour < 24; hour++) {
        const voltage = 415 + Math.sin(hour / 24 * Math.PI * 2) * 20 + Math.random() * 10
        const current = 25 + Math.sin(hour / 24 * Math.PI * 2) * 8 + Math.random() * 5
        const power = (voltage * current * 1.732 / 1000)

        result.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: `${String(hour).padStart(2, '0')}:00`,
          timestamp: new Date(d.getTime() + hour * 60 * 60 * 1000).toISOString(),
          voltage: Math.round(voltage * 100) / 100,
          current: Math.round(current * 100) / 100,
          power: Math.round(power * 100) / 100,
          frequency: 50 + (Math.random() - 0.5) * 0.3,
          efficiency: 85 + Math.random() * 10,
          temperature: 35 + Math.sin(hour / 24 * Math.PI * 2) * 5 + Math.random() * 3
        })
      }
    }

    return result
  }

  // Load data on mount and when dates change
  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const loadData = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      const mockData = generateMockData()
      setData(mockData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = {
    voltage: {
      min: data.length ? Math.min(...data.map(d => d.voltage)) : 0,
      max: data.length ? Math.max(...data.map(d => d.voltage)) : 0,
      avg: data.length ? (data.reduce((sum, d) => sum + d.voltage, 0) / data.length).toFixed(2) : 0
    },
    current: {
      min: data.length ? Math.min(...data.map(d => d.current)) : 0,
      max: data.length ? Math.max(...data.map(d => d.current)) : 0,
      avg: data.length ? (data.reduce((sum, d) => sum + d.current, 0) / data.length).toFixed(2) : 0
    },
    power: {
      min: data.length ? Math.min(...data.map(d => d.power)) : 0,
      max: data.length ? Math.max(...data.map(d => d.power)) : 0,
      avg: data.length ? (data.reduce((sum, d) => sum + d.power, 0) / data.length).toFixed(2) : 0,
      total: data.length ? data.reduce((sum, d) => sum + d.power, 0).toFixed(2) : 0
    }
  }

  const handleExport = () => {
    if (data.length === 0) return

    const csv = [
      ['Date', 'Time', 'Voltage (V)', 'Current (A)', 'Power (kW)', 'Frequency (Hz)', 'Temperature (°C)'],
      ...data.map(item => [
        item.date,
        item.time,
        item.voltage,
        item.current,
        item.power,
        item.frequency.toFixed(2),
        item.temperature.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historical-data-${startDate}-to-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Group daily data for daily view
  const dailyData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item.date)
    if (existing) {
      existing.voltage = (parseFloat(existing.voltage) + item.voltage) / 2
      existing.current = (parseFloat(existing.current) + item.current) / 2
      existing.power = (parseFloat(existing.power) + item.power) / 2
    } else {
      acc.push({
        date: item.date,
        voltage: item.voltage,
        current: item.current,
        power: item.power
      })
    }
    return acc
  }, [])

  const chartData = chartType === 'daily' ? dailyData : data.slice(0, 100)

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Historical Data</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analyze power consumption trends</p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline mr-2" size={16} />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="daily">Daily Average</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExport}
                disabled={data.length === 0 || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadData}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No data available for selected date range</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Voltage (V)</h3>
                <div className="space-y-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                  <div className="flex justify-between"><span>Min:</span> <span>{stats.voltage.min.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Max:</span> <span>{stats.voltage.max.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span>Avg:</span> <span>{stats.voltage.avg}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Current (A)</h3>
                <div className="space-y-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                  <div className="flex justify-between"><span>Min:</span> <span>{stats.current.min.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Max:</span> <span>{stats.current.max.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span>Avg:</span> <span>{stats.current.avg}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Power (kW)</h3>
                <div className="space-y-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                  <div className="flex justify-between"><span>Min:</span> <span>{stats.power.min.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Max:</span> <span>{stats.power.max.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span>Total:</span> <span className="text-blue-600">{stats.power.total} kWh</span></div>
                </div>
              </div>
            </div>

            {/* Voltage Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Voltage Readings (V)</h2>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="voltage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="voltage" fill="#3b82f6" stroke="#3b82f6" />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="voltage" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Current Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Current Readings (A)</h2>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="current" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="current" fill="#10b981" stroke="#10b981" />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="current" stroke="#10b981" dot={false} strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Power Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Power Consumption (kW)</h2>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="power" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="power" fill="#f59e0b" stroke="#f59e0b" />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="power" stroke="#f59e0b" dot={false} strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Detailed Data</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-right py-3 px-4 font-semibold">Voltage (V)</th>
                    <th className="text-right py-3 px-4 font-semibold">Current (A)</th>
                    <th className="text-right py-3 px-4 font-semibold">Power (kW)</th>
                    <th className="text-right py-3 px-4 font-semibold">Temp (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((item, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">{item.date} {item.time}</td>
                      <td className="text-right py-3 px-4">{item.voltage}</td>
                      <td className="text-right py-3 px-4">{item.current}</td>
                      <td className="text-right py-3 px-4">{item.power}</td>
                      <td className="text-right py-3 px-4">{item.temperature.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

