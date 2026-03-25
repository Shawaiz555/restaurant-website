import React, { useEffect, useState, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import { loadCart, fetchCart } from './store/slices/cartSlice';
import { fetchPublicSettings } from './store/slices/settingsSlice';
import Loader from './components/common/Loader';
import NotificationManager from './components/common/NotificationManager';

import Home from './pages/user/Home';
import Menu from './pages/user/Menu';
import About from './pages/user/About';
import Services from './pages/user/Services';
import ProductDetail from './pages/user/ProductDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/user/Checkout';
import Navbar from './components/layout/Navbar';
import CartDrawer from './components/layout/CartDrawer';
import Footer from './components/layout/Footer';

// Admin Components
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleGuard from './components/routing/RoleGuard';
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
import AdminStaffManagement from './pages/admin/AdminStaffManagement';
import AdminPayments from './pages/admin/AdminPayments';
import AdminKitchenQueue from './pages/admin/AdminKitchenQueue';
import AdminSystemSettings from './pages/admin/AdminSystemSettings';
import AdminPOS from './pages/admin/AdminPOS';

// Auth Pages
import StaffLogin from './pages/StaffLogin';

// User Pages
import Reservations from './pages/user/Reservations';
import MyReservations from './pages/user/MyReservations';
import Deals from './pages/user/Deals';

// Component to handle cart initialization
function AppContent() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const location = useLocation();

  // Fetch public settings once on app boot
  useEffect(() => {
    dispatch(fetchPublicSettings());
  }, [dispatch]);

  // Load cart when app mounts or user changes
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart());
    } else {
      dispatch(loadCart(null));
    }
  }, [dispatch, currentUser]);

  // Show loader instantly on route change, hide after new page renders
  const [routeLoading, setRouteLoading] = useState(false);

  useLayoutEffect(() => {
    setRouteLoading(true);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setRouteLoading(false);
  }, [location.pathname]);

  return (
    <>
      <NotificationManager />
      {routeLoading && <Loader />}

      <Routes>
        {/* Admin Routes - any staff role can enter AdminLayout */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard — all roles */}
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Orders — all roles */}
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />

          {/* Products — super_admin, manager */}
          <Route path="products" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminProducts />
            </RoleGuard>
          } />
          <Route path="products/new" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminProductForm />
            </RoleGuard>
          } />
          <Route path="products/:id/edit" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminProductForm />
            </RoleGuard>
          } />

          {/* Tables — super_admin, manager, employee */}
          <Route path="tables" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'employee']}>
              <AdminTables />
            </RoleGuard>
          } />
          <Route path="tables/new" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'employee']}>
              <AdminTableForm />
            </RoleGuard>
          } />
          <Route path="tables/:id/edit" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'employee']}>
              <AdminTableForm />
            </RoleGuard>
          } />

          {/* Reservations — super_admin, manager, employee */}
          <Route path="reservations" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'employee']}>
              <AdminReservations />
            </RoleGuard>
          } />
          <Route path="reservations/:id" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'employee']}>
              <AdminReservationDetail />
            </RoleGuard>
          } />

          {/* Deals — super_admin, manager */}
          <Route path="deals" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminDeals />
            </RoleGuard>
          } />
          <Route path="deals/new" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminDealForm />
            </RoleGuard>
          } />
          <Route path="deals/:id/edit" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminDealForm />
            </RoleGuard>
          } />

          {/* Expenses — super_admin, manager */}
          <Route path="expenses" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminExpenses />
            </RoleGuard>
          } />

          {/* Analytics — super_admin, manager */}
          <Route path="analytics" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminAnalytics />
            </RoleGuard>
          } />

          {/* Stock — Ingredients: super_admin, manager, chef */}
          <Route path="ingredients" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'chef']}>
              <AdminIngredients />
            </RoleGuard>
          } />

          {/* Stock — Suppliers, Purchases, AddonStock, StockReports: super_admin, manager */}
          <Route path="suppliers" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminSuppliers />
            </RoleGuard>
          } />
          <Route path="purchases" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminPurchases />
            </RoleGuard>
          } />
          <Route path="addon-stock" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminAddonStock />
            </RoleGuard>
          } />
          <Route path="stock-reports" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminStockReports />
            </RoleGuard>
          } />

          {/* Recipes, Wastage — super_admin, manager, chef */}
          <Route path="recipes" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'chef']}>
              <AdminRecipes />
            </RoleGuard>
          } />
          <Route path="wastage" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'chef']}>
              <AdminWastage />
            </RoleGuard>
          } />

          {/* Staff Management — super_admin, manager */}
          <Route path="staff" element={
            <RoleGuard allowedRoles={['super_admin', 'manager']}>
              <AdminStaffManagement />
            </RoleGuard>
          } />

          {/* Payments — super_admin, manager, employee */}
          <Route path="payments" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'employee']}>
              <AdminPayments />
            </RoleGuard>
          } />

          {/* Kitchen Queue — chef (also accessible to super_admin, manager) */}
          <Route path="kitchen-queue" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'chef']}>
              <AdminKitchenQueue />
            </RoleGuard>
          } />

          {/* POS / New Order — super_admin, manager, employee */}
          <Route path="pos" element={
            <RoleGuard allowedRoles={['super_admin', 'manager', 'employee']}>
              <AdminPOS />
            </RoleGuard>
          } />

          {/* System Settings — super_admin only */}
          <Route path="settings" element={
            <RoleGuard allowedRoles={['super_admin']}>
              <AdminSystemSettings />
            </RoleGuard>
          } />
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
                  <Route path="/staff/login" element={<StaffLogin />} />
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
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
