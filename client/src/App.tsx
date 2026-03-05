/*
MercatoX AI E-Commerce Platform
Copyright © 2026
All Rights Reserved.

Unauthorized copying of this file or system is strictly prohibited.
*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import HomePage from './pages/home/HomePage';
import Recommendations from './pages/Recommendations';
import CategoriesPage from './pages/shop/CategoriesPage';
import CategoryProductsPage from './pages/shop/CategoryProductsPage';
import ProductDetailsPage from './pages/shop/ProductDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AddProduct from './pages/dashboard/AddProduct';
import CartPage from './pages/CartPage';
import ShippingPage from './pages/ShippingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import TrackingPage from './pages/TrackingPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import NotificationBanner from './components/NotificationBanner';
import { fetchWithKind } from './services/axiosWrapper';
import type { ErrorKind } from './services/axiosWrapper';

function App() {
  const [errorKind, setErrorKind] = React.useState<ErrorKind | 'none'>('none');

  React.useEffect(() => {
    const runHealthCheck = async () => {
      // Use a short timeout for health check
      const result = await fetchWithKind<any>('/health', { timeout: 2000 });
      if (result.ok) {
        setErrorKind('none');
      } else if (result.kind === 'network' || result.kind === 'server') {
        setErrorKind(result.kind);
      }
    };

    runHealthCheck();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <NotificationBanner kind={errorKind} />
          <Routes>
            {/* Main Layout (Public) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="wishlist" element={<WishlistPage />} />

              {/* Shop Sub-routes */}
              <Route path="shop">
                <Route index element={<CategoriesPage />} />
                <Route path="category/:categoryId" element={<CategoryProductsPage />} />
                <Route path="product/:productId" element={<ProductDetailsPage />} />
              </Route>
            </Route>

            {/* Auth Layout */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="/auth/login" replace />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
            </Route>

            {/* Dashboard Layout (Protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="settings" element={<div className="card p-6 bg-white">User Settings Page</div>} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="orders/:orderId/track" element={<TrackingPage />} />
              <Route path="shipping" element={<ShippingPage />} />
              <Route path="add-product" element={<AddProduct />} />
            </Route>

            {/* PART 1 — Separate Admin Route */}
            <Route
              path="/admindashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

