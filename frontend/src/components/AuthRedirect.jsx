"use client"

import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (user) {
    console.log(user)
    console.log(user.user_type)

    switch (user.user_type) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />
      case "seller":
        return <Navigate to="/seller/dashboard" replace />
      case "user":
      default:
        return <Navigate to="/home" replace />
    }
  }
  return children
}

export default AuthRedirect