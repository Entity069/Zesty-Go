"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Badge, Dropdown } from "react-bootstrap"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma, formatDate } from "../../utils/helpers"

const AdminItems = () => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, statusFilter])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/admin/all-items", {
        method: "GET",
        credentials: "include"
      })
      if (!response.ok) {
        showError("Error", "Failed to fetch items")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      showSuccess("Items Loaded", data.msg)
      setItems(data.items)
    } catch (error) {
      showError("Error", "Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    const filtered = items.filter((item) => !statusFilter || item.status === statusFilter)
    setFilteredItems(filtered)
  }

  const getStatus = (status) => {
    switch (status) {
      case "available":
        return "success"
      case "unavailable":
        return "warning"
      case "discontinued":
        return "danger"
      default:
        return "secondary"
    }
  }

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const response = await fetch("/api/admin/update-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ itemId, status: newStatus }),
        credentials: "include"
      })
      if (!response.ok) {
        showError("Error", "Failed to update item status")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }

      const updatedItems = items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
      setItems(updatedItems)
      showSuccess("Item Status Updated", data.msg)
    } catch (error) {
      showError("Error", "Failed to update item status")
    }
  }

  if (loading) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading items…</p>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col xs={12}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: "200px" }}
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="discontinued">Discontinued</option>
            </Form.Select>
          </Col>
        </Row>

        <Card className="food-card">
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr className="text-center">
                    <th>Image</th>
                    <th>Name</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="align-middle text-center">
                        <td>
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="rounded-2"
                            style={{ width: "120px", height: "80px", objectFit: "cover" }}
                          />
                        </td>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>
                          <div>
                            {item.fname} {item.lname}
                          </div>
                        </td>
                        <td>₹ {intcomma(item.price)}</td>
                        <td>
                          <Badge bg="info">{item.cname}</Badge>
                        </td>
                        <td>
                          <Badge bg={getStatus(item.status)}>{item.status}</Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <div className="rating">
                              <i className="fas fa-star text-warning"></i>
                              <span>{item.rating}</span>
                            </div>
                          </div>
                        </td>
                        <td>{new Date(item.created_at).toLocaleDateString("en-GB")}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-primary" size="sm">
                              Change Status
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => handleStatusChange(item.id, "available")}
                                disabled={item.status === "available"}
                              >
                                Available
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => handleStatusChange(item.id, "unavailable")}
                                disabled={item.status === "unavailable"}
                              >
                                Unavailable
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => handleStatusChange(item.id, "discontinued")}
                                disabled={item.status === "discontinued"}
                              >
                                Discontinued
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  )
}

export default AdminItems
