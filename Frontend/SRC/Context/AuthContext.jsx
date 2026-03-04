import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [initializing, setInitializing] = useState(true)

  // Validate existing token on load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setInitializing(false)
      return
    }

    const loadUser = async () => {
      const result = await api.getCurrentUser()
      if (result?.success) {
        setUser(result.user)
        localStorage.setItem('user', JSON.stringify(result.user))
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
      setInitializing(false)
    }

    loadUser()
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Get JWT token for API requests
  const getToken = () => localStorage.getItem('token')

  const isAdmin = () => user?.role === 'admin'
  const isOperator = () => user?.role === 'operator'

  return (
    <AuthContext.Provider value={{ 
      user,
      initializing,
      login, 
      logout, 
      getToken,
      isAdmin,
      isOperator
    }}>
      {children}
    </AuthContext.Provider>
  )
}

