"use client"

import { Nav } from "react-bootstrap"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"


const Sidebar = ({ show, onHide }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const menuItems = [
    { path: "/home", icon: "fas fa-home", label: "Overview", key: "overview" },
    { path: "/categories", icon: "fas fa-th-large", label: "Categories", key: "categories" },
    { path: "/search", icon: "fas fa-search", label: "Browse", key: "search" },
    { path: "/my-cart", icon: "fas fa-shopping-cart", label: "My Cart", key: "cart" },
    { path: "/my-orders", icon: "fas fa-receipt", label: "My Orders", key: "orders" },
    { path: "/my-profile", icon: "fas fa-user", label: "Profile", key: "profile" },
  ]

  const handleNavigation = (path) => {
    navigate(path)
    if (onHide) onHide()
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className={`sidebar p-3 ${show ? "show" : ""}`} id="sidebar">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="brand mb-0">
          <i className="fas fa-utensils me-2"></i>Zesty
        </h4>
        <button className="btn theme-toggle" onClick={toggleTheme}>
          <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
        </button>
      </div>
      <div className="mb-4">
        <small className="text-muted">Welcome Back!</small>
        <h6 className="mb-0">
          {user?.first_name} {user?.last_name}
        </h6>
      </div>

      <Nav className="flex-column">
        {menuItems.map((item) => (
          <Nav.Item key={item.key} className="nav-item">
            <Nav.Link
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => handleNavigation(item.path)}
            >
              <i className={`${item.icon} me-3`}></i>
              {item.label}
            </Nav.Link>
          </Nav.Item>
        ))}
        <Nav.Item className="nav-item">
          <Nav.Link className="nav-link" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-3"></i>
            Logout
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  )
}

export default Sidebar
