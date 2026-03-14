import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../store/slices/authSlice";
import { fetchCart } from "../store/slices/cartSlice";
import { showNotification } from "../store/slices/notificationSlice";
import Loader from "../components/common/Loader";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Utensils } from "lucide-react";

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
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const resultAction = await dispatch(
        loginUser({ email: formData.email, password: formData.password }),
      );

      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        await dispatch(fetchCart());
        dispatch(
          showNotification({
            message: `Welcome back, ${user.name}! 🎉`,
            type: "success",
          }),
        );
        setNavigating(true);
        setTimeout(() => {
          navigate(user.role === "admin" ? "/admin/dashboard" : "/");
        }, 800);
      } else {
        const errorMessage = resultAction.payload || "Login failed";
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

  const handleBackToHome = () => {
    setNavigating(true);
    setTimeout(() => navigate("/"), 500);
  };

  if (pageLoading || navigating) return <Loader />;

  return (
    <div
      className="bg-gradient-to-br from-orange-50 via-cream-light to-amber-50 flex items-center justify-center px-4"
      style={{ minHeight: "calc(100vh - 5rem)", marginTop: "5rem" }}
    >
      <div className="w-full max-w-md my-6">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />

          <div className="px-9 pt-7 pb-8">
            {/* Back button */}
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-7 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>

            {/* Icon + heading */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-sans text-[1.75rem] font-bold text-dark mb-1.5 tracking-tight">
                Welcome back
              </h2>
              <p className="text-[0.9rem] text-gray-500">
                Sign in to your{" "}
                <span className="font-semibold text-primary">Bites</span>{" "}
                account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5 animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    Logging in...
                  </>
                ) : (
                  "Login to Your Account"
                )}
              </button>
            </form>

            {/* Signup link */}
            <p className="mt-6 text-center text-[0.875rem] text-gray-500">
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
