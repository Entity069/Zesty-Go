"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import Header from "./Header"
import Sidebar from "./Sidebar"
import AdminSidebar from "./AdminSidebar"
import SellerSidebar from "./SellerSidebar"

const Layout = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(false)
  const { user } = useAuth()

  const toggleSidebar = () => {
    setSidebarShow(!sidebarShow)
  }

  const hideSidebar = () => {
    setSidebarShow(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar")
      const sidebarToggler = document.querySelector(".sidebar-toggler")

      if (
        sidebar &&
        sidebarToggler &&
        window.innerWidth <= 992 &&
        !sidebar.contains(event.target) &&
        !sidebarToggler.contains(event.target) &&
        sidebarShow
      ) {
        setSidebarShow(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [sidebarShow])

  const getSidebarComponent = () => {
    if (!user) return null

    switch (user.user_type) {
      case "admin":
        return <AdminSidebar show={sidebarShow} onHide={hideSidebar} />
      case "seller":
        return <SellerSidebar show={sidebarShow} onHide={hideSidebar} />
      default:
        return <Sidebar show={sidebarShow} onHide={hideSidebar} />
    }
  }

  return (
    <div className="d-flex">
      {getSidebarComponent()}
      <div className="main-content flex-grow-1">
        <Header onToggleSidebar={toggleSidebar} />
        <main>{children}</main>
      </div>
    </div>
  )
}

export default Layout
