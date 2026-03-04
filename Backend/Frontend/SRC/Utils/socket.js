/**
 * Socket.IO client for real-time updates from the Power Monitoring System backend.
 * 
 * Usage:
 * import { initSocket, disconnectSocket } from './utils/socket'
 * 
 * // Initialize connection
 * const socket = initSocket()
 * 
 * // Listen for events
 * socket.on('new_telemetry', (data) => {
 *   console.log('New telemetry:', data)
 * })
 * 
 * socket.on('new_alert', (alert) => {
 *   console.log('New alert:', alert)
 * })
 * 
 * // Disconnect when done
 * disconnectSocket()
 */

import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

/**
 * Initialize Socket.IO connection
 * @returns {Socket} Socket.IO client instance
 */
export const initSocket = () => {
  if (socket && socket.connected) {
    return socket
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('Connected to Power Monitoring System server')
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from server')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  socket.on('connected', (data) => {
    console.log('Server message:', data.message)
  })

  return socket
}

/**
 * Get current socket instance
 * @returns {Socket|null} Socket.IO client instance or null
 */
export const getSocket = () => {
  return socket
}

/**
 * Disconnect Socket.IO connection
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Listen for new telemetry data
 * @param {Function} callback Callback function to handle telemetry data
 */
export const onNewTelemetry = (callback) => {
  if (!socket) {
    initSocket()
  }
  socket.on('new_telemetry', callback)
}

/**
 * Listen for new alerts
 * @param {Function} callback Callback function to handle alert data
 */
export const onNewAlert = (callback) => {
  if (!socket) {
    initSocket()
  }
  socket.on('new_alert', callback)
}

/**
 * Remove telemetry listener
 * @param {Function} callback Callback function that was registered
 */
export const offNewTelemetry = (callback) => {
  if (socket) {
    socket.off('new_telemetry', callback)
  }
}

/**
 * Remove alert listener
 * @param {Function} callback Callback function that was registered
 */
export const offNewAlert = (callback) => {
  if (socket) {
    socket.off('new_alert', callback)
  }
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  onNewTelemetry,
  onNewAlert,
  offNewTelemetry,
  offNewAlert,
}

