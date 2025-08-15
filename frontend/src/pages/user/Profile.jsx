import { useState, useEffect, useRef } from "react"
import { Container, Row, Col, Card, Button, Form, FloatingLabel, Modal } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import Cropper from "cropperjs"
import "cropperjs/dist/cropper.css"

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
  })
  const [showPassword, setShowPassword] = useState({})
  const [profilePic, setProfilePic] = useState("")
  const [showCropModal, setShowCropModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [croppedImage, setCroppedImage] = useState(null)
  const cropperRef = useRef(null)
  const imageRef = useRef(null)
  const modalBodyRef = useRef(null)

  const navigate = useNavigate()
  const { user, validatePassword } = useAuth()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        address: user.address || "",
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
      })
      setProfilePic(user.profile_pic || "/abstract-geometric-shapes.png")
    }
  }, [user])

  useEffect(() => {
    if (showCropModal && selectedImage && imageRef.current && modalBodyRef.current) {
      if (cropperRef.current) {
        cropperRef.current.destroy()
      }

      const modalBody = modalBodyRef.current
      const availableHeight = modalBody.clientHeight - 32
      const availableWidth = modalBody.clientWidth - 32

      imageRef.current.style.maxWidth = availableWidth + 'px'
      imageRef.current.style.maxHeight = availableHeight + 'px'
      imageRef.current.style.width = 'auto'
      imageRef.current.style.height = 'auto'

      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: 1,
        viewMode: 1,
        preview: '.preview',
        responsive: true,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        autoCropArea: 0.69,
        minContainerWidth: availableWidth,
        minContainerHeight: availableHeight,
      })
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy()
        cropperRef.current = null
      }
    }
  }, [showCropModal, selectedImage])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target.result)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropAndSave = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas({
        width: 300,
        height: 300,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob)
          setProfilePic(croppedImageUrl)
          setCroppedImage(blob)
        }
      }, 'image/jpeg', 0.9)
    }

    setShowCropModal(false)
    setSelectedImage(null)
  }

  const handleCloseCropModal = () => {
    if (cropperRef.current) {
      cropperRef.current.destroy()
      cropperRef.current = null
    }
    setShowCropModal(false)
    setSelectedImage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { firstName, lastName, email, address, newPassword, confirmPassword, currentPassword } = formData

    if (!currentPassword) {
      showError("Password Error", "Please enter your current password to continue")
      return
    }

    if (newPassword || confirmPassword) {
      if (!newPassword) {
        showError("Password Error", "New password is required")
        return
      }
      if (newPassword !== confirmPassword) {
        showError("Password Error", "New passwords do not match")
        return
      }
      if (!validatePassword(newPassword)) {
        showError("Password Error", "New password must be at least 8 characters long")
        return
      }
      if (currentPassword === newPassword) {
        showError("Password Error", "New password must be different from current password")
        return
      }
    }

    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('first_name', firstName)
      submitData.append('last_name', lastName)
      submitData.append('email', email)
      submitData.append('addr', address)
      submitData.append('currPwd', currentPassword)
      
      if (newPassword) {
        submitData.append('newPwd', newPassword)
      }
      
      if (croppedImage) {
        submitData.append('profilePic', croppedImage, 'profile.jpg')
      }
      
      const response = await fetch('/api/user/update-details', {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        showSuccess("Profile Updated", result.msg || "Your profile has been updated successfully!")
        
        if (result.profile_pic) {
          setProfilePic(result.profile_pic)
        }
        
        setFormData(prev => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
          currentPassword: "",
        }))
        
        setCroppedImage(null)
        
      } else {
        showError("Update Failed", result.msg || "Could not update profile")
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showError("Update Failed", "An error occurred while updating your profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="d-flex align-items-center mb-4">
              <i className="fas fa-user-edit text-orange fs-4 me-3"></i>
              <h4 className="mb-0">Edit Profile</h4>
            </div>

            <Row className="align-items-center">
              <Col xs="auto" className="mb-4">
                <Card className="food-card">
                  <Card.Body className="p-3 text-center" style={{ width: "200px" }}>
                    <h6 className="text-orange mb-3">
                      <i className="fas fa-camera me-2"></i>Profile Picture
                    </h6>
                    <div className="position-relative d-inline-block mb-3">
                      <img
                        src={profilePic || "/placeholder.svg"}
                        alt="Profile Picture"
                        className="rounded-circle"
                        width="120"
                        height="120"
                        style={{ objectFit: "cover" }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        className="position-absolute bottom-0 end-0 rounded-circle"
                        style={{ width: "35px", height: "35px", padding: "0" }}
                        onClick={() => document.getElementById("pic-input").click()}
                      >
                        <i className="fas fa-camera"></i>
                      </Button>
                    </div>
                    <input
                      type="file"
                      id="pic-input"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                    <p className="text-muted small mb-0">Click camera to change</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col className="mb-4">
                <Card className="food-card h-100 d-flex align-items-center">
                  <Card.Body className="p-4 w-100">
                    <Form onSubmit={handleSubmit}>
                      <h6 className="text-orange mb-3">
                        <i className="fas fa-user me-2"></i>Personal Information
                      </h6>

                      <Row>
                        <Col md={6} className="mb-3">
                          <FloatingLabel controlId="firstName" label="First Name">
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="First Name"
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={6} className="mb-3">
                          <FloatingLabel controlId="lastName" label="Last Name">
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Last Name"
                              required
                            />
                          </FloatingLabel>
                        </Col>
                      </Row>

                      <div className="mb-4">
                        <FloatingLabel controlId="email" label="Email Address">
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Address"
                            required
                          />
                        </FloatingLabel>
                      </div>

                      <h6 className="text-orange mb-3">
                        <i className="fas fa-map-marker-alt me-2"></i>Address Information
                      </h6>

                      <div className="mb-4">
                        <FloatingLabel controlId="address" label="Address">
                          <Form.Control
                            as="textarea"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Street Address"
                            style={{ height: "80px" }}
                          />
                        </FloatingLabel>
                      </div>

                      <h6 className="text-orange mb-3">
                        <i className="fas fa-lock me-2"></i>Change Password
                      </h6>

                      <Row>
                        <Col lg={6} className="mb-3">
                          <div className="position-relative">
                            <FloatingLabel controlId="newPassword" label="New Password">
                              <Form.Control
                                type={showPassword.newPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="New Password"
                              />
                            </FloatingLabel>
                            <Button
                              variant="link"
                              className="password-toggle"
                              onClick={() => togglePasswordVisibility("newPassword")}
                            >
                              <i className={`fas ${showPassword.newPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </Button>
                          </div>
                        </Col>

                        <Col lg={6} className="mb-3">
                          <div className="position-relative">
                            <FloatingLabel controlId="confirmPassword" label="Confirm Password">
                              <Form.Control
                                type={showPassword.confirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm Password"
                              />
                            </FloatingLabel>
                            <Button
                              variant="link"
                              className="password-toggle"
                              onClick={() => togglePasswordVisibility("confirmPassword")}
                            >
                              <i className={`fas ${showPassword.confirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </Button>
                          </div>
                        </Col>
                      </Row>

                      <h6 className="text-orange mb-3">
                        <i className="fas fa-key me-2"></i>Enter current password to save changes
                      </h6>

                      <Row>
                        <Col lg={6} className="mb-3">
                          <div className="position-relative">
                            <FloatingLabel controlId="currentPassword" label="Current Password">
                              <Form.Control
                                type={showPassword.currentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Current Password"
                                required
                              />
                            </FloatingLabel>
                            <Button
                              variant="link"
                              className="password-toggle"
                              onClick={() => togglePasswordVisibility("currentPassword")}
                            >
                              <i className={`fas ${showPassword.currentPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <div className="d-flex gap-3 justify-content-end">
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left me-2"></i>Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        <Modal show={showCropModal} onHide={handleCloseCropModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-crop me-2"></i>Crop Profile Picture
            </Modal.Title>
          </Modal.Header>
          <Modal.Body ref={modalBodyRef}>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
              {selectedImage && (
                <img
                  ref={imageRef}
                  src={selectedImage || "/placeholder.svg"}
                  alt="Crop preview"
                  style={{ maxWidth: "100%", maxHeight: "400px", display: "block" }}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCropModal}>
              <i className="fas fa-times me-2"></i>Cancel
            </Button>
            <Button variant="primary" onClick={handleCropAndSave}>
              <i className="fas fa-check me-2"></i>Crop & Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  )
}

export default Profile