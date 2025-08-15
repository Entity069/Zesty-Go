"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma } from "../../utils/helpers"

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/order/user-cart", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.success) {
        setCartItems(data.cart?.items)
        showSuccess("Cart Loaded", data.msg)
      } else {
        showError("Error", data.msg || "Failed to load cart items")
      }
    } catch (error) {
      showError("Error", "Failed to load cart items")
    }
  }

  const updateQuantity = async (itemId, action) => {
    try {
      const response = await fetch("/api/order/update-count", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, action }),
      })

      if (!response.ok) {
        showError("Update Failed", "Could not update item quantity")
        return
      }
      const data = await response.json()
      if (data.success) {
        setCartItems((prevItems) =>
          prevItems
            .map((item) => {
              if (item.id === itemId) {
                const newQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
              }
              return item
            })
            .filter(Boolean),
        )
      } else {
        showError("Update Failed", data.msg)
      }
    } catch (error) {
      showError("Update Failed", "Could not update quantity")
    }
  }

  const placeOrder = async () => {
    if (cartItems.length === 0) return

    setLoading(true)
    try {
      const response = await fetch("/api/order/place-order", {
        method: "POST",
        credentials: "include"
      })
      const data = await response.json()
      if (!data.success) {
        showError("Order Failed", data.msg)
        return
      }
      showSuccess("Order placed!", data.msg)
      setTimeout(() => {
        setCartItems([])
        navigate("/my-orders")
      }, 1500)
    } catch (error) {
      showError("Request Failed", "Could not place order")
    } finally {
      setLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.unit_price * item.quantity, 0)
  }

  const subtotal = calculateSubtotal()

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row>
          <Col lg={8}>
            {cartItems.length > 0 ? (
              <div id="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item mb-3">
                    <Row className="align-items-center">
                      <Col md={2}>
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="img-fluid rounded" />
                      </Col>
                      <Col md={4}>
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <p className="text-muted small mb-0">{item.description}</p>
                      </Col>
                      <Col md={2}>
                        <span className="fw-bold text-orange">₹ {intcomma(item.unit_price)}</span>
                      </Col>
                      <Col md={3}>
                        <div className="quantity-controls d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, "decrease")}
                          >
                            <i className="fas fa-minus"></i>
                          </Button>
                          <span className="mx-3 fw-bold">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, "increase")}
                          >
                            <i className="fas fa-plus"></i>
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            ) : (
              <div id="empty-cart" className="text-center py-5">
                <i className="fas fa-shopping-cart fs-1 text-muted mb-3"></i>
                <h4 className="text-muted">Your cart is empty</h4>
                <p className="text-muted">Add some delicious items to get started!</p>
                <div className="d-flex justify-content-center">
                  <Button variant="primary" onClick={() => navigate("/search")}>
                    <i className="fas fa-search me-2"></i>Browse Menu
                  </Button>
                </div>
              </div>
            )}
          </Col>

          <Col lg={4}>
            <div className="p-4 rounded-4 border position-sticky" style={{ top: "20px" }}>
              <h5 className="fw-bold mb-4">Order Summary</h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>₹ {intcomma(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount</span>
                  <span>₹ 0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span className="text-orange">₹ {intcomma(subtotal)}</span>
                </div>
              </div>

              <div className="d-grid gap-2">
                <Button variant="primary" disabled={cartItems.length === 0 || loading} onClick={placeOrder}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card me-2"></i>Proceed to Checkout
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  )
}

export default Cart
