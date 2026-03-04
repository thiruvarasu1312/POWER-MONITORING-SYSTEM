import { Link } from 'react-router-dom'
import { ArrowRight, Activity, TrendingUp, Shield, Zap } from 'lucide-react'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center py-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl text-white shadow-2xl">
          <h1 className="text-5xl font-bold mb-4">Industrial Power Monitoring System</h1>
          <p className="text-xl text-primary-100 mb-8">
            Real-time monitoring and analytics for large-scale industrial power systems
          </p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
            View Dashboard
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="text-primary-600 dark:text-primary-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Monitoring</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Live tracking of voltage, current, and power consumption
            </p>
          </div>

          <div className="card text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Historical Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive data analysis with detailed reports
            </p>
          </div>

          <div className="card text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Alert System</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Instant notifications for anomalies and critical events
            </p>
          </div>

          <div className="card text-center hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-yellow-600 dark:text-yellow-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Machine Health</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor equipment status and maintenance schedules
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-blue-100">Continuous Monitoring</div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-green-100">Uptime Guarantee</div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-4xl font-bold mb-2">100+</div>
            <div className="text-purple-100">Machines Monitored</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

