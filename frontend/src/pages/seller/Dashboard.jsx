"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Badge, Modal, Button, Form } from "react-bootstrap"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { formatDate, intcomma } from "../../utils/helpers"

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    items: 0,
    catered: 0,
  })
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [statusFilter, orders])

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await fetch("/api/seller/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      })
      if (!statsResponse.ok) {
        showError("Error", "Failed to fetch stats")
        return
      }

      const statsData = await statsResponse.json()
      if (!statsData.success) {
        showError("Error", statsData.msg)
        return
      }

      if (statsData.success) {
        showSuccess("Stats Loaded", statsData.msg)
        setStats({
          revenue: statsData.data?.revenue || 0,
          orders: statsData.data?.orders || 0,
          items: statsData.data?.items || 0,
          catered: statsData.data?.customers || 0,
        })
      }

      // Fetch orders
      const ordersResponse = await fetch("/api/seller/current-orders")
      const ordersData = await ordersResponse.json()

      if (ordersData.success) {
        setOrders(ordersData.orders)
        showSuccess("Dashboard Loaded", "Data fetched successfully")
      } else {
        showError("Error", ordersData.msg)
      }
    } catch (error) {
      showError("Error", "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    if (!statusFilter) {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ordered":
        return "info"
      case "preparing":
        return "warning"
      case "prepared":
        return "primary"
      case "delivered":
        return "success"
      default:
        return "secondary"
    }
  }

  const getItemStatusButton = (item) => {
    if (item.status === "ordered") {
      return (
        <Button size="sm" variant="outline-info" onClick={() => updateItemStatus(item.id, "preparing")}>
          Start Preparing
        </Button>
      )
    } else if (item.status === "preparing") {
      return (
        <Button size="sm" variant="outline-success" onClick={() => updateItemStatus(item.id, "prepared")}>
          Mark Prepared
        </Button>
      )
    } else if (item.status === "prepared") {
      return (
        <Button size="sm" variant="success" disabled>
          <i className="fas fa-check"></i> Ready
        </Button>
      )
    } else {
      return <Badge bg="secondary">{item.status}</Badge>
    }
  }

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      const response = await fetch("/api/seller/update-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID: itemId }),
      })

      const data = await response.json()

      if (data.success) {
        showSuccess("Status Updated", data.msg)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        showError("Update Failed", data.msg)
      }
    } catch (error) {
      showError("Error", "Failed to update status")
    }
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const calculateOrderTotal = (items) => {
    return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="g-4 mb-4">
          <Col lg={3} md={6}>
            <div className="stats-card">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-primary bg-opacity-10 text-primary me-3">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h4 className="fw-bold mb-0">₹{intcomma(stats.revenue)}</h4>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stats-card">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-success bg-opacity-10 text-success me-3">
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Orders</h6>
                  <h4 className="fw-bold mb-0">{intcomma(stats.orders)}</h4>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stats-card">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-info bg-opacity-10 text-info me-3">
                  <i className="fas fa-utensils"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Items</h6>
                  <h4 className="fw-bold mb-0">{intcomma(stats.items)}</h4>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stats-card">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-warning bg-opacity-10 text-warning me-3">
                  <i className="fas fa-users"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Users Catered</h6>
                  <h4 className="fw-bold mb-0">{intcomma(stats.catered)}</h4>
                </div>
              </div>
            </div>
          </Col>
        </Row>


        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">Recent Orders</h5>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ maxWidth: "200px" }}
                >
                  <option value="">All Orders</option>
                  <option value="ordered">Ordered</option>
                  <option value="preparing">Preparing</option>
                  <option value="prepared">Prepared</option>
                  <option value="delivered">Delivered</option>
                </Form.Select>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted">Loading orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-shopping-bag fs-1 text-muted mb-3"></i>
                    <h4 className="text-muted">No orders found</h4>
                    <p className="text-muted">New orders will appear here</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const total = calculateOrderTotal(order.items)
                    const summary = order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")

                    return (
                      <div key={order.id} className="food-card mb-4">
                        <div className="card-body">
                          <Row>
                            <Col md={8}>
                              <div className="d-flex align-items-center mb-3">
                                <h6 className="fw-bold mb-0 me-3">Order #{order.id}</h6>
                                <Badge bg={getStatusColor(order.status)} className="rounded-pill me-2">
                                  {order.status}
                                </Badge>
                                <small className="text-muted">
                                  {formatDate(new Date(order.created_at), "DD/MM/YYYY")}
                                </small>
                              </div>

                              <Row className="mb-3">
                                <Col md={6}>
                                  <h6 className="fw-semibold mb-1">Customer</h6>
                                  <p className="mb-1">
                                    {order.first_name} {order.last_name}
                                  </p>
                                  <small className="text-muted">{order.email}</small>
                                </Col>
                                <Col md={6}>
                                  <h6 className="fw-semibold mb-1">Address</h6>
                                  <p className="text-muted small mb-0">{order.address}</p>
                                </Col>
                              </Row>

                              <div className="mb-3">
                                <h6 className="fw-semibold mb-2">Items ({order.items.length})</h6>
                                <div className="text-muted small">{summary}</div>
                              </div>
                            </Col>

                            <Col md={4}>
                              <div className="text-center mb-3">
                                <h5 className="fw-bold text-primary mb-1">₹{intcomma(total)}</h5>
                                <small className="text-muted">Total Amount</small>
                              </div>

                              <div className="d-grid gap-2">
                                <Button variant="primary" onClick={() => viewOrderDetails(order)}>
                                  <i className="fas fa-eye me-1"></i>View Items
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    )
                  })
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>


        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <h6 className="fw-bold">Order #{selectedOrder.id}</h6>
                    <p className="mb-1">
                      <strong>Customer:</strong> {selectedOrder.first_name} {selectedOrder.last_name}
                    </p>
                    <p className="mb-1">
                      <strong>Email:</strong> {selectedOrder.email}
                    </p>
                    <p className="mb-1">
                      <strong>Status:</strong>
                      <Badge bg={getStatusColor(selectedOrder.status)} className="ms-2">
                        {selectedOrder.status}
                      </Badge>
                    </p>
                    <p className="mb-1">
                      <strong>Date:</strong> {formatDate(new Date(selectedOrder.created_at), "DD/MM/YYYY")}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Address:</strong>
                    </p>
                    <p className="text-muted">{selectedOrder.address}</p>
                    {selectedOrder.message && (
                      <>
                        <p className="mb-1">
                          <strong>Message:</strong>
                        </p>
                        <p className="text-muted">{selectedOrder.message}</p>
                      </>
                    )}
                  </Col>
                </Row>

                <h6 className="fw-bold mb-3">Items</h6>
                <Row>
                  {selectedOrder.items.map((item) => (
                    <Col md={6} key={item.id} className="mb-3">
                      <Card className="h-100">
                        <Row className="g-0 h-100">
                          <Col xs={4}>
                            <img
                              src={item.image || "/placeholder.svg"}
                              className="img-fluid rounded-start h-100"
                              style={{ objectFit: "cover" }}
                              alt={item.name}
                            />
                          </Col>
                          <Col xs={8}>
                            <Card.Body className="d-flex flex-column h-100">
                              <div className="flex-grow-1">
                                <Card.Title className="h6 mb-1">{item.name}</Card.Title>
                                <Card.Text>
                                  <strong>Qty:</strong> {item.quantity}
                                  <br />
                                  <strong>Price:</strong> ₹{intcomma(item.unit_price)}
                                  <br />
                                  <strong>Total:</strong> ₹{intcomma(item.unit_price * item.quantity)}
                                </Card.Text>
                              </div>
                              <div className="mt-auto">
                                <div className="d-flex align-items-center justify-content-between">
                                  <Badge bg={getStatusColor(item.status)}>{item.status}</Badge>
                                  {getItemStatusButton(item)}
                                </div>
                              </div>
                            </Card.Body>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <Row className="mt-4">
                  <Col>
                    <div className="text-end">
                      <h5>
                        <strong>Total: ₹{intcomma(calculateOrderTotal(selectedOrder.items))}</strong>
                      </h5>
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  )
}

export default Dashboard
