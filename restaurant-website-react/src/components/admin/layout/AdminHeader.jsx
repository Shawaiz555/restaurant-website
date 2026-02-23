import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Menu } from 'lucide-react';

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
    <header className="bg-white border-b-2 border-gray-200 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cream hover:bg-cream-dark flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-dark" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-hidden flex-1">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {index > 0 && <span className="text-gray-400 hidden sm:inline">/</span>}
                {index > 0 && <span className="text-gray-400 sm:hidden">›</span>}
                <span
                  className={`${
                    index === breadcrumbs.length - 1
                      ? 'text-primary font-semibold'
                      : 'text-dark-gray hidden sm:inline'
                  } truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none`}
                  title={crumb.label}
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Right: User info */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          {/* Welcome message */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-dark-gray">Welcome back,</p>
            <p className="text-sm font-semibold text-dark truncate max-w-[120px] lg:max-w-none" title={currentUser?.name}>
              {currentUser?.name}
            </p>
          </div>

          {/* User Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base flex-shrink-0">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
