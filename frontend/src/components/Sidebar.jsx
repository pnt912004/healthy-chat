// src/components/Sidebar.jsx
// SideNavBar – Dashboard layout (desktop only, sticky)

import { Link, useLocation } from 'react-router-dom';

const sideItems = [
  { label: 'Bảng Điều Khiển', to: '/dashboard',  icon: 'dashboard' },
  { label: 'Dinh Dưỡng',      to: '/nutrition',  icon: 'restaurant' },
  { label: 'Theo Dõi Nước',   to: '/water',      icon: 'water_drop' },
  { label: 'Bài Tập',         to: '/exercise',   icon: 'fitness_center' },
  { label: 'Sức Khỏe',        to: '/wellness',   icon: 'bedtime' },
  { label: 'Báo Cáo',         to: '/reports',    icon: 'assessment' },
  { label: 'Mục Tiêu',        to: '/goals',      icon: 'track_changes' },
  { label: 'Trợ Lý AI',       to: '/ai',         icon: 'smart_toy' },
  { label: 'Hồ Sơ',           to: '/profile',    icon: 'person' },
  { label: 'Cài Đặt',         to: '/settings',   icon: 'settings' },
];

import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const currentUser = user || {};
  const fullName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username || 'Healthy User';

  return (
    <aside className="bg-white dark:bg-slate-900 h-[calc(100vh-64px)]
                      w-64 hidden lg:flex flex-col
                      border-r border-slate-200 dark:border-slate-800
                      sticky top-16 pt-lg">
      {/* User Info */}
      <div className="px-lg mb-xl flex items-center gap-md">
        {currentUser.avatar_url ? (
          <img src={currentUser.avatar_url} alt={fullName} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container">person</span>
          </div>
        )}
        <div>
          <h3 className="text-h3 font-semibold text-on-surface dark:text-white">{fullName}</h3>
          <p className="text-body-sm text-on-surface-variant dark:text-slate-400">Thành Viên</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-sm flex flex-col gap-xs">
        {sideItems.map(({ label, to, icon }) => {
          const active = pathname === to || pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200
                ${active
                  ? 'bg-green-50 dark:bg-green-900/20 text-primary font-bold border-r-4 border-primary'
                  : 'text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-white hover:pl-5'
                }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </Link>
          );
        })}
        {currentUser?.role === 'admin' && (
          <Link
            to="/admin"
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 mt-2
              ${pathname.startsWith('/admin')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 font-bold border-r-4 border-red-600'
                : 'text-red-500 hover:bg-surface-container-low hover:text-red-600 hover:pl-5'
              }`}
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Upgrade CTA */}
      <div className="p-lg border-t border-slate-100 dark:border-slate-800">
        <button className="w-full h-xxl bg-primary-container text-on-primary-container
                           font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity"
                onClick={() => alert('Chức năng đang được phát triển')}>
          Nâng Cấp Gói
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

