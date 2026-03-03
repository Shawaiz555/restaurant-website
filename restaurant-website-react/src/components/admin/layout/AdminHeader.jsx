import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
import { useAuth } from "../../../hooks/useAuth";
import { showNotification } from "../../../store/slices/notificationSlice";
import { Menu, LogOut, ChevronDown } from "lucide-react";

const AdminHeader = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    dispatch(
      showNotification({
        type: "success",
        message: "Admin Logged out successfully!",
      }),
    );
    navigate("/");
  };

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Admin", path: "/admin" }];

    if (paths.length > 1) {
      paths.slice(1).forEach((path, index) => {
        const label =
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
        const fullPath = "/" + paths.slice(0, index + 2).join("/");
        breadcrumbs.push({ label, path: fullPath });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-8 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left Side: Mobile Menu Toggle & Title/Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs Section */}
          <div className="flex flex-col flex-1 min-w-0 pr-4">
            <h2 className="hidden sm:block text-[16px] font-bold text-dark tracking-tight truncate leading-tight">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
            </h2>

            <nav className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 overflow-hidden shrink-0 mt-0.5">
              {breadcrumbs.map((crumb, index) => (
                <div
                  key={crumb.path}
                  className="flex items-center gap-1.5 shrink-0"
                >
                  {index > 0 && <span>/</span>}
                  <span
                    className={`truncate ${
                      index === breadcrumbs.length - 1
                        ? "text-primary"
                        : "hover:text-dark transition-colors"
                    } max-w-[100px] sm:max-w-none`}
                  >
                    {crumb.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Side: Profile Dropdown */}
        <div className="flex items-center shrink-0">
          <div className="relative" ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2.5 p-2 px-6 rounded-xl border transition-all duration-300 group outline-none ${
                isDropdownOpen
                  ? "bg-gray-50 border-gray-200 shadow-sm"
                  : "border-transparent hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <div className="w-[38px] h-[38px] rounded-lg bg-gradient-to-br from-primary to-primary-dark shadow-sm shadow-primary/20 flex items-center justify-center text-white font-display tracking-wider text-base transform transition-transform duration-300 group-hover:rotate-6 border border-primary-light/30">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm"
                  title="Online"
                />
              </div>

              <div className="hidden md:flex flex-col items-start mr-1">
                <span className="text-[14px] font-bold text-dark leading-tight max-w-[120px] truncate group-hover:text-primary transition-colors">
                  {currentUser?.name || "Admin"}
                </span>
                <span className="text-[11px] text-gray-500 font-medium tracking-wide">
                  Manager
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 hidden md:block ${isDropdownOpen ? "rotate-180 text-primary" : "group-hover:text-dark"}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] border border-gray-100/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                {/* Header/Info */}
                <div className="px-4 py-4 mb-2 rounded-xl bg-gradient-to-br from-cream-light/60 to-white/80 border border-gray-100/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative shrink-0">
                      <div className="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-primary/20 flex items-center justify-center text-white font-display text-lg tracking-wider transform group-hover:rotate-6 transition-transform duration-300 border border-primary-light/30">
                        {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-sm"
                        title="Online"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-[15px] font-bold text-dark truncate">
                        {currentUser?.name || "Admin User"}
                      </p>
                      <p className="text-[12px] text-dark-gray font-medium tracking-wide truncate mt-0.5 opacity-80">
                        {currentUser?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50/50 text-red-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-red-600 transition-all border border-transparent group-hover:border-red-100">
                      <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
