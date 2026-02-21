import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
import { useAuth } from "../../../hooks/useAuth";
import { showNotification } from "../../../store/slices/notificationSlice";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const navItems = [
    { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/admin/orders", icon: "📦", label: "Orders" },
    { path: "/admin/products", icon: "🍕", label: "Products" },
    { path: "/admin/expenses", icon: "💰", label: "Expenses" },
    { path: "/admin/analytics", icon: "📈", label: "Analytics" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    dispatch(
      showNotification({
        type: "success",
        message: "Admin Logged out successfully!",
      }),
    );
    navigate("/");
    if (onClose) onClose();
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white z-[70] transition-transform duration-300 ease-in-out
          w-72 border-r-2 border-gray-200 flex flex-col
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-br from-cream-light to-white">
          <div className="flex items-center justify-center">
            <div>
              {/* Logo */}
              <div className="flex items-center justify-center">
                <img
                  src="/assets/images/BitesLogo.png"
                  alt="logo"
                  className="w-full h-full lg:w-44 lg:h-28"
                />
              </div>
              <div>
                <h1 className="text-xl font-display text-center text-primary">
                  Admin Panel
                </h1>
                <p className="text-xs text-dark-gray text-center mt-0.5">
                  Restaurant Management
                </p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 bg-cream-light border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
              {currentUser?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-dark-gray truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-primary/10 to-primary-light/10 border-l-4 border-primary text-primary font-semibold shadow-sm"
                      : "text-dark-gray hover:bg-cream-light hover:text-primary border-l-4 border-transparent"
                  }
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t-2 border-gray-200 bg-cream-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all font-semibold"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
