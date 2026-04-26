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

// Any logged in user can access seller routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#143D59]">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

// Only suppliers can access supplier console
function SupplierProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#143D59]">Loading...</div>
  if (!user) return <Navigate to="/supplier-console" />
  if (profile?.role !== 'supplier') return <Navigate to="/supplier-console" />
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

      {/* Seller/Reseller/Influencer Routes — any logged in user */}
      <Route path="/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
      <Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
      <Route path="/seller/catalog" element={<ProtectedRoute><SellerCatalog /></ProtectedRoute>} />
      <Route path="/seller/orders" element={<ProtectedRoute><SellerOrders /></ProtectedRoute>} />
      <Route path="/seller/account" element={<ProtectedRoute><SellerAccount /></ProtectedRoute>} />
      <Route path="/seller/stores" element={<ProtectedRoute><SellerStores /></ProtectedRoute>} />
      <Route path="/seller/shipments" element={<ProtectedRoute><SellerShipments /></ProtectedRoute>} />
      <Route path="/seller/wishlist" element={<ProtectedRoute><SellerWishlist /></ProtectedRoute>} />
      <Route path="/seller/invoices" element={<ProtectedRoute><SellerInvoices /></ProtectedRoute>} />

      {/* Supplier Console — suppliers only */}
      <Route path="/supplier-console" element={<SupplierConsoleLogin />} />
      <Route path="/supplier-console/signup" element={<SupplierConsoleSignup />} />
      <Route path="/supplier-console/dashboard" element={<SupplierProtectedRoute><SupplierConsoleDashboard /></SupplierProtectedRoute>} />
      <Route path="/supplier-console/products" element={<SupplierProtectedRoute><SupplierConsoleProducts /></SupplierProtectedRoute>} />
      <Route path="/supplier-console/orders" element={<SupplierProtectedRoute><SupplierConsoleOrders /></SupplierProtectedRoute>} />
      <Route path="/supplier-console/account" element={<SupplierProtectedRoute><SupplierConsoleAccount /></SupplierProtectedRoute>} />
      <Route path="/supplier-console/shipping" element={<SupplierProtectedRoute><SupplierConsoleShipping /></SupplierProtectedRoute>} />
      <Route path="/supplier-console/qa" element={<SupplierProtectedRoute><SupplierConsoleQA /></SupplierProtectedRoute>} />
      <Route path="/supplier-console/settings" element={<SupplierProtectedRoute><SupplierConsoleSettings /></SupplierProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
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