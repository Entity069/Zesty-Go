"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/whoami", {
        credentials: "include",
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user || userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 8
  }

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
       setUser(data.user)
      }
      return data
    } catch (error) {
      return { success: false, msg: "Request failed successfully." }
    }
  }

  const register = async (regdata) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(regdata),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, msg: "Request failed successfully." }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, msg: "Request failed successfully." }
    }
  }

  const resetPassword = async (password) => {
    try {
      const token = new URLSearchParams(window.location.search).get("token")
      const response = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, msg: "Request failed successfully." }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "GET",
      })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    validateEmail,
    validatePassword,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
