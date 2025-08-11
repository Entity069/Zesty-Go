"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, allowedRoles = null }) => {
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

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles) {
    return children
  }
  
  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/403" replace />
  }

  return children
}

export default ProtectedRoute