import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showNotification } from "../store/slices/notificationSlice";
import authService from "../services/authService";
import Loader from "../components/common/Loader";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      dispatch(showNotification({
        message: "Passwords do not match",
        type: 'error'
      }));
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
      dispatch(showNotification({
        message: "Account created successfully! Redirecting to login... ✅",
        type: 'success'
      }));
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(result.message);
      dispatch(showNotification({
        message: result.message,
        type: 'error'
      }));
    }

    setLoading(false);
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
                  Join Bites!
                </h2>
                <p className="text-lg opacity-90">
                  Create an account and start ordering delicious food
                </p>
              </div>

              {/* Decorative Food Image */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop"
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

            <h2 className="font-display text-3xl text-center mb-2">Sign Up</h2>
            <p className="text-center text-dark-gray mb-8">
              Create your account to get started
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-6 text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-dark font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

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
                <p className="text-xs text-dark-gray mt-1">
                  At least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-dark font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
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
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center mt-6 text-dark-gray">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:text-primary-dark"
              >
                Login
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

export default Signup;
