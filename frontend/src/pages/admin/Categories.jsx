"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Modal, Form, FloatingLabel } from "react-bootstrap"
import Layout from "../../components/Layout"
import { useToast } from "../../context/ToastContext"

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/all-categories", {
        method: "GET",
        credentials: "include"
      })
      if (!response.ok) {
        showError("Error", "Failed to fetch categories")
        return
      }
      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }

      setCategories(data.categories)
      showSuccess("Categories Fetched", "Categories loaded successfully")
    } catch (error) {
      showError("Error", "Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddCategory = async () => {
    if (!formData.name) {
      showError("Validation Error", "Please enter category name")
      return
    }

    try {
      const response = await fetch("/api/admin/add-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || "",
        }),
        credentials: "include"
      })
      if (!response.ok) {
        showError("Error", "Failed to add category")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }

      setCategories([...categories, data.category])
      setShowAddModal(false)
      setFormData({ name: "", description: "" })
      showSuccess("Success", "Category added successfully")
    } catch (error) {
      showError("Error", "Failed to add category")
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
    })
    setShowEditModal(true)
  }

  const handleUpdateCategory = async () => {
    if (!formData.name) {
      showError("Validation Error", "Please enter category name")
      return
    }

    try {
      const response = await fetch(`/api/admin/edit-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingCategory.id,
          name: formData.name,
          description: formData.description || "",
        }),
        credentials: "include"
      })
      if (!response.ok) {
        showError("Error", "Failed to update category")
        return
      }
      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      }
      const updatedCategories = categories.map((category) =>
        category.id === editingCategory.id
          ? {
              ...category,
              name: formData.name,
              description: formData.description,
            }
          : category,
      )

      setCategories(updatedCategories)
      setShowEditModal(false)
      setFormData({ name: "", description: "" })
      showSuccess("Success", "Category updated successfully")
    } catch (error) {
      showError("Error", "Failed to update category")
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setEditingCategory(null)
  }

  if (loading) {
    return (
      <Layout>
        <Container fluid className="p-4">
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
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
          <Col md={10}>
            <h4 className="mb-0">Category Management</h4>
          </Col>
          <Col md={2}>
            <Button
              variant="primary"
              className="w-100"
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
            >
              <i className="fas fa-plus me-2"></i>Add Category
            </Button>
          </Col>
        </Row>

        <Card className="food-card mb-4">
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description || "-"}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" onClick={() => handleEditCategory(category)}>
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>

        {/* add */}
        <Modal
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false)
            resetForm()
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <FloatingLabel controlId="addCategoryName" label="Category Name" className="mb-3">
                <Form.Control 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Category Name"
                />
              </FloatingLabel>

              <FloatingLabel controlId="addCategoryDescription" label="Description" className="mb-3">
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Description"
                />
              </FloatingLabel>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCategory}>
              Add Category
            </Button>
          </Modal.Footer>
        </Modal>

        {/* edit */}
        <Modal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false)
            resetForm()
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <FloatingLabel controlId="editCategoryName" label="Category Name" className="mb-3">
                <Form.Control 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Category Name"
                />
              </FloatingLabel>

              <FloatingLabel controlId="editCategoryDescription" label="Description" className="mb-3">
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Description"
                />
              </FloatingLabel>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateCategory}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  )
}

export default AdminCategories