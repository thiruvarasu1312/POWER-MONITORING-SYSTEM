import SparklineChart from './SparklineChart'
import { Settings, Clock, Trash2 } from 'lucide-react'

export default function MachineCard({ machine, sparklineData, onDelete }) {

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    }
  }

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'No data'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="card hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Settings className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {machine.name}
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {machine.model && <span>{machine.model}</span>}
              {machine.type && <span> • {machine.type}</span>}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 inline-block ${getStatusColor(machine.status)}`}>
              {machine.status}
            </span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(machine.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete Machine"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        {machine.location && (
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Loc:</span> {machine.location}
          </div>
        )}
        {machine.rated_power && (
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Power:</span> {machine.rated_power} kW
          </div>
        )}
      </div>

      {/* Last Update Time */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Clock size={16} />
        <span>Last update: {formatLastUpdate(machine.lastUpdate)}</span>
      </div>

      {/* Sparkline Graph */}
      {sparklineData && sparklineData.length > 0 ? (
        <div className="mb-4 h-16">
          <SparklineChart
            data={sparklineData.map((item, idx) => ({ value: item.power || item.value || 0, time: idx }))}
            color="#0ea5e9"
          />
        </div>
      ) : (
        <div className="mb-4 h-16 flex items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      )}

    </div>
  )
}
