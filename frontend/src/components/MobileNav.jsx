// src/components/MobileNav.jsx
// Bottom Navigation Bar – chỉ hiển thị trên màn hình nhỏ (mobile)

import { Link, useLocation } from 'react-router-dom';

const mobileNavItems = [
  { label: 'Tổng Quan', to: '/dashboard', icon: 'dashboard' },
  { label: 'Dinh Dưỡng', to: '/nutrition', icon: 'restaurant' },
  { label: 'Nước', to: '/water', icon: 'water_drop' },
  { label: 'Bài Tập', to: '/exercise', icon: 'fitness_center' },
  { label: 'AI', to: '/ai', icon: 'smart_toy' },
  { label: 'Mục Tiêu', to: '/goals', icon: 'track_changes' },
];

const MobileNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                    bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                    border-t border-slate-200 dark:border-slate-800
                    flex items-stretch safe-area-pb">
      {mobileNavItems.map(({ label, to, icon }) => {
        const active = pathname === to || (to !== '/' && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-200
              ${active
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            <span
              className={`material-symbols-outlined transition-all duration-200 ${active ? 'filled' : ''}`}
              style={{
                fontSize: '22px',
                fontVariationSettings: active ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
              }}>
              {icon}
            </span>
            <span className={`text-[10px] leading-tight font-medium ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
              {label}
            </span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
