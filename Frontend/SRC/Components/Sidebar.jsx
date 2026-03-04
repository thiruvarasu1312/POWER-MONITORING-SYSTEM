import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  History,
  AlertTriangle,
  FileText,
  Settings,
  Users,
  Home,
  Info,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// All menu items with admin-only flag
const allMenuItems = [
  { path: '/', icon: Home, label: 'Home', adminOnly: false },
  { path: '/about', icon: Info, label: 'About', adminOnly: false },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { path: '/historical', icon: History, label: 'Historical Data', adminOnly: false },
  { path: '/machines', icon: Settings, label: 'Machines', adminOnly: true },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts', adminOnly: false },
  { path: '/reports', icon: FileText, label: 'Reports', adminOnly: false },
  { path: '/users', icon: Users, label: 'User Management', adminOnly: true },
  { path: '/settings', icon: Settings, label: 'Settings', adminOnly: true },
]

export default function Sidebar() {
  const location = useLocation()
  const { logout, isAdmin } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin())

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-industrial-dark dark:bg-industrial-darker border-r border-gray-700 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-primary-400 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                ⚡
              </div>
              Power Monitor
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

