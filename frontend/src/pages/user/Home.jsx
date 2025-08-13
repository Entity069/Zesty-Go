"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Modal, Form, FloatingLabel, InputGroup } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import Layout from "../../components/Layout"
import { intcomma } from "../../utils/helpers"

const Home = () => {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [showAddBalance, setShowAddBalance] = useState(false)
  const [showEditAddress, setShowEditAddress] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchCategories()
    fetchItems()
    fetchOrders()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/home/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        showError("Error", "Failed to load categories data")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      setCategories(data.categories)
    } catch (error) {
      showError("Error", "Failed to load categories")
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/home/items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        showError("Error", "Failed to load items data")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      setItems(data.items)
    } catch (error) {
      showError("Error", "Failed to load items")
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/home/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      })

      if (!response.ok) {
        showError("Error", "Failed to load orders data")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      setRecentOrders(data.orders)
    } catch (error) {
      showError("Error", "Failed to load orders")
    }
  }

  const handleAddToCart = async (item) => {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ itemId: item.id, quantity: 1 }),
      })
      if (!response.ok) {
        showError("Add Failed", "Could not add item to cart")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Add Failed", data.msg)
        return
      }
      showSuccess("Added to Cart", `${item.name} added to cart successfully!`)
    } catch (error) {
      showError("Add Failed", "Could not add item to cart")
    }
  }

  const handleAddBalance = async (e) => {
    e.preventDefault()
    const balance = Number.parseFloat(balanceAmount)

    if (!balance || balance <= 0 || balance > 99999999) {
      showError("Invalid Amount", "Balance should be between 0 and 99,999,999!")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/user/update-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ balance: balance }),
      })

      if (!response.ok) {
        showError("Payment Failed", "Could not add balance")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Payment Failed", data.msg)
        return
      }

      showSuccess("Balance Added", data.msg)
      setShowAddBalance(false)
      setBalanceAmount("")
      
      if (user) {
        user.balance = (user.balance || 0) + balance
      }
    } catch (error) {
      showError("Payment Failed", "Could not add balance")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    if (!newAddress.trim()) {
      showError("Invalid Address", "Please enter a valid address")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/user/update-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ addr: newAddress }),
      })
      if (!response.ok) {
        showError("Update Failed", "Could not update address")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Update Failed", data.msg)
        return
      }
      showSuccess("Address Updated", "Your address has been updated successfully!")
      setShowEditAddress(false)
      setNewAddress("")

      if (user) {
        user.address = newAddress
      }
    } catch (error) {
      showError("Update Failed", "Could not update address")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInitials = (name) => {
    const words = name.split(" ")
    return words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0]
  }

  const getRandomColor = () => {
    return Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row>
          <Col xl={8} lg={7}>
            <div className="promo-card p-4 mb-4 fade-in position-relative">
              <Row className="align-items-center">
                <Col lg={7}>
                  <h3 className="fw-bold mb-2">Get Up To 69% Discount On Your First Order</h3>
                  <p className="mb-3 opacity-90">
                    Get the discount from one of the best dishes that are prepared by our top 0.69% chef around the
                    world.
                  </p>
                  <Button variant="light" size="lg" disabled>
                    Order Now
                  </Button>
                </Col>
                <Col lg={5} className="text-end">
                  <div className="promo-pic">
                    <img src="/discount.png" alt="Chef" className="img-fluid" />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Category</h5>
              <Button
                variant="link"
                className="text-decoration-none fw-semibold text-orange p-0"
                onClick={() => navigate("/categories")}
              >
                View all
              </Button>
            </div>

            <div className="d-flex overflow-x-auto pb-2 mb-2 px-2 pt-2" style={{ gap: "1rem" }}>
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="flex-shrink-0 text-decoration-none"
                  style={{ minWidth: "120px", color: "inherit" }}
                >
                  <div className="category-card text-center h-100">
                    <img
                      src={`https://placehold.co/60x60/${getRandomColor()}/white?text=${getCategoryInitials(
                        category.name,
                      )}`}
                      alt={category.name}
                      className="mb-2"
                    />
                    <h6 className="small fw-semibold mb-0">{category.name}</h6>
                  </div>
                </a>
              ))}
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Popular Dishes</h5>
              <Button
                variant="link"
                className="text-decoration-none fw-semibold text-orange p-0"
                onClick={() => navigate("/search")}
              >
                View all
              </Button>
            </div>

            {items && items.length > 0 ? (
              <Row className="g-4 mb-5">
                {items.map((item) => (
                  <Col key={item.id} lg={4} md={6}>
                    <Card
                      className="food-card position-relative h-100"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      <Card.Img variant="top" src={item.image} alt={item.name} />
                      <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                          <div className="rating me-2">
                            <i className="fas fa-star me-1"></i>
                            {item.rating}
                          </div>
                        </div>
                        <Card.Title className="fw-bold h6">{item.name}</Card.Title>
                        <Card.Text className="text-muted small mb-3">{item.description}</Card.Text>
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="fw-bold mb-0 text-orange">₹ {intcomma(item.price)}</h6>
                          <Button
                            variant="primary"
                            size="sm"
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation() // Prevent card click when clicking add button
                              handleAddToCart(item)
                            }}
                          >
                            <i className="fas fa-plus"></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-5 mb-5">
                <i className="fas fa-utensils fs-1 text-muted mb-3"></i>
                <h4 className="text-muted">No dishes available</h4>
                <p className="text-muted">We're working on bringing you delicious meals. Check back soon!</p>
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Recent Order</h5>
              <Button
                variant="link"
                className="text-decoration-none fw-semibold text-orange p-0"
                onClick={() => navigate("/my-orders")}
              >
                View all
              </Button>
            </div>

            {recentOrders && recentOrders.length > 0 ? (
              <Row className="g-4">
                {recentOrders.map((order) => (
                  <Col key={order.id} lg={4} md={6}>
                    <Card
                      className="food-card position-relative"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/item/${order.id}`)}
                    >
                      <Card.Img variant="top" src={order.image} alt={order.name} />
                      <Card.Body>
                        <Card.Title className="fw-bold h6">{order.name}</Card.Title>
                        <Card.Text className="text-muted small mb-0">{order.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-shopping-bag fs-1 text-muted mb-3"></i>
                <h4 className="text-muted">No orders found</h4>
                <p className="text-muted">You haven't placed any orders yet.</p>
              </div>
            )}
          </Col>

          <Col xl={4} lg={5}>
            <div className="order-summary p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="fw-bold mb-0">Your Balance</h6>
                <Button variant="outline-primary" size="sm" onClick={() => setShowAddBalance(true)}>
                  <i className="fas fa-plus me-1"></i>Add
                </Button>
              </div>
              <div className="bg-warning bg-opacity-10 rounded-3 p-3 mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold">₹{intcomma(user?.balance || 0)}</span>
                  <i className="fas fa-wallet text-warning"></i>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-3">Your Address</h6>
                <div className="d-flex align-items-start">
                  <i className="fas fa-map-marker-alt text-warning me-2 mt-1"></i>
                  <div className="flex-grow-1">
                    <small className="text-muted d-block">{user?.address || "No address provided"}</small>
                  </div>
                </div>
                <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => setShowEditAddress(true)}>
                  Edit address
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Modal show={showAddBalance} onHide={() => setShowAddBalance(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Balance</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddBalance}>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>₹</InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    min="1"
                    max="69420"
                    step="0.01"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    id="credit-card"
                    name="paymentMethod"
                    value="credit_card"
                    label={
                      <>
                        <i className="fas fa-credit-card me-2"></i>Credit Card
                      </>
                    }
                  />
                  <Form.Check
                    type="radio"
                    id="debit-card"
                    name="paymentMethod"
                    value="debit_card"
                    label={
                      <>
                        <i className="fas fa-credit-card me-2"></i>Debit Card
                      </>
                    }
                  />
                  <Form.Check
                    type="radio"
                    id="gpay"
                    name="paymentMethod"
                    value="Gpay"
                    label={
                      <>
                        <i className="fab fa-paypal me-2"></i>Gpay
                      </>
                    }
                  />
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddBalance(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddBalance} disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Processing...
                </>
              ) : (
                "Add Balance"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showEditAddress} onHide={() => setShowEditAddress(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdateAddress}>
              <FloatingLabel controlId="address" label="New Address">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="51°30'45.4''N 0°13'08.9''W"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </FloatingLabel>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditAddress(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateAddress} disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  )
}

export default Home