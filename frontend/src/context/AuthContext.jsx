import { createContext, useContext, useEffect, useState } from 'react'

import {
  getCurrentUser,
  logoutUser,
} from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadCurrentUser() {
    try {
      const result = await getCurrentUser()

      if (result.success) {
        setUser(result.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCurrentUser()
  }, [])

  async function logout() {
    try {
      await logoutUser()
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser: loadCurrentUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}