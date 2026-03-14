import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showNotification } from "../store/slices/notificationSlice";
import { registerUser } from "../store/slices/authSlice";
import Loader from "../components/common/Loader";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Utensils,
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

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    setNavigating(true);
    setTimeout(() => navigate("/"), 500);
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    const checks = {
      length: p.length >= 6,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
    };
    return { checks, score: Object.values(checks).filter(Boolean).length };
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
        showNotification({ message: "Passwords do not match", type: "error" }),
      );
      setLoading(false);
      return;
    }

    try {
      const resultAction = await dispatch(
        registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      );

      if (registerUser.fulfilled.match(resultAction)) {
        setSuccess("Account created successfully!");
        dispatch(
          showNotification({
            message: "Account created successfully! Redirecting to login... ✅",
            type: "success",
          }),
        );
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const errorMessage = resultAction.payload || "Registration failed";
        setError(errorMessage);
        dispatch(showNotification({ message: errorMessage, type: "error" }));
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      dispatch(
        showNotification({
          message: "An unexpected error occurred",
          type: "error",
        }),
      );
      setLoading(false);
    }
  };

  if (pageLoading || navigating) return <Loader />;

  return (
    <div
      className="bg-gradient-to-br from-orange-50 via-cream-light to-amber-50 flex items-center justify-center px-4"
      style={{ minHeight: "calc(100vh - 5rem)", marginTop: "5rem" }}
    >
      <div className="w-full max-w-lg my-6">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />

          <div className="px-9 pt-7 pb-8">
            {/* Back button */}
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>

            {/* Icon + heading */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-sans text-[1.75rem] font-bold text-dark mb-1.5 tracking-tight">
                Create account
              </h2>
              <p className="text-[0.9rem] text-gray-500">
                Join <span className="font-semibold text-primary">Bites</span>{" "}
                and start your food journey
              </p>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2.5 animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2.5 animate-bounce-in">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-dark font-semibold text-[0.875rem]">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-[1.05rem] h-[1.05rem] text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark text-[0.9rem] placeholder:text-gray-400"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-dark font-semibold text-[0.875rem]">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-[1.05rem] h-[1.05rem] text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark text-[0.9rem] placeholder:text-gray-400"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-dark font-semibold text-[0.875rem]">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-[1.05rem] h-[1.05rem] text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark text-[0.9rem] placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[1.05rem] h-[1.05rem]" />
                    ) : (
                      <Eye className="w-[1.05rem] h-[1.05rem]" />
                    )}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${level <= passwordStrength.score ? strengthColor : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs font-semibold w-10 text-right ${
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
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-dark font-semibold text-[0.875rem]">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-[1.05rem] h-[1.05rem] text-gray-400 group-focus-within:text-primary transition-colors" />
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
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark text-[0.9rem] placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-[1.05rem] h-[1.05rem]" />
                    ) : (
                      <Eye className="w-[1.05rem] h-[1.05rem]" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <X className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl text-[0.95rem] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Your Account"
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-5 text-center text-[0.875rem] text-gray-500">
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
