"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Badge } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"

const Categories = () => {
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/order/categories", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
        showSuccess("Successful!", data.msg)
      } else {
        showError("Error!", data.msg)
      }
    } catch (error) {
      showError("Error!", "Failed to fetch categories")
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

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`)
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <h5 className="fw-bold mb-0">Food Categories</h5>
              <div className="ms-auto d-flex gap-2">
                <Badge bg="secondary" pill>
                  {categories.length} Categories
                </Badge>
              </div>
            </div>
          </Col>
        </Row>

        {categories.length > 0 ? (
          <Row className="g-4" id="categories-grid">
            {categories.map((category) => (
              <Col key={category.id} lg={3} md={4} sm={6}>
                <Card
                  className="food-card position-relative h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <Card.Img
                    variant="top"
                    src={`https://placehold.co/60x60/${getRandomColor()}/white?text=${getCategoryInitials(
                      category.name,
                    )}`}
                    alt={category.name}
                  />
                  <Card.Body>
                    <Card.Title className="fw-bold h6">{category.name}</Card.Title>
                    {category.description && (
                      <Card.Text className="text-muted small mb-3">{category.description}</Card.Text>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div id="no-categories" className="text-center py-5">
            <i className="fas fa-list fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">No categories available</h4>
            <p className="text-muted">Categories will appear here once they are added.</p>
            <button className="btn btn-primary" onClick={() => navigate("/home")}>
              <i className="fas fa-home me-2"></i>Go Home
            </button>
          </div>
        )}
      </Container>
    </Layout>
  )
}

export default Categories
