"use client"

import { Nav } from "react-bootstrap"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

const AdminSidebar = ({ show, onHide }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const menuItems = [
    { path: "/admin/dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard", key: "dashboard" },
    { path: "/admin/all-users", icon: "fas fa-users", label: "Users", key: "users" },
    { path: "/admin/all-orders", icon: "fas fa-shopping-bag", label: "Orders", key: "orders" },
    { path: "/admin/all-categories", icon: "fas fa-tags", label: "Categories", key: "categories" },
    { path: "/admin/all-items", icon: "fas fa-utensils", label: "Items", key: "items" },
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
          <i className="fas fa-utensils me-2"></i>Zesty Admin
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
        <small className="text-muted">Administrator</small>
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

export default AdminSidebar
