import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_API_URL || '/'
    const socketInstance = io(serverUrl, {
      withCredentials: true
    })

    socketInstance.on('connect', () => {
      if (user?._id) {
        socketInstance.emit('setup', user._id)
      }
    })

    socketInstance.on('notification', (data) => {
      toast(data.message, {
        icon: '🔔',
        duration: 5000
      })
    })

    socketInstance.on('getOnlineUsers', (users) => {
      setOnlineUsers(users)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within a SocketProvider')
  return context
}
