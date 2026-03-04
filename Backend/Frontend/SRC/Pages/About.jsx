import Layout from '../components/Layout'
import { Target, Users, Award, Globe, Mail, Phone, MapPin, Zap, Activity, AlertTriangle, TrendingUp, Shield } from 'lucide-react'

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Power Monitoring System</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Advanced industrial power monitoring and analytics platform
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            To provide industries with comprehensive, real-time power monitoring solutions that 
            enable efficient energy management, predictive maintenance, and operational excellence.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Our system helps organizations reduce energy costs, prevent equipment failures, 
            and maintain optimal performance across all industrial operations.
          </p>
        </div>

        {/* Features */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Zap className="text-primary-600 dark:text-primary-400 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Real-Time Monitoring</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live tracking of voltage, current, and power consumption</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="text-primary-600 dark:text-primary-400 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Historical Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive data analysis with detailed reports</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-primary-600 dark:text-primary-400 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Alert System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instant notifications for anomalies and critical events</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="text-primary-600 dark:text-primary-400 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Machine Health</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitor equipment status and maintenance schedules</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="text-primary-600 dark:text-primary-400 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Role-Based Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admin and Operator roles with appropriate permissions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="text-primary-600 dark:text-primary-400 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Data Export</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Export historical data and reports in multiple formats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-1" size={24} />
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-primary-100">support@powermonitor.com</p>
                <p className="text-primary-100">info@powermonitor.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1" size={24} />
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-primary-100">+1 (555) 123-4567</p>
                <p className="text-primary-100">+1 (555) 987-6543</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1" size={24} />
              <div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p className="text-primary-100">123 Industrial Blvd</p>
                <p className="text-primary-100">Tech City, TC 12345</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

