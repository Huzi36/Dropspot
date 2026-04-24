import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

import SellerDashboard from './pages/seller/Dashboard'
import SellerCatalog from './pages/seller/Catalog'
import SellerOrders from './pages/seller/Orders'

import SupplierDashboard from './pages/supplier/Dashboard'
import SupplierProducts from './pages/supplier/Products'
import SupplierOrders from './pages/supplier/Orders'

function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (allowedRole && profile?.role !== allowedRole) return <Navigate to="/login" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Seller Routes */}
      <Route path="/seller/dashboard" element={<ProtectedRoute allowedRole="seller"><SellerDashboard /></ProtectedRoute>} />
      <Route path="/seller/catalog" element={<ProtectedRoute allowedRole="seller"><SellerCatalog /></ProtectedRoute>} />
      <Route path="/seller/orders" element={<ProtectedRoute allowedRole="seller"><SellerOrders /></ProtectedRoute>} />

      {/* Supplier Routes */}
      <Route path="/supplier/dashboard" element={<ProtectedRoute allowedRole="supplier"><SupplierDashboard /></ProtectedRoute>} />
      <Route path="/supplier/products" element={<ProtectedRoute allowedRole="supplier"><SupplierProducts /></ProtectedRoute>} />
      <Route path="/supplier/orders" element={<ProtectedRoute allowedRole="supplier"><SupplierOrders /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App