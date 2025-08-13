"use client"

import { useState, useEffect } from "react"
import { Container, Table, Badge, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma } from "../../utils/helpers"

const ManageItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/seller/all-items", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        showError("Error", "Failed to fetch items. Please try again later.")
        return
      }
      const data = await response.json()

      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      setItems(data.items)
      showSuccess("Items Loaded", data.msg)
    } catch (error) {
      showError("Error", "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = (itemId) => {
    navigate(`/seller/edit-items/${itemId}`)
  }

  const getStatus = (status) => {
    switch (status) {
      case "available":
        return "success"
      case "unavailable":
        return "danger"
      case "discontinued":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading your items…</p>
          </div>
        </Container>
      </Layout>
    )
  }

  if (items.length === 0) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-5">
            <i className="fas fa-utensils fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">No items found</h4>
            <p className="text-muted">Start by adding your first menu item</p>
              <div className="d-flex justify-content-center">
              <Button variant="primary" onClick={() => navigate("/seller/add-items")}>
                <i className="fas fa-plus me-2"></i>Add First Item
              </Button>
              </div>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <div className="food-card">
          <div className="card-body">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr className="text-center">
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
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
                      <td className="text-muted small">{item.description}</td>
                      <td>
                        <Badge bg="info">{item.cname}</Badge>
                      </td>
                      <td>₹{intcomma(item.price)}</td>
                      <td>
                        <Badge bg={getStatus(item.status)}>{item.status}</Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <div className="rating">
                            <i className="fas fa-star text-warning"></i>
                            <span>{item.rating ?? "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => handleEditItem(item.id)}>
                          <i className="fas fa-edit me-1"></i>Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  )
}

export default ManageItems
