import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleCart } from '../../store/slices/cartSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import Loader from '../common/Loader';

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
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      dispatch(logout());
      dispatch(showNotification({
        message: 'Logged out successfully. See you soon! 👋',
        type: 'success'
      }));
      setShowProfileDropdown(false);
      navigate('/');
      setIsLoggingOut(false);
    }, 800);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setShowMobileMenu(false);
  };

  if (isLoggingOut) {
    return <Loader />;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-cream-light/95 backdrop-blur-sm z-50 shadow-sm">
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
              <button
                onClick={() => scrollToSection('home')}
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('menu')}
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection('reviews')}
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection('chefs')}
                className="text-dark hover:text-primary transition-colors font-medium"
              >
                Chefs
              </button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Profile Icon */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-10 h-10 rounded-full border-2 border-dark/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"
                >
                  👤
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-cream-light to-cream">
                          <p className="font-display text-lg text-dark text-center">
                            {currentUser?.name}
                          </p>
                          <p className="text-sm text-dark-gray text-center">
                            {currentUser?.email}
                          </p>
                        </div>
                        <div className="py-2">
                          <button className="w-full text-center px-4 py-3 text-dark hover:bg-cream transition-colors">
                            My Orders
                          </button>
                          <button className="w-full text-center px-4 py-3 text-dark hover:bg-cream transition-colors">
                            Profile Settings
                          </button>
                          <hr className="my-2 border-gray-100" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <Link
                          to="/login"
                          className="block px-4 py-3 text-dark text-center hover:bg-cream transition-colors"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          className="block px-4 py-3 text-dark text-center hover:bg-cream transition-colors"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Sign Up
                        </Link>
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

              <button className="hidden lg:block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
                Reserve Table
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              >
                <span className={`w-6 h-0.5 bg-dark transition-all ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-dark transition-all ${showMobileMenu ? 'opacity-0' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-dark transition-all ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileMenu(false)}
      >
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl p-8 transition-transform duration-300 ease-out ${
            showMobileMenu ? 'translate-x-0' : '-translate-x-full'
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
              <button
                onClick={() => scrollToSection('home')}
                className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('menu')}
                className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection('reviews')}
                className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection('chefs')}
                className="text-dark hover:text-primary transition-colors font-medium text-lg text-left"
              >
                Chefs
              </button>
              <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium transition-all mt-4">
                Reserve Table
              </button>
            </div>
          </div>
      </div>
    </>
  );
};

export default Navbar;
