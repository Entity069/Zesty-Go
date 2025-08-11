"use client"

import { useState } from "react"
import { Form, InputGroup, Dropdown, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

const Header = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <header className="d-flex align-items-center justify-content-between p-4 border-bottom">
      <Button variant="link" className="btn sidebar-toggler p-0" onClick={onToggleSidebar}>
        <i className="fas fa-bars"></i>
      </Button>

      <div className="flex-grow-1 mx-4">
        <div className="position-relative">
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <InputGroup.Text className="bg-transparent border-end-0">
                <i className="fas fa-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                className="search-box border-start-0"
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Form>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <Dropdown>
          <Dropdown.Toggle variant="link" className="p-0 border-0 bg-transparent">
            <i className="fas fa-cog fs-5"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Header>Settings</Dropdown.Header>
            <Dropdown.Item onClick={toggleTheme}>
              <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"} me-2`}></i>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate("/my-profile")}>
              <i className="fas fa-user me-2"></i>Account Settings
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown>
          <Dropdown.Toggle variant="link" className="p-0 border-0 bg-transparent">
            <img
              src={user?.profile_pic || "/placeholder.svg?height=40&width=40&query=user"}
              alt="Profile"
              className="rounded-circle"
              width="40"
              height="40"
            />
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Header>
              <div className="d-flex align-items-center">
                <img
                  src={user?.profile_pic || "/placeholder.svg?height=50&width=50&query=user"}
                  alt="Profile"
                  className="rounded-circle me-3"
                  width="50"
                  height="50"
                />
                <div>
                  <strong className="d-block">
                    {user?.first_name} {user?.last_name}
                  </strong>
                  <small className="text-muted">{user?.email}</small>
                </div>
              </div>
            </Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate("/my-profile")}>
              <i className="fas fa-user me-2"></i>View Profile
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-danger" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-2"></i>Sign Out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  )
}

export default Header
