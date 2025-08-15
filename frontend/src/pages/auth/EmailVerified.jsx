"use client"

import { Card, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"

const EmailVerified = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="reg-body min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden py-4 px-3">
      <div className="position-fixed top-0 start-50 translate-middle-x mt-4 text-center" style={{ zIndex: 1000 }}>
        <h1 className="brand fw-bold fs-1 mb-2">
          <i className="fas fa-utensils me-2"></i>Zesty
        </h1>
        <p className="brand-tagline small fw-normal">Delicious food, delivered fresh</p>
      </div>

      <Button
        variant="link"
        className="theme-toggle position-fixed top-0 end-0 mt-4 me-4 rounded-3 p-3"
        onClick={toggleTheme}
        style={{ zIndex: 1000 }}
      >
        <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
      </Button>

      <Card className="auth-card rounded-4 w-100" style={{ maxWidth: "450px", marginTop: "6rem", zIndex: 10 }}>
        <Card.Body className="auth-content p-4 p-md-5">
          <div className="auth-form">
            <div className="mb-4 text-center">
              <div className="mb-3">
                <i className="fas fa-check-circle text-success" style={{ fontSize: "4rem" }}></i>
              </div>
              <h2 className="fw-bold mb-2">Email Verified!</h2>
              <p className="text-muted">Your email address has been successfully verified.</p>
            </div>

            <div className="d-flex flex-column gap-3">
              <Button variant="primary" className="w-100 rounded-3 fw-semibold py-3" onClick={() => navigate("/login")}>
                <i className="fas fa-sign-in-alt me-2"></i>Continue to Sign In
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default EmailVerified
