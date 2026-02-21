import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const AdminHeader = ({ onMenuToggle }) => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Admin', path: '/admin' }];

    if (paths.length > 1) {
      paths.slice(1).forEach((path, index) => {
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        const fullPath = '/' + paths.slice(0, index + 2).join('/');
        breadcrumbs.push({ label, path: fullPath });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 rounded-xl bg-cream hover:bg-cream-dark flex items-center justify-center transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-400">/</span>}
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? 'text-primary font-semibold'
                      : 'text-dark-gray'
                  }
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Right: User info */}
        <div className="flex items-center gap-4">
          {/* Welcome message */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-dark-gray">Welcome back,</p>
            <p className="text-sm font-semibold text-dark">{currentUser?.name}</p>
          </div>

          {/* User Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
