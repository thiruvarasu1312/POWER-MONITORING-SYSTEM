import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../utils/api'
import { Settings as SettingsIcon, Save, Plus, Trash2, Key, AlertCircle, Gauge } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { isAdmin } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('thresholds')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const result = await api.getSettings()
      setSettings(result)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setLoading(false)
    }
  }

  const handleSave = () => {
    // Save settings (placeholder)
    alert('Settings saved successfully!')
  }

  const handleThresholdChange = (metric, field, value) => {
    setSettings({
      ...settings,
      thresholds: {
        ...settings.thresholds,
        [metric]: {
          ...settings.thresholds[metric],
          [field]: parseFloat(value)
        }
      }
    })
  }

  if (loading || !settings) {
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <SettingsIcon size={32} />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {[
              { id: 'thresholds', label: 'Thresholds', icon: Gauge },
              { id: 'alerts', label: 'Alert Rules', icon: AlertCircle },
              { id: 'api', label: 'API Keys', icon: Key },
              { id: 'appearance', label: 'Appearance', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Thresholds Tab */}
        {activeTab === 'thresholds' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Power Thresholds</h2>
            <div className="space-y-6">
              {['voltage', 'current', 'power'].map((metric) => (
                <div key={metric} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-4 capitalize text-gray-800 dark:text-gray-200">{metric} Thresholds</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum
                      </label>
                      <input
                        type="number"
                        value={settings.thresholds[metric].min}
                        onChange={(e) => handleThresholdChange(metric, 'min', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maximum
                      </label>
                      <input
                        type="number"
                        value={settings.thresholds[metric].max}
                        onChange={(e) => handleThresholdChange(metric, 'max', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert Rules Tab */}
        {activeTab === 'alerts' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Alert Rules</h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus size={18} />
                Add Rule
              </button>
            </div>
            <div className="space-y-4">
              {settings.alertRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{rule.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rule.severity === 'critical'
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {rule.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rule.enabled
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {rule.condition}
                      </p>
                    </div>
                    <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-4">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">API Keys</h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus size={18} />
                Generate Key
              </button>
            </div>
            <div className="space-y-4">
              {settings.apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{key.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{key.key}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Created: {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-4">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Appearance Settings</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Theme Mode</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="btn-secondary"
                  >
                    {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>
    </Layout>
  )
}

