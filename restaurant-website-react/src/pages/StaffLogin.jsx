import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../store/slices/authSlice";
import { showNotification } from "../store/slices/notificationSlice";
import Loader from "../components/common/Loader";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ChefHat,
  Shield,
  Users,
} from "lucide-react";

const STAFF_ROLES = ["super_admin", "manager", "employee", "chef"];

const ROLE_LABELS = {
  super_admin: "Super Admin",
  manager: "Manager",
  employee: "Employee",
  chef: "Chef",
};

const StaffLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 600);
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

        // Only allow staff roles through this portal
        if (!STAFF_ROLES.includes(user.role)) {
          setError(
            "This portal is for staff only. Please use the main login page.",
          );
          setLoading(false);
          return;
        }

        const roleLabel = ROLE_LABELS[user.role] || user.role;
        dispatch(
          showNotification({
            message: `Welcome back, ${user.name}! Logged in as ${roleLabel}.`,
            type: "success",
          }),
        );
        setNavigating(true);
        setTimeout(() => navigate("/admin/dashboard"), 800);
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

  if (pageLoading || navigating) return <Loader />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-32 pb-20 px-3">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />

          <div className="px-9 pt-7 pb-8">
            {/* Back to main site */}
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-7 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs sm:text-sm font-medium">
                Back to Website
              </span>
            </button>

            {/* Icon + heading */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center sm:w-16 sm:h-16 w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-4 shadow-lg">
                <ChefHat className="sm:w-8 sm:h-8 w-6 h-6 text-white" />
              </div>
              <h2 className="font-sans sm:text-[1.75rem] text-xl font-bold text-dark mb-1.5 tracking-tight">
                Staff Portal
              </h2>
              <p className="sm:text-[0.9rem] text-xs text-gray-500">
                Sign in to access your{" "}
                <span className="font-semibold text-primary">dashboard</span>
              </p>
            </div>

            {/* Role chips */}
            <div className="grid grid-cols-2 items-center justify-center gap-2 mb-6">
              {[
                {
                  label: "Super Admin",
                  icon: Shield,
                  color: "border border-gray-300 text-dark",
                },
                {
                  label: "Manager",
                  icon: Users,
                  color: "border border-gray-300 text-dark",
                },
                {
                  label: "Employee",
                  icon: Users,
                  color: "border border-gray-300 text-dark",
                },
                {
                  label: "Chef",
                  icon: ChefHat,
                  color: "border border-gray-300 text-dark",
                },
              ].map(({ label, icon: Icon, color }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold ${color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-dark font-semibold text-xs sm:text-[0.875rem]">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark text-xs sm:text-[0.9rem] placeholder:text-gray-400"
                    placeholder="staff@restaurant.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-dark font-semibold text-xs sm:text-[0.875rem]">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-dark text-xs sm:text-[0.9rem] placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 sm:py-3.5 rounded-xl text-xs sm:text-[0.95rem] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-center text-[10px] sm:text-xs text-gray-400">
              Not a staff member?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Customer login
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs sm:text-sm mt-4 text-gray-500">
          Staff portal — authorized access only
        </p>
      </div>
    </div>
  );
};

export default StaffLogin;
