import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../utils/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts'
import { Wrench, Activity, TrendingUp, AlertCircle } from 'lucide-react'

export default function MachineDetails() {
  const { id } = useParams()
  const [machine, setMachine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMachineDetails()
    const interval = setInterval(loadMachineDetails, 5000)
    return () => clearInterval(interval)
  }, [id])

  const loadMachineDetails = async () => {
    try {
      const result = await api.getMachineDetails(id || 1)
      setMachine(result)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load machine details:', error)
      setLoading(false)
    }
  }

  if (loading || !machine) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  // Generate trend data
  const trendData = Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString('en-US', { hour: '2-digit' }),
    power: machine.telemetry.power + (Math.random() - 0.5) * 1000,
    voltage: machine.telemetry.voltage + (Math.random() - 0.5) * 10,
    current: machine.telemetry.current + (Math.random() - 0.5) * 5,
  }))

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{machine.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed machine information and monitoring</p>
        </div>

        {/* Health Score */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 mb-2">Machine Health Score</p>
              <p className={`text-5xl font-bold ${getHealthColor(machine.healthScore)}`}>
                {machine.healthScore}%
              </p>
            </div>
            <div className="text-right">
              <TrendingUp size={48} className="opacity-50" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Specifications */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Activity size={24} />
              Specifications
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Max Voltage:</span>
                <span className="font-semibold">{machine.specifications.maxVoltage} V</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Max Current:</span>
                <span className="font-semibold">{machine.specifications.maxCurrent} A</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Max Power:</span>
                <span className="font-semibold">{(machine.specifications.maxPower / 1000).toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
                <span className="font-semibold">{(machine.specifications.efficiency * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Manufacturer:</span>
                <span className="font-semibold">{machine.specifications.manufacturer}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Model:</span>
                <span className="font-semibold">{machine.specifications.model}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Installation Date:</span>
                <span className="font-semibold">{machine.specifications.installationDate}</span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Activity size={24} />
              Real-time Telemetry
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Voltage</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {machine.telemetry.voltage.toFixed(1)} V
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {machine.telemetry.current.toFixed(1)} A
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Power</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {(machine.telemetry.power / 1000).toFixed(1)} kW
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Temperature</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {machine.telemetry.temperature.toFixed(1)}°C
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Humidity</p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {machine.telemetry.humidity.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <TrendingUp size={24} />
            Trend Analysis (Last 24 Hours)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="power" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPower)" name="Power (W)" />
              <Area type="monotone" dataKey="voltage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVoltage)" name="Voltage (V)" />
              <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} name="Current (A)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Logs */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Wrench size={24} />
            Maintenance Logs
          </h2>
          <div className="space-y-4">
            {machine.maintenanceLogs.map((log, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      log.type === 'Routine' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                    }`}>
                      {log.type}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{log.date}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{log.description}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Technician: <span className="font-semibold">{log.technician}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

