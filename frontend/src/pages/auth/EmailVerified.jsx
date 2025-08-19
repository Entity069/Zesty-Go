"use client"

import { useState, useEffect } from "react"
import { Card, Button } from "react-bootstrap"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../context/ToastContext"

const EmailVerified = () => {
  const [loading, setLoading] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState(null) // 'success', 'error', null
  const [message, setMessage] = useState("")
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { theme, toggleTheme } = useTheme()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      
      if (!token) {
        setVerificationStatus("error")
        setMessage("Verification token is missing. Please check your email link.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (data.success) {
          setVerificationStatus("success")
          setMessage(data.msg)
        } else {
          setVerificationStatus("error")
          setMessage(data.msg)
        }
      } catch (error) {
        setVerificationStatus("error")
        setMessage("An error occurred during verification.")
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, showSuccess, showError])

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
            {loading ? (
              <div className="mb-4 text-center">
                <div className="mb-3">
                  <i className="fas fa-spinner fa-spin text-primary" style={{ fontSize: "4rem" }}></i>
                </div>
                <h2 className="fw-bold mb-2">Verifying Email...</h2>
                <p className="text-muted">Please wait while we verify your email address.</p>
              </div>
            ) : (
              <div className="mb-4 text-center">
                <div className="mb-3">
                  <i className={`fas ${verificationStatus === "success" ? "fa-check-circle text-success" : "fa-times-circle text-danger"}`} style={{ fontSize: "4rem" }}></i>
                </div>
                <h2 className="fw-bold mb-2">
                  {verificationStatus === "success" ? "Email Verified!" : "Verification Failed"}
                </h2>
                <p className="text-muted">{message}</p>
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              {verificationStatus === "success" && (
                <Button variant="primary" className="w-100 rounded-3 fw-semibold py-3" onClick={() => navigate("/login")}>
                  <i className="fas fa-sign-in-alt me-2"></i>Continue to Sign In
                </Button>
              )}
              
              {verificationStatus === "error" && (
                <>
                  <Button variant="outline-primary" className="w-100 rounded-3 fw-semibold py-3" onClick={() => navigate("/login")}>
                    <i className="fas fa-arrow-left me-2"></i>Back to Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default EmailVerified
