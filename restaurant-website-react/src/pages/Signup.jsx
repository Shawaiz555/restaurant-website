import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showNotification } from "../store/slices/notificationSlice";
import authService from "../services/authService";
import Loader from "../components/common/Loader";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Utensils,
  Sparkles,
  Check,
  X,
} from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    setNavigating(true);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  // Password strength validation
  const getPasswordStrength = () => {
    const password = formData.password;
    const checks = {
      length: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor =
    passwordStrength.score === 4
      ? "bg-green-500"
      : passwordStrength.score === 3
        ? "bg-yellow-500"
        : passwordStrength.score >= 2
          ? "bg-orange-500"
          : "bg-red-500";
  const strengthText =
    passwordStrength.score === 4
      ? "Strong"
      : passwordStrength.score === 3
        ? "Good"
        : passwordStrength.score >= 2
          ? "Fair"
          : "Weak";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      dispatch(
        showNotification({
          message: "Passwords do not match",
          type: "error",
        }),
      );
      setLoading(false);
      return;
    }

    const result = authService.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setSuccess(result.message);
      dispatch(
        showNotification({
          message: "Account created successfully! Redirecting to login... ✅",
          type: "success",
        }),
      );
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(result.message);
      dispatch(
        showNotification({
          message: result.message,
          type: "error",
        }),
      );
    }

    setLoading(false);
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
              <div className="absolute top-10 right-10 w-20 h-20 border-4 border-white rounded-full"></div>
              <div className="absolute top-32 left-20 w-16 h-16 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-20 right-1/4 w-24 h-24 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-40 left-10 w-12 h-12 border-4 border-white rounded-full"></div>
            </div>

            <div className="relative h-full flex flex-col justify-between text-white z-10">
              {/* Top Section */}
              <div className="flex items-center gap-3">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl">
                  <Utensils className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold ml-1">
                    Bites
                  </h3>
                  <p className="text-sm text-white/80 ml-1">
                    Delicious Food Delivered
                  </p>
                </div>
              </div>

              {/* Center Content */}
              <div className="text-center space-y-6 mt-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Join Our Community
                </div>

                <h2 className="font-display text-5xl xl:text-6xl font-bold leading-tight">
                  Start Your
                  <br />
                  Food Journey!
                </h2>

                <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
                  Create an account and unlock exclusive access to our delicious
                  menu
                </p>

                {/* Decorative Food Image */}
                <div className="relative w-full max-w-md mx-auto mt-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl blur-2xl"></div>
                  <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop"
                    alt="Delicious Food"
                    className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                    style={{ animation: "floating 4s ease-in-out infinite" }}
                  />
                </div>
              </div>

              {/* Bottom Features */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Order from 500+ delicious dishes
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Fast delivery to your doorstep
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Exclusive member discounts
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col">
            {/* Back Button */}
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 text-dark-gray hover:text-primary transition-colors mb-6 group w-fit"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>

            {/* Logo for Mobile */}
            <div className="lg:hidden mb-6">
              <button onClick={handleBackToHome} className="mx-auto block">
                <img
                  src="/assets/images/BitesLogo.png"
                  alt="Bites Logo"
                  className="h-24 w-40 object-contain"
                />
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-dark mb-3">
                Sign Up
              </h2>
              <p className="text-lg text-dark-gray">
                Create your account to get started
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 animate-bounce-in">
                <Check className="w-5 h-5 text-green-600" />
                <p className="font-medium">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark placeholder:text-gray-400"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark placeholder:text-gray-400"
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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark placeholder:text-gray-400"
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

                {/* Password Strength Indicator */}
                {formData.password &&
                  (passwordFocused || formData.password.length > 0) && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dark-gray">
                          Password Strength:
                        </span>
                        <span
                          className={`font-semibold ${
                            passwordStrength.score === 4
                              ? "text-green-600"
                              : passwordStrength.score === 3
                                ? "text-yellow-600"
                                : passwordStrength.score >= 2
                                  ? "text-orange-600"
                                  : "text-red-600"
                          }`}
                        >
                          {strengthText}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              level <= passwordStrength.score
                                ? strengthColor
                                : "bg-gray-200"
                            }`}
                          ></div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-2 text-xs ${passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}`}
                        >
                          {passwordStrength.checks.length ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>At least 6 characters</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${passwordStrength.checks.hasNumber ? "text-green-600" : "text-gray-400"}`}
                        >
                          {passwordStrength.checks.hasNumber ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>Contains a number</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${passwordStrength.checks.hasUpper && passwordStrength.checks.hasLower ? "text-green-600" : "text-gray-400"}`}
                        >
                          {passwordStrength.checks.hasUpper &&
                          passwordStrength.checks.hasLower ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>Mix of uppercase & lowercase</span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1 ml-1">
                      <X className="w-3 h-3" />
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create Your Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center mt-6 text-dark-gray">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:text-primary-dark hover:underline transition-all"
              >
                Login here
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

        @keyframes bounce-in {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Signup;
