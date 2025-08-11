"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const RoleDashboard = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (user) {
      const userRole = user.user_type
      
      switch (userRole) {
        case "admin":
          navigate("/admin/dashboard", { replace: true })
          break
        case "seller":
          navigate("/seller/dashboard", { replace: true })
          break
        case "user":
        default:
          navigate("/home", { replace: true })
          break
      }
    } else {
      navigate("/login", { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Redirecting...</span>
      </div>
    </div>
  )
}

export default RoleDashboard