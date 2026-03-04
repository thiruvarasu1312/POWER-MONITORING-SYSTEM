import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import MachineCard from '../components/MachineCard'
import AddMachineModal from '../components/AddMachineModal'
import { Settings, Plus } from 'lucide-react'

export default function Machines() {
  const [machines, setMachines] = useState([])
  const [machineTelemetry, setMachineTelemetry] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const { isAdmin } = useAuth()

  useEffect(() => {
    loadMachines()
  }, [])

  const loadMachines = async () => {
    try {
      setLoading(true)
      const machinesList = await api.getMachines()
      setMachines(machinesList)

      // Fetch telemetry data for each machine (optimized - only last 24 hours, max 30 records)
      const telemetryPromises = machinesList.map(async (machine) => {
        try {
          // Get recent telemetry for last update time and sparkline (last 24 hours, max 30 records)
          const now = new Date()
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          const historyResult = await api.getHistoricalData(
            yesterday.toISOString(),
            now.toISOString(),
            machine.id
          )

          const telemetryData = historyResult.data || []
          const latestTelemetry = telemetryData.length > 0 ? telemetryData[telemetryData.length - 1] : null

          // Get last 20 data points for sparkline (or all if less than 20)
          const sparklineData = telemetryData.slice(-20).map(t => ({
            power: t.power || 0,
            timestamp: t.timestamp
          }))

          return {
            machineId: machine.id,
            lastUpdate: latestTelemetry?.timestamp || null,
            sparklineData: sparklineData.length > 0 ? sparklineData : null
          }
        } catch (error) {
          console.error(`Failed to load telemetry for machine ${machine.id}:`, error)
          return {
            machineId: machine.id,
            lastUpdate: null,
            sparklineData: null
          }
        }
      })

      const telemetryResults = await Promise.all(telemetryPromises)
      const telemetryMap = {}
      telemetryResults.forEach(result => {
        telemetryMap[result.machineId] = {
          lastUpdate: result.lastUpdate,
          sparklineData: result.sparklineData
        }
      })
      setMachineTelemetry(telemetryMap)

      setLoading(false)
    } catch (error) {
      console.error('Failed to load machines:', error)
      setLoading(false)
    }
  }

  const handleMachineAdded = () => {
    loadMachines()
  }

  const handleDeleteMachine = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      const result = await api.deleteMachine(id)
      if (result.success) {
        loadMachines()
      } else {
        alert(result.message || 'Failed to delete machine')
      }
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Machines</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all machines</p>
            </div>
            {isAdmin() && (
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Add Machine button for Admin */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Machines</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all machines</p>
          </div>
          {isAdmin() && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Plus size={20} />
              <span>Add Machine</span>
            </button>
          )}
        </div>

        {/* Machines Grid */}
        {machines.length === 0 ? (
          <div className="card text-center py-12">
            <Settings size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">No machines found</p>
            {isAdmin() && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
              >
                <Plus size={20} />
                <span>Add Your First Machine</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={{
                  ...machine,
                  lastUpdate: machineTelemetry[machine.id]?.lastUpdate
                }}
                sparklineData={machineTelemetry[machine.id]?.sparklineData}
                onDelete={isAdmin() ? handleDeleteMachine : null}
              />
            ))}
          </div>
        )}

        {/* Add Machine Modal */}
        <AddMachineModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleMachineAdded}
        />
      </div>
    </Layout>
  )
}

