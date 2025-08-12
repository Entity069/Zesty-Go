"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma } from "../../utils/helpers"

const ItemDetail = () => {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentRating, setCurrentRating] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)
  const { item_id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchItemDetail()
  }, [item_id])

  const fetchItemDetail = async () => {
    try {
      const response = await fetch(`/api/order/item/${item_id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!response.ok) {
        showError("Error", "Failed to load item details")
        setItem(null)
        return
      }
      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg || "Failed to load item details")
        setItem(null)
        return
      } else {
        setItem(data.item) 
      }
    } catch (error) {
      showError("Error", "Failed to load item details")
      setItem(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (item.status !== 'available') {
      showError("Item Unavailable", "This item is currently not available")
      return
    }

    setAddingToCart(true)
    try {
      const response = await fetch('/api/order/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, quantity })
      })
      if (!response.ok) {
        showError("Add Failed", "Failed to add item to cart")
        return
      }
      const data = await response.json()
      
      if (data.success) {
        showSuccess("Added to Cart", data.msg)
        setQuantity(1)
      } else {
        showError("Add Failed", data.msg)
      }
    } catch (error) {
      showError("Add Failed", "Could not add item to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleRatingSubmit = async () => {
    if (currentRating === 0) {
      showError("Error", "Please select a star rating.")
      return
    }

    setSubmittingRating(true)
    try {
      const response = await fetch('/api/order/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, rating: currentRating })
      })

      const data = await response.json()

      if (data.success) {
        showSuccess("Rating Submitted", data.msg || "Thank you for your rating!")
        window.location.reload()
      } else {
        showError("Submission Failed", data.msg || "Failed to submit rating")
      }
    } catch (error) {
      showError("Error", "Something went wrong. Please try again.")
    } finally {
      setSubmittingRating(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index + 1}
        className={`${index + 1 <= currentRating ? 'fas' : 'far'} fa-star`}
        style={{ cursor: 'pointer', marginRight: '4px' }}
        onClick={() => setCurrentRating(index + 1)}
        onMouseEnter={() => setCurrentRating(index + 1)}
      />
    ))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge bg="success">Available</Badge>
      case 'unavailable':
        return <Badge bg="warning">Unavailable</Badge>
      default:
        return <Badge bg="danger">Discontinued</Badge>
    }
  }

  if (loading) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </Layout>
    )
  }

  if (!item) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-5">
            <i className="fas fa-exclamation-triangle fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">Item not found</h4>
            <p className="text-muted">The item you're looking for doesn't exist.</p>
            <div className="d-flex justify-content-center">
              <Button variant="primary" onClick={() => navigate("/search")}>
                <i className="fas fa-search me-2"></i>Browse Menu
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
        <Row className="mb-4">
          <Col xs={12}>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-2"></i>Back
            </Button>
          </Col>
        </Row>

        <Row className="align-items-center mb-4">
          <Col lg={6} className="mb-4">
            <Card className="food-card h-100">
              <div className="card-body p-0">
                <Card.Img
                  src={item.image}
                  alt={item.name}
                  className="w-100"
                  style={{ height: "400px", objectFit: "cover", borderRadius: "16px" }}
                />
              </div>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="food-card h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Card.Title as="h2" className="fw-bold mb-2">
                      {item.name}
                    </Card.Title>
                    <Card.Text className="text-muted mb-3">
                      {item.description}
                    </Card.Text>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="mb-4">
                  <h3 className="text-orange fw-bold mb-0">₹ {intcomma(item.price)}</h3>
                  <small className="text-muted">per unit</small>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rating">
                      <i className="fas fa-star me-1"></i>
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <label className="form-label fw-semibold mb-3">Quantity</label>
                      <div className="quantity-controls d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <i className="fas fa-minus"></i>
                        </Button>
                        <span className="quantity-display px-3 py-2 border rounded text-center mx-2" style={{ minWidth: "60px" }}>
                          {quantity}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(1)}
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                      </div>
                    </Col>
                    <Col md={6} className="text-md-end">
                      <label className="form-label fw-semibold mb-3">Total Price</label>
                      <div>
                        <span className="h4 text-orange fw-bold">
                          ₹ {intcomma(item.price * quantity)}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="d-grid gap-2 mb-4">
                  {item.status === 'available' ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                    >
                      {addingToCart ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Adding...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shopping-cart me-2"></i>Add to Cart
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button variant="secondary" size="lg" disabled>
                      <i className="fas fa-ban me-2"></i>Not Available
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mb-4">
            <Card className="food-card h-100">
              <Card.Body className="p-4 d-flex flex-column h-100">
                <h6 className="text-orange mb-4">
                  <i className="fas fa-info-circle me-2"></i>Item Information
                </h6>
                <Row className="g-4 flex-grow-1">
                  <Col md={6}>
                    <div className="p-3 rounded h-100 d-flex flex-column justify-content-center" style={{ background: "var(--light-orange)" }}>
                      <small className="text-muted d-block mb-3">Category</small>
                      <span className="fw-semibold">{item.cname}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 rounded h-100 d-flex flex-column justify-content-center" style={{ background: "var(--light-orange)" }}>
                      <small className="text-muted d-block mb-3">Seller</small>
                      <span className="fw-semibold">{item.seller_fname} {item.seller_lname}</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="food-card h-100">
              <Card.Body className="p-4 d-flex flex-column h-100">
                <h6 className="text-orange mb-4">
                  <i className="fas fa-star me-2"></i>Rate this Product
                </h6>
                <div className="flex-grow-1 d-flex flex-column justify-content-center">
                  <span>Your Rating</span>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="star-rating me-3">
                      {renderStars()}
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleRatingSubmit}
                      disabled={submittingRating || currentRating === 0}
                    >
                      {submittingRating ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Submitting...
                        </>
                      ) : (
                        "Submit Rating"
                      )}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  )
}

export default ItemDetail
