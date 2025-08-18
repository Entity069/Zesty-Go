"use client"

import { useState, useEffect } from "react"
import { Card, Form, Button, FloatingLabel } from "react-bootstrap"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { useTheme } from "../../context/ThemeContext"

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  })
  const [showPassword, setShowPassword] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  const navigate = useNavigate()
  const { resetPassword, validatePassword } = useAuth()
  const { showSuccess, showError } = useToast()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      navigate("/403")
    }
  }, [searchParams, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { newPassword, confirmNewPassword } = formData

    if (!validatePassword(newPassword)) {
      showError("Invalid Password", "Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmNewPassword) {
      showError("Password Mismatch", "Passwords do not match! Please try again.")
      return
    }

    setLoading(true)
    const result = await resetPassword(newPassword)

    if (result.success) {
      showSuccess("Password Updated!", result.msg)
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } else {
      showError("Request Failed", result.msg)
    }
    setLoading(false)
  }

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
              <h2 className="fw-bold mb-2">Choose New Password</h2>
              <p className="text-muted">Create a strong password for your account</p>
            </div>

            <Form onSubmit={handleSubmit}>
              <div className="position-relative mb-3">
                <FloatingLabel controlId="newPassword" label="New Password">
                  <Form.Control
                    type={showPassword.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="rounded-3"
                    placeholder="New Password"
                    required
                  />
                </FloatingLabel>
                <Button
                  variant="link"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("newPassword")}
                >
                  <i className={`far ${showPassword.newPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </Button>
              </div>

              <div className="position-relative mb-4">
                <FloatingLabel controlId="confirmNewPassword" label="Confirm New Password">
                  <Form.Control
                    type={showPassword.confirmNewPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    className="rounded-3"
                    placeholder="Confirm Password"
                    required
                  />
                </FloatingLabel>
                <Button
                  variant="link"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirmNewPassword")}
                >
                  <i className={`far ${showPassword.confirmNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </Button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-100 mb-4 rounded-3 fw-semibold py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>Changing Password...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>Update Password
                  </>
                )}
              </Button>
            </Form>

            <div className="text-center">
              <Button
                variant="link"
                className="text-decoration-none fw-semibold text-orange p-0"
                onClick={() => navigate("/login")}
              >
                <i className="fas fa-arrow-left me-1"></i> Back to Sign In
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ResetPassword
