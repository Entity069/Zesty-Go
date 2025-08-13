"use client"

import { useState, useEffect, useRef } from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"
import { intcomma } from "../../utils/helpers"

const EditItems = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    status: "available",
  })
  const [categories, setCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [itemLoading, setItemLoading] = useState(true)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const { sitem_id } = useParams()
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (sitem_id) {
      fetchItemData()
      fetchCategories()
    } else {
      navigate("/seller/manage-items")
    }
  }, [sitem_id])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/seller/all-categories", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        showError("Error", "Failed to fetch categories. Please try again later.")
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
        if (data.categories.length > 0) {
          setFormData((prev) => ({ ...prev, category: data.categories[0].id }))
        }
      }
    } catch (error) {
      showError("Error", "Failed to load categories")
    }
  }

  const fetchItemData = async () => {
    try {
      const response = await fetch(`/api/seller/item/${sitem_id}`)
      const data = await response.json()

      if (data.success) {
        const item = data.item
        setFormData({
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category_id,
          status: item.status,
        })
        setPreviewImage(item.image)
      } else {
        showError("Error", "Failed to load item data")
      }
    } catch (error) {
      showError("Error", "Failed to load item data")
    } finally {
      setItemLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Invalid File", "Please select an image file")
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("id", sitem_id)
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key])
      })

      if (imageFile) {
        submitData.append("itemImage", imageFile)
      }

      const response = await fetch(`/api/seller/edit-item/${sitem_id}`, {
        method: "POST",
        body: submitData,
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        showSuccess("Item Updated", data.msg)
        setTimeout(() => {
          navigate("/seller/manage-items")
        }, 1500)
      } else {
        showError("Update Failed", data.msg)
      }
    } catch (error) {
      showError("Error", "Failed to update item. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (itemLoading) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-5">
            <div className="spinner-bor   der text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading item data...</p>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="align-items-start">
          <Col lg={8}>
            <Form onSubmit={handleSubmit}>
              <div className="food-card mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Basic Information</h5>

                  <Row className="g-3">
                    <Col md={8}>
                      <Form.Floating>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Item Name"
                          required
                        />
                        <Form.Label>Item Name</Form.Label>
                      </Form.Floating>
                    </Col>
                    <Col md={4}>
                      <Form.Floating>
                        <Form.Control
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="Price"
                          step="0.01"
                          min="0"
                          required
                        />
                        <Form.Label>Price (₹)</Form.Label>
                      </Form.Floating>
                    </Col>
                    <Col xs={12}>
                      <Form.Floating>
                        <Form.Control
                          as="textarea"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Description"
                          style={{ height: "100px" }}
                          required
                        />
                        <Form.Label>Description</Form.Label>
                      </Form.Floating>
                    </Col>
                    <Col md={6}>
                      <Form.Floating>
                        <Form.Select name="category" value={formData.category} onChange={handleInputChange} required>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Label>Category</Form.Label>
                      </Form.Floating>
                    </Col>
                    <Col md={6}>
                      <Form.Floating>
                        <Form.Select name="status" value={formData.status} onChange={handleInputChange} required>
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                          <option value="discontinued">Discontinued</option>
                        </Form.Select>
                        <Form.Label>Status</Form.Label>
                      </Form.Floating>
                    </Col>
                  </Row>
                </div>
              </div>

              <div className="food-card mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Item Image</h5>

                  <Row className="g-3">
                    <Col xs={12}>
                      <Form.Label>Upload New Image (optional)</Form.Label>
                      <Form.Control type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                      <Form.Text>Leave empty to keep current image</Form.Text>
                    </Col>
                  </Row>
                </div>
              </div>
            </Form>
          </Col>

          <Col lg={4}>
            <div className="position-sticky" style={{ top: "20px" }}>
              <div className="food-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Preview</h5>

                  <div className="food-card position-relative">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      className="card-img-top"
                      alt="Preview"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div className="rating me-2">
                          <i className="fas fa-star me-1"></i>4.5
                        </div>
                        <small className="text-muted">(Reviews)</small>
                      </div>
                      <h6 className="card-title fw-bold">{formData.name || "Item Name"}</h6>
                      <p className="text-muted small mb-3">
                        {formData.description || "Item description will appear here..."}
                      </p>
                      <div className="d-flex align-items-center justify-content-between">
                        <h6 className="fw-bold mb-0 text-orange">
                          ₹{formData.price ? intcomma(Number.parseFloat(formData.price)) : "0.00"}
                        </h6>
                        <Button variant="primary" size="sm">
                          <i className="fas fa-plus"></i>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    <Button type="submit" variant="primary" disabled={loading} onClick={handleSubmit}>
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Updating Item...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>Update Item
                        </>
                      )}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate("/seller/manage-items")}>
                      <i className="fas fa-arrow-left me-2"></i>Back to Items
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  )
}

export default EditItems
