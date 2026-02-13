import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { showNotification } from "../store/slices/notificationSlice";
import { loadCart } from "../store/slices/cartSlice";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LocationMap from "../components/common/LocationMap";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total, clearCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    additionalNotes: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [mapCenter, setMapCenter] = useState([31.5204, 74.3587]); // Default: Lahore, Pakistan
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    dispatch(loadCart(currentUser?.id));
    // Set a small timeout to ensure cart is loaded before checking
    const timer = setTimeout(() => {
      setIsCartLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [dispatch, currentUser?.id]);

  // Redirect if cart is empty (only after cart is loaded and not during order processing)
  useEffect(() => {
    if (isCartLoaded && items.length === 0 && !orderPlaced) {
      dispatch(
        showNotification({
          message: "Your cart is empty! Add items to checkout.",
          type: "error",
        }),
      );
      navigate("/menu");
    }
  }, [items, navigate, dispatch, isCartLoaded, orderPlaced]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(
        showNotification({
          message: "Please login to checkout",
          type: "error",
        }),
      );
      navigate("/login");
    }
  }, [isAuthenticated, navigate, dispatch]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.name || "",
        email: currentUser.email || "",
      }));
    }
  }, [currentUser]);

  // Geocode address using free Nominatim API (OpenStreetMap)
  const geocodeAddress = async (address, city) => {
    if (!address || !city) return;

    setIsGeocoding(true);
    try {
      const query = encodeURIComponent(`${address}, ${city}, Pakistan`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "RestaurantWebsite/1.0", // Required by Nominatim
          },
        },
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Keep default location on error
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Debounced geocoding when address or city changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address && formData.city) {
        geocodeAddress(formData.address, formData.city);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [formData.address, formData.city]);

  // Calculate delivery fee
  const deliveryFee = 50.0;
  const subtotal = total;
  const grandTotal = subtotal + deliveryFee;

  // Handle form submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      dispatch(
        showNotification({
          message: "Please fill in all required fields",
          type: "error",
        }),
      );
      return;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      dispatch(
        showNotification({
          message: "Please enter a valid phone number",
          type: "error",
        }),
      );
      return;
    }

    setIsProcessing(true);
    setOrderPlaced(true); // Prevent cart empty redirect

    try {
      // Create order object
      const order = {
        orderId: `ORD-${Date.now()}`,
        userId: currentUser?.id,
        customerInfo: formData,
        items: items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: grandTotal,
        paymentMethod: "Cash on Delivery",
        status: "Pending",
        orderDate: new Date().toISOString(),
      };

      // Send order to backend
      const response = await fetch("http://localhost:8000/api/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const result = await response.json();

      if (result.success) {
        // Store order in localStorage
        const existingOrders = JSON.parse(
          localStorage.getItem("orders") || "[]",
        );
        existingOrders.push(order);
        localStorage.setItem("orders", JSON.stringify(existingOrders));

        // Clear cart
        clearCart(true);

        // Show success notification with email status
        let successMessage = `Order placed successfully! Order ID: ${order.orderId}`;
        if (result.emailStatus) {
          if (result.emailStatus.customerEmailSent && formData.email) {
            successMessage += " Confirmation email sent!";
          }
        }

        dispatch(
          showNotification({
            message: successMessage,
            type: "success",
          }),
        );

        setIsProcessing(false);

        // Redirect to home or order confirmation page
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);

      // Fallback: Still save order locally if backend fails
      const order = {
        orderId: `ORD-${Date.now()}`,
        userId: currentUser?.id,
        customerInfo: formData,
        items: items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: grandTotal,
        paymentMethod: "Cash on Delivery",
        status: "Pending",
        orderDate: new Date().toISOString(),
      };

      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      clearCart(true);

      dispatch(
        showNotification({
          message: `Order placed! Order ID: ${order.orderId}. (Email notification may be delayed)`,
          type: "success",
        }),
      );

      setIsProcessing(false);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  // Show loader while cart is being loaded
  if (!isCartLoaded) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-light pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🛒</div>
            <p className="text-dark-gray">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  // Prevent rendering if cart is empty (redirect will handle this)
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-light py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          {/* Header */}
          <div className="mb-8 lg:ml-2">
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-2">
              Checkout
            </h1>
            <p className="text-dark-gray">
              Complete your order and get delicious food delivered to your door
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Delivery Details Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="mb-6 pb-4 border-b-2 border-cream">
                    <h2 className="font-display text-2xl text-dark mb-1">
                      Customer Information
                    </h2>
                    <p className="text-sm text-dark-gray">
                      Please provide your contact details
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white hover:bg-cream-light/50"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white hover:bg-cream-light/50"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="md:col-span-2 relative group">
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white hover:bg-cream-light/50"
                        placeholder="+92 300 1234567"
                      />
                      <p className="text-xs text-dark-gray mt-2">
                        We'll call you for order confirmation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="mb-6 pb-4 border-b-2 border-cream">
                    <h2 className="font-display text-2xl text-dark mb-1">
                      Delivery Address
                    </h2>
                    <p className="text-sm text-dark-gray">
                      Where should we deliver your order?
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white hover:bg-cream-light/50"
                        placeholder="House #, Street name, Area"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-dark mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white hover:bg-cream-light/50"
                          placeholder="Lahore"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-semibold text-dark mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white hover:bg-cream-light/50"
                          placeholder="54000"
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Delivery Instructions{" "}
                        <span className="text-xs text-dark-gray font-normal">
                          (Optional)
                        </span>
                      </label>
                      <textarea
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none bg-white hover:bg-cream-light/50"
                        placeholder="e.g., Ring the doorbell, leave at the gate, etc."
                      />
                      <p className="text-xs text-dark-gray mt-2">
                        Any special instructions for our delivery rider
                      </p>
                    </div>
                  </div>

                  {/* Map Display */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-dark">
                        Delivery Location on Map
                      </label>
                      {isGeocoding && (
                        <span className="text-xs text-primary font-semibold animate-pulse bg-primary/10 px-3 py-1 rounded-full">
                          Locating...
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <LocationMap
                        center={mapCenter}
                        city={formData.city}
                        address={formData.address}
                      />
                      {!formData.address && !formData.city && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30">
                          <div className="text-center p-6">
                            <p className="text-dark-gray font-semibold mb-1">
                              Enter your address
                            </p>
                            <p className="text-sm text-dark-gray">
                              The map will show your location automatically
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                      <p className="text-xs text-blue-900">
                        <span className="font-semibold">Note:</span> Map shows
                        approximate location based on your address. Our delivery
                        rider will use the exact address you provided above.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="mb-6 pb-4 border-b-2 border-cream">
                    <h2 className="font-display text-2xl text-dark mb-1">
                      Payment Method
                    </h2>
                    <p className="text-sm text-dark-gray">
                      Choose how you want to pay
                    </p>
                  </div>

                  <div className="relative">
                    <div className="bg-gradient-to-br from-cream to-cream-light rounded-2xl p-6 border-2 border-primary shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-lg text-dark mb-1">
                            Cash on Delivery
                          </h3>
                          <p className="text-sm text-dark-gray">
                            Pay with cash when your order arrives at your
                            doorstep
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Available
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Payment Instructions
                    </p>
                    <p className="text-sm text-blue-800">
                      Please keep exact change ready for a smooth delivery
                      experience.
                      <span className="font-semibold">
                        {" "}
                        Online payment methods coming soon!
                      </span>
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg sticky top-24">
                <h2 className="font-display text-2xl text-dark mb-6 flex items-center gap-2">
                  <span>🛒</span>
                  <span>Order Summary</span>
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${item.size}-${index}`}
                      className="bg-cream-light rounded-xl p-3 border border-gray-200"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-dark truncate">
                            {item.name}
                          </h4>
                          {item.size && (
                            <p className="text-xs text-dark-gray">
                              Size: {item.size}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-dark-gray">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Add-ons Details */}
                      {item.addOns && (item.addOns.drinks?.length > 0 || item.addOns.desserts?.length > 0 || item.addOns.extras?.length > 0 || item.spiceLevel) && (
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                          <p className="text-xs font-semibold text-dark-gray mb-2">Customizations:</p>

                          {/* Spice Level */}
                          {item.spiceLevel && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-dark-gray">• Spice Level:</span>
                              <span className="text-xs font-medium text-dark">
                                {item.spiceLevel.replace('spice-', '').split('-').map(word =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </span>
                            </div>
                          )}

                          {/* Drinks */}
                          {item.addOns.drinks?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-dark-gray">Drinks:</span>
                              {item.addOns.drinks.map((drink, idx) => (
                                <div key={idx} className="flex items-center justify-between pl-2">
                                  <span className="text-xs text-dark">
                                    • {drink.name} {drink.quantity > 1 && `x${drink.quantity}`}
                                  </span>
                                  <span className="text-xs text-primary font-medium">
                                    +Rs.{(drink.price * drink.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Desserts */}
                          {item.addOns.desserts?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-dark-gray">Desserts:</span>
                              {item.addOns.desserts.map((dessert, idx) => (
                                <div key={idx} className="flex items-center justify-between pl-2">
                                  <span className="text-xs text-dark">
                                    • {dessert.name} {dessert.quantity > 1 && `x${dessert.quantity}`}
                                  </span>
                                  <span className="text-xs text-primary font-medium">
                                    +Rs.{(dessert.price * dessert.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Extras */}
                          {item.addOns.extras?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-dark-gray">Extras:</span>
                              {item.addOns.extras.map((extra, idx) => (
                                <div key={idx} className="flex items-center justify-between pl-2">
                                  <span className="text-xs text-dark">
                                    • {extra.name} {extra.quantity > 1 && `x${extra.quantity}`}
                                  </span>
                                  <span className="text-xs text-primary font-medium">
                                    +Rs.{(extra.price * extra.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-dark-gray">
                    <span>Subtotal</span>
                    <span>Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-dark-gray">
                    <span>Delivery Fee</span>
                    <span>Rs.{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                    <span className="font-display text-xl text-dark">
                      Total
                    </span>
                    <span className="font-display text-2xl text-primary">
                      Rs.{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className={`w-full mt-6 py-4 rounded-2xl font-display text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white hover:shadow-2xl hover:scale-105"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <span className="text-xl">✓</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-dark-gray mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
