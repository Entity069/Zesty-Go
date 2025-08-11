"use client"

import { Toast, ToastContainer as BSToastContainer } from "react-bootstrap"
import { useToast } from "../context/ToastContext"

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <BSToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          show={true}
          onClose={() => removeToast(toast.id)}
          delay={5000}
          autohide
          className={`toast-${toast.type}`}
        >
          <Toast.Header>
            <i
              className={`fas ${
                toast.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-circle text-danger"
              } me-2`}
            ></i>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      ))}
    </BSToastContainer>
  )
}

export default ToastContainer
