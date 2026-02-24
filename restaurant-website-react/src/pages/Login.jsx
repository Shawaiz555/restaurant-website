import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess } from "../store/slices/authSlice";
import { loadCart } from "../store/slices/cartSlice";
import { showNotification } from "../store/slices/notificationSlice";
import authService from "../services/authService";
import Loader from "../components/common/Loader";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Utensils,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      // Redirect admin users to admin panel, regular users to home
      setTimeout(() => {
        if (result.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-cream-light to-amber-50 flex items-center justify-center p-4 pt-24 pb-12">
      <div className="relative w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Decorative */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-primary via-orange-600 to-amber-600 p-12 overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"></div>
              <div className="absolute top-32 right-20 w-16 h-16 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-20 left-1/4 w-24 h-24 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-40 right-10 w-12 h-12 border-4 border-white rounded-full"></div>
            </div>

            <div className="relative h-full flex flex-col justify-between text-white z-10">
              {/* Top Section */}
              <div className="flex items-center gap-3">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl">
                  <Utensils className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold ml-3">
                    Bites
                  </h3>
                  <p className="text-sm text-white/80 ml-3">
                    Delicious Food Delivered
                  </p>
                </div>
              </div>

              {/* Center Content */}
              <div className="text-center space-y-6 mt-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Welcome Back
                </div>

                <h2 className="font-display text-5xl xl:text-6xl font-bold leading-tight">
                  Your Favorite
                  <br />
                  Meals Await!
                </h2>

                <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
                  Login to explore our delicious menu and continue your culinary
                  journey
                </p>

                {/* Decorative Food Image */}
                <div className="relative w-full max-w-md mx-auto mt-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl blur-2xl"></div>
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
                    alt="Delicious Food"
                    className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                    style={{ animation: "floating 4s ease-in-out infinite" }}
                  />
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 text-center mt-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <div className="font-display text-3xl font-bold">500+</div>
                  <div className="text-sm text-white/80">Dishes</div>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <div className="font-display text-3xl font-bold">10k+</div>
                  <div className="text-sm text-white/80">Customers</div>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <div className="font-display text-3xl font-bold">4.9</div>
                  <div className="text-sm text-white/80">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col">
            {/* Back Button */}
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 text-dark-gray hover:text-primary transition-colors mb-8 group w-fit"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>

            {/* Logo for Mobile */}
            <div className="lg:hidden mb-8">
              <button onClick={handleBackToHome} className="mx-auto block">
                <img
                  src="/assets/images/BitesLogo.png"
                  alt="Bites Logo"
                  className="h-24 w-40 object-contain"
                />
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-dark mb-3">
                Login
              </h2>
              <p className="text-lg text-dark-gray">
                Welcome back! Please enter your details
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark placeholder:text-gray-400"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  "Login to Your Account"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center mt-8 text-dark-gray">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary font-semibold hover:text-primary-dark hover:underline transition-all"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floating {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Login;
