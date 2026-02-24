import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import { loadCart } from './store/slices/cartSlice';
import Loader from './components/common/Loader';
import NotificationManager from './components/common/NotificationManager';
import authService from './services/authService';
import productsService from './services/productsService';

import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Services from './pages/Services';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import Navbar from './components/layout/Navbar';
import CartDrawer from './components/layout/CartDrawer';
import Footer from './components/layout/Footer';

// Admin Components
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminLayout from './components/admin/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Component to handle cart initialization
function AppContent() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Initialize admin user and migrate products on app startup
  useEffect(() => {
    authService.initializeAdminUser();
    // Migrate products from static file to localStorage if not already done
    productsService.migrateProductsToLocalStorage();
  }, []);

  // Load cart when app mounts or user changes
  useEffect(() => {
    dispatch(loadCart(currentUser?.id));
  }, [dispatch, currentUser?.id]);

  // Show loader on route change and scroll to top
  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Short loader for route transitions

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <NotificationManager />
      {loading && <Loader />}

      <Routes>
        {/* Admin Routes - Protected and using AdminLayout */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Public Routes - Using standard layout */}
        <Route
          path="*"
          element={
            <div className="bg-cream-light min-h-screen">
              <Navbar />
              <CartDrawer />
              <div>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Routes>
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
