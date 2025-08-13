"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Form, InputGroup } from "react-bootstrap"
import { useSearchParams, useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma } from "../../utils/helpers"

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    } else {
      loadAllItems()
    }
  }, [searchParams])

  const loadAllItems = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/order/all-items", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      if (!response.ok) {
        showError("Load Failed", "Could not load items")
        return
      }

      const data = await response.json()
      setAllItems(data.items)
      setItems(data.items)
    } catch (error) {
      showError("Load Failed", "Could not load items")
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (query) => {
    if (!query.trim()) {
      setItems(allItems)
      return
    }

    if (allItems.length === 0) {
      await loadAllItems()
      return
    }

    const searchResults = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()),
    )

    setItems(searchResults)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() })
    } else {
      setSearchParams({})
    }
  }

  const handleAddToCart = async (item) => {
    try {
      const response = await fetch("/api/order/add-to-cart", {
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
            <h5 className="fw-bold mb-3">{searchParams.get("q") ? "Search Results" : "Browse All Items"}</h5>
          </Col>
        </Row>

        {searchParams.get("q") && (
          <Row className="mb-3">
            <Col xs={12}>
              <p className="text-muted">
                Search results for "<strong>{searchParams.get("q")}</strong>" ({items.length} items found)
              </p>
            </Col>
          </Row>
        )}

        {items.length > 0 ? (
          <Row className="g-4">
            {items.map((item) => (
              <Col key={item.id} lg={3} md={6}>
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
                        {item.rating || 0}
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
        ) : searchParams.get("q") && !loading ? (
          <div className="text-center py-5">
            <i className="fas fa-search fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">No results found</h4>
            <p className="text-muted">Try searching with different keywords.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-5">
            <i className="fas fa-spinner fa-spin fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">Loading...</h4>
          </div>
        ) : null}
      </Container>
    </Layout>
  )
}

export default Search