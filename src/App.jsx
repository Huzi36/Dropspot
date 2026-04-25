import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Product from './pages/Product'

import SellerDashboard from './pages/seller/Dashboard'
import SellerCatalog from './pages/seller/Catalog'
import SellerOrders from './pages/seller/Orders'
import SellerAccount from './pages/seller/Account'
import SellerStores from './pages/seller/Stores'
import SellerShipments from './pages/seller/Shipments'
import SellerWishlist from './pages/seller/Wishlist'
import SellerInvoices from './pages/seller/Invoices'

import SupplierConsoleLogin from './pages/supplier-console/Login'
import SupplierConsoleSignup from './pages/supplier-console/Signup'
import SupplierConsoleDashboard from './pages/supplier-console/Dashboard'
import SupplierConsoleProducts from './pages/supplier-console/Products'
import SupplierConsoleOrders from './pages/supplier-console/Orders'
import SupplierConsoleAccount from './pages/supplier-console/Account'
import SupplierConsoleShipping from './pages/supplier-console/Shipping'
import SupplierConsoleQA from './pages/supplier-console/QA'
import SupplierConsoleSettings from './pages/supplier-console/Settings'

import SupplierDashboard from './pages/supplier/Dashboard'
import SupplierProducts from './pages/supplier/Products'
import SupplierOrders from './pages/supplier/Orders'

function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#143D59]">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (allowedRole && profile?.role !== allowedRole) return <Navigate to="/login" />
  return children
}

function SupplierProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#143D59]">Loading...</div>
  if (!user) return <Navigate to="/seller-console" />
  if (profile?.role !== 'supplier') return <Navigate to="/seller-console" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/product/:id" element={<Product />} />

      {/* Seller Routes */}
      <Route path="/seller/dashboard" element={<ProtectedRoute allowedRole="seller"><SellerDashboard /></ProtectedRoute>} />
      <Route path="/seller/catalog" element={<ProtectedRoute allowedRole="seller"><SellerCatalog /></ProtectedRoute>} />
      <Route path="/seller/orders" element={<ProtectedRoute allowedRole="seller"><SellerOrders /></ProtectedRoute>} />
      <Route path="/seller/account" element={<ProtectedRoute allowedRole="seller"><SellerAccount /></ProtectedRoute>} />
      <Route path="/seller/stores" element={<ProtectedRoute allowedRole="seller"><SellerStores /></ProtectedRoute>} />
      <Route path="/seller/shipments" element={<ProtectedRoute allowedRole="seller"><SellerShipments /></ProtectedRoute>} />
      <Route path="/seller/wishlist" element={<ProtectedRoute allowedRole="seller"><SellerWishlist /></ProtectedRoute>} />
      <Route path="/seller/invoices" element={<ProtectedRoute allowedRole="seller"><SellerInvoices /></ProtectedRoute>} />

      {/* Supplier Console */}
      <Route path="/seller-console" element={<SupplierConsoleLogin />} />
      <Route path="/seller-console/signup" element={<SupplierConsoleSignup />} />
      <Route path="/seller-console/dashboard" element={<SupplierProtectedRoute><SupplierConsoleDashboard /></SupplierProtectedRoute>} />
      <Route path="/seller-console/products" element={<SupplierProtectedRoute><SupplierConsoleProducts /></SupplierProtectedRoute>} />
      <Route path="/seller-console/orders" element={<SupplierProtectedRoute><SupplierConsoleOrders /></SupplierProtectedRoute>} />
      <Route path="/seller-console/account" element={<SupplierProtectedRoute><SupplierConsoleAccount /></SupplierProtectedRoute>} />
      <Route path="/seller-console/shipping" element={<SupplierProtectedRoute><SupplierConsoleShipping /></SupplierProtectedRoute>} />
      <Route path="/seller-console/qa" element={<SupplierProtectedRoute><SupplierConsoleQA /></SupplierProtectedRoute>} />
      <Route path="/seller-console/settings" element={<SupplierProtectedRoute><SupplierConsoleSettings /></SupplierProtectedRoute>} />

      {/* Old supplier routes */}
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