"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button, Modal, FloatingLabel, Badge } from "react-bootstrap"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { formatDate } from "../../utils/helpers"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [userTypeFilter, setUserTypeFilter] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
  })

  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, userTypeFilter])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/all-users", {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) {
        showError("Error", "Failed to fetch users")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }

      setUsers(data.users)
      showSuccess("Users Fetched", "Users loaded successfully")
    } catch (error) {
      showError("Error", "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    const filtered = users.filter((user) => !userTypeFilter || user.user_type === userTypeFilter)
    setFilteredUsers(filtered)
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "danger"
      case "seller":
        return "warning"
      case "user":
        return "info"
      default:
        return "secondary"
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.user_type,
    })
    setShowEditModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showError("Validation Error", "Please fill all required fields")
      return
    }

    try {
      const response = await fetch(`/api/admin/edit-user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingUser.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          user_type: formData.role,
        }),
      })

      if (!response.ok) {
        showError("Error", "Failed to update user")
        return
      }

      const updatedUsers = users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              user_type: formData.role,
            }
          : user,
      )

      setUsers(updatedUsers)
      setShowEditModal(false)
      showSuccess("Success", "User updated successfully")
    } catch (error) {
      showError("Error", "Failed to update user")
    }
  }

  if (loading) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col md={4}>
            <Form.Select value={userTypeFilter} onChange={e => setUserTypeFilter(e.target.value)}>
              <option value="">All Users</option>
              <option value="user">Users</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </Form.Select>
          </Col>
        </Row>

        <Card className="food-card mb-4">
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>USR-{user.id}</td>
                        <td>
                          {user.first_name} {user.last_name}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg={getRoleBadgeColor(user.user_type)}>{user.user_type}</Badge>
                        </td>
                        <td>
                          <Badge bg={user.is_verified ? "success" : "danger"}>
                            {user.is_verified ? "Verified" : "Not verified"}
                          </Badge>
                        </td>
                        <td>
                          {new Date(user.created_at).toLocaleDateString("en-GB")}
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" onClick={() => handleEditUser(user)}>
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>

        {/* edit user */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <FloatingLabel controlId="firstName" label="First Name" className="mb-3">
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </FloatingLabel>
                </Col>
                <Col md={6}>
                  <FloatingLabel controlId="lastName" label="Last Name" className="mb-3">
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </FloatingLabel>
                </Col>
              </Row>

              <FloatingLabel controlId="email" label="Email" className="mb-3">
                <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </FloatingLabel>

              <FloatingLabel controlId="role" label="Role" className="mb-3">
                <Form.Select name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </FloatingLabel>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  )
}

export default AdminUsers
