import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Pizza,
  DollarSign,
  TrendingUp,
  TableIcon,
  CalendarCheck,
  Tag,
  X,
} from "lucide-react";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/orders", icon: Package, label: "Orders" },
    { path: "/admin/products", icon: Pizza, label: "Products" },
    { path: "/admin/tables", icon: TableIcon, label: "Tables" },
    { path: "/admin/reservations", icon: CalendarCheck, label: "Reservations" },
    { path: "/admin/deals", icon: Tag, label: "Deals" },
    { path: "/admin/expenses", icon: DollarSign, label: "Expenses" },
    { path: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white/95 backdrop-blur-2xl z-[70] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          w-[270px] border-r border-gray-100 shadow-[8px_0_30px_rgba(0,0,0,0.03)] flex flex-col
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo/Header Area */}
        <div className="relative pt-8 pb-6 px-6 overflow-hidden shrink-0 border-b border-gray-50 bg-gradient-to-b from-cream-light/50 to-transparent">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange/5 rounded-full blur-2xl -ml-10 -mb-10" />

          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Logo */}
            <div className="flex items-center justify-center group">
              <div className="relative transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-1">
                <img
                  src="/assets/images/BitesLogo.png"
                  alt="logo"
                  className="w-40 h-20 lg:w-[200px] lg:h-[120px] object-contain drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-md"
                />
              </div>
            </div>
            {/* Title */}
            <div className="mt-3 text-center">
              <h1 className="text-2xl font-sans text-dark tracking-wide">
                Admin<span className="text-primary font-bold">Panel</span>
              </h1>
              <p className="text-[10px] text-dark-gray mt-1 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
                <span className="w-5 h-[2px] bg-primary/20 rounded-full"></span>
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Manager
                </span>
                <span className="w-5 h-[2px] bg-primary/20 rounded-full"></span>
              </p>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="absolute top-0 right-0 lg:hidden w-8 h-8 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-dark hover:bg-gray-50 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent border-t-2 border-gray-200">
          <div className="space-y-2.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`
                  relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ease-in-out group outline-none
                  ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-[0_8px_20px_rgba(230,126,34,0.3)] shadow-primary/30 font-semibold border border-primary-light/20 scale-[1.02]"
                      : "text-dark-gray hover:bg-cream-light hover:text-primary hover:shadow-md hover:shadow-gray-200/50 hover:scale-[1.02] border border-transparent"
                  }
                `}
              >
                {/* Active Hover Glow */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                {/* Icon Container */}
                <div
                  className={`
                  flex items-center justify-center p-2 rounded-xl transition-all duration-300 shadow-sm
                  ${
                    isActive(item.path)
                      ? "bg-white/20 shadow-inner backdrop-blur-sm"
                      : "bg-white group-hover:bg-primary/10 text-gray-500 group-hover:text-primary border border-gray-100/50"
                  }
                `}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive(item.path) ? "text-white drop-shadow-sm" : ""
                    }`}
                  />
                </div>

                {/* Text */}
                <span className="text-[14.5px] tracking-wide relative z-10 flex-1">
                  {item.label}
                </span>

                {/* Active Indicator Chevron or Dot */}
                {isActive(item.path) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-sm" />
                )}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
