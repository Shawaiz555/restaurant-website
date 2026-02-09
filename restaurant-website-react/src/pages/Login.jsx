import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess } from "../store/slices/authSlice";
import { loadCart } from "../store/slices/cartSlice";
import { showNotification } from "../store/slices/notificationSlice";
import authService from "../services/authService";
import Loader from "../components/common/Loader";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = authService.login(formData.email, formData.password);

    if (result.success) {
      dispatch(loginSuccess(result.user));
      dispatch(loadCart(result.user.id));
      dispatch(
        showNotification({
          message: `Welcome back, ${result.user.name}! 🎉`,
          type: "success",
        }),
      );
      setNavigating(true);
      setTimeout(() => {
        navigate("/");
      }, 800);
    } else {
      setError(result.message);
      dispatch(
        showNotification({
          message: result.message,
          type: "error",
        }),
      );
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setNavigating(true);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  if (pageLoading || navigating) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-cream-light flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Image (Hidden on mobile) */}
          <div className="hidden lg:block relative bg-gradient-to-br from-primary to-primary-dark p-12">
            <div className="h-full flex flex-col justify-center items-center text-white">
              <div className="text-center mb-8">
                <h2 className="font-display text-4xl xl:text-5xl mb-4">
                  Welcome Back!
                </h2>
                <p className="text-lg opacity-90">
                  Login to continue your delicious journey
                </p>
              </div>

              {/* Decorative Food Image */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
                  alt="Delicious Food"
                  className="relative rounded-3xl shadow-2xl"
                  style={{ animation: "floating 3s ease-in-out infinite" }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 sm:p-12">
            <button
              onClick={handleBackToHome}
              className="block w-full text-center my-8 text-dark-gray hover:text-dark transition-colors"
            >
              ← Back to Home
            </button>

            <button
              onClick={handleBackToHome}
              className="flex items-center justify-center gap-2 mb-8 w-full"
            >
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl">
                🍽️
              </div>
              <span className="font-display text-3xl text-dark">Bites</span>
            </button>

            <h2 className="font-display text-3xl text-center mb-2">Login</h2>
            <p className="text-center text-dark-gray mb-8">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-dark font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-dark font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-full font-display text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center mt-6 text-dark-gray">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary font-medium hover:text-primary-dark"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floating {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
