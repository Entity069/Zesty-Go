"use client"

import { Container, Row, Col, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

const NotFound = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleGoHome = () => {
    if (user) {
      switch (user.user_type) {
        case "admin":
          navigate("/admin/dashboard")
          break
        case "seller":
          navigate("/seller/dashboard")
          break
        default:
          navigate("/home")
      }
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="reg-body min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden py-4 px-3">

      <div className="position-fixed top-0 start-50 translate-middle-x mt-4 text-center" style={{ zIndex: 1000 }}>
        <h1 className="brand-reg fw-bold fs-1 mb-2">
          <i className="fas fa-utensils me-2"></i>Zesty
        </h1>
        <p className="brand-tagline small fw-normal">Delicious food, delivered fresh</p>
      </div>

      <button 
        className="btn theme-toggle position-fixed top-0 end-0 mt-4 me-4 rounded-3 p-3 transition-all" 
        onClick={toggleTheme}
        style={{ zIndex: 1000 }}
      >
        <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
      </button>

      <div className="auth-card rounded-4 w-100" style={{ maxWidth: "450px", marginTop: "6rem", zIndex: 10 }}>
        <div className="auth-content p-4 p-md-5">
          <div className="auth-form">
            <div className="mb-4 text-center">
              <div className="mb-3">
                <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: "4rem" }}></i>
              </div>
              <h2 className="fw-bold mb-2">Oops!</h2>
              <p className="text-muted">Something went wrong</p>
            </div>
            <div className="mb-4">
              <p className="text-muted text-center">
                The page you're looking for doesn't exist. Don't worry, you are not schizophrenic.
              </p>
            </div>
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={handleGoHome} className="fw-semibold">
                <i className="fas fa-home me-2"></i>Go Home
              </Button>
              <Button variant="outline-secondary" onClick={() => window.history.back()} className="fw-semibold">
                <i className="fas fa-arrow-left me-2"></i>Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
