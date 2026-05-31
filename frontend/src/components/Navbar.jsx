// src/components/Navbar.jsx
// TopNavBar dùng chung – sticky, glassmorphism, responsive

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Trang Chủ',  to: '/' },
  { label: 'Tổng Quan',  to: '/dashboard' },
  { label: 'AI Trợ Lý', to: '/ai' },
  { label: 'Mục Tiêu',  to: '/goals' },
  { label: 'Hồ Sơ',     to: '/profile' },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50
                       border-b border-slate-100 dark:border-slate-800 shadow-soft w-full">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">spa</span>
          HealthyChat
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1 items-center h-full">
          {navItems.map(({ label, to }) => {
            if (!isAuthenticated && to !== '/') return null;
            const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`h-full flex items-center px-md font-body-md text-body-md transition-all duration-200
                  ${isActive
                    ? 'text-primary font-semibold border-b-2 border-primary'
                    : 'text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-slate-800 rounded-lg'
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-sm">
          <button onClick={toggleDarkMode} className="p-2 text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-slate-800 rounded-lg transition-all"
                  title="Chế độ tối">
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
          
          {isAuthenticated ? (
            <>
              <button onClick={() => alert('Tính năng thông báo đang phát triển!')} className="p-2 text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-low dark:hover:bg-slate-800 rounded-lg transition-all"
                      title="Thông báo">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button onClick={logout}
                      className="hidden sm:flex items-center gap-1 px-md py-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200
                                 rounded-lg text-label-md font-label-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors
                                 active:scale-95 duration-200">
                Đăng Xuất
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-md py-sm text-primary font-semibold hover:bg-green-50 rounded-lg transition-colors">
                Đăng Nhập
              </Link>
              <Link to="/register" className="px-md py-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
