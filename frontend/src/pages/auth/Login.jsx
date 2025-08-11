"use client"

import { useState, useEffect } from "react"
import { Card, Form, Button, FloatingLabel, Row, Col } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { useTheme } from "../../context/ThemeContext"

const Login = () => {
  const [activeForm, setActiveForm] = useState("login")
  const [formData, setFormData] = useState({
    // login
    loginEmail: "",
    loginPassword: "",
    // register
    firstName: "",
    lastName: "",
    registerEmail: "",
    address: "",
    registerPassword: "",
    confirmPassword: "",
    agree: false,
    // forgot password
    forgotEmail: "",
  })
  const [showPassword, setShowPassword] = useState({})
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { user, login, register, forgotPassword, validateEmail, validatePassword } = useAuth()
  const { showSuccess, showError } = useToast()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (user) {
      switch (user.user_type) {
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
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const { loginEmail, loginPassword } = formData

    if (!validateEmail(loginEmail)) {
      showError("Invalid Email", "Please enter a valid email address.")
      return
    }

    if (!validatePassword(loginPassword)) {
      showError("Invalid Password", "Password must be at least 8 characters long.")
      return
    }

    setLoading(true)
    const result = await login(loginEmail, loginPassword)

    if (result.success) {
      showSuccess("Login Successful!", result.msg)
      
      console.log(result.user?.user_type)
      
      setTimeout(() => {
        switch (result.user?.user_type) {
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
      }, 1500)
    } else {
      showError("Login Failed:", result.msg)
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const { firstName, lastName, registerEmail, address, registerPassword, confirmPassword, agree } = formData

    if (!validateEmail(registerEmail)) {
      showError("Invalid Email", "Please enter a valid email address.")
      return
    }

    if (!validatePassword(registerPassword)) {
      showError("Invalid Password", "Password must be at least 8 characters long.")
      return
    }

    if (registerPassword !== confirmPassword) {
      showError("Password Mismatch", "Passwords do not match! Please try again.")
      return
    }

    if (!agree) {
      showError("Terms Required", "Please agree to the Terms of Service and Privacy Policy.")
      return
    }

    setLoading(true)
    const result = await register({
      first_name: firstName,
      last_name: lastName,
      email: registerEmail,
      password: registerPassword,
      address,
    })

    if (result.success) {
      showSuccess("Registration Successful", result.msg)
      setTimeout(() => {
        setActiveForm("login")
      }, 1500)
    } else {
      showError("Registration Failed", result.msg)
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    const { forgotEmail } = formData

    if (!validateEmail(forgotEmail)) {
      showError("Invalid email", "Please enter a valid email address.")
      return
    }

    setLoading(true)
    const result = await forgotPassword(forgotEmail)

    if (result.success) {
      showSuccess("Password reset link sent!", "An email has been sent to your email.")
      setTimeout(() => {
        setActiveForm("login")
      }, 1500)
    } else {
      showError("Request Failed", result.msg)
    }
    setLoading(false)
  }

  const switchForm = (formType) => {
    setActiveForm(formType)
    setFormData({
      loginEmail: "",
      loginPassword: "",
      firstName: "",
      lastName: "",
      registerEmail: "",
      address: "",
      registerPassword: "",
      confirmPassword: "",
      agree: false,
      forgotEmail: "",
    })
  }

  return (
    <div className="reg-body min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden py-4 px-3">

      <div className="position-fixed top-0 start-50 translate-middle-x mt-4 text-center" style={{ zIndex: 1000 }}>
        <h1 className="brand-reg fw-bold fs-1 mb-2">
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

          {activeForm === "login" && (
            <div className={`auth-form ${activeForm === "login" ? "" : "d-none"}`}>
              <div className="mb-4 text-center">
                <h2 className="fw-bold mb-2">Welcome Back</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>

              <Form onSubmit={handleLogin}>
                <FloatingLabel controlId="loginEmail" label="Email Address" className="mb-3">
                  <Form.Control
                    type="email"
                    name="loginEmail"
                    value={formData.loginEmail}
                    onChange={handleInputChange}
                    className="rounded-3"
                    placeholder="name@example.com"
                    required
                  />
                </FloatingLabel>

                <div className="position-relative mb-3">
                  <FloatingLabel controlId="loginPassword" label="Password">
                    <Form.Control
                      type={showPassword.loginPassword ? "text" : "password"}
                      name="loginPassword"
                      value={formData.loginPassword}
                      onChange={handleInputChange}
                      className="rounded-3"
                      placeholder="Password"
                      required
                    />
                  </FloatingLabel>
                  <Button
                    variant="link"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("loginPassword")}
                  >
                    <i className={`far ${showPassword.loginPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </Button>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Button
                    variant="link"
                    className="text-decoration-none text-orange p-0"
                    onClick={() => switchForm("forgot")}
                  >
                    Forgot password?
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
                      <i className="fas fa-spinner fa-spin me-2"></i>Signing in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>Sign In
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <span className="text-muted">Don't have an account? </span>
                <Button
                  variant="link"
                  className="text-decoration-none fw-semibold text-orange p-0"
                  onClick={() => switchForm("register")}
                >
                  Sign up
                </Button>
              </div>
            </div>
          )}


          {activeForm === "register" && (
            <div className={`auth-form ${activeForm === "register" ? "slide-in-right" : "d-none"}`}>
              <div className="mb-4 text-center">
                <h2 className="fw-bold mb-2">Create Account</h2>
                <p className="text-muted">Join Zesty today</p>
              </div>

              <Form onSubmit={handleRegister}>
                <Row className="g-3 mb-3">
                  <Col xs={6}>
                    <FloatingLabel controlId="firstName" label="First Name">
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="rounded-3"
                        placeholder="John"
                        required
                      />
                    </FloatingLabel>
                  </Col>
                  <Col xs={6}>
                    <FloatingLabel controlId="lastName" label="Last Name">
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="rounded-3"
                        placeholder="Doe"
                        required
                      />
                    </FloatingLabel>
                  </Col>
                </Row>

                <FloatingLabel controlId="registerEmail" label="Email Address" className="mb-3">
                  <Form.Control
                    type="email"
                    name="registerEmail"
                    value={formData.registerEmail}
                    onChange={handleInputChange}
                    className="rounded-3"
                    placeholder="name@example.com"
                    required
                  />
                </FloatingLabel>

                <FloatingLabel controlId="address" label="Address" className="mb-3">
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="rounded-3"
                    placeholder="Address"
                    required
                  />
                </FloatingLabel>

                <div className="position-relative mb-3">
                  <FloatingLabel controlId="registerPassword" label="Password">
                    <Form.Control
                      type={showPassword.registerPassword ? "text" : "password"}
                      name="registerPassword"
                      value={formData.registerPassword}
                      onChange={handleInputChange}
                      className="rounded-3"
                      placeholder="Password"
                      required
                    />
                  </FloatingLabel>
                  <Button
                    variant="link"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("registerPassword")}
                  >
                    <i className={`far ${showPassword.registerPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </Button>
                </div>

                <div className="position-relative mb-3">
                  <FloatingLabel controlId="confirmPassword" label="Confirm Password">
                    <Form.Control
                      type={showPassword.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="rounded-3"
                      placeholder="Confirm Password"
                      required
                    />
                  </FloatingLabel>
                  <Button
                    variant="link"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    <i className={`far ${showPassword.confirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </Button>
                </div>

                <div className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="agree"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleInputChange}
                    label={
                      <>
                        I agree to the{" "}
                        <Link to="#" className="text-orange">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="#" className="text-orange">
                          Privacy Policy
                        </Link>
                      </>
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-4 rounded-3 fw-semibold py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>Creating account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>Create Account
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <span className="text-muted">Already have an account? </span>
                <Button
                  variant="link"
                  className="text-decoration-none fw-semibold text-orange p-0"
                  onClick={() => switchForm("login")}
                >
                  Sign in
                </Button>
              </div>
            </div>
          )}

          {activeForm === "forgot" && (
            <div className={`auth-form ${activeForm === "forgot" ? "slide-in-right" : "d-none"}`}>
              <div className="mb-4 text-center">
                <h2 className="fw-bold mb-2">Forgot Password</h2>
                <p className="text-muted">We'll send you a reset link</p>
              </div>

              <Form onSubmit={handleForgotPassword}>
                <FloatingLabel controlId="forgotEmail" label="Email Address" className="mb-4">
                  <Form.Control
                    type="email"
                    name="forgotEmail"
                    value={formData.forgotEmail}
                    onChange={handleInputChange}
                    className="rounded-3"
                    placeholder="name@example.com"
                    required
                  />
                </FloatingLabel>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-4 rounded-3 fw-semibold py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>Sending reset link...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>Send Reset Link
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-decoration-none fw-semibold text-orange p-0"
                  onClick={() => switchForm("login")}
                >
                  <i className="fas fa-arrow-left me-1"></i> Back to Sign In
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default Login