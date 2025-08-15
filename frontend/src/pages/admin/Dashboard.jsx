"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { intcomma } from "../../utils/helpers"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    sellers: 0,
    items: 0,
    categories: 0,
    pending: 0,
    reviews: 0,
  })

  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        showError("Error", "Failed to fetch stats")
        return
      }

      const data = await response.json()
      if (!data.success) {
        showError("Error", data.msg)
        return
      } 
      setStats({
        revenue: data.data.revenue,
        orders: data.data.orders,
        users: data.data.users,
        sellers: data.data.sellers,
        items: data.data.items,
        categories: data.data.categories,
        pending: data.data.pending,
        reviews: data.data.reviews,
      })
    } catch (error) {
      showError("Error", "Failed to fetch stats")
    }
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `₹${intcomma(stats.revenue)}`,
      icon: "fas fa-dollar-sign",
      color: "primary",
    },
    {
      title: "Total Orders",
      value: intcomma(stats.orders),
      icon: "fas fa-shopping-bag",
      color: "success",
    },
    {
      title: "Total Users",
      value: intcomma(stats.users),
      icon: "fas fa-users",
      color: "info",
    },
    {
      title: "Active Sellers",
      value: intcomma(stats.sellers),
      icon: "fas fa-store",
      color: "warning",
    },
    {
      title: "Total Items",
      value: intcomma(stats.items),
      icon: "fas fa-utensils",
      color: "secondary",
    },
    {
      title: "Categories",
      value: intcomma(stats.categories),
      icon: "fas fa-tags",
      color: "danger",
    },
    {
      title: "Pending Orders",
      value: intcomma(stats.pending),
      icon: "fas fa-clock",
      color: "success",
    },
    {
      title: "Total Reviews",
      value: intcomma(stats.reviews),
      icon: "fas fa-chart-line",
      color: "info",
    },
  ]

  const quickActions = [
    {
      title: "View All Users",
      description: "Manage registered users",
      icon: "fas fa-users",
      color: "primary",
      path: "/admin/all-users",
    },
    {
      title: "View All Orders",
      description: "Monitor platform orders",
      icon: "fas fa-shopping-bag",
      color: "success",
      path: "/admin/all-orders",
    },
    {
      title: "View All Categories",
      description: "Manage food categories",
      icon: "fas fa-tags",
      color: "danger",
      path: "/admin/all-categories",
    },
        {
      title: "View All Items",
      description: "Manage food items",
      icon: "fas fa-utensils",
      color: "danger",
      path: "/admin/all-items",
    }
  ]

  return (
    <Layout>
      <Container fluid className="p-4">
        <Row className="g-4 mb-4">
          {statsCards.map((stat, index) => (
            <Col key={index} lg={3} md={6}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className={`stats-icon bg-${stat.color} bg-opacity-10 text-${stat.color} me-3`}>
                      <i className={stat.icon}></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">{stat.title}</h6>
                      <h4 className="fw-bold mb-0">{stat.value}</h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-4 justify-content-center">
          {quickActions.map((action, index) => (
            <Col key={index} lg={3} sm={6}>
              <Card className="h-100 text-center">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <div className="mb-4">
                    <i className={`${action.icon} text-${action.color}`} style={{ fontSize: "3rem" }}></i>
                  </div>
                  <Card.Title className="fw-bold mb-3">{action.title}</Card.Title>
                  <Card.Text className="text-muted mb-4">{action.description}</Card.Text>
                  <div className="mt-auto">
                    <Button variant={action.color} className="w-100" onClick={() => navigate(action.path)}>
                      <i className="fas fa-eye me-2"></i>
                      {action.title}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Layout>
  )
}

export default AdminDashboard
