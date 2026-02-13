import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { toggleCart } from "../../store/slices/cartSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import Loader from "../common/Loader";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileDropdownRef = useRef(null);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      dispatch(logout());
      dispatch(
        showNotification({
          message: "Logged out successfully. See you soon! 👋",
          type: "success",
        }),
      );
      setShowProfileDropdown(false);
      navigate("/");
      setIsLoggingOut(false);
    }, 800);
  };

  if (isLoggingOut) {
    return <Loader />;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-cream-light/85 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-6 sm:px-6 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-2xl">
                🍽️
              </div>
              <span className="font-display text-2xl text-dark">Bites</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/menu"
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Menu
              </Link>
              <Link
                to="/about"
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/services"
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Services
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Profile Icon */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`${
                    isAuthenticated
                      ? "bg-gradient-to-br from-primary to-primary-dark"
                      : "bg-white border-2 border-gray-200"
                  } w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md hover:shadow-xl relative`}
                >
                  {isAuthenticated ? (
                    <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                      {currentUser?.name?.charAt(0).toUpperCase() || "👤"}
                    </div>
                  ) : (
                    <span className="text-xl text-dark">👤</span>
                  )}
                  {isAuthenticated && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute -right-4 sm:right-0 left-auto mt-3 w-64 sm:w-72 max-w-[90vw] bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden sm:animate-dropdown">
                    {isAuthenticated ? (
                      <>
                        {/* User Info Header */}
                        <div className="p-5 bg-cream relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-xl"></div>
                          </div>

                          <div className="relative flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full text-orange-300 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-2xl font-bold shadow-lg">
                              {currentUser?.name?.charAt(0).toUpperCase() ||
                                "👤"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-lg text-primary-dark tracking-wide truncate">
                                {currentUser?.name}
                              </p>
                              <p className="text-sm text-primary-dark truncate">
                                {currentUser?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2 max-h-[50vh] sm:max-h-none overflow-y-auto">
                          <button className="w-full text-left px-5 py-3 sm:py-3 text-dark hover:bg-gradient-to-r hover:from-cream-light hover:to-cream transition-all flex items-center gap-3 group active:bg-cream">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                              📦
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm">
                                My Orders
                              </div>
                              <div className="text-xs text-dark-gray truncate">
                                Track your orders
                              </div>
                            </div>
                          </button>

                          <button className="w-full text-left px-5 py-3 sm:py-3 text-dark hover:bg-gradient-to-r hover:from-cream-light hover:to-cream transition-all flex items-center gap-3 group active:bg-cream">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                              ⚙️
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm">
                                Settings
                              </div>
                              <div className="text-xs text-dark-gray truncate">
                                Manage your account
                              </div>
                            </div>
                          </button>

                          <hr className="my-2 border-gray-200" />

                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-5 py-3 sm:py-3 mb-2 sm:mb-0 text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 group rounded-b-3xl sm:rounded-b-2xl active:bg-red-100"
                          >
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-xl group-hover:bg-red-100 transition-all flex-shrink-0">
                              🚪
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm">
                                Logout
                              </div>
                              <div className="text-xs text-red-400 truncate">
                                Sign out of your account
                              </div>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 pb-6 sm:pb-4">
                        {/* Guest Header */}
                        <div className="text-center mb-4 py-6 bg-cream rounded-xl">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl shadow-lg">
                            👤
                          </div>
                          <h3 className="font-display text-xl text-dark mb-1">
                            Welcome!
                          </h3>
                          <p className="text-sm text-dark-gray px-4">
                            Sign in to access your account
                          </p>
                        </div>

                        {/* Auth Buttons */}
                        <div className="space-y-3 sm:space-y-2">
                          <Link
                            to="/login"
                            className="block w-full bg-gradient-to-r from-primary to-primary-dark text-white text-center px-4 py-4 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 sm:hover:scale-105"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/signup"
                            className="block w-full bg-white text-primary border-2 border-primary text-center px-4 py-4 sm:py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all active:scale-95 sm:hover:scale-105"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            Create Account
                          </Link>
                        </div>

                        <p className="text-xs text-center text-dark-gray mt-4 px-4">
                          New to Bites? Sign up and get exclusive offers!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative w-10 h-10 rounded-full border-2 border-dark/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"
              >
                🛒
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              >
                <span
                  className={`w-6 h-0.5 bg-dark transition-all ${showMobileMenu ? "rotate-45 translate-y-2" : ""}`}
                ></span>
                <span
                  className={`w-6 h-0.5 bg-dark transition-all ${showMobileMenu ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`w-6 h-0.5 bg-dark transition-all ${showMobileMenu ? "-rotate-45 -translate-y-2" : ""}`}
                ></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          showMobileMenu ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowMobileMenu(false)}
      >
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl p-8 transition-transform duration-300 ease-out ${
            showMobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-2xl">
              🍽️
            </div>
            <span className="font-display text-2xl text-dark">Bites</span>
          </div>

          <div className="flex flex-col gap-6">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setShowMobileMenu(false)}
              className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
            >
              Menu
            </Link>
            <Link
              to="/about"
              onClick={() => setShowMobileMenu(false)}
              className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
            >
              About
            </Link>
            <Link
              to="/services"
              onClick={() => setShowMobileMenu(false)}
              className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
            >
              Services
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;
