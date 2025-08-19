"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma, naturaltime } from "../../utils/helpers"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/order/user-orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
    } catch (error) {
      showError("Error", "Failed to load orders")
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch("/api/order/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId }),
      })
      if (!response.ok) {
        showError("Cancellation Failed", "Failed to cancel the order")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Cancellation Failed", data.msg)
        return
      }
      
      showSuccess("Order Cancelled", data.msg)
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)),
      )
    } catch (error) {
      showError("Cancellation Failed", "Could not cancel the order.")
    }
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

  return (
    <Layout>
      <Container fluid className="p-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="food-card mb-4">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center mb-2">
                      <h6 className="fw-bold mb-0 me-3">ORD-{order.id}</h6>
                      <Badge bg={getStatus(order.status)} className="rounded-pill">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-2">{naturaltime(order.updated_at)}</p>
                    <div className="mb-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <small key={index} className="text-muted d-block">
                            {item.quantity}× {item.name}
                          </small>
                        ))
                      ) : (
                        <small className="text-muted">No items found</small>
                      )}
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <h6 className="fw-bold text-orange mb-3">₹ {intcomma(order.total_amount)}</h6>
                    {order.status === "ordered" && (
                      <div className="d-flex gap-2 justify-content-md-end">
                        <Button variant="outline-primary" size="sm" onClick={() => cancelOrder(order.id)}>
                          <i className="fas fa-times me-1"></i>Cancel
                        </Button>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-shopping-bag fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">No orders found</h4>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <div className="d-flex justify-content-center">
              <Button variant="primary" onClick={() => navigate("/search")}>
                <i className="fas fa-search me-2"></i>Browse Menu
              </Button>
            </div>
          </div>
        )}
      </Container>
    </Layout>
  )
}

export default Orders