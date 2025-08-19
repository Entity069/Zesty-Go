"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button, Badge } from "react-bootstrap"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma, formatDate } from "../../utils/helpers"

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/all-orders", {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) {
        showError("Error", "Failed to fetch orders")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }

      setOrders(data.orders)
      showSuccess("Orders Fetched", data.msg)
    } catch (error) {
      showError("Error", "Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    const filtered = orders.filter((order) => !statusFilter || order.status === statusFilter)
    setFilteredOrders(filtered)
  }

  const getStatus = (status) => {
    switch (status) {
      case "ordered":
        return "info"
      case "preparing":
        return "warning"
      case "delivered":
        return "success"
      case "cancelled":
        return "danger"
      default:
        return "secondary"
    }
  }

  const handleDeliverOrder = async (orderId) => {
    try {
      const response = await fetch("/api/admin/deliver-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
        credentials: "include",
      })

      if (!response.ok) {
        showError("Error", "Failed to deliver order")
        return
      }
      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      showSuccess("Order Delivered", data.msg)
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: "delivered" } : order,
      )

      setOrders(updatedOrders)
      showSuccess("Order Delivered", data.msg)
    } catch (error) {
      showError("Error", "Failed to deliver order")
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch("/api/admin/cancel-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
        credentials: "include",
      })
      if (!response.ok) {
        showError("Error", "Failed to cancel order")
        return
      }
      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      showSuccess("Order Cancelled", data.msg)
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" } : order,
      )

      setOrders(updatedOrders)
      showSuccess("Order Cancelled", data.msg)
    } catch (error) {
      showError("Error", "Failed to cancel order")
    }
  }

  if (loading) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading orders…</p>
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
              <option value="ordered">Ordered</option>
              <option value="preparing">Preparing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Col>
        </Row>

        <Card className="food-card">
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>ORD-{order.id}</td>
                        <td>
                          <div>
                            {order.first_name} {order.last_name}
                          </div>
                          <small className="text-muted">{order.email}</small>
                        </td>
                        <td>₹{intcomma(order.total_amount || 0)}</td>
                        <td>
                          <Badge bg={getStatus(order.status)} className="rounded-pill">
                            {order.status}
                          </Badge>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString("en-GB")}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleDeliverOrder(order.id)}
                              disabled={order.status !== "prepared"}
                            >
                              Deliver
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={order.status !== "ordered"}
                            >
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No orders found
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

export default AdminOrders