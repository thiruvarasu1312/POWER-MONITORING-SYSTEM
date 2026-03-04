import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../utils/api'

export default function AddMachineModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    type: '',
    location: '',
    rated_power: '',
    description: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name.trim()) {
      setError('Machine name is required')
      setLoading(false)
      return
    }

    try {
      // Prepare data for backend
      const machineData = {
        name: formData.name.trim(),
        model: formData.model?.trim() || 'Unknown',
        type: formData.type?.trim() || null,
        location: formData.location?.trim() || null,
        rated_power: formData.rated_power ? parseFloat(formData.rated_power) : null,
        description: formData.description?.trim() || null,
        status: formData.status || 'active'
      }

      const result = await api.createMachine(machineData)

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          model: '',
          type: '',
          location: '',
          rated_power: '',
          description: '',
          status: 'active'
        })
        onSuccess()
        onClose()
      } else {
        setError(result.message || 'Failed to create machine')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-industrial-darker rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Machine</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Machine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="Enter machine name"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., Series X-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., Generator"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., Floor 1, Zone B"
            />
          </div>

          <div>
            <label htmlFor="rated_power" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rated Power (kW)
            </label>
            <input
              type="number"
              id="rated_power"
              name="rated_power"
              value={formData.rated_power}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., 50.5"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., Main power backup"
              rows="2"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="active">Active (Running)</option>
              <option value="idle">Idle (Standby)</option>
              <option value="maintenance">Maintenance (Down)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Machine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
