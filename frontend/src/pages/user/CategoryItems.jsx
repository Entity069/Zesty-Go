"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma } from "../../utils/helpers"

const CategoryItems = () => {
  const [items, setItems] = useState([])
  const [categoryName, setCategoryName] = useState("")
  const { category_id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchCategoryItems()
  }, [category_id])

  const fetchCategoryItems = async () => {
    try {
      const response = await fetch(`/api/order/categories/${category_id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new showError("Error", "Failed to fetch category items")
      }
      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      showSuccess("Success", data.msg)

      setItems(data.items || [])
      setCategoryName(data.category.name)
    } catch (error) {
      showError("Error", "Failed to load category items")
    }
  }

  const handleAddToCart = async (item) => {
    try {
      const response = await fetch("/api/order/add-to-cart", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: item.id, quantity: 1 }),
      })
      if (!response.ok) {
        showError("Add Failed", "Failed to add item to cart")
      }

      const data = await response.json()
      if (!data.success) {
        showError("Add Failed", data.msg)
        return
      }
      showSuccess("Added to Cart", data.msg)
    } catch (error) {
      showError("Add Failed", "Could not add item to cart")
    }
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex align-items-center">
              <Button variant="link" className="p-0 me-3" onClick={() => navigate("/categories")}>
                <i className="fas fa-arrow-left"></i>
              </Button>
              <h5 className="fw-bold mb-0">{categoryName} Items</h5>
            </div>
          </Col>
        </Row>

        {items.length > 0 ? (
          <Row className="g-4">
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
                          e.stopPropagation() // prevent card click when clikcing on plus
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
          <div className="text-center py-5">
            <i className="fas fa-utensils fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">No items found</h4>
            <p className="text-muted">No items available in this category yet.</p>
            <Button variant="primary" onClick={() => navigate("/categories")}>
              <i className="fas fa-arrow-left me-2"></i>Back to Categories
            </Button>
          </div>
        )}
      </Container>
    </Layout>
  )
}

export default CategoryItems
