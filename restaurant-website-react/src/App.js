import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import { loadCart, fetchCart } from './store/slices/cartSlice';
import Loader from './components/common/Loader';
import NotificationManager from './components/common/NotificationManager';

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
import AdminTables from './pages/admin/AdminTables';
import AdminTableForm from './pages/admin/AdminTableForm';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReservationDetail from './pages/admin/AdminReservationDetail';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminDeals from './pages/admin/AdminDeals';
import AdminDealForm from './pages/admin/AdminDealForm';
import AdminIngredients from './pages/admin/AdminIngredients';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminPurchases from './pages/admin/AdminPurchases';
import AdminRecipes from './pages/admin/AdminRecipes';
import AdminWastage from './pages/admin/AdminWastage';
import AdminStockReports from './pages/admin/AdminStockReports';
import AdminAddonStock from './pages/admin/AdminAddonStock';

// User Pages
import Reservations from './pages/Reservations';
import MyReservations from './pages/MyReservations';
import Deals from './pages/Deals';

// Component to handle cart initialization
function AppContent() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Load cart when app mounts or user changes
  useEffect(() => {
    if (currentUser) {
      // For logged-in users, fetch cart from server
      dispatch(fetchCart());
    } else {
      // For guests, load from localStorage
      dispatch(loadCart(null));
    }
  }, [dispatch, currentUser]);

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
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="tables/new" element={<AdminTableForm />} />
          <Route path="tables/:id/edit" element={<AdminTableForm />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="reservations/:id" element={<AdminReservationDetail />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="deals/new" element={<AdminDealForm />} />
          <Route path="deals/:id/edit" element={<AdminDealForm />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="ingredients" element={<AdminIngredients />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="purchases" element={<AdminPurchases />} />
          <Route path="recipes" element={<AdminRecipes />} />
          <Route path="wastage" element={<AdminWastage />} />
          <Route path="stock-reports" element={<AdminStockReports />} />
          <Route path="addon-stock" element={<AdminAddonStock />} />
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
                  <Route path="/reservations" element={<Reservations />} />
                  <Route path="/my-reservations" element={<MyReservations />} />
                  <Route path="/deals" element={<Deals />} />
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
