import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ToastProvider } from "./context/ToastContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ToastContainer from "./components/ToastContainer"
import RoleDashboard from "./pages/common/RoleDashboard"

import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import EmailVerified from "./pages/auth/EmailVerified"

import Home from "./pages/user/Home"
import Categories from "./pages/user/Categories"
import CategoryItems from "./pages/user/CategoryItems"
import Search from "./pages/user/Search"
import ItemDetail from "./pages/user/ItemDetail"
import Cart from "./pages/user/Cart"
import Orders from "./pages/user/Orders"
import Profile from "./pages/user/Profile"

// Seller Pages
import SellerDashboard from "./pages/seller/Dashboard"
import AddItems from "./pages/seller/AddItems"
import ManageItems from "./pages/seller/ManageItems"
import EditItems from "./pages/seller/EditItems"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import AdminCategories from "./pages/admin/Categories"
import AdminItems from "./pages/admin/Items"
import AdminOrders from "./pages/admin/Orders"
import AdminUsers from "./pages/admin/Users"

// Common Pages
import Error403 from "./pages/common/403"
import Error404 from "./pages/common/404"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="App">
            <ToastContainer />
            <Routes>
              {/* publiv auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verified" element={<EmailVerified />} />

              {/* dashboard -> redirects to role based dashboard */}
              <Route path="/dashboard" element={<RoleDashboard />} />

              {/* only user */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category/:category_id"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <CategoryItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/item/:item_id"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <ItemDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-cart"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* only seller routes */}
              <Route
                path="/seller/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["seller"]}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/add-items"
                element={
                  <ProtectedRoute allowedRoles={["seller"]}>
                    <AddItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/manage-items"
                element={
                  <ProtectedRoute allowedRoles={["seller"]}>
                    <ManageItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/edit-items/:sitem_id"
                element={
                  <ProtectedRoute allowedRoles={["seller"]}>
                    <EditItems />
                  </ProtectedRoute>
                }
              />

              {/* only admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/all-categories"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/all-items"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/all-orders"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/all-users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              {/* error */}
              <Route path="/403" element={<Error403 />} />
              <Route path="/404" element={<Error404 />} />

              {/* default routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App