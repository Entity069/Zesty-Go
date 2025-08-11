"use client"

import { createContext, useContext, useState } from "react"

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showSuccess = (title, message) => {
    const id = Date.now()
    const toast = {
      id,
      type: "success",
      title,
      message,
    }
    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      removeToast(id)
    }, 2000)
  }

  const showError = (title, message) => {
    const id = Date.now()
    const toast = {
      id,
      type: "error",
      title,
      message,
    }
    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      removeToast(id)
    }, 2000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const value = {
    toasts,
    showSuccess,
    showError,
    removeToast,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
